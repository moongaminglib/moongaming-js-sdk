const BASE_URL = DEFINE_SERVER_BASE_URL;

export const login = `${BASE_URL}/auth/chain/login`;
export const chainLogin = `${BASE_URL}/auth/chain/contract-sign`;
export const sendTransaction = `${BASE_URL}/trade/order/apply`;
export const checkTransaction = `${BASE_URL}/trade/order/check`;
export const checkAddress = `${BASE_URL}/auth/chain/check-address`;

export const getFingerPrint = `${BASE_URL}/auth/config/fingerprint`;

const BASE_LOG_URL = DEFINE_SERVER_LOG_URL;
export const sendLog = `${BASE_LOG_URL}`;
