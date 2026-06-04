import {
  Activity,
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowRightLeft,
  ArrowUpCircle,
  Badge,
  BarChart3,
  BarChartBig,
  BarChartHorizontal,
  BookOpen,
  BookOpenCheck,
  BookUp2,
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
  FolderCog,
  FolderKey,
  FolderLock,
  FolderTree,
  HelpCircle,
  Landmark,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  ListOrdered,
  Lock,
  NotebookPen,
  Package,
  Percent,
  PieChart,
  Podcast,
  Repeat,
  RotateCcwKey,
  ScanHeart,
  ScrollText,
  Send,
  Server,
  Settings,
  Share2,
  Shield,
  ShieldCog,
  ShoppingCart,
  Siren,
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

/* ===== UI ===== */
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
  icon?: ComponentType<{ className?: string }>;
};

/* ===== Backend ===== */
export type AllowedModule = {
  modulesId: number;
  code: string;
  label: string;
  path: string | null;
  iconKey: string | null;
  parentModulesId: number | null;
  parentId: number | null;
  orderNo: number | null;
};

/* ===== Iconos ===== */
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Activity,
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  ArrowRightLeft,
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
  FolderCog,
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
  ShieldCog,
  Settings,
  Share2,
  Shield,
  ShoppingCart,
  Sparkles,
  ScrollText,
  Siren,
  ScanHeart,
  BookUp2,
  NotebookPen,
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
};

const resolveIcon = (key?: string | null) => {
  if (!key) return HelpCircle;
  const k = key.replace(/[\s_-]+/g, "").toLowerCase();
  for (const [name, Cmp] of Object.entries(ICONS)) {
    if (name.toLowerCase() === k) return Cmp;
  }
  return HelpCircle;
};

/* ===== Secciones ===== */
const PARENT_SECTIONS: Record<
  number,
  {
    title: string;
    icon?: ComponentType<{ className?: string }>;
    stickyToBottom?: boolean;
  }
> = {
  1: { title: "General", icon: LayoutDashboard },
  2: { title: "Ventas", icon: UserSquare },
  3: { title: "Operaciones", icon: Server },
  4: { title: "Logística", icon: Package },
  5: { title: "Compras", icon: ShoppingCart },
  6: { title: "Finanzas", icon: Wallet },
  7: { title: "Contabilidad", icon: BarChartBig },
  8: { title: "RRHH", icon: Users },
  9: { title: "Configuración", icon: Cog },
  10: { title: "Seguridad", icon: Shield, stickyToBottom: true },
};

/* ===== Helpers ===== */
type ModNode = AllowedModule & { children: ModNode[] };

const sortNodes = (arr: ModNode[]) => {
  arr.sort((a, b) => {
    const ao = a.orderNo ?? 0,
      bo = b.orderNo ?? 0;
    if (ao !== bo) return ao - bo;
    return a.label.localeCompare(b.label, "es");
  });
  arr.forEach((n) => sortNodes(n.children));
};

const buildTree = (mods: AllowedModule[]): ModNode[] => {
  const byId = new Map<number, ModNode>();
  const roots: ModNode[] = [];

  // Primero crear todos los nodos
  mods.forEach((m) => byId.set(m.modulesId, { ...m, children: [] }));

  // Luego construir la jerarquía
  for (const node of byId.values()) {
    const pid = node.parentId;
    if (pid !== null && pid !== undefined && byId.has(pid)) {
      byId.get(pid)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  sortNodes(roots);
  return roots;
};

const mapToNav = (nodes: ModNode[]): NavNode[] =>
  nodes
    .map((n) => {
      const kids = n.children.length ? mapToNav(n.children) : undefined;
      return {
        label: n.label,
        href: n.path ?? undefined,
        icon: resolveIcon(n.iconKey),
        exact: false,
        children: kids && kids.length ? kids : undefined,
      };
    })
    .filter((n) => n.href || (n.children && n.children.length));

/* ===== Builder con permisos ":ver módulo" ===== */
export function buildNavSectionsWithPerms(
  allowedModules?: AllowedModule[] | null,
  effectiveList?: string[] | null,
): NavSection[] {
  if (!allowedModules?.length || !effectiveList?.length) return [];

  // 1) Set de códigos con permiso ver módulo
  const canView = new Set(
    effectiveList
      .filter((s) => s.toLowerCase().endsWith(":view_module"))
      .map((s) => s.split(":")[0]?.toLowerCase()),
  );

  // 2) Módulos permitidos (por código)
  const permitted = allowedModules.filter((m) =>
    canView.has(m.code.toLowerCase()),
  );

  // 3) Asegura ancestros visibles (aunque no tengan permiso directo)
  const byId = new Map(allowedModules.map((m) => [m.modulesId, m]));
  const childrenByParent = new Map<number, AllowedModule[]>();
  for (const module of allowedModules) {
    if (module.parentId == null) continue;
    const children = childrenByParent.get(module.parentId) ?? [];
    children.push(module);
    childrenByParent.set(module.parentId, children);
  }

  const visibleIds = new Set<number>(permitted.map((m) => m.modulesId));

  // Función recursiva para agregar ancestros
  const addAncestors = (moduleId: number) => {
    const module = byId.get(moduleId);
    if (!module) return;

    if (module.parentId && byId.has(module.parentId)) {
      visibleIds.add(module.parentId);
      addAncestors(module.parentId);
    }
  };

  // Agregar ancestros para todos los módulos permitidos
  const addDescendants = (moduleId: number) => {
    const children = childrenByParent.get(moduleId) ?? [];
    for (const child of children) {
      visibleIds.add(child.modulesId);
      addDescendants(child.modulesId);
    }
  };

  permitted.forEach((m) => {
    addAncestors(m.modulesId);
    if (!m.path?.trim()) {
      addDescendants(m.modulesId);
    }
  });

  // 4) Conjunto final visible
  const visible = Array.from(visibleIds).map((id) => byId.get(id)!);

  // 5) Agrupar por sección válida
  const groups = new Map<number, AllowedModule[]>();
  for (const m of visible) {
    if (m.parentModulesId == null) continue;
    if (!PARENT_SECTIONS[m.parentModulesId]) continue;
    const arr = groups.get(m.parentModulesId) ?? [];
    arr.push(m);
    groups.set(m.parentModulesId, arr);
  }

  // 6) Armar secciones + árbol
  const sections: NavSection[] = [];
  for (const [sectionId, mods] of groups) {
    const conf = PARENT_SECTIONS[sectionId];
    const tree = buildTree(mods);
    const nodes = mapToNav(tree);
    if (!nodes.length) continue;
    sections.push({
      title: conf.title,
      icon: conf.icon,
      stickyToBottom: conf.stickyToBottom,
      nodes,
    });
  }

  // 7) Ordenar secciones por id
  sections.sort((a, b) => {
    const ai = Number(
      Object.entries(PARENT_SECTIONS).find(
        ([_, v]) => v.title === a.title,
      )?.[0] ?? 999,
    );
    const bi = Number(
      Object.entries(PARENT_SECTIONS).find(
        ([_, v]) => v.title === b.title,
      )?.[0] ?? 999,
    );
    return ai - bi;
  });

  return sections;
}
