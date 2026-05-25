// @shared/utils/ensurePdfVfs.ts
import pdfMake from "pdfmake/build/pdfmake";

function looksLikeVfs(obj: any) {
  if (!obj || typeof obj !== "object") return false;
  const keys = Object.keys(obj);
  // Heurística: si hay fuentes .ttf como claves, es el vfs
  return keys.some(k => k.toLowerCase().endsWith(".ttf"));
}

export async function ensurePdfVfs() {
  if ((pdfMake as any).vfs) return; // ya inicializado (HMR friendly)

  // Intenta varias formas de import (algunos bundlers requieren .js)
  const mod: any =
    (await import("pdfmake/build/vfs_fonts").catch(() => null)) ??
    (await import("pdfmake/build/vfs_fonts.js").catch(() => null));

  if (!mod) {
    throw new Error("No se pudo importar vfs_fonts");
  }

  // Posibles ubicaciones del vfs
  const candidates = [
    mod?.pdfMake?.vfs,
    mod?.vfs,
    mod?.default?.pdfMake?.vfs,
    mod?.default?.vfs,
    // si el propio módulo “parece” vfs (mapa de .ttf)
    looksLikeVfs(mod) ? mod : null,
    looksLikeVfs(mod?.default) ? mod.default : null,
  ].filter(Boolean);

  const vfs =
    (candidates.find(Boolean) as any) ||
    null;

  if (!vfs) {
    // Log para depurar qué llegó realmente
    console.error("vfs_fonts no expone vfs en formas típicas. Módulo importado:", mod);
    throw new Error("No se pudo inicializar pdfMake.vfs");
  }

  (pdfMake as any).vfs = vfs;
}
