"""SMTP email service for sending transactional emails."""
import requests

from config import settings


def send_temp_password_email(to_email: str, name: str, username: str, temp_password: str) -> None:
    """Send a welcome email with the temporary password via Brevo."""
    if not settings.BREVO_API_KEY:
        # API not configured — log and skip (dev mode)
        print(f"[DEV] Temp password for {username}: {temp_password}")
        return
    subject = "Welcome to HirePrep — Your Temporary Password"
    
    from_addr = settings.SMTP_FROM
    sender_name = "HirePrep"
    sender_email = from_addr
    if "<" in from_addr and ">" in from_addr:
        sender_name = from_addr.split("<")[0].strip()
        sender_email = from_addr.split("<")[1].split(">")[0].strip()

    html_body = f"""
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                 background:#0a0f1e; color:#e5e7eb; padding:40px;">
      <div style="max-width:520px; margin:0 auto; background:#111827;
                  border-radius:16px; overflow:hidden; border:1px solid #1f2937;">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);
                    padding:32px 40px; text-align:center;">
          <h1 style="margin:0; font-size:24px; color:#fff; letter-spacing:-0.5px;">
            Welcome to HirePrep 🚀
          </h1>
        </div>

        <!-- Body -->
        <div style="padding:32px 40px;">
          <p style="margin:0 0 16px;">Hi <strong>{name}</strong>,</p>
          <p style="margin:0 0 24px; color:#9ca3af; line-height:1.6;">
            Your account has been created successfully. Use the temporary password below to
            log in. You'll be asked to set a new password on your first sign-in.
          </p>

          <div style="background:#1f2937; border:1px solid #374151; border-radius:12px;
                      padding:20px 24px; text-align:center; margin:0 0 24px;">
            <p style="margin:0 0 6px; font-size:12px; color:#6b7280; text-transform:uppercase;
                      letter-spacing:0.1em;">Your temporary password</p>
            <p style="margin:0; font-size:22px; font-weight:700; letter-spacing:2px;
                      color:#818cf8; font-family:monospace;">{temp_password}</p>
          </div>

          <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">Your username:</p>
          <p style="margin:0 0 24px; font-weight:600; color:#e5e7eb;">{username}</p>

          <a href="https://hire-prep-beta.vercel.app/login"
             style="display:inline-block; background:linear-gradient(135deg,#4f46e5,#7c3aed);
                    color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px;
                    font-weight:600; font-size:14px;">
            Sign In Now →
          </a>
        </div>

        <!-- Footer -->
        <div style="padding:20px 40px; border-top:1px solid #1f2937;">
          <p style="margin:0; font-size:12px; color:#4b5563; text-align:center;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
    """

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json"
    }
    payload = {
        "sender": {"name": sender_name, "email": sender_email},
        "to": [{"email": to_email, "name": name}],
        "subject": subject,
        "htmlContent": html_body
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        print(f"[INFO] Email sent successfully via Brevo. ID: {response.json().get('messageId')}")
    except Exception as e:
        print(f"[WARN] Failed to send email via Brevo: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"[WARN] Brevo Error details: {e.response.text}")
        raise
