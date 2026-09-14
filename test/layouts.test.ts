import { describe, expect, it } from 'vitest';
import { envelope, errorEnvelope, stubFetch, testClient } from './helpers';

const layout = {
  id: 1,
  uuid: 'u-1',
  name: 'Default',
  permalink: 'default',
  html_wrapper: '<html><body>{{{ content }}}</body></html>',
  text_wrapper: '{{ content }}',
};

describe('layouts', () => {
  it('lists', async () => {
    const { requests } = stubFetch({ body: envelope({ layouts: [layout] }) });
    const { data } = await testClient().layouts.list();
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/layouts');
    expect(data?.layouts).toHaveLength(1);
  });

  it('creates', async () => {
    const { requests } = stubFetch({ status: 201, body: envelope({ layout }) });
    const { data } = await testClient().layouts.create({
      name: 'Default',
      html_wrapper: '<html><body>{{{ content }}}</body></html>',
    });
    expect(requests[0]?.method).toBe('POST');
    expect(data?.layout.permalink).toBe('default');
  });

  it('refuses a wrapper that escapes the body, and says why', async () => {
    stubFetch({
      status: 422,
      body: errorEnvelope(
        'ValidationError',
        'html_wrapper must embed the body with {{{ content }}} (raw interpolation)',
      ),
    });
    const { error } = await testClient().layouts.create({
      name: 'Broken',
      html_wrapper: '<html><body>{{ content }}</body></html>',
    });
    expect(error?.code).toBe('ValidationError');
    expect(error?.message).toContain('{{{ content }}}');
  });

  it('gets, updates and deletes by permalink', async () => {
    const { requests } = stubFetch(
      { body: envelope({ layout }) },
      { body: envelope({ layout: { ...layout, name: 'Renamed' } }) },
      { body: envelope({ deleted: true }) },
    );
    const client = testClient();
    await client.layouts.get('default');
    const { data: updated } = await client.layouts.update('default', { name: 'Renamed' });
    const { data: removed } = await client.layouts.delete('default');
    expect(requests.map((r) => r.method)).toEqual(['GET', 'PATCH', 'DELETE']);
    expect(updated?.layout.name).toBe('Renamed');
    expect(removed?.deleted).toBe(true);
  });

  it('uploads a logo as a data URL and returns the public URL', async () => {
    const { requests } = stubFetch({
      body: envelope({ url: 'https://mail.example.test/assets/layouts/u-1/logo' }),
    });
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    const { data } = await testClient().layouts.uploadLogo('default', dataUrl);
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/layouts/default/logo');
    expect(requests[0]?.body).toEqual({ data_url: dataUrl });
    expect(data?.url).toContain('/assets/layouts/');
  });
});
