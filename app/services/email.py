import smtplib
import logging
import socket
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
        logger.info(f"Resolving SMTP host {settings.SMTP_HOST}...")
        addr_info = socket.getaddrinfo(settings.SMTP_HOST, settings.SMTP_PORT, type=socket.SOCK_STREAM)
    except Exception as e:
        error_msg = f"Failed to resolve SMTP host {settings.SMTP_HOST}: {str(e)}"
        logger.error(error_msg, exc_info=True)
        raise RuntimeError(error_msg) from e

    # Log every resolved address
    logger.info("Resolved addresses for SMTP host:")
    for item in addr_info:
        family, _, _, _, sockaddr = item
        fam_str = "IPv4" if family == socket.AF_INET else "IPv6" if family == socket.AF_INET6 else str(family)
        logger.info(f"- {fam_str}: {sockaddr[0]}")

    # Prefer IPv4 (socket.AF_INET) addresses
    ipv4_addrs = [item for item in addr_info if item[0] == socket.AF_INET]
    ipv6_addrs = [item for item in addr_info if item[0] == socket.AF_INET6]
    other_addrs = [item for item in addr_info if item[0] not in (socket.AF_INET, socket.AF_INET6)]
    candidate_addrs = ipv4_addrs + ipv6_addrs + other_addrs

    server = None
    success = False
    errors = []

    for family, socktype, proto, canonname, sockaddr in candidate_addrs:
        ip = sockaddr[0]
        # Always log chosen info before connection attempt
        logger.info(f"Attempting SMTP connection: SMTP_HOST={settings.SMTP_HOST}, SMTP_PORT={settings.SMTP_PORT}, SMTP_USERNAME={settings.SMTP_USERNAME}, Target_IP={ip}")
        try:
            if settings.SMTP_USE_SSL:
                logger.info(f"Connecting via SSL to {ip}:{settings.SMTP_PORT}...")
                server = smtplib.SMTP_SSL(timeout=10)
                server._host = settings.SMTP_HOST
                server.connect(ip, settings.SMTP_PORT)
                logger.info("SSL connection established successfully.")
            else:
                logger.info(f"Connecting to {ip}:{settings.SMTP_PORT}...")
                server = smtplib.SMTP(timeout=10)
                server._host = settings.SMTP_HOST
                server.connect(ip, settings.SMTP_PORT)
                logger.info("SMTP connection established successfully.")
                if settings.SMTP_USE_TLS:
                    logger.info("Starting TLS...")
                    server.starttls()
                    logger.info("TLS started successfully.")
            
            success = True
            break
        except Exception as e:
            err_msg = f"Failed to connect to IP {ip}: {str(e)}"
            logger.error(err_msg, exc_info=True)
            errors.append((ip, str(e)))
            if server:
                try:
                    server.close()
                except Exception:
                    pass
                server = None

    if not success or not server:
        err_details = "; ".join([f"{ip}: {err}" for ip, err in errors])
        error_msg = f"Failed to connect to SMTP server. Tried addresses: {', '.join([sockaddr[0] for _, _, _, _, sockaddr in candidate_addrs])}. Errors: {err_details}"
        logger.error(error_msg)
        raise RuntimeError(error_msg)

    try:
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
        if server:
            try:
                server.close()
            except Exception:
                pass
        raise RuntimeError(error_msg) from e
    except Exception as e:
        error_msg = f"Unexpected error occurred while sending email: {str(e)}"
        logger.error(error_msg, exc_info=True)
        if server:
            try:
                server.close()
            except Exception:
                pass
        raise RuntimeError(error_msg) from e
