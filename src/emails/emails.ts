import type { CamelMailer } from '../camelmailer';
import type { CamelMailerResult, EmailAddress } from '../types';
import type {
  SendRequestOptions,
  SendToStreamOptions,
  SendToStreamResponse,
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

/**
 * Turn the request options into headers.
 *
 * An idempotency key makes a retry replay the original result instead of
 * queuing a second copy. The server scopes keys per server and keeps a
 * completed result for 24 hours; reusing a key with different content is
 * rejected rather than silently ignored.
 */
function idempotencyHeader(request: SendRequestOptions): Record<string, string> {
  return request.idempotencyKey ? { 'Idempotency-Key': request.idempotencyKey } : {};
}

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
  send(
    options: SendEmailOptions,
    request: SendRequestOptions = {},
  ): Promise<CamelMailerResult<SendEmailResponse>> {
    return this.client.postWithHeaders<SendEmailResponse>(
      '/api/v2/server/messages',
      serializeSend(options),
      idempotencyHeader(request),
    );
  }

  /**
   * Send the same content to every subscriber of a broadcast stream.
   *
   * Either give `subject` with a body, or a `template` permalink with an
   * optional `template_model`. The response counts what was `queued` and
   * what was `skipped`: recipients past the per-request cap of 1000 are
   * skipped rather than queued, so a large audience wants a campaign.
   */
  sendToStream(
    permalink: string,
    options: SendToStreamOptions,
  ): Promise<CamelMailerResult<SendToStreamResponse>> {
    return this.client.post<SendToStreamResponse>(
      `/api/v2/server/streams/${encodeURIComponent(permalink)}/send`,
      options,
    );
  }

  /**
   * Send a batch of emails in one request. The batch always resolves with
   * HTTP 200; inspect each entry's `status` for per-message success.
   */
  sendBatch(
    batch: SendEmailOptions[],
    request: SendRequestOptions = {},
  ): Promise<CamelMailerResult<SendBatchResponse>> {
    return this.client.postWithHeaders<SendBatchResponse>(
      '/api/v2/server/messages/batch',
      batch.map(serializeSend),
      idempotencyHeader(request),
    );
  }

  /**
   * Render a stored template (Mustache-style `{{ variables }}`) against
   * `template_model`, then send. Fields set directly (e.g. `subject`)
   * override the rendered ones.
   */
  sendWithTemplate(
    options: SendEmailWithTemplateOptions,
    request: SendRequestOptions = {},
  ): Promise<CamelMailerResult<SendEmailResponse>> {
    return this.client.postWithHeaders<SendEmailResponse>(
      '/api/v2/server/messages/with_template',
      serializeSend(options),
      idempotencyHeader(request),
    );
  }

  /** Send a stored template to many recipients in one request. */
  sendWithTemplateBatch(
    batch: SendEmailWithTemplateOptions[],
    request: SendRequestOptions = {},
  ): Promise<CamelMailerResult<SendBatchResponse>> {
    return this.client.postWithHeaders<SendBatchResponse>(
      '/api/v2/server/messages/with_template/batch',
      batch.map(serializeSend),
      idempotencyHeader(request),
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
