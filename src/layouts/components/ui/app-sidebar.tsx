import {
  forwardRef,
  memo,
  useEffect,
  useState,
  type ComponentType,
} from "react";

import { type NavNode, type NavSection } from "@/sharedKernel";
import { useAuth } from "@/stores/auth";
import * as Icons from "lucide-react";
import { ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

export type AppSidebarTreeProps = {
  isOpen: boolean;
  sections: NavSection[];
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
  storageKey?: string;
};

const INDENTS = ["pl-2", "pl-4", "pl-6", "pl-8", "pl-10"];

function makeKey(path: string[], label: string) {
  return [...path, label].join("::").toLowerCase();
}

function pathnameMatchesNode(pathname: string, node: NavNode): boolean {
  if (node.href) {
    if (node.exact) return pathname === node.href;
    return pathname === node.href || pathname.startsWith(`${node.href}/`);
  }
  return false;
}

function anyDescendantActive(pathname: string, node: NavNode): boolean {
  if (!node.children) return false;
  return node.children.some(
    (c) => pathnameMatchesNode(pathname, c) || anyDescendantActive(pathname, c),
  );
}

function RenderIcon({
  icon,
}: {
  icon?: string | ComponentType<{ className?: string }>;
}) {
  if (!icon) {
    return (
      <div className="h-4 w-4 shrink-0 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-500">
        ?
      </div>
    );
  }
  if (typeof icon === "string") {
    const IconComponent = (Icons as any)[icon];
    if (IconComponent && typeof IconComponent === "function") {
      return <IconComponent className="h-4 w-4 shrink-0" />;
    }

    return (
      <div
        className="h-4 w-4 shrink-0 bg-yellow-100 rounded flex items-center justify-center text-[10px] text-yellow-800 border border-yellow-300"
        title={`Icono no encontrado: ${icon}`}
      >
        {icon.slice(0, 2)}
      </div>
    );
  }

  try {
    const IconComponent = icon as ComponentType<{ className?: string }>;
    return <IconComponent className="h-4 w-4 shrink-0" />;
  } catch (error) {
    console.error("Error rendering icon component:", error);
    return <div className="h-4 w-4 shrink-0 bg-red-100 rounded" />;
  }
}
const TreeNode: React.FC<{
  node: NavNode;
  depth: number;
  path: string[];
  isOpen: boolean;
  canInlineExpand: boolean;
  expanded: Set<string>;
  setExpanded: (s: Set<string>) => void;
  onNavigate?: () => void;
}> = ({
  node,
  depth,
  path,
  isOpen,
  canInlineExpand,
  expanded,
  setExpanded,
  onNavigate,
}) => {
  const key = makeKey(path, node.label);
  const hasChildren = !!node.children?.length;
  const { pathname } = useLocation();

  const activeSelf = pathnameMatchesNode(pathname, node);
  const activeChild = hasChildren && anyDescendantActive(pathname, node);
  const active = activeSelf || !!activeChild;

  useEffect(() => {
    if (canInlineExpand && activeChild && !expanded.has(key)) {
      const next = new Set(expanded);
      next.add(key);
      setExpanded(next);
    }
  }, [activeChild, canInlineExpand]);

  const padding = isOpen
    ? INDENTS[Math.min(depth, INDENTS.length - 1)]
    : "pl-0";

  if (hasChildren) {
    const isExpanded = canInlineExpand && expanded.has(key);

    return (
      <div>
        <button
          type="button"
          aria-haspopup="tree"
          aria-expanded={isExpanded || undefined}
          onClick={() => {
            if (!canInlineExpand) return;
            const next = new Set(expanded);
            next.has(key) ? next.delete(key) : next.add(key);
            setExpanded(next);
          }}
          className={[
            "w-full group relative flex items-center rounded-lg py-2 text-sm transition border-l-2",
            isOpen ? "px-3" : "px-0 justify-center",
            padding,
            active
              ? isOpen
                ? "bg-primary/10 text-foreground font-medium border-primary"
                : "text-primary border-primary"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent",
          ].join(" ")}
        >
          <RenderIcon icon={node.icon} />
          <span className={isOpen ? "ml-3 truncate" : "sr-only"}>
            {node.label}
          </span>

          <ChevronRight
            className={[
              "ml-auto size-4 shrink-0 transition-transform",
              isExpanded ? "rotate-90" : "",
              !canInlineExpand ? "hidden" : "",
            ].join(" ")}
          />

          {!isOpen && (
            <span className="pointer-events-none absolute left-full ml-2 rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
              {node.label}
            </span>
          )}
        </button>
        <div className={`${isExpanded ? "grid" : "hidden"} gap-1.5 mt-1`}>
          {node.children!.map((child) => (
            <TreeNode
              key={makeKey(path.concat(node.label), child.label)}
              node={child}
              depth={depth + 1}
              path={path.concat(node.label)}
              isOpen={isOpen}
              canInlineExpand={canInlineExpand}
              expanded={expanded}
              setExpanded={setExpanded}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={node.href || "#"}
      end={!!node.exact}
      onClick={() => onNavigate?.()}
      className={({ isActive }) => {
        const base =
          "group relative flex w-full items-center rounded-lg py-2 text-sm transition border-l-2";
        const collapsed = isOpen ? "px-3" : "px-0 justify-center";
        const notActive =
          "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent";
        const activeCls = isActive
          ? isOpen
            ? "bg-primary/10 text-foreground font-medium border-primary"
            : "text-primary border-primary"
          : notActive;
        return [base, collapsed, padding, activeCls].join(" ");
      }}
    >
      <RenderIcon icon={node.icon} />
      <span className={isOpen ? "ml-3 truncate" : "sr-only"}>{node.label}</span>

      {!isOpen && (
        <span className="pointer-events-none absolute left-full ml-2 rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
          {node.label}
        </span>
      )}
    </NavLink>
  );
};

const AppSidebarTree = forwardRef<HTMLElement, AppSidebarTreeProps>(
  ({ isOpen, sections, variant = "desktop", onNavigate, storageKey }, ref) => {
    const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
    const userId = useAuth((s) => s.userId);
    const expandedStorageKey = storageKey
      ? `gm_sidebar_expanded:${storageKey}`
      : `gm_sidebar_expanded:${userId ?? "anon"}`;

    useEffect(() => {
      if (variant !== "desktop") return;
      const raw = localStorage.getItem(expandedStorageKey);
      if (raw) setExpanded(new Set(JSON.parse(raw)));
      else setExpanded(new Set());
    }, [variant, expandedStorageKey]);

    useEffect(() => {
      if (variant !== "mobile") return;
      const all = new Set<string>();
      sections.forEach((sec) => {
        sec.nodes.forEach((n) =>
          all.add(["root", sec.title, n.label].join("::").toLowerCase()),
        );
      });
      setExpanded(all);
    }, [variant, sections]);

    useEffect(() => {
      if (variant !== "desktop") return;
      localStorage.setItem(
        expandedStorageKey,
        JSON.stringify([...expanded]),
      );
    }, [expanded, variant, expandedStorageKey]);

    const canInlineExpand = isOpen;
    useEffect(() => {
      if (!canInlineExpand && expanded.size) setExpanded(new Set());
    }, [canInlineExpand, expanded]);

    return (
      <nav
        ref={ref}
        className={`h-full flex flex-col p-3 ${isOpen ? "gap-6" : "gap-3"}`}
      >
        {sections.map((section) => (
          <div
            key={`sec::${section.title}`}
            className={section.stickyToBottom ? "mt-auto" : ""}
          >
            {isOpen && (
              <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-secondary/50">
                {section.title}
              </div>
            )}
            <div className={`${isOpen ? "mt-2" : "mt-0"} grid gap-1.5`}>
              {section.nodes.map((node) => (
                <TreeNode
                  key={makeKey([section.title], node.label)}
                  node={node}
                  depth={0}
                  path={[section.title]}
                  isOpen={isOpen}
                  canInlineExpand={canInlineExpand}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    );
  },
);

export default memo(AppSidebarTree);
