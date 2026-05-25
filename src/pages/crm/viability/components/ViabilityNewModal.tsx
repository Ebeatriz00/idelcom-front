import { Modal } from "@/layouts";
import { ViabilitySection } from "@/pages/crm/opportunity/components/modal/form/viabilitySection";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

type Props = {
  open: boolean;
  onClose: () => void;
  data: any;
  opporNum: string;
};

export function ViabilityViewModal({ open, onClose, data, opporNum }: Props) {
  const defaultValues = useMemo(() => {
    if (!data) return {};
    return {
      viabilityScore: data.viabilityScore,
      isHiring: data.isHiring,
      isReEvaluation: data.isReEvaluation,

      contractMethod: data.contractMethod,
      contractMethodDesc: data.contractMethodDesc,

      requiresIsos: data.requiresIsos,
      requiresIsosDesc: data.requiresIsosDesc,

      brandAproach: data.brandAproach,
      brandAproachDesc: data.brandAproachDesc,
      technicalChanges: data.technicalChanges,
      technicalChangesDesc: data.technicalChangesDesc,

      authority: data.authority,
      authorityDesc: data.authorityDesc,
      budget: data.budget,
      budgetDesc: data.budgetDesc,
      need: data.need,
      needDesc: data.needDesc,
      term: data.term,
      termDesc: data.termDesc,
      companyExperience: data.companyExperience,
      companyExperienceDesc: data.companyExperienceDesc,
      workerExperience: data.workerExperience,
      workerExperienceDesc: data.workerExperienceDesc,
      staffExperience: data.staffExperience,
      staffExperienceDesc: data.staffExperienceDesc,
      ability: data.ability,
      abilityDesc: data.abilityDesc,
      shedule: data.schedule,
      sheduleDesc: data.scheduleDesc,
      compliance: data.compliance,
      partialCompliance: data.partialCompliance,
      nonCompliance: data.nonCompliance,
    };
  }, [data]);

  const { register, watch } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const totalCompliance = data?.compliance ?? 0;
  const totalPartial = data?.partialCompliance ?? 0;
  const totalNoComp = data?.nonCompliance ?? 0;

  if (!open || !data) return null;

  return (
    <Modal
      title={`Análisis de Viabilidad: ${opporNum}`}
      size="full"
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border border-gray-300"
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div className="p-6 bg-white">
        <fieldset
          disabled
          className="pointer-events-none grayscale-[0.1] opacity-90"
        >
          <ViabilitySection
            register={register as any}
            watch={watch as any}
            totalCompliance={totalCompliance}
            totalPartial={totalPartial}
            totalNoComp={totalNoComp}
          />
        </fieldset>
      </div>
    </Modal>
  );
}
