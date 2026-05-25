import logoUrl from "@/assets/logos/idelcom.png";

// Carga el logo como base64 (para exceljs/pdfmake)
export async function loadLogoAsBase64(): Promise<string> {
  const res = await fetch(logoUrl);
  const blob = await res.blob();
  return await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}