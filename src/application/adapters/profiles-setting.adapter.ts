import type {
  ProfileData,
  ProfilesSeattingUpate,
  ProfilesSeattingView,
} from "@/application";

export function mapViewToForm(view: ProfilesSeattingView): ProfileData {
  return {
    name:view.usersName,
    lastName: view.usersLastName,
    email: view.usersEmail,
    documentType: view.documentType,
    document: view.usersDocument,
    position: view.descriptionProfiles,
    avatarUrl: view.usersPhoto ?? "",
  };
}

export function mapFormToUpdate(
  form: ProfileData,
  base: ProfilesSeattingView
): ProfilesSeattingUpate {
  return {
    businessId: 0,
    usersId: base.usersId,
    usersName: form.name,
    usersLastName: form.lastName,
    usersEmail: form.email,
    usersDocument: form.document,
    usersPhoto: form.avatarUrl,
  };
}
