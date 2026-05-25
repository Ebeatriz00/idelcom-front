export interface ContactsResponseDto{
    contactsCrmId?: number,
    businessId?: number;
    workerId?: number;
    workerDescription:string;
    clientsId?: number;
    clientsDescription:string;
    leadsSourcesId?: number;
    leadsSourcesDescription:string;
    contactTypeId?: number;
    contactTypeDescription:string;
    contactName: string;
    jobTitle: string;
    phone: string;
    movil: string;
    email: string,
    status: string;
    contactsCount: number;
}