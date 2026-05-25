export interface NotificationPersist {
  NotificationId: number;
  BusinessId: number;
  UsersId: number;
  Title: string;
  Message: string;
  Module: string;
  Entity: string;
  EntityId: string;
  LinkUrl: string;
  Type: string;
  CreatedAt: Date;
  ReadAt: Date;
  CreatedBy: number;
  CreatedByName: string;
}
