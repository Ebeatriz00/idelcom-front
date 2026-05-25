import type { OptionItem, UsersUpsertDto } from "@/application";
import { SearchSelect, UpperInput } from "@/layouts";
import Dropzone from "@/layouts/presentation/dropZone";
import {
  generateSecurePassword,
  generateUserCodeSequential,
  useDocumentTypeOptions,
  useProfilesOptions,
  useWorkerOptions,
} from "@/sharedKernel";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function UsersForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
  profilesLabel,
  documentTypeLabel,
  workerLabel,
}: {
  defaultValues: UsersUpsertDto;
  onSubmit: (dto: UsersUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  profilesLabel?: string;
  documentTypeLabel?: string;
  workerLabel?: string;
}) {
  const [usersId, setUsersId] = useState<number | undefined>(
    defaultValues?.usersId
  );
  const [usersName, setUsersName] = useState(defaultValues?.usersName);

  const [usersLastName, setUsersLastName] = useState(
    defaultValues?.usersLastName
  );
  const [usersCode, setUsersCode] = useState(defaultValues?.usersCode);
  const [usersEmail, setUsersEmail] = useState(defaultValues?.usersEmail);
  const [documentTypeId, setDocumentTypeId] = useState<number | undefined>(
    defaultValues?.documentTypeId
  );
  const [workerId, setWorkerId] = useState<number | undefined>(
    defaultValues?.workerId
  );
  const [profilesId, setProfilesId] = useState<number | undefined>(
    defaultValues?.profilesId
  );

  const [usersDocument, setUsersDocument] = useState(
    defaultValues?.usersDocument
  );
  const [usersPhoto, setUsersPhoto] = useState<string | undefined>(
    defaultValues?.usersPhoto
  );
  const [usersPassword, setUsersPassword] = useState(
    defaultValues?.usersPassword ?? ""
  );
  const [showPass, setShowPass] = useState(true);

  const [profilesOpt, setProfilesOpt] = useState<OptionItem | null>(null);
  const [documentTypeOpt, setDocumentTypeOpt] = useState<OptionItem | null>(
    null
  );

  const [workerIdOpt, setWorkerIdOpt] = useState<OptionItem | null>(null);

  useEffect(() => {
    setUsersId(defaultValues?.usersId);
    setUsersName(defaultValues?.usersName);
    setUsersLastName(defaultValues?.usersLastName);
    setUsersCode(defaultValues?.usersCode);
    setUsersEmail(defaultValues?.usersEmail);
    setDocumentTypeId(defaultValues?.documentTypeId);
    setProfilesId(defaultValues?.profilesId);
    setUsersDocument(defaultValues?.usersDocument);
    setUsersPhoto(defaultValues?.usersPhoto ?? "");
    setUsersPassword(defaultValues?.usersPassword ?? "");
  }, [defaultValues?.usersId]);

  const { data: profilesResp } = useProfilesOptions();
  const profileOptions: OptionItem[] = profilesResp?.items ?? [];

  const { data: docTypeResp } = useDocumentTypeOptions();
  const docTypeOptions: OptionItem[] = docTypeResp?.items ?? [];

  const { data: workerResp } = useWorkerOptions();
  const workerIdOpts: OptionItem[] = workerResp?.items ?? [];

  useEffect(() => {
    if (profilesId == null) return;
    if (profilesOpt?.value === profilesId) return;
    const found = profileOptions.find(
      (o: OptionItem) => Number(o.value) === Number(profilesId)
    );

    if (found) {
      setProfilesOpt(found);
      return;
    }
    if (profilesLabel) {
      setProfilesOpt({ value: Number(profilesId), label: profilesLabel });
    }
  }, [profilesId, profilesLabel, profileOptions]);

  useEffect(() => {
    if (documentTypeId == null) return;
    if (documentTypeOpt?.value === documentTypeId) return;

    const found = docTypeOptions.find(
      (o: OptionItem) => Number(o.value) === Number(documentTypeId)
    );

    if (found) {
      setDocumentTypeOpt(found);
      return;
    }

    if (documentTypeLabel) {
      setDocumentTypeOpt({
        value: Number(documentTypeId),
        label: documentTypeLabel,
      });
    }
  }, [documentTypeId, documentTypeLabel, docTypeOptions]);

  useEffect(() => {
    if (workerId == null) return;
    if (workerIdOpt?.value === workerId) return;

    if (workerIdOpt?.value === workerId) return;
    const found = workerIdOpts.find(
      (o: OptionItem) => Number(o.value) === Number(workerId)
    );

    if (found) {
      setWorkerIdOpt(found);
      return;
    }

    if (workerLabel) {
      setWorkerIdOpt({
        value: Number(workerId),
        label: workerLabel,
      });
    }
  }, [workerId, workerLabel, docTypeOptions]);

  const [autoCode, setAutoCode] = useState<boolean>(
    () => !defaultValues?.usersCode
  );
  const debounceRef = useRef<number | null>(null);

  const valid = !!usersName && !!usersLastName;

  useEffect(() => {
    if (!autoCode || !usersName || !usersLastName) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      const code = await generateUserCodeSequential(
        usersName,
        usersLastName,
        50
      );
      setUsersCode(code);
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [usersName, usersLastName, autoCode]);
  const onChangeUsersCode: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setUsersCode(e.target.value?.toUpperCase());
    setAutoCode(false);
  };

  const isEdit = Boolean(usersId);
  const handleGenerate = () => {
    const newPassword = generateSecurePassword();
    setUsersPassword(newPassword);
  };
  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            usersId: usersId!,
            usersName,
            usersLastName,
            usersCode,
            workerId: workerId!,
            usersEmail,
            profilesId: profilesId!,
            documentTypeId: documentTypeId!,
            usersDocument,
            usersPhoto: usersPhoto!,
            usersPassword,
          });
        }
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        <div className="flex items-start justify-center">
          <Dropzone
            value={usersPhoto}
            onChange={setUsersPhoto}
            size={220}
            carpeta="USERS"
            entityId={usersId ?? 0}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="col-span-full lg:col-span-6 min-w-0">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Nombres
            </label>
            <UpperInput
              mode="upper"
              value={usersName}
              autoFocus={autofocus}
              onValueChange={(v) => {
                setUsersName(v);
                if (!usersCode) setAutoCode(true);
              }}
              placeholder="Juan"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
            />
          </div>
          <div className="col-span-full lg:col-span-6 min-w-0">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Apellidos
            </label>
            <UpperInput
              mode="upper"
              value={usersLastName}
              onValueChange={(e) => {
                setUsersLastName(e);
                if (!usersCode) setAutoCode(true);
              }}
              placeholder="Pérez"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
            />
          </div>

          <div className="col-span-full min-w-0">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Código
            </label>
            <input
              value={usersCode}
              onChange={onChangeUsersCode}
              placeholder="EFASANANDO"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
            />
          </div>
          <div className="col-span-full min-w-0">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Correo
            </label>
            <input
              type="email"
              value={usersEmail}
              onChange={(e) => setUsersEmail(e.target.value)}
              placeholder="usuario@dominio.com"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
            />
          </div>
          <div className="col-span-full min-w-0">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              VinculaR trabajador
            </label>
            <SearchSelect
              useOptions={useWorkerOptions}
              value={workerIdOpt}
              onChange={(opt) => {
                setWorkerIdOpt(opt);
                setWorkerId(opt ? Number(opt.value) : undefined);
              }}
              placeholder="Buscar trabajador..."
              pageSize={10}
              minSearchChars={0}
              className="w-full min-w-0"
            />
            {!workerId && (
              <p className="text-xs text-amber-600">
                Selecciona un trabajador.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="col-span-full lg:col-span-7 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Tipo doc
          </label>
          <SearchSelect
            useOptions={useDocumentTypeOptions}
            value={documentTypeOpt}
            onChange={(opt) => {
              setDocumentTypeOpt(opt);
              setDocumentTypeId(opt ? Number(opt.value) : undefined);
            }}
            placeholder="Buscar módulo..."
            pageSize={10}
            minSearchChars={0}
            className="w-full min-w-0"
          />
          {!documentTypeId && (
            <p className="text-xs text-amber-600">
              Selecciona un tipo de documento.
            </p>
          )}
        </div>
        <div className="col-span-full lg:col-span-5 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            N° Documento
          </label>
          <input
            value={usersDocument}
            onChange={(e) => setUsersDocument(e.target.value)}
            placeholder="00000000"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
          />
        </div>
        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Perfil
          </label>
          <SearchSelect
            useOptions={useProfilesOptions}
            value={profilesOpt}
            onChange={(opt) => {
              setProfilesOpt(opt);
              setProfilesId(opt ? Number(opt.value) : undefined);
            }}
            placeholder="Buscar módulo..."
            pageSize={10}
            minSearchChars={0}
            className="w-full min-w-0"
          />
          {!profilesId && (
            <p className="text-xs text-amber-600">Selecciona el perfil.</p>
          )}
        </div>
        {!isEdit && (
          <div className="md:col-span-full lg:col-span-6 min-w-0">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <input
                type={showPass ? "text" : "password"}
                value={usersPassword}
                disabled
                onChange={(e) => setUsersPassword(e.target.value)}
                placeholder="•••••••"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pr-20 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
              />

              <button
                type="button"
                onClick={handleGenerate}
                className="absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                title="Generar contraseña segura"
              >
                <RefreshCw className="size-4 text-gray-500" />
              </button>
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                aria-label="Mostrar/Ocultar"
              >
                {showPass ? (
                  <EyeOff className="size-4 text-gray-500" />
                ) : (
                  <Eye className="size-4 text-gray-500" />
                )}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              Mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, número y
              símbolo.
            </p>
          </div>
        )}
      </div>
      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={!valid || saving}
            className="rounded-md bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}
    </form>
  );
}
