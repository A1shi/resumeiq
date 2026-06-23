import logging
import requests
from app.config import settings

logger = logging.getLogger("app.services.email")

def send_email(to_email: str, subject: str, html_content: str):
    """
    Sends an email using the Brevo REST API over HTTPS.
    """
    # 4. Before sending the request, validate:
    if not settings.BREVO_API_KEY.strip():
        raise ValueError("BREVO_API_KEY is empty.")

    # 3. Before making the request, log status:
    logger.info("BREVO_API_KEY loaded: %s", bool(settings.BREVO_API_KEY))
    logger.info("BREVO sender: %s", settings.SMTP_SENDER)

    # 1. Endpoint
    url = "https://api.brevo.com/v3/smtp/email"

    # 2. Headers
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json",
    }

    # 7. Payload matching Brevo's API format
    payload = {
        "sender": {
            "name": "ResumeIQ",
            "email": settings.SMTP_SENDER,
        },
        "to": [
            {
                "email": to_email,
            }
        ],
        "subject": subject,
        "htmlContent": html_content,
    }

    try:
        logger.info(f"Sending email via Brevo REST API to {to_email}...")
        # 5. Send request
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=30,
        )
        
        # 6. Log response status and body
        logger.info("Status Code: %s", response.status_code)
        logger.info("Response Body: %s", response.text)

        if response.status_code == 201:
            logger.info(f"Email sent successfully to {to_email}")
        else:
            error_detail = f"Brevo API error: HTTP Status {response.status_code}, Body: {response.text}"
            raise RuntimeError(error_detail)
    except Exception as e:
        error_detail = f"Failed to send email via Brevo REST API: {str(e)}"
        logger.error(error_detail, exc_info=True)
        raise RuntimeError(error_detail) from e
