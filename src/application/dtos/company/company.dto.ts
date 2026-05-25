
export interface BusinessViewDto {
  ruc: string;
  nombreComercial : string;
  razonSocial: string;
  resumen: string;            
  website: string ;        
  esEmpresaPrincipal: boolean;    
  verificada: boolean;           

  telefono?: string | null;
  email?: string | null;

  representanteLegal: {
    nombre: string;
    documento?: string | null;
    firmaUrl?: string | null;     
  };

  tributario: {
    agenteRetencion: boolean;     
    agentePercepcion: boolean;    
    pricos: boolean;             
    abrevDocumento: string;    
  };

  direcciones: Array<{
    id: number;
    etiqueta: string;
    direccion: string;
    departamento: string;
    provincia: string;
    distrito: string;
    esPrincipal: boolean;
  }>;

  documentos: {
    fichaRuc?: string | null;             
    constanciaCumplimiento?: string | null;
  };

  logoUrl?: string | null;
}
