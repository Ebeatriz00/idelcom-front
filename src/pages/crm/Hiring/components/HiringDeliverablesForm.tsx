import type { OpportunitiesStateUpdateDto } from "@/application";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { OpporDeliverablesHiringSection } from "../../opportunity/components/modal/deliverablesHiring/opporDeliverablesHiringSection";

const hiringDeliverablesSchema = z.object({
  deliverablesHiring: z
    .array(
      z
        .object({
          deliverablesId: z.number(),
          comment: z.string().optional(),
          dueDate: z.date().nullable().optional(),
          fromDb: z.boolean().optional(),
          state: z.string().optional(),
          name: z.string().optional(),
          taskId: z.number().nullable().optional(),
          tasksId: z.number().nullable().optional(),
          taskStateDesc: z.string().nullable().optional(),
          taskStateColor: z.string().nullable().optional(),
        })
        .refine((d) => d.fromDb || d.dueDate, {
          path: ["dueDate"],
          message: "La fecha es obligatoria para los nuevos",
        })
    )
    .optional(),
});

type FormStateValues = z.infer<typeof hiringDeliverablesSchema>;

type Props = {
  defaultValues?: Partial<OpportunitiesStateUpdateDto>;
  onSubmit?: (dto: OpportunitiesStateUpdateDto) => void; 
  saving?: boolean;
  onClose?: () => void; 
  taskStateOptions?: any[];
  onTaskStatusChange?: (taskId: string, newStateId: string) => void;
  isReadOnly?: boolean;
};

export function HiringDeliverablesForm({
  defaultValues,
  taskStateOptions,
  onTaskStatusChange,
  isReadOnly = false
}: Props) {
  const {
    control,
    reset,
    formState: { errors },
  } = useForm<FormStateValues>({
    resolver: zodResolver(hiringDeliverablesSchema),
    mode: "onChange",
    defaultValues: {
      deliverablesHiring: (defaultValues?.deliverablesHiring ?? []) as any[],
    },
  });

  useEffect(() => {
    if (defaultValues?.deliverablesHiring) {
      reset({ deliverablesHiring: defaultValues.deliverablesHiring as any[] });
    }
  }, [defaultValues, reset]);

  return (
    <div className="space-y-6">
      <div className="p-1">
        <Controller
          name="deliverablesHiring"
          control={control}
          render={({ field }) => (
            <OpporDeliverablesHiringSection
              value={(field.value as any[]) ?? []}
              onChange={field.onChange}
              disabled={true} 
              errors={errors.deliverablesHiring as any}
              hideSelect={true} 

              taskStateOptions={taskStateOptions}
              onTaskStatusChange={isReadOnly ? undefined : onTaskStatusChange}
              
            />
          )}
        />
      </div>
    </div>
  );
}