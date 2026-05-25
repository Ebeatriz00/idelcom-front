import { useCrmOpporPerms } from "@/pages/crm/opportunity/hooks/oppor.perms";
import { usePreSaleProyectsPerms } from "@/pages/presale/presaleproyects/hooks/project.perms";
import { useHiringPerms } from "../../Hiring/hooks/hiring.perms";
import type { FolderNode } from "../components/detail/fileOpp/components/folderTree";

export function useOpportunityFolders() {
  const perms = useCrmOpporPerms();
  const presalePerms = usePreSaleProyectsPerms();
  const hiringPerms = useHiringPerms();

  console.log(
    "CRM Perms:",
    perms.canAddClientComm,
    presalePerms.canAddClientComm,
  );

  const folders: FolderNode[] = [
    {
      key: "PRESUPUESTAL",
      label: "Comercial",
      canView: perms.canViewBudget || presalePerms.canViewBudget,
      canAdd: false,
      candDelete: false,
      canDownload: false,
      isGroup: true,
      children: [
        {
          key: "CLIENTES",
          label: "Clientes",
          canView: perms.canViewClientComm || presalePerms.canViewClientComm,
          canAdd: perms.canAddClientComm || presalePerms.canAddClientComm,
          candDelete:
            perms.canDeleteClientComm || presalePerms.canDeleteClientComm,
          canDownload:
            perms.canDownaldClientComm || presalePerms.canDownaldClientComm,
        },
      ],
    },
    {
      key: "LOGISTICA",
      label: "Logística",
      canView: perms.canViewLogistic || presalePerms.canViewLogistic,
      canAdd: false,
      candDelete: false,
      canDownload: false,
      isGroup: true,
      children: [
        {
          key: "INFORMACIONCLIENTE",
          label: "Información Cliente",
          canView: perms.canViewInfoClient,
          canAdd: perms.canAddInfoClient,
          canDownload: perms.canDownloadInfoClient,
          candDelete: perms.canDeleteInfoClient,
        },
        {
          key: "O.C. PROVEEDORES",
          label: "O.C. Proveedores",
          canView: presalePerms.canViewLogisticOcSupliers,
          canAdd: presalePerms.canAddLogisticOcSupliers,
          canDownload: presalePerms.canDownaldLogisticOcSupliers,
          candDelete: presalePerms.canDeleteLogisticOcSupliers,
        },
        {
          key: "GUIASDEREMISION",
          label: "Guías de remisión",
          canView: perms.canViewDeliveryGuidesFolder,
          canAdd: false,
          canDownload: false,
          candDelete: false,
          isGroup: true,
          children: [
            {
              key: "DESPACHO",
              label: "Despacho",
              canView: perms.canViewDispatchGuidesFolder,
              canAdd: perms.canAddDispatchGuidesFolder,
              canDownload: perms.canDownloadDispatchGuidesFolder,
              candDelete: perms.canDeleteDispatchGuidesFolder,
            },
            {
              key: "HERRAMIENTAS",
              label: "Herramientas",
              canView: perms.canViewLogisticGuidesTools,
              canAdd: perms.canAddLogisticGuidesTools,
              canDownload: perms.canDownloadLogisticGuidesTools,
              candDelete: perms.canDeleteLogisticGuidesTools,
            },
          ],
        },
        {
          key: "EVIDENCIADEENTREGAS",
          label: "Evidencia de entregas",
          canView: perms.canViewLogisticEvidenceDeliveries,
          canAdd: perms.canAddLogisticEvidenceDeliveries,
          canDownload: perms.canDownloadLogisticEvidenceDeliveries,
          candDelete: perms.canDeleteLogisticEvidenceDeliveries,
        },
        {
          key: "CERTIFICACIONES",
          label: "Certificaciones",
          canView: false,
          canAdd: false,
          canDownload: false,
          candDelete: false,
        },
        {
          key: "CALIBRACIONES",
          label: "Calibraciones",
          canView: false,
          canAdd: false,
          canDownload: false,
          candDelete: false,
        },
        {
          key: "CHOFERES",
          label: "Choferes",
          canView: false,
          canAdd: false,
          canDownload: false,
          candDelete: false,
        },
        {
          key: "FICHATECNICA",
          label: "Ficha Técnica",
          canView: perms.canViewTechSpecFolder,
          canAdd: perms.canAddTechSpecFolder,
          canDownload: perms.canDownloadTechSpecFolder,
          candDelete: perms.canDeleteTechSpecFolder,
        },
      ],
    },
    {
      key: "PREVENTA",
      label: "Pre-Venta",
      canView: perms.canViewPreSales || presalePerms.canViewPreSales,
      canAdd: false,
      candDelete: false,
      canDownload: false,
      isGroup: true,
      children: [
        {
          key: "CLIENTS",
          label: "Información Cliente",
          canView:
            perms.canViewClientPreSales || presalePerms.canViewClientPreSales,
          canAdd:
            perms.canAddClientPreSales || presalePerms.canAddClientPreSales,
          candDelete:
            perms.canDeleteClientPreSales ||
            presalePerms.canDeleteClientPreSales,
          canDownload:
            perms.canDownaldClientPreSales ||
            presalePerms.canDownaldClientPreSales,
        },
        {
          key: "COTIZACION",
          label: "Cotizaciones",
          canView:
            perms.canViewQuotPreSales || presalePerms.canViewQuotPreSales,
          canAdd: perms.canAddQuotPreSales || presalePerms.canAddQuotPreSales,
          candDelete:
            perms.canDeleteQuotPreSales || presalePerms.canDeleteQuotPreSales,
          canDownload:
            perms.canDownaldQuotPreSales || presalePerms.canDownaldQuotPreSales,
        },
        {
          key: "TECNICA",
          label: "Oferta",
          canView: perms.canViewTechnical || presalePerms.canViewTechnical,
          canAdd: perms.canAddTechnical || presalePerms.canAddTechnical,
          candDelete:
            perms.canDeleteTechnical || presalePerms.canDeleteTechnical,
          canDownload:
            perms.canDownaldTechnical || presalePerms.canDownaldTechnical,
        },
      ],
    },
    {
      key: "CONTRATACIONES",
      label: "Contrataciones",
      canView: perms.canViewContracts || hiringPerms.canViewContracts,
      canAdd: false,
      candDelete: false,
      canDownload: false,
      isGroup: true,
      children: [
        {
          key: "CONSULTORIA",
          label: "Consultoria",
          canView: perms.canViewConsulting || hiringPerms.canViewConsulting,
          canAdd: perms.canAddConsulting || hiringPerms.canAddConsulting,
          candDelete:
            perms.canDeleteConsulting || hiringPerms.canDeleteConsulting,
          canDownload:
            perms.canDownaldConsulting || hiringPerms.canDownaldConsulting,
        },

        {
          key: "DOCUMENTACION",
          label: "Documentación",
          canView:
            perms.canViewDocumentation || hiringPerms.canViewDocumentation,
          canAdd: perms.canAddDocumentation || hiringPerms.canAddDocumentation,
          candDelete:
            perms.canDeleteDocumentation || hiringPerms.canDeleteDocumentation,
          canDownload:
            perms.canDownaldDocumentation ||
            hiringPerms.canDownaldDocumentation,
        },
        {
          key: "INFORMES",
          label: "Informes",
          canView: perms.canViewReports || hiringPerms.canViewReports,
          canAdd: perms.canAddReports || hiringPerms.canAddReports,
          candDelete: perms.canDeleteReports || hiringPerms.canDeleteReports,
          canDownload: perms.canDownaldReports || hiringPerms.canDownaldReports,
        },
      ],
    },

    {
      key: "ECONOMICA",
      label: "Finanzas",
      canView: perms.canViewEconomy,
      canAdd: false,
      candDelete: false,
      canDownload: false,
      isGroup: true,
      children: [
        {
          key: "FACTURACION",
          label: "Facturación",
          canView: perms.canViewBilling,
          canAdd: perms.canAddBilling,
          candDelete: perms.canDeleteBilling,
          canDownload: perms.canDownaldBilling,
        },
        {
          key: "GUIAS_FIRMADAS",
          label: "Guías firmadas",
          canView: perms.canViewSignedGuides,
          canAdd: perms.canAddSignedGuides,
          candDelete: perms.canDeleteSignedGuides,
          canDownload: perms.canDownaldSignedGuides,
        },
        {
          key: "COMPROBANTES_PAGO",
          label: "Comprobantes de pago",
          canView: perms.canViewPaymentVoucher,
          canAdd: perms.canAddPaymentVoucher,
          candDelete: perms.canDeletePaymentVoucher,
          canDownload: perms.canDownaldPaymentVoucher,
        },
        {
          key: "ACTAS_CONFORMIDAD",
          label: "Actas de conformidad",
          canView: perms.canViewConformityCertificate,
          canAdd: perms.canAddConformityCertificate,
          candDelete: perms.canDeleteConformityCertificate,
          canDownload: perms.canDownaldConformityCertificate,
        },
      ],
    },
  ];

  const flatFolders: FolderNode[] = [];
  const walk = (nodes: FolderNode[]) => {
    for (const n of nodes) {
      flatFolders.push(n);
      if (n.children) walk(n.children);
    }
  };
  walk(folders);

  return { folders, flatFolders };
}
