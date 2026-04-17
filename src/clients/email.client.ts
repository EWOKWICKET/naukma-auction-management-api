import nodemailer from 'nodemailer';

export const emailTransport = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const url = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;
  await emailTransport.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: 'Verify your email',
    html: `<p>Click <a href="${url}">here</a> to verify your email. Link expires in 10 minutes.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const url = `${process.env.APP_URL}/api/auth/reset-password?token=${token}`;
  await emailTransport.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: 'Reset your password',
    html: `<p>Click <a href="${url}">here</a> to reset your password. Link expires in 1 hour.</p>`,
  });
}
