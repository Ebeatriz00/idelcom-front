import { fetchCodeUsersExist } from "@/infrastructure";

function normalizeLetters(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z\s]/g, "")
    .trim();
}

/**
 * Genera códigos en este orden:
 * k = 1..len(nombre):
 *   nombre[0:k] + AP1
 *   nombre[0:k] + AP2 (si hay segundo apellido)
 * Todo en MAYÚSCULAS, sin números, máx. 50 chars.
 */
export async function generateUserCodeSequential(
  firstName: string,
  lastNames: string,
  maxLen = 50
): Promise<string> {
  const name = normalizeLetters(firstName).toUpperCase();
  const apParts = normalizeLetters(lastNames)
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean);

  if (!name || apParts.length === 0) return "";

  const ap1 = apParts[0];
  const ap2 = apParts[1] ?? ""; // puede no existir
  const cut = (s: string) => (s.length > maxLen ? s.slice(0, maxLen) : s);

  for (let k = 1; k <= name.length; k++) {
    // N(k) + AP1
    let candidate = cut(`${name.slice(0, k)}${ap1}`);
    if (!(await fetchCodeUsersExist(candidate))) return candidate;

    // N(k) + AP2 (si existe)
    if (ap2) {
      candidate = cut(`${name.slice(0, k)}${ap2}`);
      if (!(await fetchCodeUsersExist(candidate))) return candidate;
    }
  }
  let k = name.length + 1;
  while (true) {
    const prefix = name.slice(0, ((k - 1) % name.length) + 1);

    let candidate = cut(`${prefix}${ap1}`);
    if (!(await fetchCodeUsersExist(candidate))) return candidate;

    if (ap2) {
      candidate = cut(`${prefix}${ap2}`);
      if (!(await fetchCodeUsersExist(candidate))) return candidate;
    }
    k++;
  }
}
