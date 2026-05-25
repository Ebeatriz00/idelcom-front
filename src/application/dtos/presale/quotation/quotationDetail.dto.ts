export interface QuotationDetailDto {
  quotationVerId: number;
  businessId?: number;
  versionNo?: string;

  opporId?: number;
  opporNumber?: string;
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

  currentVersionNo?: number;
  versionStatusId?: number;

  subTotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  total?: number;

  salesTotal?: number;
  costTotal?: number;
  utilityTotal?: number;
  marginPercent?: number;
  lines?: Array<{
    quotationVerId?: number;
    quotationVerLinId?: number;
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

    quotationMarginVerId?: number;
    marginTypeId?: number;
    marginTypeName?: string;
    marginRate?: number;
  }>;

  servChecks?: Array<{
    quotationVerId?: number;

    servCheckId?: number;
    servCheckTypeName?: string;
    quotationAmount?: number;
    scheduleAmount?: number;
    differenceAmount?: number;
  }>;

  linePlans?: Array<{
    tempLineNo: number;
    linePlanId?: number;
    lines: Array<{
      seqNo: number;
      paymentPercent: number;
      paymentAmount: number;
      monthNo?: number;
      paymentNo?: number;
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
