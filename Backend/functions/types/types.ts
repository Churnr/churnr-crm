
export type options = {
    "method": string,
    "headers": headers,
    "json": boolean
};
export type headers = {
    "Content-Type": string,
    "Authorization": string
};
export type msg = {
    "to": string,
    "from": string,
    "subject": string,
    "template_id": string
  };

export type company = {
    "companyName":string,
    "paymentGateway":string,
    "apiKey":string,
    "emailGateway": string,
    "emailGatewayUser": string,
    "emailGatewayPassword": string,
    "contactPerson": string,
    "flowEmails": number,
    "flowCalls": number,
}

export type templates = {
    "templateIds": Map<string, string>
}

export type customer = {
    "first_name":string,
    "last_name":string,
    "handle":string
    "email":string,
    "phone": number,
    "created": string,
    "dunning_invoices": number,
    "active_subscriptions": number,
    "expired_subscriptions": number,
    "cancelled_invoices": number,
    "settled_invoices": number,
    "pending_invoices": number,
    "trial_active_subscriptions": number,
    "subscriptions": number,
}
