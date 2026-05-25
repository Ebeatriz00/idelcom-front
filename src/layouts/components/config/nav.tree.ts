import {
  Activity,
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  Badge,
  BarChart3,
  BarChartBig,
  BarChartHorizontal,
  BookOpen,
  BookOpenCheck,
  BookUser,
  Boxes,
  BrickWallShield,
  Briefcase,
  Building2,
  Cable,
  Calendar,
  CalendarCheck,
  CalendarClock,
  ChartColumn,
  CheckCircle,
  CheckSquare,
  ClipboardList,
  Clock,
  Cog,
  CreditCard,
  Database,
  DollarSign,
  Download,
  Factory,
  FileArchive,
  FileBarChart,
  FileCheck,
  FileCode,
  FilePenLine,
  FileSpreadsheet,
  FileText,
  FolderKey,
  FolderLock,
  FolderTree,
  Landmark,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  ListOrdered,
  Lock,
  Package,
  Percent,
  PieChart,
  Podcast,
  Repeat,
  RotateCcwKey,
  Send,
  Server,
  Settings,
  Share2,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Tags,
  TrendingUp,
  Truck,
  Upload,
  User,
  UserLock,
  Users,
  UserSquare,
  Wallet,
  Workflow,
  Wrench,

} from "lucide-react";
import type { ComponentType } from "react";

export type NavNode = {
  label: string;
  href?: string;
  icon?: ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string | number;
  children?: NavNode[];
};

export type NavSection = {
  title: string;
  nodes: NavNode[];
  stickyToBottom?: boolean;
};

