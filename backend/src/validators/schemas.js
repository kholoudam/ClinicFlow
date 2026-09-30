import { z } from "zod";

import { AppError } from "../utils/errors.js";

/*
|--------------------------------------------------------------------------
| Validation middleware
|--------------------------------------------------------------------------
*/

export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "Les données fournies sont invalides.",
          details,
        ),
      );
    }

    /*
     * Ne pas faire :
     *
     * req.query = result.data
     * req.params = result.data
     *
     * Express/Router peut rendre ces propriétés readonly.
     *
     * Les données validées sont donc stockées dans req.validated.
     */

    if (!req.validated) {
      req.validated = {};
    }

    req.validated[source] = result.data;

    next();
  };
};

/*
|--------------------------------------------------------------------------
| Common schemas
|--------------------------------------------------------------------------
*/

export const idParam = z.object({
  id: z.string().uuid("Identifiant invalide."),
});

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Adresse email invalide.")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, "Le mot de passe est obligatoire."),
});

/*
|--------------------------------------------------------------------------
| Patients
|--------------------------------------------------------------------------
*/

export const patientSchema = z.object({
  cin: z
    .string()
    .trim()
    .min(1, "Le CIN est obligatoire.")
    .max(50, "Le CIN est trop long."),

  full_name: z
    .string()
    .trim()
    .min(2, "Le nom complet est obligatoire.")
    .max(150, "Le nom complet est trop long."),

  date_of_birth: z
    .string()
    .trim()
    .min(1, "La date de naissance est obligatoire."),

  phone: z
    .string()
    .trim()
    .min(1, "Le téléphone est obligatoire.")
    .max(30, "Le numéro de téléphone est trop long."),

  email: z
    .string()
    .trim()
    .email("Adresse email invalide.")
    .transform((value) => value.toLowerCase()),

  address: z
    .string()
    .trim()
    .max(255, "L'adresse est trop longue.")
    .optional()
    .or(z.literal("")),
});

export const patientListQuery = z.object({
  search: z
    .string()
    .trim()
    .optional()
    .default(""),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),
});

/*
|--------------------------------------------------------------------------
| Appointments
|--------------------------------------------------------------------------
*/

export const appointmentCreate = z.object({
  patient_id: z
    .string()
    .uuid("Identifiant patient invalide."),

  appointment_date: z
    .string()
    .trim()
    .min(1, "La date du rendez-vous est obligatoire."),

  reason: z
    .string()
    .trim()
    .max(500, "Le motif est trop long.")
    .optional()
    .or(z.literal("")),

  status: z
    .enum(["pending", "confirmed", "cancelled"])
    .default("pending"),
});

export const appointmentList = z.object({
  patient_id: z
    .string()
    .uuid("Identifiant patient invalide.")
    .optional(),

  status: z
    .enum(["pending", "confirmed", "cancelled"])
    .optional(),

  date: z
    .string()
    .trim()
    .optional(),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),
});

export const statusSchema = z.object({
  status: z.enum(
    ["pending", "confirmed", "cancelled"],
    {
      message: "Statut de rendez-vous invalide.",
    },
  ),
});