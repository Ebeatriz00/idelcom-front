import type { Control, FieldPath, FieldValues } from "react-hook-form";

export interface BaseFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  description?: string;
}

export type InputTransformMode =
  | "upper"
  | "lower"
  | "capitalize"
  | "section"
  | "first";

