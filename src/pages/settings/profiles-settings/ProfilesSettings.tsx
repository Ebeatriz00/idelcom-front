import { AvatarDropzoneCard } from "./components/avatar/AvatarCard";
import { PersonalInfoCard } from "./components/personal-info/PersonalInfoCard";
import { useProfilesSettings } from "./mutations/useProfilesSettings";

export default function ProfilesSettings() {
  const {
    usersQ,
    updateMut,
    saving,
    data,
    usersPhoto,
    setUsersPhoto,
    patchData,
    onSaveProfile,
  } = useProfilesSettings();
  return (
    <div className="min-h-screen w-full bg-gray-50 p-6">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        <AvatarDropzoneCard
          value={usersPhoto}
          onChange={setUsersPhoto}
          size={220}
          carpeta="USERS"
          entityId={usersQ.data?.usersId ?? 0}
        />

        <div className="md:col-span-2 space-y-6">
          <PersonalInfoCard
            data={data}
            onChange={patchData}
            onSave={onSaveProfile}
            saving={saving || updateMut.isPending}
          />
        </div>
      </div>
    </div>
  );
}
