export interface EmailEnv {
  BREVO_API_KEY: string;
  ORDER_FROM_NAME: string;
  ORDER_FROM_EMAIL: string;
}

export interface EmailRecipient {
  name?: string;
  email: string;
}

export interface SendEmailParams {
  env: EmailEnv;
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: EmailRecipient;
}

export async function sendEmail(params: SendEmailParams): Promise<Response> {
  const { env, to, subject, htmlContent, textContent, replyTo } = params;
  const body: Record<string, unknown> = {
    sender: { name: env.ORDER_FROM_NAME, email: env.ORDER_FROM_EMAIL },
    to: Array.isArray(to) ? to : [to],
    subject,
    htmlContent,
  };
  if (textContent) body.textContent = textContent;
  if (replyTo) body.replyTo = replyTo;
  return fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': env.BREVO_API_KEY,
    },
    body: JSON.stringify(body),
  });
}
