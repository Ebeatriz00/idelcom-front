const generatedPasswords = new Set<string>();

export function generateSecurePassword(length: number = 12): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "!@#$%^&*()_+-";
  const all = upper + lower + digits + symbols;

  let password = "";

  do {
    const passwordChars = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    for (let i = passwordChars.length; i < length; i++) {
      passwordChars.push(all[Math.floor(Math.random() * all.length)]);
    }

    password = passwordChars.sort(() => Math.random() - 0.5).join("");
  } while (generatedPasswords.has(password)); // vuelve a generar si ya existe

  generatedPasswords.add(password);
  return password;
}
