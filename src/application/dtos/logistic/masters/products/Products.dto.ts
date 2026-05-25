export interface ProductFileTrackingDto {
    fileUrl: string;
    fileTitle?: string;
    relativePath?: string;
}

export interface ProductsUpsertDto{
    productsId?: number;
    sku?: string;
    barcode?: string;
    partNum?: string;
    description: string;
    shortDescription?: string;
    productTypeId: number;
    productLinesId: number;
    categoriesId: number;
    brandsId: number;
    uomId: number;
    stockMin?: number;
    stockMax?: number;
    conversionFactor?: number;
    isActive?: boolean;
    isStockable?: boolean;
    isServices?: boolean;
    isReturnable?: boolean;
    isTool?: boolean;
    canBuy?: boolean;
    canSell?: boolean;
    manageLots?: boolean;
    manegesSerials?: boolean;
    expirationControl?: boolean;
    weight?: number;
    volume?: number;
    files?: string | ProductFileTrackingDto[];
}


export interface ProductsStatusDto{
    productsId?: number;
    status?: string;
    usersBy?: string;
}
