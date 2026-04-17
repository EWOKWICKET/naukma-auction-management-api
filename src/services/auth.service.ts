import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { sendVerificationEmail, sendPasswordResetEmail } from '../clients/email.client';
import { ConflictError } from '../errors/ConflictError';
import { UnauthorizedError } from '../errors/UnauthorizedError';
import { BadRequestError } from '../errors/BadRequestError';

const SALT_ROUNDS = 10;

function signAuthToken(userId: string, role: string): string {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

function signVerificationToken(userId: string): string {
  return jwt.sign({ id: userId, purpose: 'verify' }, process.env.JWT_SECRET!, {
    expiresIn: '10m',
  });
}

function signPasswordResetToken(userId: string): string {
  return jwt.sign({ id: userId, purpose: 'reset' }, process.env.JWT_SECRET!, { expiresIn: '1h' });
}

export const authService = {
  async register(email: string, password: string): Promise<void> {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ConflictError('Email already registered');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({ email, passwordHash });
    const token = signVerificationToken(user.id);
    await sendVerificationEmail(email, token);
  },

  async login(email: string, password: string): Promise<string> {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    if (!user.isVerified) throw new UnauthorizedError('Email not verified');

    return signAuthToken(user.id, user.role);
  },

  async verifyEmail(token: string): Promise<void> {
    let payload: { id: string; purpose: string };
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as typeof payload;
    } catch {
      throw new BadRequestError('Invalid or expired verification link');
    }

    if (payload.purpose !== 'verify') throw new BadRequestError('Invalid token');

    const user = await userRepository.findById(payload.id);
    if (!user) throw new BadRequestError('User not found');
    if (user.isVerified) return;

    await userRepository.update(user.id, { isVerified: true });
  },

  async requestPasswordReset(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user) return;

    const token = signPasswordResetToken(user.id);
    await sendPasswordResetEmail(email, token);
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    let payload: { id: string; purpose: string };
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET!) as typeof payload;
    } catch {
      throw new BadRequestError('Invalid or expired reset token');
    }

    if (payload.purpose !== 'reset') throw new BadRequestError('Invalid token');

    const user = await userRepository.findById(payload.id);
    if (!user) throw new BadRequestError('User not found');

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.update(user.id, { passwordHash });
  },
};
