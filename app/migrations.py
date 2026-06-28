import logging
from sqlalchemy import text

logger = logging.getLogger("app.migrations")

def run_migrations(engine):
    """
    Ensures database schema consistency. Checks if tables contain
    the required columns, adding them dynamically if missing.
    """
    try:
        from sqlalchemy import inspect
        inspector = inspect(engine)
        
        with engine.begin() as conn:
            # Check and add columns to users table
            user_columns = [col["name"] for col in inspector.get_columns("users")]
            if "is_verified" not in user_columns:
                logger.info("Database migration: adding 'is_verified' column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE NOT NULL"))
            if "verification_token" not in user_columns:
                logger.info("Database migration: adding 'verification_token' column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) NULL"))
            if "verification_token_expires" not in user_columns:
                logger.info("Database migration: adding 'verification_token_expires' column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN verification_token_expires TIMESTAMP NULL"))
            if "verification_token_sent_at" not in user_columns:
                logger.info("Database migration: adding 'verification_token_sent_at' column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN verification_token_sent_at TIMESTAMP NULL"))
            if "reset_token" not in user_columns:
                logger.info("Database migration: adding 'reset_token' column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL"))
            if "reset_token_expires" not in user_columns:
                logger.info("Database migration: adding 'reset_token_expires' column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP NULL"))
            if "reset_token_sent_at" not in user_columns:
                logger.info("Database migration: adding 'reset_token_sent_at' column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_sent_at TIMESTAMP NULL"))

            # Fetch table columns info for resumes
            columns = [col["name"] for col in inspector.get_columns("resumes")]
            
            if "user_id" not in columns:
                logger.info("Database migration: adding 'user_id' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE"))
                logger.info("Database migration: resumes table updated successfully with 'user_id'.")
            if "name" not in columns:
                logger.info("Database migration: adding 'name' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN name VARCHAR(255) NULL"))
            if "email" not in columns:
                logger.info("Database migration: adding 'email' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN email VARCHAR(255) NULL"))
            if "phone" not in columns:
                logger.info("Database migration: adding 'phone' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN phone VARCHAR(50) NULL"))
            if "education" not in columns:
                logger.info("Database migration: adding 'education' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN education JSON DEFAULT '[]'"))
            if "experience" not in columns:
                logger.info("Database migration: adding 'experience' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN experience JSON DEFAULT '[]'"))
            if "projects" not in columns:
                logger.info("Database migration: adding 'projects' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN projects JSON DEFAULT '[]'"))
            if "certifications" not in columns:
                logger.info("Database migration: adding 'certifications' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN certifications JSON DEFAULT '[]'"))
                logger.info("Database migration: resumes table updated successfully with 'certifications'.")
            if "languages" not in columns:
                logger.info("Database migration: adding 'languages' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN languages JSON DEFAULT '[]'"))
                logger.info("Database migration: resumes table updated successfully with 'languages'.")
            if "summary" not in columns:
                logger.info("Database migration: adding 'summary' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN summary TEXT NULL"))
            if "leadership" not in columns:
                logger.info("Database migration: adding 'leadership' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN leadership JSON DEFAULT '[]'"))
            if "interests" not in columns:
                logger.info("Database migration: adding 'interests' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN interests JSON DEFAULT '[]'"))
            if "referees" not in columns:
                logger.info("Database migration: adding 'referees' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN referees JSON DEFAULT '[]'"))
            if "ats_score" not in columns:
                logger.info("Database migration: adding 'ats_score' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN ats_score INTEGER NULL"))
            if "ats_analysis" not in columns:
                logger.info("Database migration: adding 'ats_analysis' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN ats_analysis JSON NULL"))
            if "profession" not in columns:
                logger.info("Database migration: adding 'profession' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN profession VARCHAR(255) NULL"))
            if "industry" not in columns:
                logger.info("Database migration: adding 'industry' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN industry VARCHAR(255) NULL"))
            if "seniority" not in columns:
                logger.info("Database migration: adding 'seniority' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN seniority VARCHAR(255) NULL"))
            if "experience_level" not in columns:
                logger.info("Database migration: adding 'experience_level' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN experience_level VARCHAR(255) NULL"))
            if "career_objective" not in columns:
                logger.info("Database migration: adding 'career_objective' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN career_objective TEXT NULL"))
            if "profession_confidence" not in columns:
                logger.info("Database migration: adding 'profession_confidence' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN profession_confidence INTEGER NULL"))
            if "validation_passed" not in columns:
                logger.info("Database migration: adding 'validation_passed' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN validation_passed BOOLEAN NULL"))
            if "validation_reason" not in columns:
                logger.info("Database migration: adding 'validation_reason' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN validation_reason TEXT NULL"))
            if "created_at" not in columns:
                logger.info("Database migration: adding 'created_at' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            if "updated_at" not in columns:
                logger.info("Database migration: adding 'updated_at' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            
            if "parent_id" not in columns:
                logger.info("Database migration: adding 'parent_id' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN parent_id INTEGER REFERENCES resumes(id) ON DELETE CASCADE"))
            if "version_name" not in columns:
                logger.info("Database migration: adding 'version_name' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN version_name VARCHAR(255) NULL"))
            if "customization" not in columns:
                logger.info("Database migration: adding 'customization' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN customization JSON DEFAULT '{}'"))
            if "achievements" not in columns:
                logger.info("Database migration: adding 'achievements' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN achievements JSON DEFAULT '[]'"))
            if "section_order" not in columns:
                logger.info("Database migration: adding 'section_order' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN section_order JSON DEFAULT '[]'"))
            
            # Check and add user_id to job_matches table
            match_columns = [col["name"] for col in inspector.get_columns("job_matches")]
            if "user_id" not in match_columns:
                logger.info("Database migration: adding 'user_id' column to job_matches table...")
                conn.execute(text("ALTER TABLE job_matches ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE"))
                logger.info("Database migration: job_matches table updated successfully with 'user_id'.")
            if "most_important_missing_keywords" not in match_columns:
                logger.info("Database migration: adding 'most_important_missing_keywords' column to job_matches table...")
                conn.execute(text("ALTER TABLE job_matches ADD COLUMN most_important_missing_keywords JSON DEFAULT '[]'"))
            if "experience_match" not in match_columns:
                logger.info("Database migration: adding 'experience_match' column to job_matches table...")
                conn.execute(text("ALTER TABLE job_matches ADD COLUMN experience_match JSON DEFAULT '{}'"))
            if "certification_match" not in match_columns:
                logger.info("Database migration: adding 'certification_match' column to job_matches table...")
                conn.execute(text("ALTER TABLE job_matches ADD COLUMN certification_match JSON DEFAULT '{}'"))
            if "interview_questions" not in match_columns:
                logger.info("Database migration: adding 'interview_questions' column to job_matches table...")
                conn.execute(text("ALTER TABLE job_matches ADD COLUMN interview_questions JSON DEFAULT '[]'"))

            # Check and add user_id to recruiter_simulations table
            sim_columns = [col["name"] for col in inspector.get_columns("recruiter_simulations")]
            if "user_id" not in sim_columns:
                logger.info("Database migration: adding 'user_id' column to recruiter_simulations table...")
                conn.execute(text("ALTER TABLE recruiter_simulations ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE"))
                
            # 1. Trim and lowercase all user emails
            logger.info("Database migration: normalizing existing emails (lowercase and trimmed)...")
            conn.execute(text("UPDATE users SET email = LOWER(TRIM(email))"))

            # 2. Find and delete duplicate users, keeping only the first registered user per email
            logger.info("Database migration: deduplicating users table...")
            conn.execute(text("""
                DELETE FROM users
                WHERE id NOT IN (
                    SELECT MIN(id)
                    FROM users
                    GROUP BY email
                )
            """))

            # 3. Create unique index on users.email to enforce uniqueness constraint
            logger.info("Database migration: ensuring unique index on users.email...")
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users(email)"))
            
            # Since we are using engine.begin(), the transaction commits automatically on block exit,
            # but committing explicitly is safe or can be left to the transaction manager.
    except Exception as e:
        logger.error(f"Database migration failed: {str(e)}")
        raise RuntimeError(f"Database migration failure: {str(e)}")
