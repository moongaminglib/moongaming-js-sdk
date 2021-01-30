/* eslint no-unused-vars: "off" */
/* eslint class-methods-use-this: "off" */

/**
 * BaseChain
 * @author moongaminglib
 * @date 2021-01-28
 */

import getMsg from '../../error/index';
import {
  login, chainLogin, sendTransaction, checkTransaction, checkAddress,
} from '../../service/api';
import { postData } from '../../utils/Network';
import CustomError from '../../error/CustomError';
import { encode } from '../../utils/Encrypt';
import sendLog from '../log/sendLog';

export default class BaseChain {
  constructor(chain, {
    app_id, chain_type, contract_address, chain_sign_txt, silent_login, invite_code,
  }) {
    this.chain = chain;

    // base params for fetch remote url
    this._reqBaseParams = { app_id };

    this._secret = chain_sign_txt;
    this._silentLogin = silent_login;
    this._inviteCode = invite_code;
    this._chainType = chain_type;
    this._contractAddress = contract_address;
    this._signature = '';
    this._salt = '';

    this.openid = '';
    this.balance = null;
    this.address = '';
    this.publicKey = '';

    // flag install plugin
    this.isInstall = false;
    // flag plugin is ready but not auth
    this.isReady = false;
    // flag current user auth success
    this.isAuth = false;
  }

  /**
   * exportMehots
   * export some method for other libs
   */
  static exportMehots() {
    return {
      postData,
      sendLog,
      CustomError,
    };
  }

  /**
   * encodeData
   * @param { Number | String | JSON } data
   */
  static encodeData(data) {
    return encode(typeof data === 'string' ? data : JSON.stringify(data));
  }

  /**
   * clearData
   * @description clear sign data
   */
  clearData() {
    this.openid = '';
    this.balance = null;
    this.address = '';
    this.publicKey = '';
    this.isInstall = false;
    this.isReady = false;
    this.isAuth = false;
  }

  /**
   * get user openid
   */
  getOpenId() {
    return this.openid;
  }

  /**
   * get blockchain address
   * base64
   * @override
   */
  getAddress() {
    return this.address;
  }

  /**
   * get plugin state
   * @returns Number
   */
  getPluginState() {
    let code = 0;
    if (!this.isInstall) {
      code = 10001;
    } else if (!this.isReady) {
      code = 10002;
    } else if (!this.isAuth) {
      code = 10003;
    }
    return code;
  }

  /**
   * get blockchain balance from cache
   * @override
   */
  getBalanceFromCache() {
    return this.balance || 0;
  }

  /**
   * get the new balance on blockchain
   * @returns Promise
   */
  getBalance() {
    return new Promise((resolve, reject) => {
      this._startGetBalance(resolve, reject);
    });
  }

  /**
   * _startGetBalance
   * @override
   */
  async _startGetBalance(resolve, reject) {
    // console.log('this must be override');
  }

  /**
   * sign
   * @param { Number } config.flag_chain
   * @param { String } config.contract_address
   * @returns Promise
   */
  sign(config) {
    return new Promise((resolve, reject) => {
      this._startSign(resolve, reject, config);
    });
  }

  /**
   * _startSign
   * @override
   */
  async _startSign(resolve, reject, config) {
    // console.log('this must be override');
  }

  /**
   * checkOpenId
   * @param { String } openid
   * @returns Promise
   */
  checkOpenId(openid) {
    return new Promise((resolve, reject) => {
      this._startCheckOpenId(resolve, reject, openid);
    });
  }

  /**
   * _startCheckOpenId
   * @override
   */
  async _startCheckOpenId(resolve, reject, openid) {
    // console.log('this must be override');
  }

  /**
   * sendTransaction
   * @param { String } config.order_no
   * @param { Number } config.amount
   * @param { Number } config._timestamp
   * @param { String } config._signature
   * @param { String } config.contract_address
   * @override
   */
  sendTransaction(config) {
    return new Promise((resolve, reject) => {
      if (!this.isAuth) {
        const code = this.getPluginState();
        reject(new CustomError(code, getMsg(code)));
        return;
      }
      this._startSendTransaction(resolve, reject, config);
    });
  }

  /**
   * _startSendTransaction
   * @override
   */
  async _startSendTransaction(resolve, reject, config) {
    // console.log('this must be override');
  }


