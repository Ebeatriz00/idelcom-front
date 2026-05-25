import { z } from "zod";

const selectOptional = z.preprocess(
  (v) => (v === "" || v == null ? undefined : Number(v)),
  z.number().optional(),
);
const numOptional = z.preprocess(
  (v) => (v === "" || v == null ? undefined : Number(v)),
  z.number().optional(),
);

export const toDateNullable = () =>
  z.preprocess((v) => {
    if (v == null || v === "") return null;
    const d = v instanceof Date ? v : new Date(String(v));
    return Number.isNaN(d.getTime()) ? null : d;
  }, z.date().nullable());

const MAX_MB = 100;
const MAX_BYTES = MAX_MB * 1024 * 1024;

const isMissing = (v: unknown) =>
  v === undefined || v === null || v === "" || Number.isNaN(v as any);

export const createSchemaState = (opts: { canCreateOpporManager: boolean }) =>
  z
    .object({
      linkToken: z.string().trim().optional(),

      dateFinish: toDateNullable().optional(),

      stateOpporId: z.preprocess(
        (v) => (v === "" || v == null ? undefined : Number(v)),
        z.number({
          required_error: "Campo requerido",
          invalid_type_error: "Campo requerido",
        }),
      ),

      opporNumber: z.string().trim().min(3, "Mínimo 3 caracteres"),
      reasonRejectionId: selectOptional,
      reasonRejection: z.string().optional(),
      proposalComment: z.string().optional(),

      // viabilidad (opcionales)
      viabilityScore: z.number().optional(),
      compliance: z.number().optional(),
      partialCompliance: z.number().optional(),
      nonCompliance: z.number().optional(),
      minScore: numOptional,
      maxScore: numOptional,

      contractMethod: selectOptional,
      contractMethodDesc: z.string().trim().optional(),

      requiresIsos: selectOptional,
      requiresIsosDesc: z.string().trim().optional(),

      authority: selectOptional,
      authorityDesc: z.string().trim().optional(),

      budget: selectOptional,
      budgetDesc: z.string().trim().optional(),

      need: selectOptional,
      needDesc: z.string().trim().optional(),

      term: selectOptional,
      termDesc: z.string().trim().optional(),

      companyExperience: selectOptional,
      companyExperienceDesc: z.string().trim().optional(),

      workerExperience: selectOptional,
      workerExperienceDesc: z.string().trim().optional(),

      staffExperience: selectOptional,
      staffExperienceDesc: z.string().trim().optional(),

      ability: selectOptional,
      abilityDesc: z
        .string()
        .nullish()
        .transform((v) => v ?? ""),

      shedule: selectOptional,
      sheduleDesc: z.string().trim().optional(),

      deliverables: z
        .array(
          z
            .object({
              deliverablesId: z.number(),

              comment: z.string().trim().optional(),

              name: z.string().optional(),

              dueDate: z.preprocess((v) => {
                if (v == null || v === "") return null;
                const d = v instanceof Date ? v : new Date(String(v));
                return Number.isNaN(d.getTime()) ? null : d;
              }, z.date().nullable()),

              fromDb: z.boolean().optional(),
            })
            .superRefine((d, ctx) => {
              const isFromDb = d.fromDb === true;

              if (!isFromDb) {
                if (!d.comment || d.comment.length === 0) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["comment"],
                    message: "Campo requerido",
                  });
                }

                if (!d.dueDate) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["dueDate"],
                    message: "La fecha es obligatoria",
                  });
                }
              }
            }),
        )
        .optional(),

      deliverablesHiring: z
        .array(
          z
            .object({
              deliverablesId: z.number(),
              comment: z.string().trim().optional(),
              name: z.string().optional(),
              dueDate: toDateNullable(),
              fromDb: z.boolean().optional(),
            })
            .refine((d) => d.fromDb || d.dueDate, {
              path: ["dueDate"],
              message: "La fecha es obligatoria",
            }),
        )
        .optional(),

      observations: z
        .array(
          z
            .object({
              obsId: z.number(),
              obsSeverity: z.number().optional(),
              obsComment: z.string().optional(),
              dueDate: z.preprocess((v) => {
                if (v == null || v === "") return null;
                const d = v instanceof Date ? v : new Date(String(v));
                return Number.isNaN(d.getTime()) ? null : d;
              }, z.date().nullable()),
            })
        )
        .optional(),

      wonComment: z.string().optional(),

      fileTitle: z.string().optional(),
      excelFile: z
        .instanceof(File)
        .optional()
        .refine((f) => !f || f.size <= MAX_BYTES, `Máx. ${MAX_MB}MB`)
        .refine(
          (f) => !f || /\.(xlsx|xls)$/i.test(f.name),
          "Solo archivos .xlsx o .xls",
        ),
      relativePath: z.string().optional(),
      archiveType: z.string().optional(),
      fileUrl: z.string().optional(),
      currencyId: z.number().optional(),

      proposalPresentated: z.boolean().optional(),
      negotationOutcomeId: selectOptional,
      typeObsClientsId: selectOptional,
      reasonObsClients: z.string().trim().optional(),
      typeObsEconomic: selectOptional,
      dateRegister: toDateNullable().optional(),
      isHiring: z.preprocess(
        (v) =>
          v === "" || v == null
            ? undefined
            : v === true || v === "true" || Number(v) === 1,
        z.boolean().optional(),
      ),

      brandAproach: selectOptional,
      brandAproachDesc: z
        .string()
        .nullish()
        .transform((v) => (v ?? "").trim()),
      TechnicalChanges: selectOptional,
      TechnicalChangesDesc: z
        .string()
        .nullish()
        .transform((v) => (v ?? "").trim()),
      isReEvaluation: z.preprocess(
        (v) =>
          v === "" || v == null
            ? undefined
            : v === true || v === "true" || Number(v) === 1,
        z.boolean().optional(),
      ),
      quotationVerId: selectOptional,
      callDate: z.preprocess((v) => {
        if (v == null || v === "") return null;
        const d = v instanceof Date ? v : new Date(String(v));
        return Number.isNaN(d.getTime()) ? null : d;
      }, z.date().nullable()),
      followupEnabled: z.boolean().optional().default(false),
      stateOpporGenId: z.number().optional(),
      pmConditionId: z.number().optional(),
    })
    .superRefine((data, ctx) => {
      const requireViability =
        Number(data.stateOpporId) === 2 && !opts.canCreateOpporManager;

      const isHiring =
        data.isHiring === true || Number(data.isHiring as any) === 1;

      const isReEvaluation =
        data.isReEvaluation === true ||
        Number(data.isReEvaluation as any) === 1;

      const isDiscarded = Number(data.stateOpporId) === 12;

      // -------------------------
      // 1) Validaciones de viabilidad
      // -------------------------
      if (requireViability) {
        (
          [
            "minScore",
            "maxScore",
            "viabilityScore",
            "compliance",
            "partialCompliance",
            "nonCompliance",
            "authorityDesc",
            "budgetDesc",
            "needDesc",
            "termDesc",
            "companyExperienceDesc",
            "workerExperienceDesc",
            "staffExperienceDesc",
            "abilityDesc",
            "sheduleDesc",
            ...(isHiring ? (["contractMethodDesc"] as const) : []),
            ...(isHiring ? (["requiresIsosDesc"] as const) : []),
            ...(isReEvaluation ? (["brandAproachDesc"] as const) : []),
            ...(isReEvaluation ? (["TechnicalChangesDesc"] as const) : []),
          ] as const
        ).forEach((k) => {
          if (isMissing(data[k])) {
            ctx.addIssue({
              code: "custom",
              path: [k],
              message: "Campo requerido",
            });
          }
        });

        const viabilitySelects = [
          ...(isHiring ? (["contractMethod"] as const) : []),
          ...(isHiring ? (["requiresIsos"] as const) : []),
          "authority",
          "budget",
          "need",
          "term",
          "companyExperience",
          "workerExperience",
          "staffExperience",
          "ability",
          "shedule",
          ...(isReEvaluation ? (["brandAproach"] as const) : []),
          ...(isReEvaluation ? (["TechnicalChanges"] as const) : []),
        ] as const;

        viabilitySelects.forEach((k) => {
          if (isMissing(data[k])) {
            ctx.addIssue({
              code: "custom",
              path: [k],
              message: "Selecciona una opción",
            });
          }
        });

        const delivs = data.deliverables ?? [];
        if (delivs.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["deliverables"],
            message: "Debes agregar al menos un entregable para preventa.",
          });
        }
      }

      // -------------------------
      // 2) Validación de fechas vs dateFinish y Obligatoriedad Condicional
      // -------------------------
      const validateList = <T extends { dueDate: Date | null }>(
        list: T[] | undefined,
        basePath: "deliverables" | "deliverablesHiring" | "observations",
      ) => {
        (list ?? []).forEach((item, index) => {
          // La fecha en observaciones es obligatoria EXCEPTO si el estado es Descartado (12)
          if (basePath === "observations" && !isDiscarded && !item.dueDate) {
             ctx.addIssue({
               code: z.ZodIssueCode.custom,
               path: [basePath, index, "dueDate"],
               message: "La fecha es obligatoria",
             });
             return; 
          }

          if (!item.dueDate || !data.dateFinish) return;

          const finish = new Date(data.dateFinish);
          finish.setHours(23, 59, 59, 999);
          
          const due = new Date(item.dueDate);
          if (due.getTime() > finish.getTime()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [basePath, index, "dueDate"],
              message:
                "La fecha no puede ser mayor a la fecha fin de la oportunidad.",
            });
          }
        });
      };

      validateList(data.deliverables, "deliverables");
      validateList(data.deliverablesHiring, "deliverablesHiring");
      validateList(data.observations, "observations");

      // -------------------------
      // 3) Propuesta
      // -------------------------
      const requireProposal = Number(data.stateOpporId) === 4;
      const stateGen = Number(data.stateOpporGenId) === 1;

      if (requireProposal && stateGen) {
        if (data.proposalPresentated === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["proposalPresentated"],
            message: "Campo requerido",
          });
        }

        if (!data.excelFile) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["excelFile"],
            message: "Campo requerido",
          });
        }

        if (data.proposalPresentated === false) {
          const comment = (data.proposalComment ?? "").trim();
          if (!comment) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["proposalComment"],
              message: "Campo requerido",
            });
          }
        }

        if (data.pmConditionId === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["pmConditionId"],
            message: "Campo requerido",
          });
        }
      }

      // -------------------------
      // 4) Negociación
      // -------------------------
      const negotiation = Number(data.stateOpporId) === 8;

      if (negotiation) {
        const outcome = data.negotationOutcomeId;

        if (outcome == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["negotationOutcomeId"],
            message: "Campo requerido",
          });
          return;
        }

        const isObsClient = Number(outcome) === 17;
        if (isObsClient) {
          const typeObsClientId = data.typeObsClientsId;

          if (typeObsClientId == null) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["typeObsClientsId"],
              message: "Campo requerido",
            });
          }
          const t = Number(data.typeObsClientsId ?? 0);
          if (
            t === 1 &&
            (!data.reasonObsClients || data.reasonObsClients.trim() === "")
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["reasonObsClients"],
              message: "Campo requerido",
            });
          } else if (t === 2) {
            if (!data.typeObsEconomic) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["typeObsEconomic"],
                message: "Campo requerido",
              });
            }
            if (!data.reasonObsClients || data.reasonObsClients.trim() === "") {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["reasonObsClients"],
                message: "Campo requerido",
              });
            }
          }
        }
      }
    });

export type FormStateValues = z.infer<ReturnType<typeof createSchemaState>>;