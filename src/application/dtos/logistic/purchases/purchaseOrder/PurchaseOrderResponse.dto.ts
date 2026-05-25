export interface PurchaseOrderResponseDto {
  purchaseOrderId: number;
  purchaseOrderNumber?: string;
  purchaseOrderDate: Date;
  suppliersId: number;
  supplierName?: string;
  supplierDocumentNumber?: string;
  currencyId: number;
  currencyDescription?: string;
  purchaseOrderStatusId: number;
  statusDescription?: string;
  isRegularization: boolean;
  subtotal: number;
  taxAmount: number;
  total: number;
  expectedDeliveryDate?: Date;
}

export interface PurchaseOrderGetByIdResponse {
  purchaseOrderId: number;
  businessId: number;
  purchaseOrderNumber?: string;
  suppliersId: number;
  supplierName?: string;
  supplierDocumentNumber?: string;
  purchaseOrderDate: Date;
  currencyId: number;
  currencyDescription?: string;
  exchangeRate?: number;
  pmConditionId?: number;
  pmConditionDescription?: string;
  expectedDeliveryDate?: Date;
  warehouseId?: number;
  warehouseDescription?: string;
  supplierQuotationReferenceNumber?: string;
  references?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  purchaseOrderStatusId: number;
  statusDescription?: string;
  isRegularization: boolean;
  regularizationReason?: string;
  regularizedBy?: number;
  regularizationDate?: Date;
  observation?: string;
  requestedBy?: number;
  approvedBy?: number;
  approvedAt?: Date;
  details: PurchaseOrderDetailResponse[];
  invoices: PurchaseOrderInvoiceResponse[];
}

export interface PurchaseOrderDetailResponse {
  purchaseOrderDetailId: number;
  productsId: number;
  productDescription?: string;
  uomId?: number;
  uomDescription?: string;
  quantity: number;
  receivedQuantity: number;
  pendingQuantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxesId?: number;
  priceIncludesTax: boolean;
  igvPercent: number;
  igvAmount: number;
  subtotal: number;
  total: number;
  detailStatusId?: number;
  detailStatusDescription?: number;
  observation?: string;
  isActive: number;
}

export interface PurchaseOrderInvoiceResponse {
  purchaseOrderInvoiceId: number;
  businessId: number;
  purchaseOrderId: number;
  supplierInvoiceId: number;
  observation: number;
  supplierInvoiceNumber: number;
  supplierInvoiceDate: number;
  supplierInvoiceTotal: number;
  status: number;
}
