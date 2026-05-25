export type HelpArea =
  | "GENERAL"
  | "CRM"
  | "PREVENTA"
  | "LOGISTICA"
  | "GERENCIA";
export type HelpSection = {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
};
export type HelpDoc = {
  id: string;
  area: HelpArea;
  group: string;
  title: string;
  keywords: string[];
  sections: HelpSection[];
  related?: string[];
};

export type HelpGroupNode = {
  area: HelpArea;
  group: string;
  items: HelpDoc[];
};

export type HelpAreaNode = {
  area: HelpArea;
  groups: HelpGroupNode[];
};

export type HelpSidebarProps = {
  docs: HelpDoc[];
  allowedAreas: HelpArea[];
  activeDocId?: string | null;
  onSelectDocId?: (docId: string) => void;
  onCloseMobile?: () => void;
  searchPlaceholder?: string;
};

export type HelpTocProps = {
  doc: HelpDoc | null;
  query?: string;
  scrollOffsetPx?: number;
  className?: string;
};
export type HelpFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type HelpFaqProps = {
  faqs?: HelpFaqItem[];
  query?: string; // para resaltar texto
  allowMultiple?: boolean; // default false
};

export type SectionWithCallout = HelpSection & {
  callout?: { title: string; body: string };
};

export type HelpContentProps = {
  doc: HelpDoc | null;
  allDocs: HelpDoc[];
  query?: string;
  // sticky offset para TOC y anchors (depende de tu topbar)
  scrollOffsetPx?: number; // default 110
};
