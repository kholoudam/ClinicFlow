import bcrypt from "bcrypt";

import { pool } from "../config/db.js";

import * as users from "../repositories/userRepository.js";

import { AppError } from "../utils/errors.js";

import { signToken } from "../utils/jwt.js";

export async function login(email, password) {
  const user = await users.findByEmail(pool, email);

  let valid = false;

  if (user) {
    valid = await bcrypt.compare(password, user.password_hash);
  } else {
    /*
     * Effectue quand même un bcrypt.compare()
     * lorsque l'utilisateur n'existe pas afin de
     * réduire les différences de temps de réponse.
     */
    const dummyHash = await bcrypt.hash("invalid-login", 10);

    await bcrypt.compare(password, dummyHash);
  }

  if (!user || !valid) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email or password",
    );
  }

  return {
    token: signToken(user),

    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

export async function me(id) {
  const user = await users.findPublicById(pool, id);

  if (!user) {
    throw new AppError(
      401,
      "UNAUTHORIZED",
      "User no longer exists",
    );
  }

  return user;
}