import { Router } from "express";

import * as c from "../controllers/appointmentController.js";

import { authenticate } from "../middlewares/auth.js";

import { asyncHandler } from "../utils/asyncHandler.js";

import {
  appointmentCreate,
  appointmentList,
  idParam,
  statusSchema,
  validate,
} from "../validators/schemas.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate(appointmentCreate, "body"),
  asyncHandler(c.create),
);

router.get(
  "/",
  validate(appointmentList, "query"),
  asyncHandler(c.list),
);

router.patch(
  "/:id/status",
  validate(idParam, "params"),
  validate(statusSchema, "body"),
  asyncHandler(c.updateStatus),
);

router.get(
  "/patient/:id",
  validate(idParam, "params"),
  asyncHandler(c.byPatient),
);

export default router;