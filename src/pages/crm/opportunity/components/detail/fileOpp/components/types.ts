import type { OpportunitiesDetailDto } from "@/application";

export type FileItem = NonNullable<
  OpportunitiesDetailDto["filetrackingList"]
>[number];

export type FileOpportunityProps = {
  data: OpportunitiesDetailDto | null;
  pageSize?: number;
  onUpload?: (files: File[]) => Promise<void> | void;
  onDelete?: (linkToken: string) => Promise<void> | void;
  onDownload?: (file: FileItem) => Promise<void> | void;
  title?: string;
  defaultId?: string;
};
