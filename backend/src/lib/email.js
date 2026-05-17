const nodemailer = require('nodemailer');

const formatTherapistName = (user) => {
  if (!user) return 'Therapist';
  const first = (user.firstName || '').trim();
  const last = (user.lastName || '').trim();
  if (first.toLowerCase() === 'dr' || first.toLowerCase() === 'dr.') {
    return last === '-' ? 'Therapist' : last;
  }
  if (!last || last === '-') return first;
  return `${first} ${last}`;
};

// For development, we'll use a test account from Ethereal
// In production, you would use real SMTP credentials from .env
const createTransporter = async () => {
  // Try to use environment variables first
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: Create a test account on the fly for development
  let testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const sendAppointmentEmail = async (appointment, recipientEmail, recipientName, isPsychologist = false) => {
  try {
    const transporter = await createTransporter();
    const { psychologist, patient, scheduledAt, sessionType } = appointment;
    
    const dateStr = new Date(scheduledAt).toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    const timeStr = new Date(scheduledAt).toLocaleTimeString('en-US', { 
      hour: '2-digit', minute: '2-digit' 
    });

    const subject = isPsychologist 
      ? `New Appointment: ${patient.firstName} ${patient.lastName} 📅`
      : `Confirmation: Session with ${formatTherapistName(psychologist.user)} 📅`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #7C3AED; padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">CalmMind Appointment</h1>
        </div>
        <div style="padding: 30px; color: #374151; line-height: 1.6;">
          <p>Hello <strong>${recipientName}</strong>,</p>
          <p>${isPsychologist 
            ? 'A new therapy session has been booked with you.' 
            : 'Your appointment has been successfully confirmed. We are looking forward to seeing you.'}</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Date:</strong> ${dateStr}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${timeStr}</p>
            <p style="margin: 5px 0;"><strong>Type:</strong> ${sessionType}</p>
            <p style="margin: 0;"><strong>With:</strong> ${isPsychologist ? `${patient.firstName} ${patient.lastName}` : `${formatTherapistName(psychologist.user)}`}</p>
          </div>

          <p>Please ensure you are in a quiet, private space 5 minutes before the session starts.</p>
          
          <a href="http://localhost:3000/appointments" style="display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">View Dashboard</a>
        </div>
        <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
          &copy; 2026 CalmMind Mental Wellness Platform. All rights reserved.
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"CalmMind Support" <support@calmmind.app>',
      to: recipientEmail,
      subject,
      html,
    });

    console.log(`[Email Sent] Message ID: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`[Preview URL] ${nodemailer.getTestMessageUrl(info)}`);
    }
    return info;
  } catch (err) {
    console.error('[Email Error]', err);
  }
};

module.exports = { sendAppointmentEmail };
