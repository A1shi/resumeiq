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

    try:
        if settings.SMTP_USE_SSL:
            logger.info(f"Connecting to SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT} via SSL...")
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            logger.info("SSL connection established successfully.")
        else:
            logger.info(f"Connecting to SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT}...")
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
            logger.info("SMTP connection established successfully.")
            if settings.SMTP_USE_TLS:
                logger.info("Starting TLS...")
                server.starttls()
                logger.info("TLS started successfully.")
        
        logger.info("Logging into SMTP server...")
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        logger.info("Login successful.")
        
        logger.info(f"Sending email to {to_email}...")
        server.sendmail(settings.SMTP_SENDER, [to_email], msg.as_string())
        logger.info("Email sent successfully from sendmail.")
        server.quit()
        logger.info(f"Email sent successfully to {to_email}")
    except smtplib.SMTPException as e:
        error_msg = f"SMTP error occurred while sending email: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise RuntimeError(error_msg) from e
    except Exception as e:
        error_msg = f"Unexpected error occurred while sending email: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise RuntimeError(error_msg) from e