export const NAV_TREE: NavSection[] = [
  // --- DASHBOARD ---
  {
    title: "General",
    nodes: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        children: [
          {
            label: "Corporativo",
            href: "/dashboard/corporativo",
            icon: BarChart3,
          },
          { label: "Comercial", href: "/dashboard/comercial", icon: Briefcase },
          {
            label: "Pre-Venta",
            href: "/dashboard/PreSale",
            icon: LayoutDashboard
          },
          {
            label: "Operaciones",
            href: "/dashboard/operaciones",
            icon: Factory,
          },
          { label: "Finanzas", href: "/dashboard/finanzas", icon: DollarSign },
          { label: "RRHH", href: "/dashboard/rrhh", icon: Users },
        ],
      },
    ],
  },

  // --- CRM / VENTAS ---
  {
    title: "Ventas",
    nodes: [
      {
        label: "CRM",
        icon: UserSquare,
        children: [
          { label: "Cuentas", href: "/crm/accounts", icon: Users },
          { label: "Contactos", href: "/crm/contacts", icon: User },
          {
            label: "Leads",
            href: "#",
            icon: Sparkles,
            children: [
              { label: "Tipos", href: "/crm/leads/contact-type", icon: Tag },
              {
                label: "Calificación",
                href: "/crm/leads/qualifications",
                icon: Star,
              },
              { label: "Fuentes", href: "/crm/leads/sources", icon: Share2 },
              { label: "Estados", href: "/crm/leads/status", icon: Activity },
            ],
          },
          {
            label: "Oportunidades",
            href: "#",
            icon: Briefcase,
            children: [
              {
                label: "Estados",
                href: "/crm/opportunities/states",
                icon: TrendingUp,
              },
              {
                label: "Líneas",
                href: "/crm/opportunities/lines",
                icon: Layers,
              },
              {
                label: "Procesos",
                href: "/crm/opportunities/processes",
                icon: Workflow,
              },
            ],
          },
          {
            label: "Oportunidades CRM",
            href: "/crm/opportunity",
            icon: Podcast,
          },
          { label: "Tareas de Oportunidades", href: "/crm/tasks/tasks", icon: CalendarCheck },
        ],
      },

      {
        label: "Pre-Venta",
        icon: ClipboardList,
        children: [
          {
            label: "Proyectos",
            href: "/presale/presaleproyects/presaleproyects",
            icon: ClipboardList,
          },

          {
            label: "Tareas de Proyectos",
            href: "/presale/tasksprojects",
            icon: ClipboardList,
          },
          {
            label: "Cotizaciones",
            href: "/pre-sale/quotes",
            icon: FileText,
          },
          {
            label: "Viabilidad",
            href: "/pre-sale/viability",
            icon: CheckSquare,
          },
          {
            label: "Portabilidad",
            href: "/pre-sale/portability",
            icon: Cable,
          },
        ],
      },

      {
        label: "Ventas",
        icon: ShoppingCart,
        children: [
          { label: "Pedidos", href: "/sales/orders", icon: ListOrdered },
          {
            label: "Facturación",
            href: "/sales/billing-type",
            icon: FileText,
          },
          { label: "Precios", href: "/sales/prices", icon: DollarSign },
        ],
      },
    ],
  },

  // --- OPERACIONES / RED / SERVICIOS ---
  {
    title: "Operaciones",
    nodes: [
      // Servicios
      {
        label: "Servicios",
        icon: Factory,
        children: [
          {
            label: "Órdenes",
            href: "/operations/orders",
            icon: ClipboardList,
          },
          {
            label: "Matriz de Asistencia",
            href: "/operations/attendance",
            icon: CalendarClock,
          },
          {
            label: "Mantenimientos",
            href: "/operaciones/mantenimientos",
            icon: Wrench,
          },
          {
            label: "Incidencias",
            href: "/operaciones/incidencias",
            icon: Shield,
          },
        ],
      },
      // Red
      {
        label: "Red",
        icon: Server,
        children: [
          {
            label: "Inventario",
            href: "/operaciones/red/inventario",
            icon: Database,
          },
          {
            label: "Topología",
            href: "/operaciones/red/topologia",
            icon: Layers,
          },
          { label: "Provisión", href: "/operaciones/red/provision", icon: Cog },
        ],
      },
    ],
  },

  // --- LOGÍSTICA / ALMACÉN ---

  {
    title: "Almacén",
    nodes: [
      {
        label: "Maestros",
        icon: Package,
        children: [
          {
            label: "Categorías",
            href: "/warehouses/masters/categories",
            icon: Tags,
          },
          {
            label: "Líneas de producto",
            href: "/warehouses/masters/productlines",
            icon: Layers,
          },
          { label: "Marcas", href: "/warehouses/masters/brands", icon: Badge },
          {
            label: "Tipos de producto",
            href: "/warehouses/masters/producttypes",
            icon: Boxes,
          },
          {
            label: "Almacenes",
            href: "/warehouses/masters/warehouses",
            icon: Building2,
          },
          {
            label: "Tipos de movimiento",
            href: "/warehouses/masters/movementtypes",
            icon: ArrowLeftRight,
          },
        ],
      },
      {
        label: "Operación",
        icon: Package,
        children: [
          { label: "Productos", href: "/almacen/productos", icon: Package },
          { label: "Movimientos", href: "/almacen/movimientos", icon: Truck },
          { label: "Entregas", href: "/almacen/entregas", icon: ClipboardList },
          { label: "Traslados", href: "/almacen/traslados", icon: Truck },
          { label: "Stock", href: "/almacen/stock", icon: Database },
          { label: "Series", href: "/almacen/series", icon: FileText },
          {
            label: "Valorización",
            href: "/almacen/valorizacion",
            icon: DollarSign,
          },
        ],
      },
    ],
  },

  // --- COMPRAS ---
  {
    title: "Compras",
    nodes: [
      {
        label: "Abastecimiento",
        icon: ShoppingCart,
        children: [
          {
            label: "Proveedores",
            href: "/purchases/suppliers",
            icon: Briefcase,
          },
          {
            label: "Solicitudes",
            href: "/compras/solicitudes",
            icon: FileText,
            children: [
              {
                label: "Líneas de solicitud",
                href: "/compras/solicitudes/lineas",
                icon: ListOrdered,
              },
            ],
          },
          {
            label: "Pedidos de compra",
            href: "/compras/pedidos",
            icon: ClipboardList,
          },
          {
            label: "Aprobaciones",
            href: "/compras/aprobaciones",
            icon: CheckSquare,
          },
        ],
      },
    ],
  },

  // --- FINANZAS ---
  {
    title: "Finanzas",
    nodes: [
      {
        label: "Tesorería",
        icon: DollarSign,
        children: [
          { label: "Caja", href: "/finance/boxes/boxes", icon: Briefcase },
          { label: "Bancos", href: "/finance/bank/bank", icon: Landmark },
          {
            label: "Cuentas Bancarias",
            href: "/finance/account/account",
            icon: CreditCard,
          },
          {
            label: "Conciliaciones",
            href: "/finance/reconciliations",
            icon: CheckSquare,
          },
          {
            label: "Flujo de Caja",
            href: "/finance/cash-flow",
            icon: TrendingUp,
          },
          {
            label: "Ingresos Varios",
            href: "/finance/miscellaneous-income",
            icon: ArrowDownCircle,
          },
          {
            label: "Egresos Varios",
            href: "/finance/miscellaneous-expenses",
            icon: ArrowUpCircle,
          },
          {
            label: "Canje de Letra",
            href: "/finance/exchange-bill",
            icon: Repeat,
          },
          {
            label: "Rendiciones de Gastos",
            href: "/finance/surrenders",
            icon: FileCheck,
          },
        ],
      },

      // CUENTAS POR PAGAR
      {
        label: "Cuentas por Pagar",
        icon: FileSpreadsheet,
        children: [
          {
            label: "Facturas de Proveedor",
            href: "/finance/facturas-proveedor",
            icon: FileText,
          },
          {
            label: "Documentos de Finanzas",
            href: "/finance/documentos",
            icon: FileArchive,
          },
          {
            label: "Pagos a Proveedores",
            href: "/finance/pagos-proveedores",
            icon: Send,
          },
          {
            label: "Aplicaciones de Proveedores",
            href: "/finance/aplicaciones-proveedores",
            icon: CheckSquare,
          },
        ],
      },

      // CUENTAS POR COBRAR
      {
        label: "Cuentas por Cobrar",
        icon: FileBarChart,
        children: [
          {
            label: "Pagos de Clientes",
            href: "/finance/pagos-clientes",
            icon: Download,
          },
          {
            label: "Aplicaciones de Clientes",
            href: "/finance/aplicaciones-clientes",
            icon: CheckCircle,
          },
        ],
      },

      // PAGOS Y COBRANZAS PROGRAMADAS
      {
        label: "Pagos y Cobranzas",
        icon: Wallet,
        children: [
          {
            label: "Programación de Pagos",
            href: "/finance/programacion-pagos",
            icon: CalendarCheck,
          },
          {
            label: "Cobranzas Programadas",
            href: "/finance/cobranzas",
            icon: CalendarClock,
          },
        ],
      },

      // REPORTES FINANCIEROS
      {
        label: "Reportes Financieros",
        icon: BarChart3,
        children: [
          {
            label: "Liquidez",
            href: "/finance/reportes/liquidez",
            icon: Activity,
          },
          {
            label: "Flujo Real vs Proyectado",
            href: "/finance/reportes/flujo",
            icon: TrendingUp,
          },
        ],
      },
    ],
  },

  // --- CONTABILIDAD ---
  {
    title: "Contabilidad",
    nodes: [
      {
        label: "Catálogos Contables",
        icon: BookOpen,
        children: [
          {
            label: "Tipo de comprobante",
            href: "/accounting/documents",
            icon: FileText,
          },
          { label: "Series", href: "/accounting/series", icon: ListOrdered },
          {
            label: "Tipo de Afectación",
            href: "/accounting/tax-aff-type",
            icon: Percent,
          },
          {
            label: "Plan de Cuentas",
            href: "/accounting/account-plan",
            icon: BookOpenCheck,
          },
          {
            label: "Centros de Costos",
            href: "/accounting/costcenters",
            icon: LayoutGrid,
          },
          { label: "Conceptos", href: "/accounting/concepts", icon: Tags },
          {
            label: "Grupos de Conceptos",
            href: "/accounting/conceptgroups",
            icon: FolderTree,
          },
        ],
      },
      {
        label: "Operaciones Contables",
        icon: FileSpreadsheet,
        children: [
          {
            label: "Ejercicios y Periodos",
            href: "/accounting/exerper",
            icon: Calendar,
          },
          {
            label: "Sub Diarios",
            href: "/contabilidad/subdiarios",
            icon: ClipboardList,
          },
          {
            label: "Asientos",
            href: "/contabilidad/asientos",
            icon: FilePenLine,
          },
          {
            label: "Importar Asientos",
            href: "/contabilidad/importar-asientos",
            icon: Upload,
          },
          {
            label: "Cierres Contables",
            href: "/contabilidad/cierres",
            icon: Lock,
          },
        ],
      },
      {
        label: "Reportes Contables",
        icon: BarChartBig,
        children: [
          {
            label: "Balance de Comprobación",
            href: "/contabilidad/reportes/balance-comprobacion",
            icon: BarChartHorizontal,
          },
          {
            label: "Estado de Resultados",
            href: "/contabilidad/reportes/estado-resultados",
            icon: PieChart,
          },
          {
            label: "Balance General",
            href: "/contabilidad/reportes/balance-general",
            icon: ChartColumn,
          },
          {
            label: "Libros Electrónicos",
            href: "/contabilidad/reportes/ple",
            icon: FileCode,
          },
        ],
      },
    ],
  },
  // --- RECURSOS HUMANOS ---
  {
    title: "RRHH",
    nodes: [
      {
        label: "Talento Humano",
        icon: Users,
        children: [
          { label: "Áreas", href: "/rrhh/Area", icon: Building2 },
          { label: "Cargos", href: "/rrhh/JobTitle", icon: Briefcase },
          {
            label: "Colaboradores",
            href: "/rrhh/Worker",
            icon: UserSquare,
          },
          { label: "Asistencia", href: "/rrhh/asistencia", icon: Clock },
          {
            label: "Evaluaciones",
            href: "/rrhh/evaluaciones",
            icon: BarChart3,
          },
          { label: "Capacitación", href: "/rrhh/capacitacion", icon: BookUser },
          { label: "Planillas", href: "/rrhh/planillas", icon: DollarSign },
        ],
      },
    ],
  },

  // --- CONFIGURACIÓN GENERAL ---
  {
    title: "Configuración",
    nodes: [
      {
        label: "General",
        icon: Cog,
        children: [
          {
            label: "Tipo Cambio",
            href: "/general/ExchangeRate",
            icon: DollarSign,
          },
          { label: "Unidades", href: "/general/Uom", icon: Package },
          { label: "Monedas", href: "/general/Currency", icon: DollarSign },
          {
            label: "Documentos",
            href: "/general/DocumentType",
            icon: FileText,
          },
        ],
      },
    ],
  },

  // --- SEGURIDAD ---
  {
    title: "Seguridad",
    stickyToBottom: true,
    nodes: [
      {
        label: "Sistema",
        icon: Shield,
        children: [
          { label: "Empresa", href: "/config/Company", icon: Building2 },
          { label: "Usuarios", href: "/config/Users", icon: Users },
          { label: "Perfiles", href: "/config/Profiles", icon: UserSquare },
          {
            label: "Módulos",
            icon: Settings,
            children: [
              { label: "Padres", href: "/config/ParentModules", icon: Layers },
              { label: "Módulos", href: "/config/Modules", icon: FolderLock },
            ],
          },
          {
            label: "Permisos",
            icon: BrickWallShield,
            children: [
              {
                label: "Permisos",
                href: "/config/Permissions",
                icon: RotateCcwKey,
              },
              {
                label: "Permisos Perfil",
                href: "/config/ProfilesPermissions",
                icon: UserLock,
              },
              {
                label: "Permisos Módulos",
                href: "/config/PermissionsModules",
                icon: FolderKey,
              },
            ],
          },
        ],
      },
    ],
  },
];
