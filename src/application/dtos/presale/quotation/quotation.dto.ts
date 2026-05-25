export interface QuotationUpserDto {
  quotationId: number;
  businessId?: number;

  opporId?: number;
  opporName?: string;

  clientsId?: number;
  clientsName?: number;

  currencyId?: number;
  currencyName?: string;
  exchangeRate?: number;

  paymentConditionId?: number;
  paymentConditionName?: string;

  offerValidity?: number;
  startDate?: Date;
  finishDate?: Date;

  subTotal?: number;
  DiscountAmount?: number;
  taxAmount?: number;
  total?: number;

  salesTotal?: number;
  costTotal?: number;
  utilityTotal?: number;
  marginPercent?: number;
  lines?: Array<{
    quotationVerId?: number;

    lineNo?: number;
    DisplayNo?: string;

    lineType?: string;
    levelNo?: number;
    isRollUp?: boolean;
    parentQuotationId?: number;

    itemId?: number;
    productsId?: number;
    description?: string;

    productsTypeId?: number;
    productsTypeName?: string;

    UomId?: number;
    UomName?: string;

    brandsIs?: number;
    brands?: string;
    model?: string;

    qty?: number;
    unitPrice?: number;
    totalPrice?: number;

    discountAmount?: number;
    taxAmount?: number;
    lineAmount?: number;

    isPresales?: boolean;
    isBold?: boolean;

    unitCost?: number;
    lineCostTotal?: number;
    unitSalePrice?: number;
    lineSalesTotal?: number;
    margenPorcentLine?: number;

    presalesAssignedId?: number;
    presalesAssignesTo?: string;

    systemId?: number;
    systemName?: string;

    suppliersId?: number;
    suppliersName?: string;

    deliveryDays?: number;

    pmConditionId?: number;
    pmConditionName?: string;
    pmConditionDay?: number;
    orderMonthNo?: number;
  }>;

  margins?: Array<{
    quotationVerId?: number;
    marginTypeId?: number;
    marginTypeName?: string;
    marginRate?: number;
  }>;

  servCheks?: Array<{
    quotationVerId?: number;
    servCheckTypeName?: string;
    quotationAmount?: number;
    sheduleAmount?: number;
    differenceAmount?: number;
  }>;

  linePlans?: Array<{
    tempLineNo: number;
    lines: Array<{
      seqNo: number;
      paymentPercent: number;
      paymentAmount: number;
    }>;
  }>;
  egresses?: Array<{
    monthNo: number;
    amount: number;
    lines: Array<{
      tempLineNo?: number;
      lineNo: number;
      monthNo: number;
      amount: number;
    }>;
  }>;

  usersBy?: number;
}

export interface SalesQuotationResponse {
  quotationId: string;
  quotationNo?: string;
  opporDesc?: string;
  clientsName?: string;
  workerName?: string;
  currencySymbol?: string;
  total?: number;
  quotationStatus?: string;
  versionStatus?: string;
  status?: string;
  versionNo?: string;
  quotationColor?: string;
  versionColor?: string;
  createdDate?: Date;
}

export interface SalesQuotationVerResponse {
  quotationVerId: string;
  quotationNo?: string;
  clientsName?: string;
  workerResponsible?: string;
  currencySymbol?: string;
  total?: number;
  versionStatus?: string;
  versionColor?: string;
  versionNo: string;
  createdDate?: Date;
}

export interface QuotationExcelValidationError {
  sheet: string;
  row?: number | null;
  column?: string | null;
  message: string;
}

export interface QuotationExcelValidationResponse {
  isValid: boolean;
  detectedVariant: "A" | "B";
  errors: QuotationExcelValidationError[];
  warnings: string[];
}
