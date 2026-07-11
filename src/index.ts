export { CamelMailer, type CamelMailerOptions } from './camelmailer';
export { CamelMailerError, type CamelMailerErrorCode } from './error';
export type {
  CamelMailerResult,
  EmailAddress,
  Pagination,
  PaginationParams,
  PingResponse,
} from './types';

export { Emails } from './emails/emails';
export type {
  ActivityEvent,
  Attachment,
  BatchEntryResult,
  Delivery,
  Email,
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
  SendRecipientResult,
} from './emails/types';

export { Templates } from './templates/templates';
export type {
  CreateTemplateOptions,
  ListTemplatesResponse,
  RenderTemplateResponse,
  Template,
  TemplateResponse,
  UpdateTemplateOptions,
} from './templates/types';

export { Streams } from './streams/streams';
export type {
  CreateStreamOptions,
  ListStreamsResponse,
  Stream,
  StreamResponse,
  StreamType,
  UpdateStreamOptions,
} from './streams/types';

export { StatsResource } from './stats/stats';
export type {
  DeliveryStatsResponse,
  GetStatsOptions,
  GetStatsResponse,
  Stats,
} from './stats/types';

export { Bounces } from './bounces/bounces';
export type {
  GetBounceResponse,
  ListBouncesOptions,
  ListBouncesResponse,
} from './bounces/types';

export { Dmarc } from './dmarc/dmarc';
export type {
  DmarcFilterOptions,
  DmarcRecord,
  DmarcReport,
  DmarcSummary,
  DmarcSummaryResponse,
  GetDmarcReportResponse,
  ListDmarcReportsOptions,
  ListDmarcReportsResponse,
} from './dmarc/types';
