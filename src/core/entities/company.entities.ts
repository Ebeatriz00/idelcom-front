export interface CompanyRaw {
  businessRuc: string;
  companyName: string; 
  businessName: string;
  aboutBusiness: string;
  isMain: boolean;
  isVerified: boolean;
  businessPhone: string;
  businessEmail: string;
  businessLegalRepre: string;
  legalDocument: string;
  legalFirm: string;
  retentionAgent: "0" | "1";
  perceptionAgent: "0" | "1";
  pricos: "0" | "1";
  fileRuc: string; 
  fileComplanceCertificate: string;
  businessLogo: string;
  abrv: string;
  website : string
  addressBusiness?: Array<{
    id: number;
    label: string;
    mainAddress: boolean;
    address: string;
    department: string;
    province: string;
    district: string;
  }>;

}