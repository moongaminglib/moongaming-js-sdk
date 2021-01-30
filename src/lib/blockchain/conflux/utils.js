/* eslint-disable max-len */
import BigNumber from 'bignumber.js';

import abiMulticall from './abis/Multicall.json';
import abiERC777 from './abis/ERC777.json';
import abiERC1155 from './abis/ERC1155.json';
import abiPayOrder from './abis/PayOrder.json';
import abiDeposit from './abis/PetLock.json';


const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Test
// const addressMulticall = '0x81e1423d90c87ba5514a90b628272d7ecdbdddd0';
// const addressERC777Moon = '0x86430f38c31ff11c8b51c4127b847cd33b763bf8';
// const addressERC777FC = '0x814ff7b95f7d7eabd4c1fcf33a1d527f67a2bace';
// const addressERC1155ConDragon = '0x829d519b7a02ae272abcd51c7654553e0e93c237';

// const addressPayOrder = '';
// const addressPetLock = '';


// Production
// const addressMulticall = '0x8c65f9162155b29f3ed0a20abbec198e295e6187';
// const addressERC777Moon = '0x8e28460074f2ff545053e502e774dddc97125110';
// const addressERC777FC = '0x8e2f2e68eb75bb8b18caafe9607242d4748f8d98';
// const addressERC1155ConDragon = '0x83928828f200b79b78404dce3058ba0c8c4076c3';

// const addressPayOrder = '0x84935f41ce7ffdb7e5a49f4049f638bc15400af9';
// const addressPetLock = '0x866797d81a7646e442d8bbc51496b3c31b71e353';


export const CONTRACT_CONFIGS = {
  addresses: {
    multicall: '0x8c65f9162155b29f3ed0a20abbec198e295e6187',
    cMOON: '0x8e28460074f2ff545053e502e774dddc97125110',
    FC: '0x8e2f2e68eb75bb8b18caafe9607242d4748f8d98',
  },
  abis: {
    multicall: abiMulticall,
    erc777: abiERC777,
    erc1155: abiERC1155,
    payOrder: abiPayOrder,
    deposit: abiDeposit,
  },
};

export const ASSET_TYPES = {
  cMOON: 'cMOON',
  FC: 'FC',
  CFX: 'CFX',
};

export function isConfluxPortalInstalled() {
  return Boolean(window.conflux);
}

export function getContract(address, abi) {
  if (!isConfluxPortalInstalled() || !window.confluxJS) {
    return null;
  }
  return window.confluxJS.Contract({ address, abi });
}

function encodeData(orderNo, address) {
  const bytecode = Buffer.from('', 'hex');
  const code = window.confluxJS.Contract({
    abi: [
      {
        inputs: [
          { type: 'string' },
          { type: 'address' },
        ],
        type: 'constructor',
      },
    ],
    code: bytecode,
    bytecode,
  }).constructor(orderNo, address).data;
  return Buffer.from(code, 'hex');
}

function encodeStakeData(orderNo, heroId) {
  const bytecode = Buffer.from('', 'hex');
  const code = window.confluxJS.Contract({
    abi: [
      {
        inputs: [
          { type: 'string' },
          { type: 'string' },
        ],
        type: 'constructor',
      },
    ],
    code: bytecode,
    bytecode,
  }).constructor(orderNo, heroId).data;
  return Buffer.from(code, 'hex');
}

function formatErrorData(ex) {
  return { success: false, cancel: (ex && ex.code === 4001) || false, message: (ex && ex.message) || '' };
}

export async function callContract(contract, method, params) {
  let result = null;
  try {
    result = await contract[method](params);
  } catch (ex) {
    return formatErrorData(ex);
  }
  return {
    success: true,
    data: result,
  };
}

const wrapperContractOperate = async (data, params, noExecuted) => {
  let result = null;
  try {
    const estimate = await data.estimateGasAndCollateral(params);
    const txParams = {
      ...params,
      gas: BigNumber(estimate.gasUsed).times(2).toFixed(),
      storageLimit: BigNumber(estimate.storageCollateralized).times(2).toFixed(),
      gasPrice: 1,
    };
    if (noExecuted) {
      result = await data.sendTransaction(txParams);
    } else {
      result = await data.sendTransaction(txParams).executed();
    }
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.error(ex);
    return { error: (ex && ex.message) || '' };
  }
  return result || {};
};

export function getTransitionState(txHash, retryTimes) {
  const maxTimes = retryTimes || 30;
  let currentIndex = 0;
  return new Promise((resolve) => {
    // eslint-disable-next-line func-names, consistent-return
    const queryTransaction = async function () {
      let result = null;
      try {
        result = await window.confluxJS.getTransactionReceipt(txHash);
      } catch (ex) {
        // TODO
      }
      if (result && (result.outcomeStatus === 0 || result.outcomeStatus === 1)) {
        return resolve({
          success: result.outcomeStatus === 0,
          txHash,
        });
      }
      if (currentIndex > maxTimes) {
        return resolve({ success: false, timeout: true, txHash });
      }
      currentIndex += 1;
      setTimeout(queryTransaction, 1000);
    };
    queryTransaction();
  });
}

export async function opearteCommonTransition({
  onTask, onConfirming, onEnded,
}) {
  const hash = await onTask();
  if (!hash || typeof hash !== 'string') {
    await onEnded({ success: false });
    return;
  }
  await onConfirming();
  const { success } = await getTransitionState(hash);
  if (!success) {
    await onEnded({ success: false });
    return;
  }
  await onEnded({ success: true });
}

export async function getUserBalance(address, assetType, contract, decimal) {
  let result = null;
  if (assetType === ASSET_TYPES.CFX) {
    result = await window.confluxJS.getBalance(address);
  } else {
    result = await contract.balanceOf(address);
  }
  return new BigNumber(result.toString()).div(new BigNumber(10).pow(decimal || 18)).toString();
}

export async function payOrder(account, assetType, erc777Contract, payOrderContract, orderNo, amount, seller, decimal) {
  const params = { from: account };
  const fmtAmount = new BigNumber(amount).times(new BigNumber(10).pow(decimal || 18)).toString();

  let data = null;
  if (seller && seller.toLowerCase() === account.toLowerCase()) {
    seller = ZERO_ADDRESS;
  }
  if (assetType === ASSET_TYPES.cMOON || assetType === ASSET_TYPES.FC) {
    const bufferData = encodeData(orderNo, seller || ZERO_ADDRESS);
    data = erc777Contract.send(payOrderContract.address, fmtAmount, bufferData);
  } else {
    params.value = fmtAmount;
    if (seller) {
      data = payOrderContract.buyCFX(orderNo, seller);
    } else {
      data = payOrderContract.payCFX(orderNo);
    }
  }
  const result = await wrapperContractOperate(data, params, true);
  return result;
}

// const data = getContract('erc1155').safeTransferFrom(account, getContract('petLock').address, tokenId, 1, bufferData);
export async function stake(account, contract, lockAddress, orderNo, tokenId, heroId) {
  const params = { from: account };
  const bufferData = encodeStakeData(orderNo, String(heroId));
  const data = contract.safeTransferFrom(account, lockAddress, tokenId, 1, bufferData);
  const result = await wrapperContractOperate(data, params, true);
  return result;
}

// const data = getContract('petLock').unlock(tokenId, orderNo);
export async function unStake(account, contract, orderNo, tokenId, heroId) {
  const params = { from: account };
  const data = contract.unlock(tokenId, orderNo, String(heroId));
  const result = await wrapperContractOperate(data, params, true);
  return result;
}
