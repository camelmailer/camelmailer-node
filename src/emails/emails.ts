import type { CamelMailer } from '../camelmailer';
import type { CamelMailerResult, EmailAddress } from '../types';
import type {
  EmailClicksResponse,
  EmailDeliveriesResponse,
  EmailOpensResponse,
  EmailRawResponse,
  GetEmailResponse,
  ListEmailsOptions,
  ListEmailsResponse,
  SendBatchResponse,
  SendEmailOptions,
  SendEmailResponse,
  SendEmailWithTemplateOptions,
} from './types';

/** Accept a single address or a list and always produce a list. */
function toList(value: EmailAddress | EmailAddress[] | undefined): EmailAddress[] | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value : [value];
}

function serializeSend<T extends SendEmailOptions | SendEmailWithTemplateOptions>(options: T) {
  return {
    ...options,
    to: toList(options.to),
    cc: toList(options.cc),
    bcc: toList(options.bcc),
    reply_to: toList(options.reply_to),
  };
}

/** Send and read messages (`/api/v2/server/messages`). */
export class Emails {
  constructor(private readonly client: CamelMailer) {}

  /**
   * Send an email. Queues one stored message per recipient (to + cc + bcc).
   *
   * The `from` domain must be a verified sending domain of the server, or
   * the exact `from` address a confirmed sender address.
   */
  send(options: SendEmailOptions): Promise<CamelMailerResult<SendEmailResponse>> {
    return this.client.post<SendEmailResponse>('/api/v2/server/messages', serializeSend(options));
  }

  /**
   * Send a batch of emails in one request. The batch always resolves with
   * HTTP 200; inspect each entry's `status` for per-message success.
   */
  sendBatch(batch: SendEmailOptions[]): Promise<CamelMailerResult<SendBatchResponse>> {
    return this.client.post<SendBatchResponse>(
      '/api/v2/server/messages/batch',
      batch.map(serializeSend),
    );
  }

  /**
   * Render a stored template (Mustache-style `{{ variables }}`) against
   * `template_model`, then send. Fields set directly (e.g. `subject`)
   * override the rendered ones.
   */
  sendWithTemplate(
    options: SendEmailWithTemplateOptions,
  ): Promise<CamelMailerResult<SendEmailResponse>> {
    return this.client.post<SendEmailResponse>(
      '/api/v2/server/messages/with_template',
      serializeSend(options),
    );
  }

  /** Send a stored template to many recipients in one request. */
  sendWithTemplateBatch(
    batch: SendEmailWithTemplateOptions[],
  ): Promise<CamelMailerResult<SendBatchResponse>> {
    return this.client.post<SendBatchResponse>(
      '/api/v2/server/messages/with_template/batch',
      batch.map(serializeSend),
    );
  }

  /** Retrieve one message plus its delivery attempts. */
  get(id: number): Promise<CamelMailerResult<GetEmailResponse>> {
    return this.client.get<GetEmailResponse>(`/api/v2/server/messages/${id}`);
  }

  /** List messages, newest first. Filter by scope, status, tag, substring query or stream. */
  list(options: ListEmailsOptions = {}): Promise<CamelMailerResult<ListEmailsResponse>> {
    return this.client.get<ListEmailsResponse>('/api/v2/server/messages', options);
  }

  /** List the SMTP delivery attempts of a message. */
  deliveries(id: number): Promise<CamelMailerResult<EmailDeliveriesResponse>> {
    return this.client.get<EmailDeliveriesResponse>(`/api/v2/server/messages/${id}/deliveries`);
  }

  /** List the open-tracking events of a message. */
  opens(id: number): Promise<CamelMailerResult<EmailOpensResponse>> {
    return this.client.get<EmailOpensResponse>(`/api/v2/server/messages/${id}/opens`);
  }

  /** List the click-tracking events of a message. */
  clicks(id: number): Promise<CamelMailerResult<EmailClicksResponse>> {
    return this.client.get<EmailClicksResponse>(`/api/v2/server/messages/${id}/clicks`);
  }

  /**
   * Fetch the raw RFC 5322 source of a message (base64-encoded).
   * Servers in privacy mode answer with error code `NotAvailable`.
   */
  raw(id: number): Promise<CamelMailerResult<EmailRawResponse>> {
    return this.client.get<EmailRawResponse>(`/api/v2/server/messages/${id}/raw`);
  }
}
