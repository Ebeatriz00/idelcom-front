import { z } from "zod";
const MAX_MB = 100;
const MAX_BYTES = MAX_MB * 1024 * 1024;
export const createSchemaQuotation = () =>
  z.object({
    linkToken: z.string().trim().optional(),
    opporNumber: z.string().trim().optional(),
    proposalComment: z.string().optional(),
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
  });

export type FormQuotationVerNew = z.infer<
  ReturnType<typeof createSchemaQuotation>
>;
