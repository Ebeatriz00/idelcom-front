export interface ContactsUpsertDto{
    contactsCrmId?: number,
    businessId?: number;
    workerId?: number;
    clientsId?: number;
    leadsSourcesId?: number;
    contactTypeId?: number;
    contactName: string;
    jobTitle: string;
    phone: string;
    movil: string;
    email: string,
    usersBy?: string;
}

export interface ContactsStatusDto{
    contactsCrmId?: number,
    businessId?: number;
    status?: string;
    usersBy?: string;
}