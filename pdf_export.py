import io
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fpdf import FPDF
import os
import smtplib
from email.message import EmailMessage

router = APIRouter()

class GuidePDFRequest(BaseModel):
    guide: str
    resume: str
    job_description: str
    company_name: str

class EmailGuideRequest(GuidePDFRequest):
    email: str

def create_guide_pdf(guide: str, resume: str, job_description: str, company_name: str) -> io.BytesIO:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, f"Interview Guide for {company_name}", ln=True, align="C")
    pdf.ln(8)

    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Job Description", ln=True)
    pdf.set_font("Arial", "", 11)
    for line in job_description.splitlines():
        pdf.multi_cell(0, 8, line)
    pdf.ln(4)

    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Resume", ln=True)
    pdf.set_font("Arial", "", 11)
    for line in resume.splitlines():
        pdf.multi_cell(0, 8, line)
    pdf.ln(4)

    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, "Interview Guide", ln=True)
    pdf.set_font("Arial", "", 11)
    for line in guide.splitlines():
        pdf.multi_cell(0, 8, line)
    pdf.ln(4)

    out = io.BytesIO()
    pdf.output(out)
    out.seek(0)
    return out

@router.post("/api/generate-pdf/")
async def generate_pdf(data: GuidePDFRequest):
    pdf_bytes = create_guide_pdf(data.guide, data.resume, data.job_description, data.company_name)
    return StreamingResponse(pdf_bytes, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename=interview_guide_{data.company_name}.pdf"
    })

@router.post("/api/email-guide/")
async def email_guide(data: EmailGuideRequest):
    pdf_bytes = create_guide_pdf(data.guide, data.resume, data.job_description, data.company_name)
    # SMTP setup from .env
    EMAIL_HOST = os.getenv("EMAIL_HOST")
    EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
    EMAIL_USER = os.getenv("EMAIL_USER")
    EMAIL_PASS = os.getenv("EMAIL_PASS")
    EMAIL_FROM = os.getenv("EMAIL_FROM", EMAIL_USER)
    if not all([EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM]):
        return {"error": "Email server not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM in .env."}
    msg = EmailMessage()
    msg["Subject"] = f"Your Interview Guide for {data.company_name}"
    msg["From"] = EMAIL_FROM
    msg["To"] = data.email
    msg.set_content(f"Attached is your interview guide for {data.company_name}.")
    msg.add_attachment(pdf_bytes.read(), maintype="application", subtype="pdf", filename=f"interview_guide_{data.company_name}.pdf")
    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)
        return {"success": True}
    except Exception as e:
        return {"error": str(e)}
