import { Modal } from "@/layouts"; 
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ViabilityDecision } from "@/application/dtos/crm/viability/Viability.dto";

const decisionSchema = z.object({
  isApproved: z.enum(["true", "false"]),
  rejectionReason: z.string().optional(),
});

type DecisionFormValues = z.infer<typeof decisionSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ViabilityDecision, "businessId" | "usersBy">) => void;
  linkToken: string;
  opporNum: string;
  saving?: boolean;
}

export function ViabilityDecisionModal({
  open,
  onClose,
  onSubmit,
  linkToken,
  opporNum,
  saving = false,
}: Props) {
  if (!open) return null;

  const formId = "viability-decision-form";
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<DecisionFormValues>({
    resolver: zodResolver(decisionSchema),
    mode: "onChange",
    defaultValues: {
      isApproved: "true",
      rejectionReason: "",
    },
  });

  const isApprovedStr = watch("isApproved");
  const isApprovedBool = isApprovedStr === "true";

  const handleFormSubmit = async (values: DecisionFormValues) => {
    setIsSubmittingInternal(true);
    const decisionApproved = values.isApproved === "true";

    const dto = {
      linkToken,
      isApproved: decisionApproved,
      rejectionReason: decisionApproved
        ? null
        : values.rejectionReason?.trim() || null,
    };

    await onSubmit(dto);

    setIsSubmittingInternal(false);
    onClose();
    reset();
  };

  return (
    <Modal
      title={`Procesar Viabilidad: ${opporNum}`}
      size="md"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm hover:bg-gray-100"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            form={formId}
            disabled={saving || isSubmittingInternal || !isValid}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving || isSubmittingInternal ? "Guardando..." : "Guardar"}
          </button>
        </>
      }
    >
      <div className="p-4">
        <form
          id={formId}
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5"
        >
          <div className="col-span-full min-w-0">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Decisión
            </label>
            <div className="flex flex-col space-y-3">
              <label className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="true"
                  {...register("isApproved")}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">Aprobar</span>
                    <span className="text-xs text-gray-500">Pasa a Negociación</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="false"
                  {...register("isApproved")}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                 <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">Rechazar</span>
                    <span className="text-xs text-gray-500">Se marca como Perdida</span>
                </div>
              </label>
            </div>
          </div>

          {!isApprovedBool && (
            <div className="col-span-full min-w-0 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Motivo del rechazo <span className="text-xs text-gray-400 font-normal">(Opcional)</span>
              </label>
              <textarea
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="Describa el motivo..."
                {...register("rejectionReason")}
              />
               {errors.rejectionReason && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.rejectionReason.message}
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}