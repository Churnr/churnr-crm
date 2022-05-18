export interface Customer{
    companyName:string,
    paymentGateway:string,
    apiKey:string,
    emailGateway: string,
    emailGatewayUser: string,
    emailGatewayPassword: string,
    contactPerson: string,
    contactPersonEmail:string,
    flowEmails: number,
    flowCalls: number,
}


export interface Dunning {
    first_name:string,
    last_name:string,
    handle:string,
    errorState:string,
    ordertext:string,
    created:string
    settled_invoices:number,
    amount:number
    phone:number,
    email:string,
    error:string,
    acquirer_message:string,
}

export interface ActiveDunning extends Dunning {
    flowStartDate: string,
    activeFlow: boolean,
    emailCount: number,
  }

export interface Retained extends Dunning {
    flowStartDate: string,
    activeFlow: boolean,
    emailCount: number,
    invoiceEndDate: string,
  }
