import type { ClinicFormValues } from "./clinic.schema";

export interface PropsModal {
  open: boolean;
  title: string;
  loadingDetail?: boolean;
  defaultValues: Partial<ClinicFormValues>;
  onClose: () => void;
  onSubmit: (dto: any) => Promise<void>;
  saving: boolean;
}
