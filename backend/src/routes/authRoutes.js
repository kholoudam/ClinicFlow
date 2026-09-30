import { Router } from "express";

import * as c from "../controllers/authController.js";

import { authenticate } from "../middlewares/auth.js";

import { asyncHandler } from "../utils/asyncHandler.js";

import {
  loginSchema,
  validate,
} from "../validators/schemas.js";

const router = Router();

router.post(
  "/login",
  validate(loginSchema, "body"),
  asyncHandler(c.login),
);

router.get(
  "/me",
  authenticate,
  asyncHandler(c.me),
);

export default router;