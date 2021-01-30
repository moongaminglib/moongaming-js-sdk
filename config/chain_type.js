/* eslint-disable */
module.exports = function (basePath) {
  const CHAIN_ENTRYS = {
    17: {
      chain: 'Conflux',
      default: true,
      entry: {
        index: {
          chunk: 'conflux_index',
          url: basePath + '/src/entry/conflux/index.js'
        }
      }
    }
  };

  const webpackEntry = {
    index: basePath + '/src/entry/index.js'
  };
  const defineChainData = {};
  const defineChainTagData = {};
  let defaultChainType = '';

  Object.keys(CHAIN_ENTRYS).forEach(key => {
    if (CHAIN_ENTRYS[key].disabled) {
      return;
    }
    defineChainTagData[key] = CHAIN_ENTRYS[key].chain;
    defaultChainType = CHAIN_ENTRYS[key].default ? key : defaultChainType;
    Object.keys(CHAIN_ENTRYS[key].entry).forEach(subKey => {
      const { chunk, url } = CHAIN_ENTRYS[key].entry[subKey];
      webpackEntry[chunk] = url;
      defineChainData[`${key}_${subKey}`] = chunk;
    })
  });

  return {
    webpackEntry,
    defineChainData,
    defineChainTagData,
    defaultChainType
  };
};
