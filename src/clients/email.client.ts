import { MailtrapClient } from 'mailtrap';

const client = new MailtrapClient({ token: process.env.MAIL_PASS! });

const sender = { email: 'hello@demomailtrap.co', name: 'Nodejs 2026' };

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  await client.send({
    from: sender,
    to: [{ email: to }],
    subject: 'Verify your email',
    html: `<p>Your verification token: <strong>${token}</strong></p>`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const url = `${process.env.APP_URL}/api/auth/reset-password?token=${token}`;
  await client.send({
    from: sender,
    to: [{ email: to }],
    subject: 'Reset your password',
    html: `<p>Click <a href="${url}">here</a> to reset your password. Link expires in 1 hour.</p>`,
  });
}
