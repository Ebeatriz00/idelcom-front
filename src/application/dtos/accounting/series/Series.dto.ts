
export interface SeriesUpsertDto {
  seriesId?: number;
  businessId?: number;
  paymentTypeId: number;
  seriesName: string;
  correlative: number;
  used?: string;
  usersBy?: string;
}

export interface SeriesStatusDto {
  seriesId?: number;
  businessId?: number;
  status?: string;
  usersBy?: string;
}