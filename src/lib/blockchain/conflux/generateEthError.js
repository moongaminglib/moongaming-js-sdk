import CustomError from '../../../error/CustomError';
import getMsg from '../../../error/index';

export default function (err) {
  if (err && err.constructor === CustomError) {
    return err;
  }
  const message = (err && err.message) || err;
  if (typeof message === 'string') {
    const msg = message.toUpperCase();
    let code = 3;
    if (msg.indexOf('NO_PROVIDER') >= 0) {
      code = 10001;
    } else if (msg.indexOf('LOCKED') >= 0) {
      code = 10002;
    } else if (msg.indexOf('REJECTED') >= 0 || msg.indexOf('DENIED') >= 0) {
      code = 10004;
    } else if (msg.indexOf('THE HERO LOCK NFT') >= 0) {
      code = 10009;
    }
    return new CustomError(code, getMsg(code), message);
  }
  return CustomError.generate(err);
}
