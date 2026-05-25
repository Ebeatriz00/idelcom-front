export interface PurchaseOrderUpsertDto {
  purchaseOrderId?: number;
  suppliersId: number;
  purchaseOrderDate: Date;
  currencyId: number;
  exchangeRate: number;
  pmConditionId: number;
  expectedDeliveryDate: Date;
  warehouseId?: number;
  supplierQuotationReferenceNumber?: string;
  references: string;
  observation?: string;
  details: PurchaseOrderDetailUpsertDto[];
}

export interface PurchaseOrderDetailUpsertDto {
  purchaseOrderDetailId?: number;
  productsId: number;
  uomId?: number;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxesId: number;
  priceIncludesTax: boolean;
  observation?: string;
}

export interface PurchaseOrderApproveDto {
  purchaseOrderId?: number;
  approvedBy?: number;
}

export interface PurchaseOrderSendForApprovalDto {
  purchaseOrderId: number;
}

export interface PurchaseOrderCancelDto {
  purchaseOrderId?: number;
  cancelledBy: number;
  reason?: string;
}

export interface PurchaseOrderAttachInvoiceDto {
  purchaseOrderId?: number;
  cancelledBy: number;
  reason?: string;
}

export interface PurchaseOrderCreateFromInvoiceDto {
  supplierInvoiceId?: number;
  warehouseId: number;
  observation?: string;
}

export interface PurchaseOrderListFilterDto {
  suppliersId?: number;
  purchaseOrderStatusId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}
