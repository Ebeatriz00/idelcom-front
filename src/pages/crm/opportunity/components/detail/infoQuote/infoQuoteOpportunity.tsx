import { CardContentDetail } from "@/layouts";
import { fmtDate } from "@/sharedKernel";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Loader as LoaderIcon,
  UserRound,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Chip } from "../ui/chip";
import { Row } from "../ui/row";

type TeamItem = { teamMember?: string } | string;
type Props = {
  data: {
    stateProject?: string | null;
    porcentProgressTxt?: string | null;
    workerResp?: string | null;
    projectTeamList?: TeamItem[] | null;
    dateFinish?: string | Date | null;
  };
};

export default function InfoQuote({ data }: Props) {
  const [open, setOpen] = useState(true);

  const team = useMemo(() => {
    const arr = (data.projectTeamList ?? [])
      .map((t) => (typeof t === "string" ? t : t?.teamMember ?? ""))
      .filter(Boolean);
    return { list: arr, count: arr.length };
  }, [data.projectTeamList]);

  const estado = data.stateProject?.trim() || "NO HAY AVANCE DE ESTADO";
  const avanceTxt = data.porcentProgressTxt?.trim() || "0% DE AVANCE";
  const responsable = data.workerResp?.trim() || "NO ASIGNADO";
  const fecha = fmtDate(data.dateFinish);

  return (
    <CardContentDetail className="p-0">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
        {/* Rail superior */}
        <div
          className="h-1.5"
          style={{
            background: "linear-gradient(90deg, var(--brand,#FF6F00), #FFB74D)",
          }}
        />

        {/* Header */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="group w-full flex items-center justify-between px-5 md:px-6 py-4 text-left border-b border-gray-100 hover:bg-gray-50"
          aria-expanded={open}
          aria-controls="panel-info-quote"
        >
          <h2 className="text-base font-semibold text-gray-800">
            Información de la cotización
          </h2>
          <ChevronDown
            className={`size-5 text-gray-500 transition-transform duration-300 group-hover:text-gray-700 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {/* Panel */}
        <div
          id="panel-info-quote"
          className={`transition-all duration-300 overflow-hidden ${
            open
              ? "max-h-[1200px] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="px-5 md:px-6 py-4">
            <ul className="divide-y divide-gray-100">
              <Row
                icon={<CheckCircle2 className="size-5 text-emerald-600" />}
                label="Estado"
                value={<Chip>{estado}</Chip>}
              />

              <Row
                icon={
                  <LoaderIcon className="size-5 animate-none text-indigo-600" />
                }
                label="Avance"
                value={
                  <div className="flex items-center gap-3">
                    <Chip>{avanceTxt}</Chip>
                    {/* barra compacta */}
                  </div>
                }
              />

              <Row
                icon={<UserRound className="size-5 text-sky-600" />}
                label="Responsable"
                value={<Chip>{responsable}</Chip>}
              />

              <Row
                icon={<Users className="size-5 text-amber-600" />}
                label="Equipo"
                value={
                  team.count > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {team.list.slice(0, 4).map((n) => (
                        <Chip key={n}>{n}</Chip>
                      ))}
                      {team.count > 4 && <Chip>+{team.count - 4} más</Chip>}
                    </div>
                  ) : (
                    <Chip>NO ASIGNADOS</Chip>
                  )
                }
              />

              <Row
                icon={<CalendarDays className="size-5 text-gray-700" />}
                label="Fecha de cierre"
                value={<Chip>{fecha ?? "SIN FECHA"}</Chip>}
              />
            </ul>
          </div>
        </div>
      </div>
    </CardContentDetail>
  );
}
