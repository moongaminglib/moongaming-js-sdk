const BaseConfig = require('./webpack.config');

const PROJECT_NAME = 'moongaming-js-sdk';
module.exports = (env) => {
  const config = BaseConfig({
    ...env,
    index_html_filename: `../../template/${PROJECT_NAME}/index.blade.php`,
  });
  config.output.path = `${__dirname}/dist/static/${PROJECT_NAME}`;
  return config;
};
