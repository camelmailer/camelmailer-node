import type { CamelMailer } from '../camelmailer';
import type { CamelMailerResult } from '../types';
import type {
  CreateTemplateOptions,
  ListTemplatesResponse,
  RenderTemplateResponse,
  TemplateResponse,
  UpdateTemplateOptions,
} from './types';

/** Manage stored message templates (`/api/v2/server/templates`). */
export class Templates {
  constructor(private readonly client: CamelMailer) {}

  /** List all templates of the server. */
  list(): Promise<CamelMailerResult<ListTemplatesResponse>> {
    return this.client.get<ListTemplatesResponse>('/api/v2/server/templates');
  }

  /** Create a template. Subject and bodies may contain `{{ variables }}`. */
  create(options: CreateTemplateOptions): Promise<CamelMailerResult<TemplateResponse>> {
    return this.client.post<TemplateResponse>('/api/v2/server/templates', options);
  }

  /** Retrieve a template by permalink. */
  get(permalink: string): Promise<CamelMailerResult<TemplateResponse>> {
    return this.client.get<TemplateResponse>(
      `/api/v2/server/templates/${encodeURIComponent(permalink)}`,
    );
  }

  /** Update a template; only the provided fields are changed. */
  update(
    permalink: string,
    options: UpdateTemplateOptions,
  ): Promise<CamelMailerResult<TemplateResponse>> {
    return this.client.patch<TemplateResponse>(
      `/api/v2/server/templates/${encodeURIComponent(permalink)}`,
      options,
    );
  }

  /** Archive a template (it can no longer be used for sending). */
  archive(permalink: string): Promise<CamelMailerResult<TemplateResponse>> {
    return this.client.post<TemplateResponse>(
      `/api/v2/server/templates/${encodeURIComponent(permalink)}/archive`,
    );
  }

  /** Dry-run render: preview subject/html/text against a model without sending. */
  render(
    permalink: string,
    templateModel: Record<string, unknown> = {},
  ): Promise<CamelMailerResult<RenderTemplateResponse>> {
    return this.client.post<RenderTemplateResponse>(
      `/api/v2/server/templates/${encodeURIComponent(permalink)}/render`,
      { template_model: templateModel },
    );
  }
}
