import { useAuth } from "@/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCrmContactsPerms } from "../../hooks/permissions/contacts.perms";
import {
  contactsSchema,
  mapToFormValues,
  type ContactsFormValues,
} from "./contacts.schema";

type Args = {
  clientsId?: number;
  defaultValues?: Partial<ContactsFormValues>;
};

export function useContactsForm({ clientsId, defaultValues }: Args) {
  const form = useForm<ContactsFormValues>({
    resolver: zodResolver(contactsSchema),
    mode: "onChange",
    defaultValues: {
      ...mapToFormValues(defaultValues),
      clientsId: clientsId ?? defaultValues?.clientsId,
    },
  });

  const { reset, setValue } = form;
  useEffect(() => {
    reset({
      ...mapToFormValues(defaultValues),
      clientsId,
    });
  }, [defaultValues, reset, clientsId]);

  const { canUseSellerOption } = useCrmContactsPerms();
  const currentWorkerId = useAuth((s) => s.workerId);

  useEffect(() => {
    if (!canUseSellerOption && currentWorkerId != null) {
      setValue("workerId", Number(currentWorkerId), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [canUseSellerOption, currentWorkerId, setValue]);

  return { ...form, canUseSellerOption, currentWorkerId };
}
