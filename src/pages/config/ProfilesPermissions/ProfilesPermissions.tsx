import type { ProfilesPermissionsResponseDto } from "@/application";
import { fetchAuthInvalidateBootstrap } from "@/infrastructure";
import { Button } from "@/layouts/components/ui/button";
import {
  CardContent,
  CardHeader,
  CardSimple,
  CardTitle,
} from "@/layouts/presentation/cards/cardSimple";
import { useDebouncedValue } from "@/sharedKernel";
import {
  qkProfilesPermissions,
  useProfilesPermissionsList,
  useProfilesPermissionsMutations,
} from "@/sharedKernel/hooks/profilesPermissions/useProfilesPermissions";
import { boolToStatusString, statusToBool } from "@/sharedKernel/utils/status";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, Users2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AsideProfiles } from "./components/aside/AsideProfiles";
import { AssignModulePermissionModal } from "./components/dialog/AssignModulePermissionDialog";
import { ProfilesPermissionsList } from "./components/table/ProfilesPermissionsList";

// Interfaces para mejorar el tipado
interface Profile {
  id?: number;
  profileId?: number;
  profilesId?: number;
  name?: string;
  profileName?: string;
  profilesName?: string;
}

export const getProfileId = (p: Profile | null): number | null =>
  p?.profilesId ?? p?.profileId ?? p?.id ?? null;

export const getProfileLabel = (p: Profile | null): string =>
  p?.profilesName ??
  p?.profileName ??
  p?.name ??
  `Perfil ${getProfileId(p) ?? ""}`;

export default function ProfilesPermissions() {
  const qc = useQueryClient();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [openAssign, setOpenAssign] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const selectedId = useMemo(
    () => getProfileId(selectedProfile),
    [selectedProfile],
  );

  const { data, isLoading, error } = useProfilesPermissionsList(
    selectedId,
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
  );

  const rows: ProfilesPermissionsResponseDto[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = data?.totalPages ?? 1;

  const [, setVisibleCount] = useState(0);
  const { createMut, statusMut } = useProfilesPermissionsMutations();

  async function handleAssign(modulesPermissionsId: number[]) {
    if (selectedId == null) return;

    try {
      await createMut.mutateAsync({
        profilesId: Number(selectedId),
        modulesPermissionsId,
      });

      await qc.invalidateQueries({
        queryKey: qkProfilesPermissions.list(
          Number(selectedId),
          pagination.pageIndex,
          pagination.pageSize,
          debouncedSearch,
        ),
      });

      console.log(selectedId, modulesPermissionsId);
      await fetchAuthInvalidateBootstrap(Number(selectedId));
      setOpenAssign(false);
    } catch (error) {
      console.error("Error asignando permisos:", error);
    }
  }

  async function onToggleStatus(row: ProfilesPermissionsResponseDto) {
    if (!row.profilesPermissionsId) return;

    try {
      const current = statusToBool(row.status);
      await statusMut.mutateAsync({
        profilesPermissionsId: row.profilesPermissionsId,
        status: boolToStatusString(!current),
      });

      if (selectedId != null) {
        qc.invalidateQueries({
          queryKey: qkProfilesPermissions.list(
            Number(selectedId),
            pagination.pageIndex,
            pagination.pageSize,
            debouncedSearch,
          ),
        });
        await fetchAuthInvalidateBootstrap(selectedId);
      }
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  }

  async function onDelete(row: ProfilesPermissionsResponseDto) {
    // TODO: implementar confirmación + soft-delete
    console.log("Eliminar permiso:", row);
    // qc.invalidateQueries({
    //   queryKey: qkProfilesPermissions.list(
    //     Number(selectedId),
    //     pagination.pageIndex,
    //     pagination.pageSize
    //   )
    // });
  }

  // Efecto corregido - dependencias en un solo array
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    setOpenAssign(false);
  }, [selectedId, debouncedSearch]);

  const handleRefresh = async () => {
    if (selectedId != null) {
      await qc.invalidateQueries({
        queryKey: qkProfilesPermissions.list(
          Number(selectedId),
          pagination.pageIndex,
          pagination.pageSize,
          debouncedSearch,
        ),
      });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users2 className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Permisos por Perfil</h1>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={!selectedProfile || createMut.isPending}
            onClick={() => setOpenAssign(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {createMut.isPending ? "Asignando..." : "Asignar MP"}
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={statusMut.isPending}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                statusMut.isPending ? "animate-spin" : ""
              }`}
            />
            {statusMut.isPending ? "Actualizando..." : "Refrescar"}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
        <AsideProfiles
          selectedId={selectedId}
          onSelect={(row) => {
            setSelectedProfile(row);
          }}
        />

        <section>
          <CardSimple>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>
                  Asignados a:{" "}
                  {selectedProfile ? (
                    <span className="font-semibold">
                      {getProfileLabel(selectedProfile)}
                    </span>
                  ) : (
                    <span className="italic text-muted-foreground">
                      Selecciona un perfil
                    </span>
                  )}
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  Error cargando permisos
                </div>
              ) : (
                <ProfilesPermissionsList
                  data={rows}
                  total={total}
                  pageCount={pageCount}
                  pagination={pagination}
                  onPaginationChange={setPagination}
                  onToggleStatus={onToggleStatus}
                  onDelete={onDelete}
                  onVisibleCountChange={setVisibleCount}
                  search={search}
                  onSearchChange={setSearch}
                />
              )}
            </CardContent>
          </CardSimple>
        </section>
      </div>

      {openAssign && selectedId != null && (
        <AssignModulePermissionModal
          open={openAssign}
          onClose={() => setOpenAssign(false)}
          profilesId={Number(selectedId)}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
}
