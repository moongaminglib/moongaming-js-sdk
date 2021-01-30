module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    DEFINE_DEPLOY_MODE: 'readonly',
    DEFINE_SERVER_BASE_URL: 'readonly',
    DEFINE_SERVER_LOG_URL: 'readonly',
    DEFINE_ENTRY_TEMPLATE_URL: 'readonly',
    DEFINE_ENTRY_CHAIN_DATA: 'readonly',
    DEFINE_ENTRY_BASE_URLS: 'readonly',
    DEFINE_DEFAULT_CHAIN_TYPE: 'readonly',
    DEFINE_SDK_VERSION: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'no-underscore-dangle': 'off',
    'camelcase': 'off',
    'no-param-reassign': 'off',
    'import/prefer-default-export': 'off',
    'no-bitwise': 'off',
    'object-curly-newline': 'off'
  },
};
