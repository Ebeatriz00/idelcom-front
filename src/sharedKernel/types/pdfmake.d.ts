declare module "pdfmake/build/pdfmake" {
  const pdfMake: {
    vfs: any;
    createPdf: (docDef: any, tableLayouts?: any, fonts?: any, vfs?: any) => {
      download: (name?: string, cb?: () => void) => void;
      open: () => void;
      print: () => void;
      getBlob: (cb: (b: Blob) => void) => void;
      getBase64: (cb: (b64: string) => void) => void;
    };
  };
  export default pdfMake;
}

declare module "pdfmake/build/vfs_fonts" {
  // Este módulo a veces exporta directamente el mapa de fuentes (vfs),
  // y a veces lo anida en default o en pdfMake.vfs. Dejamos tipos laxos.
  const whatever: any;
  export = whatever;
}
