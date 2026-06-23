import os
import re
import logging
import requests
from app.config import settings

logger = logging.getLogger("app.services.email")

def send_email(to_email: str, subject: str, html_content: str):
    """
    Sends an email using the Brevo REST API over HTTPS.
    Reads BREVO_API_KEY from environment variables and parses SMTP_SENDER for verified email.
    """
    # 1. Read BREVO_API_KEY from environment variables
    brevo_api_key = os.environ.get("BREVO_API_KEY", "")
    if not brevo_api_key:
        error_msg = "BREVO_API_KEY is not configured in the environment variables."
        logger.error(error_msg)
        raise ValueError(error_msg)

    # 2. Extract verified sender email from settings.SMTP_SENDER
    sender_raw = settings.SMTP_SENDER
    if not sender_raw:
        error_msg = "SMTP_SENDER is not configured."
        logger.error(error_msg)
        raise ValueError(error_msg)

    sender_email = sender_raw
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', sender_raw)
    if email_match:
        sender_email = email_match.group(0)

    # 3. Post request to Brevo SMTP email API
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": brevo_api_key,
        "Content-Type": "application/json"
    }

    payload = {
        "sender": {
            "name": "ResumeIQ",
            "email": sender_email
        },
        "to": [
            {
                "email": to_email
            }
        ],
        "subject": subject,
        "htmlContent": html_content
    }

    try:
        logger.info(f"Sending email via Brevo REST API to {to_email}...")
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        # If response status is not 201, log HTTP status, body, and exception details
        if response.status_code == 201:
            logger.info(f"Email sent successfully to {to_email}")
        else:
            error_detail = f"Brevo API error: HTTP Status {response.status_code}, Body: {response.text}"
            logger.error(error_detail)
            raise RuntimeError(error_detail)
    except Exception as e:
        error_detail = f"Failed to send email via Brevo REST API: {str(e)}"
        logger.error(error_detail, exc_info=True)
        raise RuntimeError(error_detail) from e
