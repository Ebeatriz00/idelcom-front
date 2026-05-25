import type { ProductsUpsertFormValues } from "../../utils/products.schema";
import type { ReactNode } from "react";
import type { Control, FieldPath } from "react-hook-form";

export interface RHFSwitchProps {
  name: FieldPath<ProductsUpsertFormValues>;
  control: Control<ProductsUpsertFormValues>;
  label: string;
  description?: string;
  disabledReason?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

