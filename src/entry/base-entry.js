/**
  Example：

  const instance = MoonGamingSDK.init({
    app_id: 1,
    contract_address: '',
  });
  instance.sign();
 */

import CustomError from '../error/CustomError';

const VALID_KEYS = ['app_id', 'contract_address'];

export default function (BaseChain, chainType) {
  return {
    /**
     * init
     * @param {Object} config
     * @returns {BaseChain}
     */
    init(config) {
      if (!config) {
        throw new CustomError(1, 'config cannot be empty!');
      }
      VALID_KEYS.forEach((item) => {
        if (!config[item]) {
          throw new CustomError(1, `config.${item} cannot be empty!`);
        }
      });

      // set chain_type
      config.chain_type = chainType || DEFINE_DEFAULT_CHAIN_TYPE;

      // merge default config value
      config.chain_sign_txt = config.chain_sign_txt || 'Welcome To MoonGming!';
      config.silent_login = config.silent_login || 0;
      config.app_name = config.app_name || 'MoonGaming';
      config.app_icon = config.app_icon || 'https://moonswap.fi/images/192x192_App_Icon.png';
      return new BaseChain(config);
    },
  };
}
