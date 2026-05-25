import Swal from "sweetalert2";


export async function confirmPdfLimit150(entityLabel: string, limit: number) {
  const res = await Swal.fire({
    title: "Límite de exportación (PDF)",
    html: `
      <div class="erp-swal-wrap">
        <div class="erp-swal-sub">
          Por rendimiento, la exportación a PDF está limitada a 
          <span class="erp-badge">${limit}</span> ${entityLabel}.
        </div>

        <div class="erp-swal-callout">
          <div class="erp-swal-callout-title">Recomendación</div>
          <div class="erp-swal-callout-text">
            Para exportar <b>todos los registros</b>, utilice <b>Excel (.xlsx)</b> o <b>CSV (.csv)</b>.
          </div>
        </div>

        <div class="erp-swal-q">
          ¿Desea continuar con la exportación en PDF?
        </div>
      </div>
    `,
    icon: undefined,
    showCancelButton: true,
    confirmButtonText: "Continuar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "erp-swal-popup2",
      title: "erp-swal-title2",
      htmlContainer: "erp-swal-body2",
      actions: "erp-swal-actions2",
      confirmButton: "erp-swal-confirm2",
      cancelButton: "erp-swal-cancel2",
    },
  });

  return res.isConfirmed;
}
