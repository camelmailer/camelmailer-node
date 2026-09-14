import type { CamelMailer } from '../camelmailer';
import type { CamelMailerResult } from '../types';
import type {
  CreateLayoutOptions,
  DeleteLayoutResponse,
  LayoutLogoResponse,
  LayoutResponse,
  ListLayoutsResponse,
  UpdateLayoutOptions,
} from './types';

/**
 * Template layouts (`/api/v2/server/layouts`).
 *
 * A layout wraps every template that uses it, so header, footer and styling
 * live in one place instead of in each template.
 */
export class Layouts {
  constructor(private readonly client: CamelMailer) {}

  /** List all layouts of the server. */
  list(): Promise<CamelMailerResult<ListLayoutsResponse>> {
    return this.client.get<ListLayoutsResponse>('/api/v2/server/layouts');
  }

  /**
   * Create a layout.
   *
   * `html_wrapper` has to embed the body with `{{{ content }}}`; anything
   * else is refused with `ValidationError`.
   */
  create(options: CreateLayoutOptions): Promise<CamelMailerResult<LayoutResponse>> {
    return this.client.post<LayoutResponse>('/api/v2/server/layouts', options);
  }

  /** Retrieve a layout by permalink. */
  get(permalink: string): Promise<CamelMailerResult<LayoutResponse>> {
    return this.client.get<LayoutResponse>(
      `/api/v2/server/layouts/${encodeURIComponent(permalink)}`,
    );
  }

  /** Update a layout; only the provided fields are changed. */
  update(
    permalink: string,
    options: UpdateLayoutOptions,
  ): Promise<CamelMailerResult<LayoutResponse>> {
    return this.client.patch<LayoutResponse>(
      `/api/v2/server/layouts/${encodeURIComponent(permalink)}`,
      options,
    );
  }

  /** Delete a layout. Templates that referenced it fall back to no wrapper. */
  delete(permalink: string): Promise<CamelMailerResult<DeleteLayoutResponse>> {
    return this.client.delete<DeleteLayoutResponse>(
      `/api/v2/server/layouts/${encodeURIComponent(permalink)}`,
    );
  }

  /**
   * Upload the layout's logo as a data URL
   * (`data:image/png;base64,…`) and get back the absolute URL to reference
   * from the wrapper.
   */
  uploadLogo(
    permalink: string,
    dataUrl: string,
  ): Promise<CamelMailerResult<LayoutLogoResponse>> {
    return this.client.post<LayoutLogoResponse>(
      `/api/v2/server/layouts/${encodeURIComponent(permalink)}/logo`,
      { data_url: dataUrl },
    );
  }
}
