import type { OpportunitiesUploadNewVerDto } from "@/application";
import type { DefaultValues } from "react-hook-form";
import type { FormQuotationVerNew } from "./shemaQuotation";
export function mapToFormQuotationNewVer(
  dto?: Partial<OpportunitiesUploadNewVerDto>,
): DefaultValues<FormQuotationVerNew> {
  if (!dto) {
    return {
      linkToken: "",
      proposalComment: "",
      fileTitle: "",
      fileUrl: "",
      relativePath: "",
      archiveType: "",
    };
  }
  return {
    linkToken: dto.linkToken ?? "",
    opporNumber: dto.opporNumber,
    proposalComment: dto.proposalComment ?? "",
    fileTitle: dto.fileTitle ?? "",
    fileUrl: dto.fileUrl ?? "",
    relativePath: dto.relativePath ?? "",
    archiveType: dto.archiveType ?? "",
  };
}
