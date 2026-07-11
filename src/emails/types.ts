import type { EmailAddress, Pagination, PaginationParams } from '../types';

/** A file attachment; `data_base64` carries the base64-encoded content. */
export interface Attachment {
  name: string;
  content_type: string;
  data_base64: string;
}

/** Options for {@link Emails.send}. */
export interface SendEmailOptions {
  /** Sender — must belong to a verified domain or confirmed sender address of the server. */
  from: EmailAddress;
  /** One or many recipients. */
  to: EmailAddress | EmailAddress[];
  cc?: EmailAddress | EmailAddress[];
  bcc?: EmailAddress | EmailAddress[];
  reply_to?: EmailAddress | EmailAddress[];
  subject?: string;
  html_body?: string;
  text_body?: string;
  /** Extra top-level MIME headers. */
  headers?: Record<string, string>;
  attachments?: Attachment[];
  /** Free-form tag for filtering and stats. */
  tag?: string;
  /** Arbitrary JSON stored with the message. */
  metadata?: Record<string, unknown>;
  /** Message-stream permalink; defaults to the server's default stream. */
  stream?: string;
}

/** Options for {@link Emails.sendWithTemplate}. */
export interface SendEmailWithTemplateOptions extends Omit<SendEmailOptions, 'from'> {
  from: EmailAddress;
  /** Permalink of the stored template to render. */
  template: string;
  /** Variables for the template's `{{ placeholders }}`. */
  template_model?: Record<string, unknown>;
}

/** Per-recipient queue result. */
export interface SendRecipientResult {
  rcpt_to: string;
  message_id: number;
  token: string;
  status: string;
}

/** Response of a single send: one queued message per recipient. */
export interface SendEmailResponse {
  message_id: number | null;
  recipients: SendRecipientResult[];
}

/** One entry of a batch response: an envelope per submitted message. */
export type BatchEntryResult =
  | { status: 'success'; data: SendEmailResponse }
  | { status: 'error'; error: { code: string; message: string } };

/** Response of {@link Emails.sendBatch} / {@link Emails.sendWithTemplateBatch}. */
export interface SendBatchResponse {
  messages: BatchEntryResult[];
}

/** A stored message (outgoing or incoming). */
export interface Email {
  id: number;
  token: string;
  scope: 'incoming' | 'outgoing';
  rcpt_to: string;
  mail_from: string | null;
  subject: string | null;
  message_id: string | null;
  tag: string | null;
  status: string | null;
  bounce: boolean;
  spam_status: string | null;
  spam_score: number | null;
  held: boolean;
  threat: boolean;
  size: number | null;
  metadata: Record<string, unknown> | null;
  stream_id: number | null;
  bypassed: boolean;
  created_at: string;
}

/** One SMTP delivery attempt of a message. */
export interface Delivery {
  id: number;
  status: string;
  details: string | null;
  output: string | null;
  sent_with_ssl: boolean;
  created_at: string;
}

/** An open or click event. */
export interface ActivityEvent {
  ip_address: string | null;
  user_agent: string | null;
  url: string | null;
  created_at: string;
}

/** Filters for {@link Emails.list}. */
export interface ListEmailsOptions extends PaginationParams {
  scope?: 'incoming' | 'outgoing';
  status?: string;
  tag?: string;
  /** Substring match on subject / addresses. */
  query?: string;
  /** Message-stream permalink. */
  stream?: string;
}

export interface ListEmailsResponse {
  messages: Email[];
  pagination: Pagination;
}

export interface GetEmailResponse {
  message: Email;
  deliveries: Delivery[];
}

export interface EmailDeliveriesResponse {
  deliveries: Delivery[];
}

export interface EmailOpensResponse {
  opens: ActivityEvent[];
}

export interface EmailClicksResponse {
  clicks: ActivityEvent[];
}

export interface EmailRawResponse {
  /** The raw RFC 5322 source, base64-encoded. */
  raw_message: string;
}
