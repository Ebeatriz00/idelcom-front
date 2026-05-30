import pdfMake from "pdfmake/build/pdfmake";
import { ensurePdfVfs } from "@/sharedKernel/utils/ensurePdfVfs";
import { loadLogoAsBase64 } from "@/sharedKernel/utils/logo";
import { getBusinessNameFromStorage } from "@/stores/auth/storage";
import type { OrdersResponseDto } from "@/application/dtos/operations/orders/orders.dto";
import type { OperationsResponseDto } from "@/application/dtos/operations/operations/operations.dto";
import type { OperationsProjectConfigResponseDto } from "@/application/dtos/operations/configProject/configProject.dto";
import type { OperationsWorkOrderResponseDto } from "@/application/dtos/operations/workOrder/workOrder.dto";
import type { OperationsSquadResponseDto } from "@/application/dtos/operations/squad/squad.dto";
import type { OperationsPersonnelAssignmentResponseDto } from "@/application/dtos/operations/assignment/assignment.dto";
import type { OperationsTeamSsomaListItemDto } from "@/application/dtos/operations/operationsTeamSsoma/operationsTeamSsoma.dto";
import type { SsomaOperationsRequirementItem } from "@/application/dtos/operations/ssomaOperationsRequirement/ssomaOperationsRequirementItem.dto";

// =============================================
// Tipos de datos que recibe el generador
// =============================================
export interface OperationClosurePdfData {
  selectedOrder: OrdersResponseDto;
  opDetail: OperationsResponseDto;
  projectConfigs: OperationsProjectConfigResponseDto[];
  workOrders: OperationsWorkOrderResponseDto[];
  squadsMap: Record<number, OperationsSquadResponseDto[]>;
  assignmentData: OperationsPersonnelAssignmentResponseDto[];
  ssomaTeam: OperationsTeamSsomaListItemDto[];
  ssomaRequirements: SsomaOperationsRequirementItem[];
  newStatusName: string;
}

// =============================================
// Colores del diseño
// =============================================
const COLORS = {
  primary: "#1A3673",
  primaryLight: "#E8EDF5",
  headerBg: "#0A1B3D",
  headerText: "#FFFFFF",
  sectionTitle: "#1A3673",
  sectionBg: "#F1F5F9",
  tableBorder: "#CBD5E1",
  tableHeaderBg: "#E2E8F0",
  tableHeaderText: "#334155",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  accent: "#F59E0B",
  success: "#10B981",
  danger: "#EF4444",
};

// =============================================
// Helpers
// =============================================
const formatDate = (date?: string | null): string => {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatTime = (time?: string | null): string => {
  if (!time) return "—";
  return time.substring(0, 5);
};

const today = (): string => {
  return new Date().toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// =============================================
// Generador de secciones del PDF
// =============================================

/** Crea un título de sección con línea decorativa */
function sectionTitle(text: string, icon?: string): any[] {
  return [
    {
      canvas: [
        {
          type: "rect",
          x: 0, y: 0,
          w: 4, h: 16,
          r: 2,
          color: COLORS.primary,
        },
      ],
    },
    {
      text: `${icon ? icon + "  " : ""}${text}`,
      style: "sectionTitle",
      margin: [10, -14, 0, 8],
    },
  ];
}

/** Crea una fila de información con etiqueta y valor */
function infoRow(label: string, value: string): any {
  return {
    columns: [
      { text: label, style: "label", width: 160 },
      { text: value, style: "value", width: "*" },
    ],
    margin: [0, 2, 0, 2],
  };
}

/** Crea una tarjeta con borde y fondo */
function card(content: any[]): any {
  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack: content,
            margin: [12, 10, 12, 10],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => COLORS.tableBorder,
      vLineColor: () => COLORS.tableBorder,
      fillColor: () => "#FAFBFC",
    },
    margin: [0, 0, 0, 12],
  };
}

