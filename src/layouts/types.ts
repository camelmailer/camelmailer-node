/**
 * A layout is the wrapper a template renders into: shared header, footer
 * and styling, with the message body substituted for `content`.
 */
export interface Layout {
  id: number;
  uuid: string;
  name: string;
  permalink: string;
  html_wrapper: string;
  text_wrapper: string | null;
}

/** Options for {@link Layouts.create}. */
export interface CreateLayoutOptions {
  name: string;
  /** URL slug; derived from `name` when omitted. */
  permalink?: string;
  /**
   * Must embed the body raw, as `{{{ content }}}` or `{{& content }}`.
   * Escaped interpolation would show the message markup as text, so the
   * API refuses it.
   */
  html_wrapper: string;
  text_wrapper?: string;
}

/** Options for {@link Layouts.update} — only the given fields change. */
export interface UpdateLayoutOptions {
  name?: string;
  html_wrapper?: string;
  text_wrapper?: string;
}

export interface LayoutResponse {
  layout: Layout;
}

export interface ListLayoutsResponse {
  layouts: Layout[];
}

export interface DeleteLayoutResponse {
  deleted: boolean;
}

/** Result of {@link Layouts.uploadLogo}: the absolute URL mail should
 *  reference. It is served without authentication, because mail clients
 *  fetch it without a session. */
export interface LayoutLogoResponse {
  url: string;
}
