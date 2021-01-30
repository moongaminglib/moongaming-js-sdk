import Fingerprint2 from 'fingerprintjs2';
import { postData, postLogData } from '../../utils/Network';
import { sendLog, getFingerPrint } from '../../service/api';

let logData = null;

const startSendLog = (params) => {
  postLogData(sendLog, {
    ...params,
    ...logData,
    platform: 'open',
    product_line: 'open',
    log_index: 'moonswap',
  });
};

/**
 * sendLog
 * @param {String} params.openid
 * @param {String} params.log_type
 */
export default function (params) {
  if (!logData) {
    Fingerprint2.get((components) => {
      const finger_id = Fingerprint2.x64hash128(components.map(pair => pair.value).join(), 31);
      postData(getFingerPrint, {
        openid: params.open_id,
        finger_id,
      }).then((response) => {
        const { success, data } = response;
        if (!success) {
          return;
        }
        delete data.openid;
        logData = data;
        startSendLog(params);
      });
    });
  } else {
    startSendLog(params);
  }
}
