import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/errors.js";

export function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Authentication required.",
      );
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Invalid authentication token.",
      );
    }

    const payload = verifyToken(token);

    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(
      new AppError(
        401,
        "UNAUTHORIZED",
        "Invalid or expired token.",
      ),
    );
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          "FORBIDDEN",
          "You do not have permission to perform this action.",
        ),
      );
    }

    next();
  };
}