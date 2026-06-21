import hashlib
import os
import hmac
import time
import base64
from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
import app.models as models
from app.config import settings

SECRET_KEY = getattr(settings, "SECRET_KEY", "antigravity_secret_session_key_2026")

def get_password_hash(password: str) -> str:
    """
    Hash a password securely using PBKDF2-HMAC-SHA256 with 100,000 iterations.
    Returns format: pbkdf2_sha256$100000$salt_hex$hash_hex
    """
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"pbkdf2_sha256$100000${salt.hex()}${dk.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against the stored secure PBKDF2 hash.
    """
    try:
        if not hashed_password:
            return False
        parts = hashed_password.split('$')
        if len(parts) != 4:
            return False
        algorithm, iterations_str, salt_hex, hash_hex = parts
        if algorithm != 'pbkdf2_sha256':
            return False
        iterations = int(iterations_str)
        salt = bytes.fromhex(salt_hex)
        dk = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, iterations)
        return dk.hex() == hash_hex
    except Exception:
        return False

def generate_token(user_id: int) -> str:
    """
    Generates a secure cryptographically-signed access token using HMAC-SHA256.
    """
    timestamp = int(time.time())
    payload = f"{user_id}.{timestamp}"
    signature = hmac.new(
        SECRET_KEY.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    token_bytes = f"{payload}.{signature}".encode()
    return base64.urlsafe_b64encode(token_bytes).decode().rstrip("=")

def verify_token(token: str, max_age: int = 3600) -> int:
    """
    Decodes and validates a token. Returns user_id if valid, raises ValueError otherwise.
    """
    try:
        padding = len(token) % 4
        if padding:
            token += "=" * (4 - padding)
        token_bytes = base64.urlsafe_b64decode(token.encode())
        parts = token_bytes.decode().split(".")
        if len(parts) != 3:
            raise ValueError("Invalid session token")
        user_id_str, timestamp_str, signature = parts
        
        try:
            timestamp = int(timestamp_str)
        except ValueError:
            raise ValueError("Invalid session token")
            
        if time.time() - timestamp > max_age:
            raise ValueError("Token expired")
            
        payload = f"{user_id_str}.{timestamp_str}"
        expected_signature = hmac.new(
            SECRET_KEY.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_signature):
            raise ValueError("Invalid session token")
            
        return int(user_id_str)
    except ValueError as ve:
        raise ve
    except Exception:
        raise ValueError("Invalid session token")

def get_current_user(request: Request, db: Session = Depends(get_db)) -> models.User:
    """
    FastAPI dependency to extract and validate the current logged-in user.
    """
    token = None
    
    # 1. Check Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        
    # 2. Check Cookie
    if not token:
        token = request.cookies.get("session_token")
        
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
        
    try:
        user_id = verify_token(token)
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account not found"
            )
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

def get_current_verified_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    """
    FastAPI dependency to ensure the current user is verified.
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required"
        )
    return current_user

