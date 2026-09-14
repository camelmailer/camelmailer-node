import type { CamelMailer } from '../camelmailer';
import type { CamelMailerResult } from '../types';
import type {
  CampaignResponse,
  CreateCampaignOptions,
  CreateDraftCampaignOptions,
  GetCampaignResponse,
  ListCampaignsResponse,
  UpdateCampaignOptions,
} from './types';

/**
 * Broadcast campaigns (`/api/v2/server/campaigns`).
 *
 * A campaign is content plus an audience. There are two ways to create one
 * and they behave differently: {@link Campaigns.createDraft} writes it and
 * waits, while {@link Campaigns.createAndSend} expands it to the stream's
 * subscribers before the call returns.
 */
export class Campaigns {
  constructor(private readonly client: CamelMailer) {}

  /** List every campaign on the server, newest first. */
  list(): Promise<CamelMailerResult<ListCampaignsResponse>> {
    return this.client.get<ListCampaignsResponse>('/api/v2/server/campaigns');
  }

  /** List the campaigns of one broadcast stream. */
  listForStream(permalink: string): Promise<CamelMailerResult<ListCampaignsResponse>> {
    return this.client.get<ListCampaignsResponse>(
      `/api/v2/server/streams/${encodeURIComponent(permalink)}/campaigns`,
    );
  }

  /** Retrieve a campaign together with its statistics. */
  get(id: number): Promise<CamelMailerResult<GetCampaignResponse>> {
    return this.client.get<GetCampaignResponse>(`/api/v2/server/campaigns/${id}`);
  }

  /** Retrieve a campaign through its stream. */
  getForStream(permalink: string, id: number): Promise<CamelMailerResult<GetCampaignResponse>> {
    return this.client.get<GetCampaignResponse>(
      `/api/v2/server/streams/${encodeURIComponent(permalink)}/campaigns/${id}`,
    );
  }

  /**
   * Create a campaign without sending it.
   *
   * Name the audience with `stream`. Leave `scheduled_at` out for a
   * `draft`, set it for `scheduled`, or pass `send_now` to send on
   * creation.
   */
  createDraft(
    options: CreateDraftCampaignOptions,
  ): Promise<CamelMailerResult<CampaignResponse>> {
    return this.client.post<CampaignResponse>('/api/v2/server/campaigns', options);
  }

  /**
   * Create a campaign on a broadcast stream and send it immediately.
   *
   * The send starts before this call returns, so there is no draft to
   * review and no schedule to set. Use {@link Campaigns.createDraft} when
   * the campaign should wait.
   */
  createAndSend(
    permalink: string,
    options: CreateCampaignOptions,
  ): Promise<CamelMailerResult<CampaignResponse>> {
    return this.client.post<CampaignResponse>(
      `/api/v2/server/streams/${encodeURIComponent(permalink)}/campaigns`,
      options,
    );
  }

  /**
   * @deprecated Renamed to {@link Campaigns.createAndSend}, which says what
   * it does: this sends to the stream's subscribers straight away. It was
   * documented as creating a draft in 0.2.0, which was wrong. For a draft,
   * use {@link Campaigns.createDraft}.
   */
  create(
    permalink: string,
    options: CreateCampaignOptions,
  ): Promise<CamelMailerResult<CampaignResponse>> {
    return this.createAndSend(permalink, options);
  }

  /**
   * Update a draft or scheduled campaign.
   *
   * Setting `scheduled_at` moves a draft to `scheduled`; passing `null`
   * clears the schedule and drops it back to `draft`. A campaign that is
   * already sending cannot be edited.
   */
  update(
    id: number,
    options: UpdateCampaignOptions,
  ): Promise<CamelMailerResult<CampaignResponse>> {
    return this.client.patch<CampaignResponse>(`/api/v2/server/campaigns/${id}`, options);
  }

  /** Send a campaign now, whatever its schedule said. */
  send(id: number): Promise<CamelMailerResult<CampaignResponse>> {
    return this.client.post<CampaignResponse>(`/api/v2/server/campaigns/${id}/send`);
  }

  /** Cancel a scheduled or in-flight campaign. Messages already queued
   *  are not recalled. */
  cancel(id: number): Promise<CamelMailerResult<CampaignResponse>> {
    return this.client.post<CampaignResponse>(`/api/v2/server/campaigns/${id}/cancel`);
  }
}
