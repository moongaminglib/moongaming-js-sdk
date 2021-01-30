import axios from 'axios';
import qs from 'qs';

const sdkVersion = DEFINE_SDK_VERSION;

const postConfig = {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
};

const formatParams = (_params) => {
  const params = _params || {};
  params.sdk_ver = sdkVersion;
  return params;
};

export async function postData(url, params) {
  try {
    const response = await axios.post(url, qs.stringify(formatParams(params)), postConfig);
    if (response && response.data) {
      const {
        code, data, extra, msg,
      } = response.data;
      return {
        success: code === 0, code, data, extra, msg,
      };
    }
    return { success: false, code: -1 };
  } catch (ex) {
    return { success: false, code: -1 };
  }
}

export function postLogData(url, params) {
  axios.post(url, formatParams(params), {
    headers: { 'Content-Type': 'text/plain' },
  });
}

export async function getData(url, params) {
  try {
    const response = await axios.get(url, params);
    if (response && response.data) {
      return { success: true, data: response.data };
    }
    return { success: false, data: null };
  } catch (ex) {
    return { success: false, data: null };
  }
}
