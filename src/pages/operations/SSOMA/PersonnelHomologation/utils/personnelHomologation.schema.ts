import { z } from "zod";

const requiredNumber = (message = "Requerido") =>
  z.number({
    required_error: message,
    invalid_type_error: message,
  });

const requiredString = (message = "Requerido") =>
  z.string().trim().min(1, message);

export const homologationPersonnelSchema = z.object({
  homologationScopeId: requiredNumber(),
  operationsId: z.number().optional(),
  workerId: requiredNumber(),
  medicalAptitudeId: z.number().optional(),
  validFrom: requiredString(),
  ssomaApproved: z.boolean(),
  adminApproved: z.boolean(),
  notes: z.string().trim().optional(),
});

export const homologationPersonnelDocumentSchema = z.object({
  requirementId: z.number().optional(),
  fileName: z.string().trim().optional(),
  fileUrl: z.string().trim().optional(),
  filePath: z.string().trim().optional(),
  localUploadToken: z.string().trim().optional(),
  issueDate: z.string().trim().optional(),
  expirationDate: z.string().trim().optional(),
  reviewDate: z.string().trim().optional(),
  observation: z.string().trim().optional(),
  file: z.any().optional(),
});

export const createSchema = () =>
  z
    .object({
      homologationPersonnel: homologationPersonnelSchema,
      documents: z.array(homologationPersonnelDocumentSchema),
    })
    .superRefine((data, ctx) => {
      const { homologationScopeId, operationsId } = data.homologationPersonnel;
      const isGeneralScope = Number(homologationScopeId) === 1;
      const isOperationScope = Number(homologationScopeId) === 2;

      // 1. Validar OperationsId según el Scope
      if (isGeneralScope && operationsId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La homologación general no debe tener una operación asociada.",
          path: ["homologationPersonnel", "operationsId"],
        });
      }

      if (isOperationScope && !operationsId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe seleccionar una operación para la homologación por proyecto.",
          path: ["homologationPersonnel", "operationsId"],
        });
      }

      // 2. Validar duplicados de RequirementId y restricción de CAMO (ID 12) en Scope 1
      const seenRequirementIds = new Set<number>();

      data.documents.forEach((doc, index) => {
        const requirementId = Number(doc.requirementId);
        const hasFileName = Boolean(doc.fileName?.trim());
        const hasFilePath = Boolean(doc.filePath?.trim());
        const hasIssueDate = Boolean(doc.issueDate?.trim());
        const isAttemptingToSaveDocument = Boolean(doc.localUploadToken?.trim());

        if (!requirementId) {
          if (isAttemptingToSaveDocument) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Debe seleccionar un requisito.",
              path: ["documents", index, "requirementId"],
            });
          }
          return;
        }

        if (isAttemptingToSaveDocument) {
          if (!hasFileName) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Debe subir un archivo.",
              path: ["documents", index, "fileName"],
            });
          }

          if (!hasFilePath) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Debe subir un archivo.",
              path: ["documents", index, "filePath"],
            });
          }

          if (!hasIssueDate) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Requerido",
              path: ["documents", index, "issueDate"],
            });
          }
        }

        // Validar duplicados
        if (seenRequirementIds.has(requirementId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Este requisito ya ha sido seleccionado en esta homologación.",
            path: ["documents", index, "requirementId"],
          });
        }
        seenRequirementIds.add(requirementId);

        // Validar CAMO (12) en Scope 1
        if (isGeneralScope && requirementId === 12) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "El requerimiento CAMO solo aplica a homologaciones por proyecto.",
            path: ["documents", index, "requirementId"],
          });
        }
      });
    });

export type PersonnelHomologationFormValues = z.infer<
  ReturnType<typeof createSchema>
>;
