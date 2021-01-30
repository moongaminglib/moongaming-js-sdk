const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const packageVersion = require('./package.json').version;

const formData = require('./config/form_data.js');
const envConfig = require('./config/env_config.js');
const {
  webpackEntry,
  defineChainData,
  defineChainTagData,
  defaultChainType,
} = require('./config/chain_type.js')(__dirname);

const ENTRY_JS_TIMESTAMP = (new Date()).getTime() / 1000 | 0;
const ENTRY_JS_SUFFIX = '.min.js';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const isProduction = process.env.NODE_ENV === 'production';

module.exports = (env) => {
  env = env || {};
  const deployMode = env.deploy_mode || 'prod';
  const currentEnvData = envConfig[deployMode];
  const entryBaseUrl = env.mock_mode ? '' : currentEnvData.resource_base_url;
  const entryBaseUrlEnv = env.mock_mode ? ['', ''] : [envConfig.prod.resource_base_url, envConfig.dev.resource_base_url];
  const index_html_filename = env.index_html_filename || 'index.html';
  const outputDir = `${__dirname}/dist`;

  const getResUrl = tag => `${tag}${ENTRY_JS_SUFFIX}?t=${ENTRY_JS_TIMESTAMP}`;

  const plugins = [
    new webpack.DefinePlugin({
      DEFINE_DEPLOY_MODE: JSON.stringify(deployMode),
      DEFINE_SERVER_BASE_URL: JSON.stringify(currentEnvData.api_host),
      DEFINE_SERVER_LOG_URL: JSON.stringify(currentEnvData.log_url),
      DEFINE_ENTRY_TEMPLATE_URL: JSON.stringify(getResUrl('chunk_tag')),
      DEFINE_ENTRY_CHAIN_DATA: JSON.stringify(defineChainData),
      DEFINE_ENTRY_BASE_URLS: JSON.stringify(entryBaseUrlEnv),
      DEFINE_DEFAULT_CHAIN_TYPE: defaultChainType,
      DEFINE_SDK_VERSION: JSON.stringify(packageVersion),
    }),
    new HtmlWebpackPlugin({
      filename: index_html_filename,
      template: './public/index.html',
      inject: false,
      define_form_data: JSON.stringify(formData[deployMode]),
      define_engin_url: entryBaseUrl + getResUrl('index'),
      define_chain_data: defineChainTagData,
      define_default_chain: defaultChainType,
    }),
    new CopyWebpackPlugin([{
      from: './assets',
      to: './',
      ignore: ['.DS_Store'],
      transform(content, path) {
        return content;
      },
    }]),
  ];

  if (!isProduction) {
    plugins.unshift(new webpack.HotModuleReplacementPlugin());
  }

  return {
    mode: process.env.NODE_ENV,
    entry: webpackEntry,
    module: {
      rules: isProduction ? [
        {
          test: /\.js$/,
          loader: 'babel-loader',
        },
      ] : [],
    },
    optimization: {
      minimizer: isProduction ? [new TerserPlugin({
        terserOptions: {
          safari10: true,
        },
      })] : [],
    },
    output: {
      path: outputDir,
      filename: `[name]${ENTRY_JS_SUFFIX}`,
      libraryTarget: 'umd',
    },
    devServer: {
      contentBase: outputDir,
      host: '0.0.0.0',
      port: 8080,
    },
    plugins,
  };
};
