import { useState, useEffect, useCallback } from "react";
import { Modal, Button } from "@/layouts";
import { Loader2, Plus, List } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  useSquadList,
  useAssignmentList,
  useDeleteAssignment,
  confirmAction,
  useCreateWorkOrder,
  useConfigProjectById,
} from "@/sharedKernel";
import { CrewCard } from "./squads/CrewCard";
import { SearchSelect } from "@/layouts/components/ui/search-select/searchSelect";
import { useWorkerOperationsOptions, useWorkerSquadOptions } from "@/sharedKernel/hooks/rrhh/useWorkerList";
import type { OperationsSquadResponseDto, OptionItem } from "@/application";

// --- VALIDATION SCHEMA FOR CREATION ---
const schema = z.object({
  squadName: z.string().min(1, "El nombre es requerido"),
  techLeaderId: z.number().min(1, "El líder es requerido"),
  description: z.string().optional(),
  operationsProjectConfigId: z.number().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  squadName: "",
  techLeaderId: 0,
  description: "",
  operationsProjectConfigId: null,
};

interface AdminSquadsManagerModalProps {
  open: boolean;
  onClose: () => void;
  operationsId: number;
  workOrderIds: number[];
  onEditSquad: (squad: OperationsSquadResponseDto) => void;
  onAddMember: (squadId: number) => void;
}

export function AdminSquadsManagerModal({
  open,
  onClose,
  operationsId,
  workOrderIds,
  onEditSquad,
  onAddMember,
}: AdminSquadsManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  
  // Reset tab when modal opens
  useEffect(() => {
    if (open) setActiveTab("list");
  }, [open]);

  if (!open) return null;

  return (
    <Modal
      title="Gestión de Cuadrillas Administrativas"
      onClose={onClose}
      size="md"
      footer={null}
      bodyClassName="p-0 bg-slate-50/50 flex flex-col"
    >
      <div className="flex border-b border-gray-200 bg-white px-4 pt-2">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "list"
              ? "border-[#1A3673] text-[#1A3673]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <List className="size-4" />
          Ver Cuadrillas
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === "create"
              ? "border-[#1A3673] text-[#1A3673]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Plus className="size-4" />
          Crear Nueva
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {activeTab === "list" ? (
          <ListTab
            workOrderIds={workOrderIds}
            onEditSquad={onEditSquad}
            onAddMember={onAddMember}
          />
        ) : (
          <CreateTab
            operationsId={operationsId}
            onSuccess={() => setActiveTab("list")}
            onCancel={onClose}
          />
        )}
      </div>
    </Modal>
  );
}

// --- TAB 1: LIST VIEW ---
function ListTab({
  workOrderIds,
  onEditSquad,
  onAddMember,
}: {
  workOrderIds: number[];
  onEditSquad: (squad: OperationsSquadResponseDto) => void;
  onAddMember: (squadId: number) => void;
}) {
  const { mutateAsync: deleteAssignment } = useDeleteAssignment();

  const { data: squadsData, isLoading } = useSquadList(0, 500, undefined, "");
  const { data: assignmentData } = useAssignmentList(0, 1000);

  const adminSquads = (squadsData?.items || []).filter(
    (s) => s.squadCategory === "ADMINISTRATIVE" && workOrderIds.includes(s.workOrderId)
  );

  const getMembersForSquad = (squadId: number) =>
    (assignmentData?.items || []).filter((a) => a.squadId === squadId);

  const handleDeleteMember = async (assignmentId: number) => {
    const ok = await confirmAction({
      title: "¿Eliminar integrante?",
      text: "¿Estás seguro de que deseas retirar a este trabajador de la cuadrilla?",
      confirmText: "Sí, eliminar",
      cancelText: "Cancelar",
    });
    if (ok) await deleteAssignment(assignmentId);
  };

  return (
    <div className="flex flex-col gap-3">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-blue-600" />
        </div>
      ) : adminSquads.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            No hay cuadrillas administrativas
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {adminSquads.map((squad) => (
            <CrewCard
              key={squad.squadId}
              crew={squad}
              members={getMembersForSquad(squad.squadId)}
              onAddMember={() => onAddMember(squad.squadId)}
              onEdit={() => onEditSquad(squad)}
              onDeleteMember={handleDeleteMember}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- TAB 2: CREATE FORM ---
function CreateTab({
  operationsId,
  onSuccess,
  onCancel,
}: {
  operationsId: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [selectedOption, setSelectedOption] = useState<OptionItem | null>(null);
  const { data: configs } = useConfigProjectById(operationsId);
  const { mutateAsync: createWorkOrder } = useCreateWorkOrder();
  const [internalSaving, setInternalSaving] = useState(false);

  const useWorkerSquadOptionsLocal = useCallback(
    (page: number, search: string, pageSize: number) => {
      return useWorkerSquadOptions(operationsId, page, search, pageSize);
    },
    [operationsId]
  );

  const sortedConfigs = [...(configs || [])].sort((a, b) => (a.shift || 0) - (b.shift || 0));

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // Reset form when tab mounts
  useEffect(() => {
    setSelectedOption(null);
    reset(defaultValues);
  }, [reset]);

  const handleFormSubmit = async (formData: FormValues) => {
    try {
      setInternalSaving(true);
      const payload = {
        operationsId,
        workOrderCode: `OT-ADMIN-${Date.now().toString().slice(-4)}`,
        workOrderName: formData.squadName,
        orderStatusId: 1, // Pendiente
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
        location: "N/A",
        needLogistics: true,
        needSsoma: true,
        needAttendance: true,
        progressPercentage: 0,
        isAdministrative: true,
        techLeaderId: formData.techLeaderId ? Number(formData.techLeaderId) : null,
        description: formData.description,
        operationsProjectConfigId: formData.operationsProjectConfigId ? Number(formData.operationsProjectConfigId) : null,
      };

      await createWorkOrder(payload as any);
      onSuccess();
    } catch (error) {
      console.error("Error creating admin squad:", error);
    } finally {
      setInternalSaving(false);
    }
  };

  const formId = "admin-squad-tab-form";

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 flex-1 overflow-y-auto">
        <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase">Nombre de la Cuadrilla</label>
            <input
              placeholder="Ej: Equipo Administrativo"
              {...register("squadName")}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.squadName ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.squadName && (
              <p className="text-[10px] text-red-500 font-bold uppercase">{errors.squadName.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase">Descripción (Opcional)</label>
            <textarea
              placeholder="Ej: Personal administrativo y de soporte..."
              {...register("description")}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 uppercase">Líder Técnico de Cuadrilla</label>
            <Controller
              control={control}
              name="techLeaderId"
              render={({ field }) => (
                <SearchSelect
                  placeholder="Buscar líder por nombre..."
                  useOptions={useWorkerSquadOptionsLocal}
                  value={selectedOption}
                  onChange={(opt) => {
                    setSelectedOption(opt);
                    field.onChange(opt ? Number(opt.value) : 0);
                  }}
                  className={errors.techLeaderId ? "border-red-500" : ""}
                />
              )}
            />
            {errors.techLeaderId && (
              <p className="text-[10px] text-red-500 font-bold uppercase">{errors.techLeaderId.message}</p>
            )}
          </div>

          {sortedConfigs.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Configuración de Turno Asignado</label>
              <select
                {...register("operationsProjectConfigId", {
                  setValueAs: (v) => (v === "" || v === "null" ? null : Number(v)),
                })}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold text-slate-700 cursor-pointer"
              >
                <option value="null">-- Sin turno específico (Opcional) --</option>
                {sortedConfigs.map((c) => (
                  <option key={c.operationsProjectConfigId} value={c.operationsProjectConfigId}>
                    Turno {c.shift || 1} ({c.entryTime?.substring(0, 5)} - {c.departureTime?.substring(0, 5)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>
      </div>

      <div className="p-4 border-t border-gray-100 bg-slate-50 flex justify-end gap-3 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={internalSaving}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form={formId}
          disabled={internalSaving}
          className="!bg-[#1A3673] !hover:bg-[#132856] text-white px-8"
        >
          {internalSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Crear Cuadrilla"
          )}
        </Button>
      </div>
    </div>
  );
}
