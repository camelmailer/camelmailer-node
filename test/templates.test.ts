import { describe, expect, it } from 'vitest';
import { envelope, errorEnvelope, stubFetch, testClient } from './helpers';

const template = {
  id: 1,
  uuid: 'u-1',
  name: 'Welcome',
  permalink: 'welcome',
  subject: 'Hello {{ name }}',
  html_body: '<p>Hi {{ name }}</p>',
  text_body: 'Hi {{ name }}',
  archived: false,
};

describe('templates.list', () => {
  it('GETs /api/v2/server/templates', async () => {
    const { requests } = stubFetch({ body: envelope({ templates: [template] }) });
    const { data } = await testClient().templates.list();
    expect(requests[0]?.method).toBe('GET');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/templates');
    expect(data?.templates).toEqual([template]);
  });
});

describe('templates.create', () => {
  it('POSTs the template fields', async () => {
    const { requests } = stubFetch({ status: 201, body: envelope({ template }) });
    const { data } = await testClient().templates.create({
      name: 'Welcome',
      subject: 'Hello {{ name }}',
      html_body: '<p>Hi {{ name }}</p>',
      text_body: 'Hi {{ name }}',
    });
    expect(requests[0]?.method).toBe('POST');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/templates');
    expect(requests[0]?.body).toEqual({
      name: 'Welcome',
      subject: 'Hello {{ name }}',
      html_body: '<p>Hi {{ name }}</p>',
      text_body: 'Hi {{ name }}',
    });
    expect(data?.template.permalink).toBe('welcome');
  });

  it('surfaces ParameterMissing when the name is empty', async () => {
    stubFetch({ status: 400, body: errorEnvelope('ParameterMissing', 'param is missing or the value is empty: name') });
    const { error } = await testClient().templates.create({ name: '' });
    expect(error?.code).toBe('ParameterMissing');
    expect(error?.statusCode).toBe(400);
  });
});

describe('templates.get', () => {
  it('GETs a template by permalink', async () => {
    const { requests } = stubFetch({ body: envelope({ template }) });
    const { data } = await testClient().templates.get('welcome');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/templates/welcome');
    expect(data?.template.name).toBe('Welcome');
  });

  it('URL-encodes the permalink', async () => {
    const { requests } = stubFetch({ body: envelope({ template }) });
    await testClient().templates.get('wel come');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/templates/wel%20come');
  });
});

describe('templates.update', () => {
  it('PATCHes the changed fields', async () => {
    const { requests } = stubFetch({ body: envelope({ template: { ...template, subject: 'New' } }) });
    const { data } = await testClient().templates.update('welcome', { subject: 'New' });
    expect(requests[0]?.method).toBe('PATCH');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/templates/welcome');
    expect(requests[0]?.body).toEqual({ subject: 'New' });
    expect(data?.template.subject).toBe('New');
  });
});

describe('templates.archive', () => {
  it('POSTs to the archive endpoint', async () => {
    const { requests } = stubFetch({ body: envelope({ template: { ...template, archived: true } }) });
    const { data } = await testClient().templates.archive('welcome');
    expect(requests[0]?.method).toBe('POST');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/templates/welcome/archive');
    expect(data?.template.archived).toBe(true);
  });
});

describe('templates.render', () => {
  it('POSTs the model and returns the rendered fields', async () => {
    const rendered = { subject: 'Hello Ada', html_body: '<p>Hi Ada</p>', text_body: 'Hi Ada' };
    const { requests } = stubFetch({ body: envelope({ rendered }) });
    const { data } = await testClient().templates.render('welcome', { name: 'Ada' });
    expect(requests[0]?.method).toBe('POST');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/templates/welcome/render');
    expect(requests[0]?.body).toEqual({ template_model: { name: 'Ada' } });
    expect(data?.rendered).toEqual(rendered);
  });

  it('renders with an empty model by default', async () => {
    const { requests } = stubFetch({ body: envelope({ rendered: {} }) });
    await testClient().templates.render('welcome');
    expect(requests[0]?.body).toEqual({ template_model: {} });
  });
});
