import { cn } from "@/sharedKernel/lib/cn";
import * as React from "react";

/**
 * Card: contenedor principal con borde, sombra y padding
 */
const CardSimple = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-gray-200 bg-white text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
CardSimple.displayName = "Card";

/**
 * CardHeader: sección superior, generalmente título/subtítulo
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * CardTitle: título principal (h3)
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-sm font-semibold  flex items-center gap-2", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/**
 * CardContent: cuerpo del card
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-1 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardContentDetail = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-1 pt-0", className)} {...props} />
));
CardContentDetail.displayName = "CardContentDetail";

export { CardContent, CardContentDetail, CardHeader, CardSimple, CardTitle };
