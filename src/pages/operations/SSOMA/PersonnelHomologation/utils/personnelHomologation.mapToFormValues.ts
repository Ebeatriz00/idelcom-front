import type { HomologationPersonnelRequestDto } from "@/application";
import type { PersonnelHomologationFormDefaultValues } from "./TypesPersonnel";
import type { PersonnelHomologationFormValues } from "./personnelHomologation.schema";

export function mapToFormValues(
  data?: PersonnelHomologationFormDefaultValues,
): PersonnelHomologationFormDefaultValues {
  const homologationScopeId = data?.homologationPersonnel?.homologationScopeId;
  const isGeneralScope = Number(homologationScopeId) === 1;

  return {
    homologationPersonnel: {
      homologationScopeId: data?.homologationPersonnel?.homologationScopeId,
      operationsId: isGeneralScope
        ? undefined
        : data?.homologationPersonnel?.operationsId,
      workerId: data?.homologationPersonnel?.workerId,
      medicalAptitudeId: data?.homologationPersonnel?.medicalAptitudeId,
      validFrom: data?.homologationPersonnel?.validFrom ?? "",
      ssomaApproved: data?.homologationPersonnel?.ssomaApproved ?? false,
      adminApproved: data?.homologationPersonnel?.adminApproved ?? false,
      notes: data?.homologationPersonnel?.notes ?? "",
    },
    documents: (data?.documents ?? [])
      .filter((doc) => {
        // En Scope 1 (General), no debe venir CAMO (ID 12)
        if (isGeneralScope && Number(doc.requirementId) === 12) return false;
        return true;
      })
      .map((document) => ({
        requirementId: document.requirementId,
        fileName: document.fileName ?? "",
        fileUrl: document.fileUrl ?? "",
        filePath: document.filePath ?? "",
        localUploadToken: "",
        issueDate: document.issueDate ?? "",
        expirationDate: document.expirationDate ?? "",
        reviewDate: document.reviewDate ?? "",
        observation: document.observation ?? "",
      })),
  };
}

export function mapToRequestDto(
  values: PersonnelHomologationFormValues,
): HomologationPersonnelRequestDto {
  const homologationPersonnel = values.homologationPersonnel;

  return {
    homologationPersonnel: {
      homologationScopeId: homologationPersonnel.homologationScopeId,
      operationsId: homologationPersonnel.operationsId,
      workerId: homologationPersonnel.workerId,
      medicalAptitudeId: homologationPersonnel.medicalAptitudeId ?? 0,
      validFrom: homologationPersonnel.validFrom,
      ssomaApproved: homologationPersonnel.ssomaApproved,
      adminApproved: homologationPersonnel.adminApproved,
      notes: homologationPersonnel.notes,
    },
    documents: (values.documents ?? [])
      .filter(
        (doc) =>
          Number(doc.requirementId) > 0 &&
          Boolean(doc.fileName?.trim()) &&
          Boolean(doc.filePath?.trim()) &&
          Boolean(doc.issueDate?.trim()),
      )
      .map((doc) => ({
        requirementId: Number(doc.requirementId),
        clinicId: doc.clinicId ? Number(doc.clinicId) : undefined,
        fileName: doc.fileName ?? "",
        fileUrl: doc.fileUrl ?? "",
        filePath: doc.filePath ?? "",
        issueDate: doc.issueDate ?? "",
        expirationDate: doc.expirationDate ?? "",
        reviewDate: doc.reviewDate ?? "",
        observation: doc.observation ?? "",
        file: doc.file,
      })),
  };
}
