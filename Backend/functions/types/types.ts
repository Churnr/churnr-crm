
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

export type customer = {
    "companyName":string,
    "paymentGateway":string,
    "apiKey":string,
    "emailGateway": string,
    "emailGatewayUser": string,
    "emailGatewayPassword": string,
    "contactPerson": string,
    "contactPersonEmail":string,
    "flowEmails": number,
    "flowCalls": number,
}

export type templates = {
    "templateIds": Map<string, string>
}

