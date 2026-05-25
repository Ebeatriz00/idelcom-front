import Swal from "sweetalert2";

export function showLoading(title = "Validando credenciales...") {
  void Swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });
}

export function closeAlert() {
  return Swal.close();
}

export function showSuccess(title = "Listo", text?: string) {
  return Swal.fire({
    icon: "success",
    title,
    text,
  });
}
export function showWarning(title = "Advertencia", text?: string) {
  return Swal.fire({
    icon: "warning",
    title,
    text,
  });
}


export async function showWarningConfirm(
  title = "¿Estás seguro?",
  text = "No podrás revertir esta acción.",
  confirmText = "Sí, continuar",
  cancelText = "No, cancelar",
  successTitle = "Completado",
  successText = "La operación se realizó correctamente.",
  cancelTitle = "Cancelado",
  cancelMsg = "La operación fue cancelada."
): Promise<boolean> {
  const swalWithTailwindButtons = Swal.mixin({
    customClass: {
      confirmButton:
        "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mr-3",
      cancelButton:
        "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mr-3",
    },
    buttonsStyling: false,
  });

  const result = await swalWithTailwindButtons.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });

  if (result.isConfirmed) {
    await swalWithTailwindButtons.fire({
      title: successTitle,
      text: successText,
      icon: "success",
      confirmButtonText: "Aceptar",
      customClass: {
        confirmButton:
          "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mr-3",
      },
      buttonsStyling: false,
    });
    return true;
  } else if (result.dismiss === Swal.DismissReason.cancel) {
    await swalWithTailwindButtons.fire({
      title: cancelTitle,
      text: cancelMsg,
      icon: "error",
      confirmButtonText: "Entendido",
      customClass: {
        confirmButton:
          "bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-5 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500",
      },
      buttonsStyling: false,
    });
    return false;
  }

  return false;
}

export async function confirmAction({
  title = "¿Estás seguro?",
  text = "No podrás revertir esta acción.",
  confirmText = "Sí, continuar",
  cancelText = "No, cancelar",
  icon = "warning" as const,
}: {
  title?: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: "warning" | "question" | "info" | "error" | "success";
} = {}): Promise<boolean> {
  const swal = Swal.mixin({
    customClass: {
      confirmButton:
        "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mr-3",
      cancelButton:
        "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mr-3",
    },
    buttonsStyling: false,
  });

  const res = await swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    allowOutsideClick: false,
    focusCancel: true,
  });

  return res.isConfirmed === true;
}


export async function showAccountLinkedContactConfirm(): Promise<boolean> {
  const swalWithTailwindButtons = Swal.mixin({
    customClass: {
      confirmButton:
        "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mr-3",
      cancelButton:
        "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mr-3",
    },
    buttonsStyling: false,
  });

  const result = await swalWithTailwindButtons.fire({
    icon: "success",
    title: "Cuenta guardada",
    text: "La cuenta se guardó exitosamente. ¿Deseas asociarla a un contacto?",
    showCancelButton: true,
    confirmButtonText: "Sí, asociar",
    cancelButtonText: "No, ahora no",
    reverseButtons: true,
  });

  return result.isConfirmed === true;
}