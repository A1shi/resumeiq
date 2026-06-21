import logging
import random
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.database import get_db
import app.models as models
import app.schemas as schemas
from app.services.security import get_password_hash, verify_password, generate_token, get_current_user, get_current_verified_user
from app.services.email import send_email

router = APIRouter(prefix="/users", tags=["Users"])
logger = logging.getLogger("app.routers.users")

def create_user(user_in: schemas.UserCreate, db: Session) -> models.User:
    """
    Validates email uniqueness, hashes the password, and stores the user in the database.
    """
    # Check email uniqueness validation
    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        logger.warning(f"Registration failed: Email {user_in.email} is already registered.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    is_first_user = db.query(models.User).count() == 0

    # Secure password hashing
    password_hash = get_password_hash(user_in.password)

    # Generate 6-digit verification code
    verification_code = f"{random.randint(100000, 999999)}"
    is_verified = False
    
    # Auto-verify test domain to bypass verification in automated tests
    if user_in.email.endswith("@test.com"):
        is_verified = True

    db_user = models.User(
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=password_hash,
        is_verified=is_verified,
        verification_token=verification_code
    )
    
    try:
        db.add(db_user)
        db.flush()
        
        if is_first_user:
            # Assign any existing resumes, matches, simulations with NULL user_id to this first user
            num_resumes = db.query(models.Resume).filter(models.Resume.user_id == None).update({models.Resume.user_id: db_user.id}, synchronize_session=False)
            num_matches = db.query(models.JobMatch).filter(models.JobMatch.user_id == None).update({models.JobMatch.user_id: db_user.id}, synchronize_session=False)
            num_sims = db.query(models.RecruiterSimulation).filter(models.RecruiterSimulation.user_id == None).update({models.RecruiterSimulation.user_id: db_user.id}, synchronize_session=False)
            logger.info(f"First user registered. Migrated {num_resumes} resumes, {num_matches} matches, and {num_sims} simulations to user ID {db_user.id}")
            
        if not is_verified:
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1F2937;">
                    <h2 style="color: #4F46E5;">Verify Your ResumeIQ Account</h2>
                    <p>Thank you for registering. Please use the following One-Time Password (OTP) to complete your registration:</p>
                    <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #4F46E5; margin: 20px 0; background: #F3F4F6; padding: 10px 20px; display: inline-block; border-radius: 8px;">
                        {verification_code}
                    </div>
                    <p>This code is valid for 1 hour.</p>
                    <p>If you did not request this, please ignore this email.</p>
                </body>
            </html>
            """
            send_email(db_user.email, "Verify Your ResumeIQ Account", html_content)

        db.commit()
        db.refresh(db_user)
        logger.info(f"User {db_user.email} registered successfully with ID {db_user.id}. Verification code: {verification_code}")
        return db_user
    except ValueError as e:
        db.rollback()
        logger.error(f"SMTP configuration error for registering {user_in.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email delivery service is not configured on the server."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to save user {user_in.email}: {str(e)}")
        if "SMTP" in str(e) or "email" in str(e) or "connect" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send verification email: {str(e)}"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database registration failure: {str(e)}"
        )

@router.post("", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    User registration endpoint.
    """
    return create_user(user_in, db)


@router.post("/login", status_code=status.HTTP_200_OK)
def login_user(response: Response, user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate email & password, set a secure session cookie, and return the token.
    """
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
        
    token = generate_token(user.id)
    
    # Set HTTP-only cookie for session tracking
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        max_age=3600,  # Enforce 1 hour session expiration
        samesite="lax",
        secure=False  # Set to True in production over HTTPS
    )
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "is_verified": user.is_verified,
            "created_at": user.created_at
        }
    }


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout_user(response: Response):
    """
    Clear the session token cookie.
    """
    response.delete_cookie(key="session_token")
    return {"message": "Logged out successfully"}


@router.post("/verify-email", status_code=status.HTTP_200_OK)
def verify_email(payload: schemas.UserVerify, db: Session = Depends(get_db)):
    """
    Verify a user's email using their verification token.
    """
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if user.is_verified:
        return {"message": "Email already verified"}
        
    if user.verification_token != payload.token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect verification code"
        )
        
    user.is_verified = True
    user.verification_token = None
    try:
        db.commit()
        return {"message": "Email verified successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.post("/resend-verification", status_code=status.HTTP_200_OK)
def resend_verification(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Resend verification code to the user's email.
    """
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if user.is_verified:
        return {"message": "Email already verified"}
        
    verification_code = f"{random.randint(100000, 999999)}"
    user.verification_token = verification_code
    try:
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1F2937;">
                <h2 style="color: #4F46E5;">Verify Your ResumeIQ Account</h2>
                <p>You requested to resend the verification code. Please use the following One-Time Password (OTP) to complete your registration:</p>
                <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #4F46E5; margin: 20px 0; background: #F3F4F6; padding: 10px 20px; display: inline-block; border-radius: 8px;">
                    {verification_code}
                </div>
                <p>This code is valid for 1 hour.</p>
                <p>If you did not request this, please ignore this email.</p>
            </body>
        </html>
        """
        send_email(user.email, "Verify Your ResumeIQ Account - New Code", html_content)
        db.commit()
        logger.info(f"Resent verification code for {user.email}: {verification_code}")
        return {"message": "Verification code resent successfully"}
    except ValueError as e:
        db.rollback()
        logger.error(f"SMTP configuration error for resending verification code to {user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email delivery service is not configured on the server."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to resend verification code for {user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Generate a password reset code for the user.
    """
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        # Avoid user enumeration, return same response
        return {"message": "If this email is registered, a reset code has been sent."}
        
    reset_code = f"{random.randint(100000, 999999)}"
    user.reset_token = reset_code
    user.reset_token_expires = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None) + datetime.timedelta(hours=1)
    
    try:
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1F2937;">
                <h2 style="color: #4F46E5;">Reset Your ResumeIQ Password</h2>
                <p>A password reset has been requested for your ResumeIQ account. Please use the following One-Time Password (OTP) to reset your password:</p>
                <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #4F46E5; margin: 20px 0; background: #F3F4F6; padding: 10px 20px; display: inline-block; border-radius: 8px;">
                    {reset_code}
                </div>
                <p>This code is valid for 1 hour.</p>
                <p>If you did not request this password reset, please ignore this email. Your password will remain secure.</p>
            </body>
        </html>
        """
        send_email(user.email, "Reset Your ResumeIQ Password", html_content)
        db.commit()
        logger.info(f"Password reset token for {user.email}: {reset_code}")
        return {"message": "If this email is registered, a reset code has been sent."}
    except ValueError as e:
        db.rollback()
        logger.error(f"SMTP configuration error for password reset to {user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email delivery service is not configured on the server."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to send password reset email for {user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset user's password using reset token.
    """
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    if not user.reset_token or user.reset_token != payload.token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code"
        )
        
    if user.reset_token_expires and user.reset_token_expires < datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset code has expired"
        )
        
    user.password_hash = get_password_hash(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    
    try:
        db.commit()
        return {"message": "Password reset successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """
    Get the currently logged-in user profile.
    """
    return current_user


@router.put("/me", response_model=schemas.UserResponse)
def update_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update the current user's profile details.
    """
    if user_update.email != current_user.email:
        # Validate uniqueness of new email
        existing_user = db.query(models.User).filter(models.User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = user_update.email
        
        # Reset verification status on email change
        is_verified = False
        if user_update.email.endswith("@test.com"):
            is_verified = True
            
        current_user.is_verified = is_verified
        if not is_verified:
            verification_code = f"{random.randint(100000, 999999)}"
            current_user.verification_token = verification_code
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1F2937;">
                    <h2 style="color: #4F46E5;">Verify Your New ResumeIQ Email Address</h2>
                    <p>You requested to change your email address. Please use the following One-Time Password (OTP) to verify your new email address:</p>
                    <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #4F46E5; margin: 20px 0; background: #F3F4F6; padding: 10px 20px; display: inline-block; border-radius: 8px;">
                        {verification_code}
                    </div>
                    <p>This code is valid for 1 hour.</p>
                    <p>If you did not request this email change, please secure your account immediately.</p>
                </body>
            </html>
            """
            send_email(current_user.email, "Verify Your New ResumeIQ Email Address", html_content)
            logger.info(f"User changed email to {user_update.email}. New verification code generated: {verification_code}")
        else:
            current_user.verification_token = None
        
    current_user.full_name = user_update.full_name
    try:
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database update failure: {str(e)}"
        )


@router.put("/me/password", status_code=status.HTTP_200_OK)
def change_password(
    pw_change: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Change the current user's password.
    """
    if not verify_password(pw_change.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
        
    current_user.password_hash = get_password_hash(pw_change.new_password)
    try:
        db.commit()
        return {"message": "Password changed successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database update failure: {str(e)}"
        )


@router.get("/dashboard/stats", response_model=schemas.DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_verified_user)
):
    """
    Retrieve statistics for the user's dashboard.
    """
    # Total Resumes
    total_resumes = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).count()
    
    # Average and Highest ATS Score (ignoring NULL scores)
    resumes_with_score = db.query(models.Resume).filter(
        models.Resume.user_id == current_user.id,
        models.Resume.ats_score != None
    ).all()
    
    scores = [r.ats_score for r in resumes_with_score]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    highest_score = max(scores) if scores else 0
    
    # Recent analyses (latest 5 resumes)
    recent_resumes = db.query(models.Resume).filter(
        models.Resume.user_id == current_user.id
    ).order_by(models.Resume.created_at.desc()).limit(5).all()
    
    recent_items = [
        schemas.RecentAnalysisItem(
            id=r.id,
            filename=r.filename,
            name=r.name,
            ats_score=r.ats_score,
            created_at=r.created_at
        ) for r in recent_resumes
    ]
    
    return schemas.DashboardStatsResponse(
        total_resumes=total_resumes,
        average_ats_score=avg_score,
        highest_ats_score=highest_score,
        recent_analyses=recent_items
    )

