/** Lifecycle of a campaign. A campaign only leaves `draft` deliberately. */
export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'canceled';

/** The audience stream a campaign belongs to, carried inline so a list
 *  needs no second lookup. Both fields are null when the stream was
 *  archived away. */
export interface CampaignStream {
  permalink: string | null;
  name: string | null;
}

/** A broadcast campaign: content plus an audience, expanded into one
 *  message per subscriber when it sends. */
export interface Campaign {
  id: number;
  stream_id: number;
  name: string;
  subject: string | null;
  /** Bare From address. */
  from: string | null;
  html_body: string | null;
  text_body: string | null;
  status: CampaignStatus;
  /** Recipients counted when the campaign was expanded. */
  total: number;
  /** Recipients turned into messages so far. */
  sent: number;
  scheduled_at: string | null;
  created_at: string;
  completed_at: string | null;
  /** Present on the server-level endpoints. */
  stream?: CampaignStream;
}

/** Per-campaign analytics, attributed through `messages.campaign_id`. */
export interface CampaignStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
}

/** Options for {@link Campaigns.createAndSend}. */
export interface CreateCampaignOptions {
  name: string;
  /** Bare From address; the broadcast path authorizes its domain. */
  from?: string;
  subject?: string;
  html_body?: string;
  text_body?: string;
}

/**
 * Options for {@link Campaigns.createDraft}.
 *
 * The initial status follows what you pass: `send_now` wins, then a
 * `scheduled_at` (status `scheduled`), else a `draft`.
 */
export interface CreateDraftCampaignOptions {
  /** Permalink of the broadcast stream to send to. */
  stream: string;
  /** Bare From address; the broadcast path authorizes its domain. */
  from: string;
  name?: string;
  subject?: string;
  html_body?: string;
  text_body?: string;
  /** RFC 3339 send time; arms the campaign as `scheduled`. */
  scheduled_at?: string;
  /** Send on creation, overriding `scheduled_at`. */
  send_now?: boolean;
}

/**
 * Options for {@link Campaigns.update}. Only the given fields change.
 *
 * `scheduled_at` is three-valued on purpose: omit it to leave the schedule
 * alone, set a time to move a draft to `scheduled`, or pass `null` to clear
 * it and drop back to `draft`.
 */
export interface UpdateCampaignOptions {
  name?: string | null;
  from?: string;
  subject?: string | null;
  html_body?: string | null;
  text_body?: string | null;
  scheduled_at?: string | null;
}

export interface CampaignResponse {
  campaign: Campaign;
}

/** {@link Campaigns.get} returns the campaign together with its statistics. */
export interface GetCampaignResponse {
  campaign: Campaign;
  stats: CampaignStats;
}

export interface ListCampaignsResponse {
  campaigns: Campaign[];
}
