
export type options = {
    method: string,
    headers: headers,
    json: boolean
};
export type headers = {
    "Content-Type": string,
    Authorization: string
};
export type msg = {
    to: string,
    from: string,
    subject: string,
    template_id: string
  };

export type company = {
    companyName:string,
    paymentGateway:string,
    apiKey:string,
    emailGateway: string,
    emailGatewayUser: string,
    emailGatewayPassword: string,
    contactPerson: string,
}

export type templates = {
    templateIds: Map<string, string>
}

export type emailRequest = {
    companyName:string,
    customerId:string,
    templateId:string,
}

export type customer = {
    first_name:string,
    last_name:string,
    handle:string
    email:string,
    phone: number,
    created: string,
    dunning_invoices: number,
    active_subscriptions: number,
    expired_subscriptions: number,
    cancelled_invoices: number,
    settled_invoices: number,
    pending_invoices: number,
    trial_active_subscriptions: number,
    subscriptions: number,
    paymentLink: string,
}

export type activeFlow = {
    invoiceId:string,
    customerId:string,
    flowStartDate:string,
    errorState:string,
    emailCount:number,
    emailAnswered:boolean,
}

export type activeDunnig = {
    first_name:string,
    last_name:string,
    handle:string,
    flowStartDate:string,
    errorState:string,
    emailCount:number,
    ordertext:string,
    created:string
    settled_invoices:number,
    amount:number
    phone:number,
    email:string,
    error:string,
    acquirer_message:string,
    activeFlow:boolean,
}
export type dailyUpdate = {
    retianed: number,
    onhold: number,
    newDunning: number
}
// ActiveDunnig:
// Kundeid
// Navn
// Email
// Telefon nr
// Dunning dato
// Dunning årsag (error og error state)
// Beløb
// Ordren (texten i ordren)
// Betalte invoices i alt
// Antal emails sendt

export type Retained = {
    customerId: number;
    firstName: string;
    lastName: string;
    invoiceValue: number;
    retainedDate: Date;
}
export type Expired = {
    customerId: number;
    firstName: string;
    lastName: string;
    customerCreated: Date;
    expiredDate: Date;
}
export type OnHold = {
    customerId: number;
    firstName: string;
    lastName: string;
    customerCreated: Date;
    onHoldDate: Date;
}
export type NotRetained = {
    customerId: number;
    firstName: string;
    lastName: string;
    emailCount: number;
    phoneCount: number;
}
