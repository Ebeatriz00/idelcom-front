import logo from "@/assets/logos/idelcom_logo_ico.ico";

export function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      <img src={logo} alt="logo" className="size-8 rounded-xl object-cover" />
      <span className="font-semibold">Idelcom</span>
    </div>
  );
}
