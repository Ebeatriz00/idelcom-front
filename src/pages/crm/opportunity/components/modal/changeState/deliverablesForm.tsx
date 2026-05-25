import type { OpportunitiesStateUpdateDto } from "@/application";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { mapToFormStateValues } from "./form/mapToFormStateValues";
import type { FormStateValues } from "./form/shemaState";
import { OpporDeliverablesSection } from "./opporDeliverablesSection";

const deliverablesSchema = z.object({
  deliverables: z
    .array(
      z
        .object({
          deliverablesId: z.number(),
          comment: z.string().optional(),
          dueDate: z.date().nullable().optional(),
          fromDb: z.boolean().optional(),
          state: z.string().optional(),
          name: z.string().optional(),
        })
        .passthrough()
        .refine((d) => d.fromDb || d.dueDate, {
          path: ["dueDate"],
          message: "La fecha es obligatoria para los nuevos",
        }),
    )
    .optional(),
});
type Props = {
  defaultValues?: Partial<OpportunitiesStateUpdateDto>;
  onSubmit: (dto: OpportunitiesStateUpdateDto) => void;
  saving?: boolean;
  formId?: string;
  disabled?: boolean;
  onClose?: () => void;
};

export function DeliverablesForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  disabled,
  onClose,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormStateValues>({
    resolver: zodResolver(deliverablesSchema),
    mode: "onChange",
    defaultValues: mapToFormStateValues(defaultValues),
  });

  useEffect(() => {
    reset(mapToFormStateValues(defaultValues));
  }, [defaultValues, reset]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit((values) => {
        const cleanDto: OpportunitiesStateUpdateDto = {
          linkToken: defaultValues?.linkToken ?? "",
          businessId: defaultValues?.businessId ?? 0,
          usersBy: defaultValues?.usersBy ?? 0,

          deliverables: values.deliverables as any[],
        };

        onSubmit(cleanDto);
      })}
      className="space-y-6 p-1"
    >
      <Controller
        name="deliverables"
        control={control}
        render={({ field }) => (
          <OpporDeliverablesSection
            value={(field.value as any[]) ?? []}
            onChange={field.onChange}
            disabled={saving}
          />
        )}
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-black disabled:opacity-60 font-medium shadow-sm"
          disabled={saving || isSubmitting || disabled}
        >
          {saving ? "Guardando..." : "Guardar Entregables"}
        </button>
      </div>
    </form>
  );
}
