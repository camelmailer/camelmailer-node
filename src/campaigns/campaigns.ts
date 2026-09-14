import type { CamelMailer } from '../camelmailer';
import type { CamelMailerResult } from '../types';
import type {
  CampaignResponse,
  CreateCampaignOptions,
  GetCampaignResponse,
  ListCampaignsResponse,
  UpdateCampaignOptions,
} from './types';

/**
 * Broadcast campaigns (`/api/v2/server/campaigns`).
 *
 * A campaign is content plus an audience. Creating one leaves it as a
 * `draft`; scheduling and sending are separate calls, so nothing goes out
 * as a side effect of writing it.
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

  /** Create a campaign on a broadcast stream. It starts as a draft. */
  create(
    permalink: string,
    options: CreateCampaignOptions,
  ): Promise<CamelMailerResult<CampaignResponse>> {
    return this.client.post<CampaignResponse>(
      `/api/v2/server/streams/${encodeURIComponent(permalink)}/campaigns`,
      options,
    );
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
