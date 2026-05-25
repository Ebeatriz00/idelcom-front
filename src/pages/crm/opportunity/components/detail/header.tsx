import { BadgeDetail } from "./ui/badge";
import { ButtonDetail } from "./ui/button";
import { ProgressDetail } from "./ui/progress";

type Props = {
  data: any;
  onBack: () => void;
};

export default function HeaderDetail({ data, onBack }: Props) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 min-w-0">
            <ButtonDetail size="sm" variant="ghost" onClick={onBack}>
              ← Volver
            </ButtonDetail>
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 truncate">
              {data?.opporDesc}
            </h1>
          </div>
          <dl className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-[13px] sm:text-sm">
            <div className="min-w-0">
              <dt className="text-gray-500">Cliente</dt>
              <dd className="font-semibold text-gray-800 truncate">
                {data?.clientsName}
              </dd>
            </div>

            <div className="min-w-0">
              <dt className="text-gray-500">Comercial</dt>
              <dd className="font-semibold text-gray-800 truncate">
                {data?.salesName}
              </dd>
            </div>

            <div className="min-w-0">
              <dt className="text-gray-500">Cierre</dt>
              <dd className="font-semibold text-gray-800">{data.dateFinish}</dd>
            </div>
          </dl>
        </div>
        <div className="sm:text-right flex items-center sm:block gap-3 sm:gap-0">
          <BadgeDetail
            variant="outline"
            className="rounded-full px-3 py-1 text-sm shrink-0"
          >
            {data?.stateStatusProject}
          </BadgeDetail>

          <div className="sm:mt-2 w-full sm:w-56 relative">
            <ProgressDetail
              value={data?.porcentProgressPro}
              className="h-3 bg-gray-200"
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-800">
              {data?.porcentProgressPro ?? 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
