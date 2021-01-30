/**
  Example：

  MoonGamingEngin.init({ chain_type: 17 }).then((MoonGamingSDK) => {
    const instance = MoonGamingSDK.init({
      app_id: 1,
      chain_type: 17,
      contract_address: '0x83928828f200b79b78404dce3058ba0c8c4076c3',
    });
    instance.sign();
  }).catch((ex) => {
    console.error(ex);
  });

 */

import { isMobile } from '../utils/Browser';
import { loadScript } from '../utils/Helper';

const isProdMode = DEFINE_DEPLOY_MODE === 'prod';
const RESOURCE_TEMPLATE = DEFINE_ENTRY_TEMPLATE_URL;
const RESOURCE_DATA = DEFINE_ENTRY_CHAIN_DATA;
const RESOURCE_BASE_URLS = DEFINE_ENTRY_BASE_URLS;

function getResourceUrl(testMode, chainType) {
  let resourceTag = RESOURCE_DATA[`${chainType}_index`];
  if (!resourceTag) {
    resourceTag = RESOURCE_DATA[`${chainType}_${isMobile ? 'mobile' : 'web'}`];
  }
  if (!resourceTag) {
    return undefined;
  }
  return RESOURCE_BASE_URLS[testMode ? 1 : 0] + RESOURCE_TEMPLATE.replace('chunk_tag', resourceTag);
}

const MoonGamingEngin = {
  /**
   * init
   * @param {Number} config.chain_type
   * @returns {Promise}
   * @throws Error
   */
  init(config) {
    const chainType = (config && config.chain_type) || DEFINE_DEFAULT_CHAIN_TYPE;
    let testMode = !isProdMode;
    if (config && typeof config.test_mode !== 'undefined') {
      testMode = config.test_mode;
    }
    const resource = getResourceUrl(testMode, chainType);
    if (!resource) {
      throw new Error(`init resource error，chain_type: ${chainType} was not found！`);
    }
    return loadScript(resource, {
      libraryName: 'MoonGamingSDK',
      addTimestamp: true,
    });
  },
};
export { MoonGamingEngin };
