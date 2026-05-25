import { z } from "zod";

export const requirementSchema = z.object({
  requirementId: z.number().optional(),
  name: z.string().min(3, "El nombre es requerido (mínimo 3 caracteres)").max(200),
  description: z.string().optional(),
  duration: z.coerce.number().min(0, "La duración no puede ser negativa"),
  scopeId: z.coerce.number().min(1, "El alcance es requerido"),
  hasExpiration: z.boolean().default(false),
  requiresFile: z.boolean().default(false),
  requiresExpiration: z.boolean().default(false),
  maxFileSize: z.coerce.number().min(0, "El tamaño no puede ser negativo"),
  allowedExtensions: z.string().optional(),
  allowInternalReuse: z.boolean().default(false),
});

export type RequirementFormValues = z.infer<typeof requirementSchema>;
