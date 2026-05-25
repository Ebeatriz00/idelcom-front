import {
  Home, GaugeCircle, Layers3, Factory, Package, ShoppingCart,
  BarChart3, Users, Banknote, Shield, Cog
} from "lucide-react";
import type { ComponentType } from "react";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;               
  badge?: string | number;
  activeMatch?: RegExp | string[] | ((pathname: string) => boolean); // opcional
};

export type NavSection = {
  title: string;
  items: NavItem[];
  stickyToBottom?: boolean;
};

export const NAV: NavSection[] = [
  {
    title: "General",
    items: [
      { label: "Inicio", href: "/inicio", icon: Home, exact: true },
      { label: "Dashboard", href: "/dashboard", icon: GaugeCircle },
    ],
  },
  {
    title: "Operaciones",
    items: [
      { label: "Órdenes de Trabajo", href: "/ot", icon: Layers3, activeMatch: ["/ot", "/produccion/ot"] },
      { label: "Producción", href: "/produccion", icon: Factory },
      { label: "Bobinas", href: "/bobinas", icon: Package },
      { label: "Ventas", href: "/ventas", icon: ShoppingCart },
    ],
  },
  {
    title: "Análisis",
    items: [
      { label: "Reportes", href: "/reportes", icon: BarChart3 },
      { label: "Clientes", href: "/clientes", icon: Users, activeMatch: /^\/clientes(\/.*)?$/ },
      { label: "Finanzas", href: "/finanzas", icon: Banknote },
    ],
  },
  {
    title: "Seguridad",
    stickyToBottom: true,
    items: [
      { label: "Permisos y Roles", href: "/seguridad/roles", icon: Shield },
      { label: "Configuración", href: "/configuracion", icon: Cog },
    ],
  },
];
