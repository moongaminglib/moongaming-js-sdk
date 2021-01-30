const MESSAGE = {
  0: 'success',
  10001: 'env not found',
  10002: 'plugin is locked',
  10003: 'user not login',
  10004: 'user canceled',
  10005: 'openid is not right, valid failed',
  10006: 'no wallet',
  10007: 'address not activated',
  10008: 'insufficient funds',
  10009: 'deposit repeat',
};

const getMsg = code => MESSAGE[code] || '';
export default getMsg;
