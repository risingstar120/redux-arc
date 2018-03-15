import createActions from '../src/createActions';

const baseConfigs = {
  list: { url: 'endpoint', method: 'get' },
  read: { url: 'endpoint/:id', method: 'put' },
  readWithExtras: {
    url: 'endpoint/:id',
    method: 'put',
    middlewares: ['middleware'],
    meta: {
      extraParam: 'EXTRA_PARAM',
    }
  },
  reset: null,
  clear: 1,
  withDefaults: { payload: '1', meta: { foo: 'bar' }, error: true },
  resetWithMeta: {
    meta: {
      a: 'TEST',
      b: 'META_DATA',
    },
    payload: 'TEST_PAYLOAD',
  }
};

describe('createActions', () => {
  const { types, creators } = createActions('my', baseConfigs);

  it('should return the proper types object', () => {
    const expectedTypes = {
      LIST: {
        REQUEST: 'MY_LIST_REQUEST',
        RESPONSE: 'MY_LIST_RESPONSE',
      },
      READ: {
        REQUEST: 'MY_READ_REQUEST',
        RESPONSE: 'MY_READ_RESPONSE',
      },
      READ_WITH_EXTRAS: {
        REQUEST: 'MY_READ_WITH_EXTRAS_REQUEST',
        RESPONSE: 'MY_READ_WITH_EXTRAS_RESPONSE',
      },
      RESET: 'MY_RESET',
      WITH_DEFAULTS: 'MY_WITH_DEFAULTS',
      CLEAR: 'MY_CLEAR',
      RESET_WITH_META: 'MY_RESET_WITH_META',
    };

    expect(types).toEqual(expectedTypes);
  });

  it('should return the proper action when calling a creator without any value', () => {
    expect(creators.list()).toEqual({
      type: [types.LIST.REQUEST, types.LIST.RESPONSE],
      meta: {
        url: 'endpoint',
        method: 'get',
      },
    });

    expect(creators.reset()).toEqual({
      type: types.RESET,
    });
  });

  it('should parse the url with provided params', () => {
    expect(creators.read(null, { id: '123' })).toEqual({
      type: [types.READ.REQUEST, types.READ.RESPONSE],
      meta: {
        url: 'endpoint/123',
        method: 'put',
        id: '123',
      },
      payload: null,
    });

  });

  it('should return the final action with given payload, meta and error', () => {
    expect(creators.reset(null, { id: '123' }, false)).toEqual({
      type: types.RESET,
      meta: {
        id: '123',
      },
      payload: null,
      error: false,
    });
  });

  it('should return the action with defaults values if configured', () => {
    expect(creators.withDefaults()).toEqual({
      type: types.WITH_DEFAULTS,
      meta: {
        foo: 'bar',
      },
      payload: '1',
      error: true,
    });
  });

  it('should return middlewares and any extra param inside meta', () => {
    expect(creators.readWithExtras({ test: 'TEST' }, { id: '123' })).toEqual({
      type: [types.READ_WITH_EXTRAS.REQUEST, types.READ_WITH_EXTRAS.RESPONSE],
      payload: { test: 'TEST' },
      meta: {
        url: 'endpoint/123',
        method: 'put',
        id: '123',
        middlewares: ['middleware'],
        extraParam: 'EXTRA_PARAM',
      },
    });
  })
});