  /**
   * _checkAddress
   * @param {String} openid
   * @returns Boolean
   * @throws {CustomError}
   */
  async _checkAddress(openid) {
    const response = await postData(checkAddress, {
      ...this._reqBaseParams,
      from_address: this.address,
      openid,
    });
    const { success, data } = response;
    if (success) {
      if (data && data.result === 'success') {
        this._onUserLoginSuccess({ openid });
        return true;
      }
      throw new CustomError(10005, getMsg(10005), JSON.stringify(response));
    } else {
      throw new CustomError(2, `error：request '${checkAddress}'`, JSON.stringify(response));
    }
  }

  /**
   * _reqeustLogin
   * @override
   * @returns response data or _retry object
   */
  async _reqeustLogin() {
    const response = await postData(login, {
      ...this._reqBaseParams,
      from_address: this.address,
      public_key: this.publicKey,
      secret: this._getVerifySecret(),
      signature: this._signature,
      silent_login: this._silentLogin,
      invite_code: this._inviteCode,
      chain_type: this._chainType,
    });
    const { success, data, msg } = response;
    if (success && data) {
      this._onUserLoginSuccess(data);
      return data;
    }
    throw new CustomError(2, `error：request ${login}, msg：${msg}`, JSON.stringify(response));
  }

  /**
   * add salt for verify message
   */
  _getVerifySecret() {
    return this._salt + this._secret;
  }

  /**
   * _reqeustLoginOnChain
   * @override
   * @returns response data
   */
  async _reqeustLoginOnChain(config) {
    const response = await postData(chainLogin, {
      ...this._reqBaseParams,
      ...config.params,
      from_address: this.address,
      chain_type: this._chainType,
      invite_code: this._inviteCode,
    });
    const { success, data, msg } = response;
    if (success && data) {
      this._onUserLoginSuccess(data);
      return data;
    }
    throw new CustomError(2, `error：request ${chainLogin}, msg：${msg}`, JSON.stringify(response));
  }

  /**
   * _reqeustTransaction
   * @override
   * @returns Boolean  request success!
   */
  async _reqeustTransaction({
    order_no,
    amount,
    _timestamp,
    _signature,
    address,
    contract_address,
    pay_asset,
    order_type,
    nft_token_id,
    nft_hero_id,
  }) {
    const params = {
      ...this._reqBaseParams,
      contract_address: contract_address || this._contractAddress,
      from_address: address,
      chain_type: this._chainType,
      openid: this.openid,
      order_no,
      amount,
      pay_asset,
      order_type,
      _timestamp,
      _signature,
    };
    if (typeof nft_token_id !== 'undefined') {
      params.nft_token_id = nft_token_id;
    }
    if (typeof nft_hero_id !== 'undefined') {
      params.nft_hero_id = nft_hero_id;
    }

    const response = await postData(sendTransaction, params);
    const { success, code, msg, data } = response;
    if (!success) {
      if (code === 11004) {
        throw new CustomError(10005, msg, JSON.stringify(response));
      } else {
        throw new CustomError(2, `error：request ${sendTransaction}, msg：${msg}`, JSON.stringify(response));
      }
    }
    if (data && data.pay_method) {
      const items = data.pay_method.split('_');
      if (items.length > 1) {
        data.pay_method_data = {
          operation: items[0],
          asset_name: items[1],
        };
      }
    }
    return data;
  }

  /**
   * _reqeustCheckTransaction
   * @override
   */
  async _reqeustCheckTransaction({ order_no, _timestamp, _signature, txid }) {
    const response = await postData(checkTransaction, {
      ...this._reqBaseParams,
      order_no,
      txid,
      _timestamp,
      _signature,
      from_address: this.address,
      chain_type: this._chainType,
    });
    const { success, data } = response;
    if (!success) {
      throw new CustomError(2, `error：request '${checkTransaction}'`, JSON.stringify(response));
    }
    return data;
  }

  /**
   * _onUserLoginSuccess
   * @param { String } data.openid
   */
  _onUserLoginSuccess(data) {
    this.openid = data.openid;
    this.isAuth = true;
    setTimeout(() => {
      const pathName = window.location.pathname;
      const logType = (!pathName || pathName === '/') ? 'home' : pathName;
      sendLog({
        ...this._reqBaseParams,
        open_id: this.openid,
        log_type: `${logType}-pv`,
      });
    }, 80);
  }
}
