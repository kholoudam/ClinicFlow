import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import * as users from '../repositories/userRepository.js';
import { AppError } from '../utils/errors.js';
import { signToken } from '../utils/jwt.js';

export async function login(email, password) {
  const user = await users.findByEmail(pool, email);

  const valid = user
    ? await bcrypt.compare(password, user.password_hash)
    : await bcrypt.compare(
        password,
        await bcrypt.hash('invalid-login', 10)
      );

  if (!user || !valid) {
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password'
    );
  }

  return {
    token: signToken(user),
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  };
}

export async function me(id) {
  const user = await users.findPublicById(pool, id);

  if (!user) {
    throw new AppError(
      401,
      'UNAUTHORIZED',
      'User no longer exists'
    );
  }

  return user;
}