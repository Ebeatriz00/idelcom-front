// form/schema.ts
import { z } from "zod";

const selectOptional = z.preprocess(
  (v) => (v === "" || v == null ? undefined : Number(v)),
  z.number().optional(),
);

export const parseDateOnly = (v: unknown): Date | null => {
  if (!v) return null;

  if (v instanceof Date) {
    return new Date(v.getFullYear(), v.getMonth(), v.getDate());
  }

  const s = String(v).trim();
  if (!s) return null;

  const isoMatch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(s);
  if (isNaN(date.getTime())) return null;

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const compareDateOnly = (date1: Date, date2: Date): number => {
  const normalize = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const d1 = normalize(date1);
  const d2 = normalize(date2);

  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};
const zDateOnlyNullable = () =>
  z.preprocess((v) => parseDateOnly(v), z.date().nullable());

const zDateOnlyRequired = (msg = "Campo requerido") =>
  z.preprocess(
    (v) => {
      const parsed = parseDateOnly(v);
      if (parsed === null) return undefined;
      return parsed;
    },
    z.date({ required_error: msg, invalid_type_error: msg }),
  );

export const createSchema = (canCreateOpporManager: boolean) =>
  z
    .object({
      linkToken: z.string().trim().optional(),

      negotiationStagesId: z.preprocess(
        (v) => {
          if (v && typeof v === "object" && "value" in (v as any))
            return Number((v as any).value);
          return v === "" || v == null ? 0 : Number(v);
        },
        z.number().min(1, "Campo requerido"),
      ),

      opporDesc: z.string().trim().min(3, "Mínimo 3 caracteres"),
      opporNumber: z.string().trim().optional(),

      opporAmount: z.preprocess(
        (v) => {
          if (v && typeof v === "object" && "value" in (v as any))
            return Number((v as any).value);
          return v === "" || v == null ? 0 : Number(v);
        },
        z.number().min(1, "Campo requerido"),
      ),

      porcentProgressPro: z.preprocess(
        (v) => {
          if (v && typeof v === "object" && "value" in (v as any))
            return Number((v as any).value);
          return v === "" || v == null ? 0 : Number(v);
        },
        z.number().min(1, "Campo requerido"),
      ),

      flowTypeId: z.preprocess(
        (v) => {
          if (v && typeof v === "object" && "value" in (v as any))
            return Number((v as any).value);
          return v === "" || v == null ? 0 : Number(v);
        },
        z.number().min(1, "Campo requerido"),
      ),
      typeOppor: z.preprocess(
        (v) => {
          if (v && typeof v === "object" && "value" in (v as any))
            return Number((v as any).value);
          return v === "" || v == null ? 0 : Number(v);
        },
        z.number().min(1, "Campo requerido"),
      ),

      parentOpporId: z.number().optional(),

      pmConditionId: z.number().optional(),

      dateRegister: zDateOnlyRequired("Campo requerido"),

      dateFinish: z.preprocess((v) => parseDateOnly(v), z.date().nullable()),

      clientsId: z.preprocess(
        (v) => {
          if (v && typeof v === "object" && "value" in (v as any))
            return Number((v as any).value);
          return v === "" || v == null ? 0 : Number(v);
        },
        z.number().min(1, "Campo requerido"),
      ),

      businessLineId: z.preprocess(
        (v) => {
          if (v && typeof v === "object" && "value" in (v as any))
            return Number((v as any).value);
          return v === "" || v == null ? 0 : Number(v);
        },
        z.number().min(1, "Campo requerido"),
      ),

      stateOpporId: z.number().optional(),

      workerId: z.number({
        required_error: "Campo requerido",
        invalid_type_error: "Campo requerido",
      }),

      currencyId: z.preprocess(
        (v) => {
          if (v && typeof v === "object" && "value" in (v as any))
            return Number((v as any).value);
          return v === "" || v == null ? 0 : Number(v);
        },
        z.number().min(1, "Campo requerido"),
      ),

      contactsId: z.number().optional(),

      consultDate: zDateOnlyNullable().optional(),
      quoDate: zDateOnlyNullable().optional(),

      viabilityScore: z.number().optional(),
      compliance: z.number().optional(),
      partialCompliance: z.number().optional(),
      nonCompliance: z.number().optional(),

      contractMethod: canCreateOpporManager ? selectOptional : selectOptional,
      contractMethodDesc: z.string().trim().optional(),

      requiresIsos: canCreateOpporManager ? selectOptional : selectOptional,
      requiresIsosDesc: z.string().trim().optional(),

      companyExperience: canCreateOpporManager
        ? selectOptional
        : selectOptional,
      companyExperienceDesc: z.string().trim().optional(),

      workerExperience: canCreateOpporManager ? selectOptional : selectOptional,
      workerExperienceDesc: z.string().trim().optional(),

      staffExperience: canCreateOpporManager ? selectOptional : selectOptional,
      staffExperienceDesc: z.string().trim().optional(),

      ability: canCreateOpporManager ? selectOptional : selectOptional,
      abilityDesc: z
        .string()
        .nullish()
        .transform((v) => v ?? ""),

      minScore: z.number().optional(),

      isAprovedViability: z.boolean().optional(),
      isPreOpportunity: z.boolean().optional(),
      decisionManager: z.string().optional(),

      followupEnabled: z.boolean().optional().default(false),
      followupEveryDay: z.number().optional(),

      isHiring: z.boolean().optional(),

      deliverablesHiring: z
        .array(
          z
            .object({
              deliverablesId: z.number(),
              comment: z.string().trim().optional(),
              name: z.string().optional(),
              dueDate: zDateOnlyNullable(),
              fromDb: z.boolean().optional(),
            })
            .superRefine((item, ctx) => {
              const isFromDb = item.fromDb === true;

              if (!isFromDb) {
                if (!item.comment || item.comment.length === 0) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["comment"],
                    message: "Campo requerido",
                  });
                }

                if (!item.dueDate) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["dueDate"],
                    message: "Fecha obligatoria",
                  });
                }
              }
            }),
        )
        .optional(),

      hiringFiles: z
        .array(
          z.object({
            fileId: z.number().optional(),
            fileTitle: z.string().optional(),
            fileUrl: z.string().optional(),
            relativePath: z.string().optional(),
          }),
        )
        .optional(),
      hasExistingHiringFiles: z.boolean().optional().default(false),
    })
    .superRefine((d, ctx) => {
      const isApoyo = Number(d.negotiationStagesId) === 1;
      const hiringOn = (d.isHiring ?? false) === true;

      const isAdditional = Number(d.typeOppor) === 2;
      const hasParentOppor =
        d.parentOpporId != null && Number(d.parentOpporId) > 0;

      if (
        !d.dateRegister ||
        !(d.dateRegister instanceof Date) ||
        isNaN(d.dateRegister.getTime())
      ) {
        return;
      }

      if (
        d.dateFinish &&
        d.dateFinish instanceof Date &&
        !isNaN(d.dateFinish.getTime())
      ) {
        const comparison = compareDateOnly(d.dateFinish, d.dateRegister);
        if (comparison === -1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["dateFinish"],
            message:
              "La fecha de cierre no puede ser menor a la fecha de registro",
          });
        }
      }

      if (hiringOn) {
        const delivs = d.deliverablesHiring ?? [];

        if (delivs.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["deliverablesHiring"],
            message: "Debes agregar al menos un entregable de contrataciones.",
          });
        }

        delivs.forEach((item, index) => {
          if (
            item.dueDate &&
            item.dueDate instanceof Date &&
            !isNaN(item.dueDate.getTime())
          ) {
            const dueDate = item.dueDate;

            const comparisonWithStart = compareDateOnly(
              dueDate,
              d.dateRegister,
            );
            if (comparisonWithStart === -1) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["deliverablesHiring", index, "dueDate"],
                message:
                  "La fecha del entregable no puede ser menor a la fecha de registro del prospecto.",
              });
            }

            if (
              d.dateFinish &&
              d.dateFinish instanceof Date &&
              !isNaN(d.dateFinish.getTime())
            ) {
              const comparisonWithFinish = compareDateOnly(
                dueDate,
                d.dateFinish,
              );
              if (comparisonWithFinish === 1) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  path: ["deliverablesHiring", index, "dueDate"],
                  message:
                    "La fecha del entregable no puede ser mayor a la fecha de cierre del prospecto.",
                });
              }
            }
          }
        });
      }

      if (isAdditional) {
        if (!hasParentOppor) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["parentOpporId"],
            message: "La oportunidad principal es obligatoria",
          });
        }
        return;
      }
      if (isApoyo) return;

      if (d.porcentProgressPro == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["porcentProgressPro"],
          message: "Campo requerido",
        });
      }

      if (d.opporAmount == null || Number.isNaN(d.opporAmount)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["opporAmount"],
          message: "Campo requerido",
        });
      }

      const enabled = (d.followupEnabled ?? false) === true;
      if (!enabled) return;

      const every = d.followupEveryDay ?? 0;

      if (every <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["followupEveryDay"],
          message: "Define cada cuántos días será el recordatorio (mínimo 1).",
        });
        return;
      }

      if (
        d.dateFinish &&
        d.dateFinish instanceof Date &&
        !isNaN(d.dateFinish.getTime())
      ) {
        const base = new Date(
          d.dateRegister.getFullYear(),
          d.dateRegister.getMonth(),
          d.dateRegister.getDate(),
        );
        const next = new Date(base);
        next.setDate(next.getDate() + every);

        const finishEnd = new Date(
          d.dateFinish.getFullYear(),
          d.dateFinish.getMonth(),
          d.dateFinish.getDate(),
        );
        finishEnd.setHours(23, 59, 59, 999);

        if (next.getTime() > finishEnd.getTime()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["followupEveryDay"],
            message:
              "Con esos días, el siguiente recordatorio cae después de la fecha de cierre. Ajusta los días o la fecha de cierre.",
          });
        }
      }
    })
    .refine(
      (data) => {
        const isApoyo = Number(data.negotiationStagesId) === 1;

        if (isApoyo) return true;

        if (!data.dateFinish) return false;

        return (
          data.dateFinish instanceof Date && !isNaN(data.dateFinish.getTime())
        );
      },
      {
        message: "Fecha de cierre es requerida",
        path: ["dateFinish"],
      },
    );

export type FormValues = z.infer<ReturnType<typeof createSchema>>;
