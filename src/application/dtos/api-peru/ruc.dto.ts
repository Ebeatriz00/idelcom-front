export interface RucData {
  direccion: string;
  direccionCompleta: string;
  ruc: string;
  nombreORazonSocial: string;
  estado: string;
  condicion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  ubigeoSunat: string;
  ubigeo: (string | null)[];
  esAgenteDeRetencion: string;
  esAgenteDePercepcion: string;
  esAgenteDePercepcionCombustible: string;
  esBuenContribuyente: string;
}
