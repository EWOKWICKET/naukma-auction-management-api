import nodemailer from 'nodemailer';

export const emailTransport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  await emailTransport.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject: 'Verify your email',
    html: token,
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
