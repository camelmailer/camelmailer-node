import { describe, expect, it } from 'vitest';
import { envelope, errorEnvelope, stubFetch, testClient } from './helpers';

const stream = {
  id: 1,
  uuid: 'u-1',
  name: 'Broadcasts',
  permalink: 'broadcasts',
  stream_type: 'broadcast',
  archived: false,
};

describe('streams.list', () => {
  it('GETs /api/v2/server/streams', async () => {
    const { requests } = stubFetch({ body: envelope({ streams: [stream] }) });
    const { data } = await testClient().streams.list();
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/streams');
    expect(data?.streams).toEqual([stream]);
  });
});

describe('streams.create', () => {
  it('POSTs name and stream_type', async () => {
    const { requests } = stubFetch({ status: 201, body: envelope({ stream }) });
    const { data } = await testClient().streams.create({ name: 'Broadcasts', stream_type: 'broadcast' });
    expect(requests[0]?.method).toBe('POST');
    expect(requests[0]?.body).toEqual({ name: 'Broadcasts', stream_type: 'broadcast' });
    expect(data?.stream.permalink).toBe('broadcasts');
  });

  it('surfaces a ValidationError for invalid stream types', async () => {
    stubFetch({ status: 422, body: errorEnvelope('ValidationError', 'Stream type "bogus" is not valid') });
    const { error } = await testClient().streams.create({ name: 'X', stream_type: 'bogus' as never });
    expect(error?.code).toBe('ValidationError');
  });
});

describe('streams.get', () => {
  it('GETs a stream by permalink', async () => {
    const { requests } = stubFetch({ body: envelope({ stream }) });
    const { data } = await testClient().streams.get('broadcasts');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/streams/broadcasts');
    expect(data?.stream.stream_type).toBe('broadcast');
  });
});

describe('streams.update', () => {
  it('PATCHes the changed fields', async () => {
    const { requests } = stubFetch({ body: envelope({ stream: { ...stream, name: 'News' } }) });
    const { data } = await testClient().streams.update('broadcasts', { name: 'News' });
    expect(requests[0]?.method).toBe('PATCH');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/streams/broadcasts');
    expect(requests[0]?.body).toEqual({ name: 'News' });
    expect(data?.stream.name).toBe('News');
  });
});

describe('streams.archive', () => {
  it('POSTs to the archive endpoint', async () => {
    const { requests } = stubFetch({ body: envelope({ stream: { ...stream, archived: true } }) });
    const { data } = await testClient().streams.archive('broadcasts');
    expect(requests[0]?.method).toBe('POST');
    expect(requests[0]?.url.pathname).toBe('/api/v2/server/streams/broadcasts/archive');
    expect(data?.stream.archived).toBe(true);
  });
});
