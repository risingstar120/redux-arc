import {
  reduceActionTypes,
  parseToUppercase,
  createTypes,
  createCreators,
  parseOptions,
} from './asyncActionHelpers';

export function apiActionCreatorFactory(config, types, prefix) {
  function apiCreator(options) {
    const { payload, ...params } = parseOptions(options, config) || {};
    const action = {
      type: [types.REQUEST, types.RESPONSE],
      meta: {
        ...params,
        url: parseUrl(config.url, params),
        method: config.method,
      },
    };

    if (payload) {
      action.payload = payload;
    }

    if (config.meta) {
      action.meta = { ...config.meta, ...action.meta };
    }

    if (config.schema) {
      action.meta.schema = config.schema;
    }

    if (config.policies) {
      action.meta.policies = config.policies;
    }

    return action;
  }

  Object.defineProperty(
    apiCreator,
    'name',
    { value: `${prefix}${types.uppercaseName} apiCreator`, writable: false },
  );

  return apiCreator;
}

export function parseUrl(url, params) {
  return url.replace(/(:)([A-Za-z0-9]*)/g, (match, $1, $2) => {
    const paramType  = typeof params[$2];
    if (paramType !== 'string' && paramType !== 'number') {
      throw new Error(`Param ${$1} from url ${url}, not found in params object`);
    }
    return params[$2];
  });
}

export function validateConfig(configs, options) {
  Object.keys(configs).forEach((creatorName) => {
    const config = configs[creatorName];
    const configName = `${options && options.prefix}${parseToUppercase(creatorName)}`;

    if (typeof config.url !== 'string') {
      throw new Error(
        `Invalid url, ${config.url}, provided for ${configName}, it should be a string`,
      );
    }
    if (/:payload*/g.test(config.url)) {
      throw new Error(
        `Invalid url, ${config.url}, provided for ${configName}, you cannot use payload as a param`,
      );
    }
    if (typeof config.method !== 'string' || !config.method.length) {
      throw new Error(
        `Invalid method,  ${config.method}, provided for ${configName}, it should be a string`,
      );
    }
    if (config.modifier && typeof config.modifier !== 'function') {
      throw new Error(
        `Invalid modifier handler, ${config.modifier}, provided for ${configName}, it should be a function`,
      );
    }
  });

  if (options && options.prefix && typeof options.prefix !== 'string') {
    throw new Error(`Invalid prefix provided to options: ${options.prefix}, it should be a string`);
  }
}

export function createApiActions(config, options) {
  validateConfig(config, options);
  const actionKeys = Object.keys(config);
  const actionTypes = createTypes(actionKeys, options && options.prefix);
  const creators = createCreators(config, actionTypes, options.prefix, apiActionCreatorFactory);

  return {
    creators,
    types: reduceActionTypes(actionTypes),
  };
}

export default {
  createApiActions,
  apiActionCreatorFactory,
  parseUrl,
  validateConfig,
};
