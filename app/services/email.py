import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger("app.services.email")

def send_email(to_email: str, subject: str, html_content: str):
    """
    Sends an email using the configured SMTP settings.
    Validates environment variables and raises exceptions if SMTP is not configured
    or if sending fails.
    """
    # Validate environment variables
    missing_vars = []
    if not settings.SMTP_HOST:
        missing_vars.append("SMTP_HOST")
    if not settings.SMTP_PORT:
        missing_vars.append("SMTP_PORT")
    if not settings.SMTP_USERNAME:
        missing_vars.append("SMTP_USERNAME")
    if not settings.SMTP_PASSWORD:
        missing_vars.append("SMTP_PASSWORD")
    if not settings.SMTP_SENDER:
        missing_vars.append("SMTP_SENDER")

    if missing_vars:
        error_msg = f"SMTP configuration is incomplete. Missing variables: {', '.join(missing_vars)}"
        logger.error(error_msg)
        raise ValueError(error_msg)

    # Construct the message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_SENDER
    msg["To"] = to_email

    part = MIMEText(html_content, "html")
    msg.attach(part)

    server = None
    try:
        # Step 1: Creating SMTP client
        try:
            logger.info("Creating SMTP client...")
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30)
            logger.info("SMTP client created.")
        except Exception as e:
            logger.error(f"Error during SMTP client creation: {e}", exc_info=True)
            raise

        # Step 2: Calling EHLO
        try:
            logger.info("Calling EHLO...")
            server.ehlo()
            logger.info("EHLO successful.")
        except Exception as e:
            logger.error(f"Error during EHLO: {e}", exc_info=True)
            raise

        # Step 3: Starting STARTTLS
        if settings.SMTP_USE_TLS:
            try:
                logger.info("Starting STARTTLS...")
                server.starttls()
                logger.info("STARTTLS successful.")
            except Exception as e:
                logger.error(f"Error during STARTTLS: {e}", exc_info=True)
                raise
            
            try:
                logger.info("Calling EHLO...")
                server.ehlo()
                logger.info("EHLO successful.")
            except Exception as e:
                logger.error(f"Error during EHLO after STARTTLS: {e}", exc_info=True)
                raise

        # Step 4: Logging into Gmail
        try:
            logger.info("Logging into Gmail...")
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            logger.info("Login successful.")
        except Exception as e:
            logger.error(f"Error during Gmail login: {e}", exc_info=True)
            raise

        # Step 5: Sending email
        try:
            logger.info("Sending email...")
            server.send_message(msg)
            logger.info("Email sent successfully.")
        except Exception as e:
            logger.error(f"Error during sending email: {e}", exc_info=True)
            raise

    except smtplib.SMTPException as e:
        error_msg = f"SMTP error occurred while sending email: {str(e)}"
        raise RuntimeError(error_msg) from e
    except Exception as e:
        error_msg = f"Unexpected error occurred while sending email: {str(e)}"
        raise RuntimeError(error_msg) from e
    finally:
        if server:
            try:
                logger.info("Quitting SMTP server connection...")
                server.quit()
            except Exception as e:
                logger.warning(f"Error during SMTP quit: {e}")
