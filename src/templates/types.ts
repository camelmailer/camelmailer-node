/** A stored message template. */
export interface Template {
  id: number;
  uuid: string;
  name: string;
  permalink: string;
  /** May contain `{{ variables }}`. */
  subject: string | null;
  html_body: string | null;
  text_body: string | null;
  archived: boolean;
}

/** Options for {@link Templates.create}. */
export interface CreateTemplateOptions {
  name: string;
  /** URL slug; derived from `name` when omitted. */
  permalink?: string;
  subject?: string;
  html_body?: string;
  text_body?: string;
}

/** Options for {@link Templates.update} — only the given fields change. */
export interface UpdateTemplateOptions {
  name?: string;
  subject?: string;
  html_body?: string;
  text_body?: string;
  archived?: boolean;
}

export interface TemplateResponse {
  template: Template;
}

export interface ListTemplatesResponse {
  templates: Template[];
}

/** The rendered fields of a template preview. */
export interface RenderTemplateResponse {
  rendered: {
    subject: string | null;
    html_body: string | null;
    text_body: string | null;
  };
}
