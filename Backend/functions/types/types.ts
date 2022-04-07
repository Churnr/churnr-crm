
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
