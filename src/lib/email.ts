import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendPrizeEmail(email: string, prizeName: string, prizeCode: string | null) {
  const mailOptions = {
    from: `"Lead Magnet Roulette" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Congratulations! You've won a prize!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h1 style="color: #c5a059; text-align: center;">You're a Winner!</h1>
        <p>Hi there,</p>
        <p>Thank you for spinning the wheel! You've won the following prize:</p>
        <div style="background: #f1f1f1; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h2 style="margin: 0; font-size: 24px;">${prizeName}</h2>
          ${prizeCode ? `<p style="font-size: 32px; font-weight: bold; margin-top: 10px; color: #1a1a1a;">${prizeCode}</p>` : ""}
        </div>
        <p>Use this code at checkout to claim your reward.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">
          Lead Magnet Roulette © ${new Date().getFullYear()}
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
