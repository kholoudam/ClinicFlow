import { Router } from "express";

import * as c from "../controllers/patientController.js";

import { authenticate, requireRole } from "../middlewares/auth.js";

import { asyncHandler } from "../utils/asyncHandler.js";

import {
  idParam,
  patientListQuery,
  patientSchema,
  validate,
} from "../validators/schemas.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate(patientSchema, "body"),
  asyncHandler(c.create),
);

router.get(
  "/",
  validate(patientListQuery, "query"),
  asyncHandler(c.list),
);

router.get(
  "/:id",
  validate(idParam, "params"),
  asyncHandler(c.get),
);

router.put(
  "/:id",
  validate(idParam, "params"),
  validate(patientSchema, "body"),
  asyncHandler(c.update),
);

router.delete(
  "/:id",
  requireRole("admin"),
  validate(idParam, "params"),
  asyncHandler(c.remove),
);

export default router;