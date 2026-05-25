import { ProgressBar } from "./ProgressBar";
import {
  getStateColorClass,
  resolveStateColor,
  type StateColorKey,
} from "./stateColor";

type RowObj = Record<string, any>;

// Interfaces para mejor tipado
interface BaseCellProps {
  descField?: string;
  colorField?: string;
}

interface BadgeCellProps extends BaseCellProps {
  onOpen?: (row: any) => void;
}

interface ProgressCellProps extends BaseCellProps {
  percentField?: string;
  widthClass?: string;
  heightClass?: string;
  showPercent?: boolean;
}

/**
 * Creador de cell renderer genérico para progreso con color por estado.
 */
export function makeProgressCell({
  percentField = "porcentProgressPro",
  colorField = "stateColor",
  widthClass = "w-28",
  heightClass = "h-2.5",
  showPercent = true,
}: ProgressCellProps = {}) {
  return ({ row }: { row: { original: RowObj } }) => {
    const value = row.original?.[percentField] ?? 0;
    const colorKey = row.original?.[colorField];

    return (
      <ProgressBar
        value={value}
        colorKey={colorKey}
        title={`${value}%`}
        showPercent={showPercent}
        widthClass={widthClass}
        heightClass={heightClass}
      />
    );
  };
}

/**
 * Badge interactivo que permite hacer click
 */
export function makeStateBadgeCell({
  descField = "stateOpporDesc",
  colorField = "stateColor",
  onOpen,
}: BadgeCellProps = {}) {
  return ({ row }: { row: { original: Record<string, any> } }) => {
    const desc = row.original?.[descField] ?? "—";
    const colorKey = (row.original?.[colorField] ?? "neutral") as StateColorKey;

    const bg = resolveStateColor(colorKey, "bg");
    const text = resolveStateColor(colorKey, "text");

    const badgeClasses = [
      "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-transform hover:scale-[1.03]",
      bg.className,
      text.className,
      "bg-opacity-15",
    ]
      .filter(Boolean)
      .join(" ");

    const style: React.CSSProperties = {
      ...(bg.style ?? {}),
      ...(text.style ?? {}),
    };

    const content = (
      <span className={badgeClasses} style={style}>
        {desc}
      </span>
    );

    if (!onOpen) {
      return <div className="flex items-center justify-center">{content}</div>;
    }

    return (
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={(e) => {e.stopPropagation(); onOpen(row.original)}}
          className={badgeClasses}
          style={style}
          title="Cambiar etapa"
        >
          {desc}
        </button>
      </div>
    );
  };
}

export function makeStateHiringBadgeCell({
  descField = "hiringStatus",
  colorField = "hiringStatusColor",
  onOpen,
}: BadgeCellProps = {}) {
  return ({ row }: { row: { original: Record<string, any> } }) => {
    const desc = row.original?.[descField] ?? "—";
    const colorKey = (row.original?.[colorField] ?? "neutral") as StateColorKey;

    const bg = resolveStateColor(colorKey, "bg");
    const text = resolveStateColor(colorKey, "text");

    const badgeClasses = [
      "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-transform hover:scale-[1.03]",
      bg.className,
      text.className,
      "bg-opacity-15",
    ]
      .filter(Boolean)
      .join(" ");

    const style: React.CSSProperties = {
      ...(bg.style ?? {}),
      ...(text.style ?? {}),
    };

    const content = (
      <span className={badgeClasses} style={style}>
        {desc}
      </span>
    );

    if (!onOpen) {
      return <div className="flex items-center justify-center">{content}</div>;
    }

    return (
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={() => onOpen(row.original)}
          className={badgeClasses}
          style={style}
          title="Cambiar etapa"
        >
          {desc}
        </button>
      </div>
    );
  };
}
/**
 * Badge de solo lectura (sin interacción)
 */
export function makeStateProBadgeCell({
  descField = "statePreSaleDescription",
  colorField = "stateColor",
}: BaseCellProps = {}) {
  return ({ row }: { row: { original: Record<string, any> } }) => {
    const desc = row.original?.[descField] ?? "—";
    const colorKey = (row.original?.[colorField] ?? "neutral") as StateColorKey;
    const bg = getStateColorClass(colorKey, "bg");
    const text = getStateColorClass(colorKey, "text");

    return (
      <div className="flex items-center justify-center">
        <span
          className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${text} bg-opacity-15 whitespace-nowrap`}
        >
          {desc}
        </span>
      </div>
    );
  };
}

// Alias para compatibilidad hacia atrás - eliminar eventualmente
export const makeProjectProgressCell = makeProgressCell;

import React from "react";

type Props = {
  desc?: string | null;
  colorKey?: StateColorKey | string | null; // por si viene string del backend
  onClick?: () => void;
  title?: string;
  className?: string;
};

export function StateBadge({
  desc,
  colorKey,
  onClick,
  title,
  className,
}: Props) {
  const textValue = (desc ?? "—").trim() || "—";
  const key = ((colorKey ) as StateColorKey) ?? "neutral";

  const bg = resolveStateColor(key, "bg");
  const text = resolveStateColor(key, "text");

  const badgeClasses = [
    "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
    "transition-transform hover:scale-[1.03]",
    bg.className,
    text.className,
    "bg-opacity-15",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style: React.CSSProperties = {
    ...(bg.style ?? {}),
    ...(text.style ?? {}),
  };

  if (!onClick) {
    return (
      <span className={badgeClasses} style={style} title={title ?? textValue}>
        {textValue}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={badgeClasses}
      style={style}
      title={title ?? textValue}
    >
      {textValue}
    </button>
  );
}
