import logging
from sqlalchemy import text

logger = logging.getLogger("app.migrations")

def run_migrations(engine):
    """
    Ensures database schema consistency. Checks if the resumes table
    contains the user_id column, adding it dynamically if missing.
    """
    try:
        with engine.begin() as conn:
            # Check and add columns to users table
            res_users = conn.execute(text("PRAGMA table_info(users)"))
            user_columns = [row[1] for row in res_users.fetchall()]
            if "is_verified" not in user_columns:
                logger.info("Database migration: adding 'is_verified' column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0 NOT NULL"))
            if "verification_token" not in user_columns:
                logger.info("Database migration: adding 'verification_token' column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) NULL"))
            if "verification_token_expires" not in user_columns:
                logger.info("Database migration: adding 'verification_token_expires' column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN verification_token_expires DATETIME NULL"))
            if "verification_token_sent_at" not in user_columns:
                logger.info("Database migration: adding 'verification_token_sent_at' column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN verification_token_sent_at DATETIME NULL"))
            if "reset_token" not in user_columns:
                logger.info("Database migration: adding 'reset_token' column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL"))
            if "reset_token_expires" not in user_columns:
                logger.info("Database migration: adding 'reset_token_expires' column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL"))
            if "reset_token_sent_at" not in user_columns:
                logger.info("Database migration: adding 'reset_token_sent_at' column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_sent_at DATETIME NULL"))

            # Fetch table columns info
            result = conn.execute(text("PRAGMA table_info(resumes)"))
            columns = [row[1] for row in result.fetchall()]
            
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
                conn.execute(text("ALTER TABLE resumes ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
            if "updated_at" not in columns:
                logger.info("Database migration: adding 'updated_at' column to resumes table...")
                conn.execute(text("ALTER TABLE resumes ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP"))
            
            # Check and add user_id to job_matches table
            res_matches = conn.execute(text("PRAGMA table_info(job_matches)"))
            match_columns = [row[1] for row in res_matches.fetchall()]
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
            res_sims = conn.execute(text("PRAGMA table_info(recruiter_simulations)"))
            sim_columns = [row[1] for row in res_sims.fetchall()]
            if "user_id" not in sim_columns:
                logger.info("Database migration: adding 'user_id' column to recruiter_simulations table...")
                conn.execute(text("ALTER TABLE recruiter_simulations ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE"))
                logger.info("Database migration: recruiter_simulations table updated successfully with 'user_id'.")
            
            conn.commit()
    except Exception as e:
        logger.error(f"Database migration failed: {str(e)}")
        raise RuntimeError(f"Database migration failure: {str(e)}")
