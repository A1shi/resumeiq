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

    logger.info("SMTP configuration loaded")

    # Construct the message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_SENDER
    msg["To"] = to_email

    part = MIMEText(html_content, "html")
    msg.attach(part)

    server = None
    try:
        # Create SMTP client
        try:
            logger.info("Creating SMTP client")
            if getattr(settings, "SMTP_USE_SSL", False):
                server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30)
            else:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30)
            logger.info("SMTP client created")
        except Exception as e:
            logger.error(f"Failed to create SMTP client: {e}", exc_info=True)
            raise RuntimeError(f"Failed to create SMTP client: {e}") from e

        # Call EHLO
        try:
            logger.info("Calling EHLO")
            server.ehlo()
            logger.info("EHLO successful")
        except Exception as e:
            logger.error(f"Failed during initial EHLO: {e}", exc_info=True)
            raise RuntimeError(f"Failed during initial EHLO: {e}") from e

        # STARTTLS
        if getattr(settings, "SMTP_USE_TLS", True):
            try:
                logger.info("Starting STARTTLS")
                server.starttls()
                logger.info("STARTTLS successful")
            except Exception as e:
                logger.error(f"Failed during STARTTLS handshake: {e}", exc_info=True)
                raise RuntimeError(f"Failed during STARTTLS handshake: {e}") from e

            try:
                logger.info("Calling EHLO")
                server.ehlo()
                logger.info("EHLO successful")
            except Exception as e:
                logger.error(f"Failed during EHLO after STARTTLS: {e}", exc_info=True)
                raise RuntimeError(f"Failed during EHLO after STARTTLS: {e}") from e

        # Login
        try:
            logger.info("Logging in")
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            logger.info("Login successful")
        except Exception as e:
            logger.error(f"Failed to log into SMTP server: {e}", exc_info=True)
            raise RuntimeError(f"Failed to log into SMTP server: {e}") from e

        # Send
        try:
            logger.info("Sending email")
            server.send_message(msg)
            logger.info("Email sent successfully")
        except Exception as e:
            logger.error(f"Failed to send email message: {e}", exc_info=True)
            raise RuntimeError(f"Failed to send email message: {e}") from e

    finally:
        if server:
            try:
                server.quit()
                logger.info("SMTP connection closed")
            except Exception as e:
                logger.warning(f"Error while closing SMTP connection: {e}")
