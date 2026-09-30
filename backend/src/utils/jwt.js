import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  );
}

export function verifyToken(token) {
  return jwt.verify(
    token,
    env.JWT_SECRET,
  );
}