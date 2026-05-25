import { Modal } from "@/layouts";
import { ViabilitySection } from "@/pages/crm/opportunity/components/modal/form/viabilitySection";
import { useOpportunitiesById } from "@/sharedKernel";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type Props = {
  open: boolean;
  onClose: () => void;
  opportunityToken?: string | null;
};

export function ViabilityViewModal({ open, onClose, opportunityToken }: Props) {
  const { data, isFetching } = useOpportunitiesById(opportunityToken);

  const { register, watch, reset, formState } = useForm<any>({
    defaultValues: {},
  });

  useEffect(() => {
    if (data) {
      const sourceData = data as any;

      reset({
        isHiring: sourceData.isHiring,
        isReEvaluation: sourceData.isReEvaluation,
        viabilityScore: sourceData.viabilityScore,
        compliance: sourceData.compliance,
        partialCompliance: sourceData.partialCompliance,
        nonCompliance: sourceData.nonCompliance,
        minScore: sourceData.minScore,
        contractMethod: sourceData.contractMethod,
        contractMethodDesc: sourceData.contractMethodDesc,
        requiresIsos: sourceData.requiresIsos,
        requiresIsosDesc: sourceData.requiresIsosDesc,
        brandAproach: sourceData.brandAproach,
        brandAproachDesc: sourceData.brandAproachDesc,
        TechnicalChanges:
          sourceData.technicalChanges ?? sourceData.TechnicalChanges,
        TechnicalChangesDesc:
          sourceData.technicalChangesDesc ?? sourceData.TechnicalChangesDesc,
        authority: sourceData.authority,
        authorityDesc: sourceData.authorityDesc,
        budget: sourceData.budget,
        budgetDesc: sourceData.budgetDesc,
        need: sourceData.need,
        needDesc: sourceData.needDesc,
        term: sourceData.term,
        termDesc: sourceData.termDesc,
        shedule: sourceData.shedule ?? sourceData.schedule,
        sheduleDesc: sourceData.sheduleDesc ?? sourceData.scheduleDesc,
        companyExperience: sourceData.companyExperience,
        companyExperienceDesc: sourceData.companyExperienceDesc,
        workerExperience: sourceData.workerExperience,
        workerExperienceDesc: sourceData.workerExperienceDesc,
        staffExperience: sourceData.staffExperience,
        staffExperienceDesc: sourceData.staffExperienceDesc,
        ability: sourceData.ability,
        abilityDesc: sourceData.abilityDesc,
        stateOpporId: sourceData.stateOpporId ?? 0,
      });
    }
  }, [data, reset]);

  const totalCompliance = (data as any)?.compliance ?? 0;
  const totalPartial = (data as any)?.partialCompliance ?? 0;
  const totalNoComp = (data as any)?.nonCompliance ?? 0;

  if (!open) return null;

  return (
    <Modal
      title={"Análisis de Viabilidad"}
      subtitle={data?.opporNumber ? `Oportunidad: ${data.opporNumber}` : ""}
      size="full"
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 border border-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      }
    >
      <div className="w-full bg-white p-4">
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <span>Cargando análisis...</span>
          </div>
        ) : (
          <div className="pointer-events-none opacity-100 w-full">
            <div className="w-full">
              <ViabilitySection
                register={register}
                watch={watch}
                totalCompliance={totalCompliance}
                totalPartial={totalPartial}
                totalNoComp={totalNoComp}
                disabled={true}
                errors={{} as any}
                touchedFields={formState.touchedFields}
                submitCount={formState.submitCount}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