// =============================================
// Función principal de generación del PDF
// =============================================
export async function generateOperationClosurePdf(data: OperationClosurePdfData): Promise<File | void> {
  await ensurePdfVfs();

  const logoB64 = await loadLogoAsBase64();
  const company = getBusinessNameFromStorage() ?? "IDELCOM";
  const dateStr = today();

  const {
    selectedOrder,
    opDetail,
    projectConfigs,
    workOrders,
    squadsMap,
    assignmentData,
    ssomaTeam,
    ssomaRequirements,
    newStatusName,
  } = data;

  // Función auxiliar para obtener miembros de una cuadrilla
  const getMembersBySquad = (squadId: number): OperationsPersonnelAssignmentResponseDto[] =>
    assignmentData.filter((a) => a.squadId === squadId);

  // =============================================
  // CONTENIDO DEL PDF
  // =============================================
  const content: any[] = [];

  // --- BANNER PRINCIPAL ---
  content.push({
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack: [
              {
                text: `ACTA DE ${newStatusName.toUpperCase()}`,
                fontSize: 18,
                bold: true,
                color: COLORS.headerText,
                alignment: "center",
              },
              {
                text: selectedOrder.opporDesc || "Operación",
                fontSize: 12,
                color: "#CBD5E1",
                alignment: "center",
                margin: [0, 4, 0, 0],
              },
              {
                text: `Generado el ${dateStr}`,
                fontSize: 8,
                color: "#94A3B8",
                alignment: "center",
                margin: [0, 6, 0, 0],
              },
            ],
            fillColor: COLORS.headerBg,
            margin: [20, 16, 20, 16],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      fillColor: () => COLORS.headerBg,
    },
    margin: [0, 0, 0, 20],
  });

  // --- 1. INFORMACIÓN DEL PROYECTO ---
  content.push(...sectionTitle("INFORMACIÓN DEL PROYECTO"));
  content.push(
    card([
      infoRow("N° Oportunidad:", selectedOrder.opporNum || "—"),
      infoRow("Descripción:", selectedOrder.opporDesc || "—"),
      infoRow("Cliente:", selectedOrder.clientsName || "—"),
      infoRow("Comercial:", selectedOrder.commercial || "—"),
      infoRow("Estado Actual:", newStatusName),
      infoRow("Avance General:", `${opDetail.progressPercentage ?? 0}%`),
    ])
  );

  // --- 2. RESPONSABLES ---
  content.push(...sectionTitle("RESPONSABLES DEL PROYECTO"));
  content.push(
    card([
      infoRow("Gerente de Proyecto:", opDetail.projectManagerName || "Sin asignar"),
      infoRow("Supervisor de Calidad:", opDetail.qualitySupervisorName || "Sin asignar"),
      infoRow("Requiere SSOMA:", opDetail.requeredSsoma ? "Sí" : "No"),
    ])
  );

  // --- 3. CRONOGRAMA ---
  content.push(...sectionTitle("CRONOGRAMA"));
  content.push({
    table: {
      headerRows: 1,
      widths: ["*", "*", "*", "*"],
      body: [
        [
          { text: "INICIO PLANIFICADO", style: "tableHeader" },
          { text: "FIN PLANIFICADO", style: "tableHeader" },
          { text: "INICIO REAL", style: "tableHeader" },
          { text: "FIN REAL", style: "tableHeader" },
        ],
        [
          { text: formatDate(opDetail.plannedStartDate), style: "tableCell", alignment: "center" },
          { text: formatDate(opDetail.plannedEndDate), style: "tableCell", alignment: "center" },
          { text: formatDate(opDetail.actualStartDate), style: "tableCell", alignment: "center" },
          { text: formatDate(opDetail.actualEndDate), style: "tableCell", alignment: "center" },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => COLORS.tableBorder,
      vLineColor: () => COLORS.tableBorder,
      fillColor: (rowIndex: number) => (rowIndex === 0 ? COLORS.tableHeaderBg : null),
      paddingLeft: () => 8,
      paddingRight: () => 8,
      paddingTop: () => 6,
      paddingBottom: () => 6,
    },
    margin: [0, 0, 0, 16],
  });

  // --- 4. CONFIGURACIÓN DE HORARIOS ---
  if (projectConfigs && projectConfigs.length > 0) {
    content.push(...sectionTitle("CONFIGURACIÓN DE HORARIOS"));

    const configBody: any[][] = [
      [
        { text: "TURNO", style: "tableHeader" },
        { text: "ENTRADA", style: "tableHeader" },
        { text: "SALIDA", style: "tableHeader" },
        { text: "TOLERANCIA", style: "tableHeader" },
        { text: "FOTO OBL.", style: "tableHeader" },
        { text: "HRS. EXTRA", style: "tableHeader" },
      ],
    ];

    const sortedConfigs = [...projectConfigs].sort((a, b) => (a.shift || 0) - (b.shift || 0));
    sortedConfigs.forEach((c) => {
      configBody.push([
        { text: `T${c.shift || 1}`, style: "tableCell", alignment: "center" },
        { text: formatTime(c.entryTime), style: "tableCell", alignment: "center" },
        { text: formatTime(c.departureTime), style: "tableCell", alignment: "center" },
        { text: `${c.minutesTolerance} min`, style: "tableCell", alignment: "center" },
        { text: c.isRequirePhoto ? "Sí" : "No", style: "tableCell", alignment: "center" },
        { text: c.isRequireOvertime ? "Sí" : "No", style: "tableCell", alignment: "center" },
      ]);
    });

    content.push({
      table: {
        headerRows: 1,
        widths: ["auto", "*", "*", "auto", "auto", "auto"],
        body: configBody,
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => COLORS.tableBorder,
        vLineColor: () => COLORS.tableBorder,
        fillColor: (rowIndex: number) => (rowIndex === 0 ? COLORS.tableHeaderBg : null),
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 5,
        paddingBottom: () => 5,
      },
      margin: [0, 0, 0, 16],
    });
  }

  // --- 5. ÓRDENES DE TRABAJO ---
  if (workOrders && workOrders.length > 0) {
    content.push(...sectionTitle("ÓRDENES DE TRABAJO"));

    const woBody: any[][] = [
      [
        { text: "#", style: "tableHeader" },
        { text: "CÓDIGO", style: "tableHeader" },
        { text: "NOMBRE", style: "tableHeader" },
        { text: "AVANCE", style: "tableHeader" },
        { text: "UBICACIÓN", style: "tableHeader" },
      ],
    ];

    workOrders.forEach((wo, i) => {
      woBody.push([
        { text: String(i + 1), style: "tableCell", alignment: "center" },
        { text: wo.workOrderCode, style: "tableCell" },
        { text: wo.workOrderName, style: "tableCell" },
        { text: `${wo.progressPercentage ?? 0}%`, style: "tableCell", alignment: "center" },
        { text: wo.location || "—", style: "tableCell" },
      ]);
    });

    content.push({
      table: {
        headerRows: 1,
        widths: [25, "auto", "*", 50, "auto"],
        body: woBody,
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => COLORS.tableBorder,
        vLineColor: () => COLORS.tableBorder,
        fillColor: (rowIndex: number) => (rowIndex === 0 ? COLORS.tableHeaderBg : null),
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 5,
        paddingBottom: () => 5,
      },
      margin: [0, 0, 0, 16],
    });
  }

  // --- 6. CUADRILLAS Y PERSONAL POR ORDEN ---
  if (workOrders && workOrders.length > 0) {
    content.push(...sectionTitle("CUADRILLAS Y PERSONAL ASIGNADO"));

    workOrders.forEach((wo) => {
      const squads = squadsMap[wo.workOrderId] || [];

      // Sub-encabezado de la OT
      content.push({
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: `${wo.workOrderCode} — ${wo.workOrderName}`,
                bold: true,
                fontSize: 9,
                color: COLORS.headerText,
                margin: [8, 5, 8, 5],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          fillColor: () => COLORS.primary,
        },
        margin: [0, 4, 0, 4],
      });

      if (squads.length === 0) {
        content.push({
          text: "Sin cuadrillas asignadas",
          style: "emptyText",
          margin: [12, 4, 0, 8],
        });
      } else {
        squads.forEach((squad) => {
          const members = getMembersBySquad(squad.squadId);

          // Nombre de cuadrilla
          content.push({
            text: [
              { text: `${squad.squadName}`, bold: true, fontSize: 9 },
              { text: `  •  Líder: ${squad.techLeaderName || "Sin líder"}`, fontSize: 8, color: COLORS.textSecondary },
            ],
            margin: [12, 6, 0, 2],
          });

          if (members.length > 0) {
            const memberBody: any[][] = [
              [
                { text: "#", style: "tableHeaderSmall" },
                { text: "TRABAJADOR", style: "tableHeaderSmall" },
                { text: "ESTADO", style: "tableHeaderSmall" },
                { text: "F. ASIGNACIÓN", style: "tableHeaderSmall" },
              ],
            ];

            members.forEach((m, idx) => {
              memberBody.push([
                { text: String(idx + 1), fontSize: 7, alignment: "center" },
                { text: m.workerName || "—", fontSize: 7 },
                { text: m.assignmentStatusName || "—", fontSize: 7, alignment: "center" },
                { text: formatDate(m.assignmentDate), fontSize: 7, alignment: "center" },
              ]);
            });

            content.push({
              table: {
                headerRows: 1,
                widths: [20, "*", 70, 80],
                body: memberBody,
              },
              layout: {
                hLineWidth: () => 0.3,
                vLineWidth: () => 0.3,
                hLineColor: () => "#E2E8F0",
                vLineColor: () => "#E2E8F0",
                fillColor: (rowIndex: number) => (rowIndex === 0 ? "#F1F5F9" : null),
                paddingLeft: () => 6,
                paddingRight: () => 6,
                paddingTop: () => 3,
                paddingBottom: () => 3,
              },
              margin: [20, 2, 0, 8],
            });
          } else {
            content.push({
              text: "Sin integrantes asignados",
              style: "emptyText",
              margin: [20, 2, 0, 6],
            });
          }
        });
      }
    });

    content.push({ text: "", margin: [0, 8, 0, 0] });
  }

  // --- 7. EQUIPO SSOMA ---
  if (ssomaTeam && ssomaTeam.length > 0) {
    content.push(...sectionTitle("EQUIPO SSOMA ASIGNADO"));

    const ssomaBody: any[][] = [
      [
        { text: "#", style: "tableHeader" },
        { text: "TRABAJADOR", style: "tableHeader" },
        { text: "ROL", style: "tableHeader" },
        { text: "INICIO", style: "tableHeader" },
        { text: "FIN", style: "tableHeader" },
        { text: "TITULAR", style: "tableHeader" },
        { text: "ACTIVO", style: "tableHeader" },
      ],
    ];

    ssomaTeam.forEach((member, i) => {
      ssomaBody.push([
        { text: String(i + 1), style: "tableCell", alignment: "center" },
        { text: member.workerName || "—", style: "tableCell" },
        { text: member.ssomaRoleName || "—", style: "tableCell" },
        { text: formatDate(member.startDate), style: "tableCell", alignment: "center" },
        { text: formatDate(member.endDate), style: "tableCell", alignment: "center" },
        { text: member.isPrimary ? "Sí" : "No", style: "tableCell", alignment: "center" },
        { text: member.isActive ? "Sí" : "No", style: "tableCell", alignment: "center" },
      ]);
    });

    content.push({
      table: {
        headerRows: 1,
        widths: [20, "*", "auto", 60, 60, 45, 45],
        body: ssomaBody,
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => COLORS.tableBorder,
        vLineColor: () => COLORS.tableBorder,
        fillColor: (rowIndex: number) => (rowIndex === 0 ? COLORS.tableHeaderBg : null),
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 5,
        paddingBottom: () => 5,
      },
      margin: [0, 0, 0, 16],
    });
  }

  // --- 8. REQUERIMIENTOS SSOMA ---
  if (ssomaRequirements && ssomaRequirements.length > 0) {
    content.push(...sectionTitle("REQUERIMIENTOS SSOMA"));

    const reqBody: any[][] = [
      [
        { text: "#", style: "tableHeader" },
        { text: "REQUERIMIENTO", style: "tableHeader" },
        { text: "DESCRIPCIÓN", style: "tableHeader" },
        { text: "OBLIGATORIO", style: "tableHeader" },
      ],
    ];

    ssomaRequirements.forEach((req, i) => {
      reqBody.push([
        { text: String(i + 1), style: "tableCell", alignment: "center" },
        { text: req.requirementName || "—", style: "tableCell" },
        { text: req.requirementDescription || "—", style: "tableCell" },
        { text: req.isMandatory ? "Sí" : "No", style: "tableCell", alignment: "center" },
      ]);
    });

    content.push({
      table: {
        headerRows: 1,
        widths: [20, "*", "*", 70],
        body: reqBody,
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => COLORS.tableBorder,
        vLineColor: () => COLORS.tableBorder,
        fillColor: (rowIndex: number) => (rowIndex === 0 ? COLORS.tableHeaderBg : null),
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 5,
        paddingBottom: () => 5,
      },
      margin: [0, 0, 0, 16],
    });
  }

  // --- RESUMEN FINAL ---
  content.push({
    table: {
      widths: ["*", "*", "*"],
      body: [
        [
          {
            stack: [
              { text: "ÓRDENES DE TRABAJO", style: "summaryLabel" },
              { text: String(workOrders?.length ?? 0), style: "summaryValue" },
            ],
            alignment: "center",
            margin: [0, 8, 0, 8],
          },
          {
            stack: [
              { text: "PERSONAL EN CUADRILLAS", style: "summaryLabel" },
              { text: String(assignmentData?.length ?? 0), style: "summaryValue" },
            ],
            alignment: "center",
            margin: [0, 8, 0, 8],
          },
          {
            stack: [
              { text: "EQUIPO SSOMA", style: "summaryLabel" },
              { text: String(ssomaTeam?.length ?? 0), style: "summaryValue" },
            ],
            alignment: "center",
            margin: [0, 8, 0, 8],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => COLORS.tableBorder,
      vLineColor: () => COLORS.tableBorder,
      fillColor: () => COLORS.primaryLight,
    },
    margin: [0, 8, 0, 0],
  });

  // =============================================
  // DEFINICIÓN DEL DOCUMENTO
  // =============================================
  const docDef: any = {
    pageSize: "A4",
    pageOrientation: "portrait",
    pageMargins: [32, 72, 32, 50],

    header: {
      margin: [32, 16, 32, 0],
      columns: [
        logoB64 ? { image: logoB64, width: 100 } : { text: company, bold: true, fontSize: 12 },
        {
          width: "*",
          alignment: "right",
          stack: [
            { text: company, bold: true, fontSize: 9, color: COLORS.textPrimary },
            { text: "Sistema de Gestión de Operaciones", fontSize: 7, color: COLORS.textSecondary },
          ],
        },
      ],
    },

    footer: (currentPage: number, pageCount: number) => ({
      margin: [32, 0, 32, 16],
      columns: [
        {
          text: `${company} — Documento generado automáticamente`,
          fontSize: 7,
          color: COLORS.textSecondary,
        },
        {
          text: `Página ${currentPage} de ${pageCount}`,
          alignment: "right",
          fontSize: 7,
          color: COLORS.textSecondary,
        },
      ],
    }),

    content,

    styles: {
      sectionTitle: {
        fontSize: 11,
        bold: true,
        color: COLORS.sectionTitle,
        margin: [0, 16, 0, 8],
      },
      label: {
        fontSize: 8,
        bold: true,
        color: COLORS.textSecondary,
      },
      value: {
        fontSize: 8,
        color: COLORS.textPrimary,
      },
      tableHeader: {
        fontSize: 7,
        bold: true,
        color: COLORS.tableHeaderText,
        alignment: "center" as const,
      },
      tableHeaderSmall: {
        fontSize: 6,
        bold: true,
        color: COLORS.tableHeaderText,
        alignment: "center" as const,
      },
      tableCell: {
        fontSize: 8,
        color: COLORS.textPrimary,
      },
      emptyText: {
        fontSize: 7,
        italics: true,
        color: COLORS.textSecondary,
      },
      summaryLabel: {
        fontSize: 7,
        bold: true,
        color: COLORS.textSecondary,
      },
      summaryValue: {
        fontSize: 18,
        bold: true,
        color: COLORS.primary,
      },
    },

    defaultStyle: {
      fontSize: 8,
      color: COLORS.textPrimary,
    },
  };

  // Retornar el PDF como File
  const fileName = `Acta_${newStatusName.replace(/\s+/g, "_")}_${selectedOrder.opporNum || "OP"}_${new Date().toISOString().slice(0, 10)}.pdf`;

  return new Promise((resolve) => {
    (pdfMake as any).createPdf(docDef).getBlob((blob: Blob) => {
      const file = new File([blob], fileName, { type: "application/pdf" });
      resolve(file);
    });
  });
}
