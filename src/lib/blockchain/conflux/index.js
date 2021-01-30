/* eslint-disable max-len */
/**
 * ConfluxChainWeb
 * @author moongaminglib
 * @date 2021-01-28
 */
import BaseChain from '../BaseChain';
import * as ChainTypes from '../ChainTypes';
import TimeDelay from '../../../utils/TimeDelay';
import CustomError from '../../../error/CustomError';
import generateEthError from './generateEthError';
import getMsg from '../../../error/index';
import { payOrder, getUserBalance, stake, unStake, ASSET_TYPES, getContract, CONTRACT_CONFIGS } from './utils';

// const addresserc1155NFT = '0x83928828f200b79b78404dce3058ba0c8c4076c3';
// const addressPayOrder = '0x84935f41ce7ffdb7e5a49f4049f638bc15400af9';
// const addressDeposit = '0x866797d81a7646e442d8bbc51496b3c31b71e353';


class ConfluxChainWeb extends BaseChain {
  constructor(config) {
    super(ChainTypes.CONFLUX, config);
    this.conflux = null;
    this.contracts = {};
    this.addressDeposit = config.contract_address_deposit;
    this.addressNFT = config.contract_address_nft;
  }

  getBalanceFromCache() {
    return this.balance;
  }

  async _startGetBalance(resolve, reject) {
    try {
      const cfxBalance = await getUserBalance(this.address, ASSET_TYPES.CFX);
      const cMoonBalance = await getUserBalance(this.address, ASSET_TYPES.cMOON, this.contracts.erc777MOON);
      const fcBalance = await getUserBalance(this.address, ASSET_TYPES.FC, this.contracts.erc777FC);
      this.balance = {
        [ASSET_TYPES.CFX]: cfxBalance,
        [ASSET_TYPES.cMOON]: cMoonBalance,
        [ASSET_TYPES.FC]: fcBalance,
      };
      resolve(this.balance);
    } catch (ex) {
      reject(generateEthError(ex));
    }
  }

  async _startSendTransaction(resolve, reject, config) {
    const { order_no, amount, _timestamp, _signature, pay_asset, seller, order_type, token_id, hero_id } = config;
    const contractAddress = this._contractAddress;
    try {
      await super._reqeustTransaction({
        order_no,
        amount,
        pay_asset,
        order_type,
        _timestamp,
        _signature,
        address: this.address,
        contract_address: contractAddress,
        nft_token_id: token_id,
        nft_hero_id: hero_id,
      });
      let tx_id;
      if (!order_type) {
        let erc777Contract = null;
        if (pay_asset !== ASSET_TYPES.CFX) {
          erc777Contract = pay_asset === ASSET_TYPES.cMOON ? this.contracts.erc777MOON : this.contracts.erc777FC;
        }
        tx_id = await payOrder(this.address, pay_asset, erc777Contract, this.contracts.payOrder, order_no, amount, seller);
      } else if (order_type === 6) {
        tx_id = await stake(this.address, this.contracts.erc1155NFT, this.contracts.deposit.address, order_no, token_id, hero_id);
      } else if (order_type === 7) {
        tx_id = await unStake(this.address, this.contracts.deposit, order_no, token_id, hero_id);
      }
      if (!tx_id || typeof tx_id !== 'string') {
        if (tx_id && tx_id.error) {
          throw generateEthError(tx_id.error);
        } else {
          throw new CustomError(2, 'error：request payOrder', JSON.stringify(payOrder));
        }
      }
      await TimeDelay(2000);
      const orderData = {
        order_no,
        txid: tx_id,
        _timestamp,
        _signature,
      };
      const checkResult = await super._reqeustCheckTransaction(orderData);
      resolve({
        order_no,
        pay_asset,
        token_id,
        seller,
        txid: tx_id,
        ...checkResult,
      });
    } catch (ex) {
      reject(generateEthError(ex));
    }
  }

  async _startSign(resolve, reject) {
    // clear sign data
    this.clearData();
    try {
      await this._initAuth();
      const data = await super._reqeustLogin();
      resolve(data);
    } catch (ex) {
      reject(generateEthError(ex));
    }
  }

  async _startCheckOpenId(resolve, reject, openid) {
    try {
      await this._initAuth();
      await super._checkAddress(openid);
      resolve();
    } catch (ex) {
      reject(generateEthError(ex));
    }
  }

  _initContract() {
    const { addresses, abis } = CONTRACT_CONFIGS;
    this.contracts = {
      erc777MOON: getContract(addresses.cMOON, abis.erc777),
      erc777FC: getContract(addresses.FC, abis.erc777),
      payOrder: getContract(this._contractAddress, abis.payOrder),
    };
    if (this.addressDeposit) {
      this.contracts.deposit = getContract(this.addressDeposit, abis.deposit);
    }
    if (this.addressNFT) {
      this.contracts.erc1155NFT = getContract(this.addressNFT, abis.erc1155);
    }
  }

  async _initAuth() {
    if (!window.conflux) {
      throw generateEthError('NO_PROVIDER');
    }
    this.conflux = window.conflux;
    this.isInstall = true;
    this._initContract();
    try {
      const [address] = await this.conflux.enable();
      if (address) {
        this.address = address;
        this.isReady = true;
      } else {
        throw generateEthError('locked');
      }
    } catch (ex) {
      throw generateEthError((ex && ex.type) ? ex.type : ex);
    }
  }

  depositProp(config) {
    return new Promise((resolve, reject) => {
      if (!this.isAuth) {
        const code = super.getPluginState();
        reject(new CustomError(code, getMsg(code)));
        return;
      }
      this._startSendTransaction(resolve, reject, {
        ...config,
        order_type: 6,
      });
    });
  }

  releaseProp(config) {
    return new Promise((resolve, reject) => {
      if (!this.isAuth) {
        const code = super.getPluginState();
        reject(new CustomError(code, getMsg(code)));
        return;
      }
      this._startSendTransaction(resolve, reject, {
        ...config,
        order_type: 7,
      });
    });
  }

  static async _initSignOnChain() {
    return null;
  }
}
export default ConfluxChainWeb;
