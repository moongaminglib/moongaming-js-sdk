### 中文文档
[链接](https://github.com/moongaminglib/moongaming-js-sdk)


The purpose of this document is for developers to quickly access the moongaming-js-SDK and includes the following：

- Introduction to relevant environment
- SDK File introduction and loading method
- SDK Init
- SDK Key Method Description
- List of error codes and definitions
- Download resources

------------

### Description of relevant environment

- DAPP running environment

  - Chrome browser （Extension）
  - Wallet Client DApp browser （iOS + Android）

- Demo  test url

  - online： [http://moongaming.demo.moonswap.fi](http://moongaming.demo.moonswap.fi "http://moongaming.demo.moonswap.fi")
  - sandbox：`It is available after opening`

> Note: To experience online or offline Demo, you need to switch to the corresponding network of wallet（TEST_NET, MAIN_NET）

------------

### SDK File introduction and loading method

- SDK File：
  - ```index.min.js```
  - ```index.html```  Demo Page

- Loading way：

  - Copy ```index.min.js``` to the project and load it through script
  - Or direct introduction MoonGaming Provide the CDN URL to load

  ```//dapp.cdn.static.mmzhuli.com/static/moongaming-js-sdk/index.min.js?t=1611991391```

------------

### SDK Initialize

- Introducing SDK JS files
- Refer to the code below for access

  ```javascript
  const enginConfig = {
    chain_type: 17,
    test_mode: false
  };
  MoonGamingEngin.init(enginConfig).then((MoonGamingSDK) => {
    const config = {
      app_id: 1,
      contract_address: '',
      silent_login: 1,
      chain_sign_txt: '',
      invite_code: '',
      contract_address_deposit: '',
      contract_address_nft: ''
    };
    const moonGamingInstance = MoonGamingSDK.init(config);
    // TODO
  }).catch((ex) => {
    console.error(ex);
  });
  ```



- enginConfig parameter

  | name | description | Is it required | Constraint |
  | --- | --- | --- | --- |
  | chain_type | chain type | Y | Conflux：17 |
  | test_mode | is sandbox | N | Default: false, can be set to true during testing |

  > **Set the test_mode parameter to false or delete it before going online.**

- config Parameter

  | Name | Description | Is it required | Constraint |
  | --- | --- | --- | --- |
  | app_id | app_id | yes | Assigned by the platform |
  | contract_address | On-chain contract address | yes | Assigned by the platform |
  | silent_login | Silent login | N | Silent login, setting 1 can log in without verifying the signature (parameters must be configured in the background)|
  | chain_sign_txt | Signature string | N | The string that is signed on the chain |
  | invite_code | invite code | N | The identity of the inviter |
  | contract_address_deposit | lock contract address | N | Assigned by the platform |
  | contract_address_nft | NFT contract address | N | Assigned by the platform  |

  * * *

  ### SDK Key Method Description

  *   `sign(config)` user auth sign
  *   `checkOpenId(openid)`  Check that OpenID is valid
  *   `getAddress()` User's wallet address
  *   `getOpenId()` User unique identity
  *   `getBalance()` Wallet account balance method (blockchain balance)
  *   `sendTransaction(config)`  SendTransaction
  *   `depositProp(config)` lock nft
  *   `releaseProp(config)` unlock nft

  **`sign`**

  ``` Javascript
  const config = { flag_chain: 0 };
  // The first time the game opens the call
  moonGamingInstance.sign(config).then(signData => {
    console.log(signData);
  }).catch(ex => {
    console.error(ex);
  });
  ```

  **config Parameter：**

  | Name | Description|  Is it required | Constraint |
  | --- | --- | --- | --- |
  | flag_chain | Whether to open the signature on the chain | N | By default, it's off， 1：open chain sign |

  **ReturnValue signData brief**

  | name | descriptioin |
  | --- | --- |
  | openid | The user's openID needs to be cached locally. Next time you enter the game, `checkopenID (openID)` should be used to check whether it is valid |
  | _timestamp | unix timestamp |
  | _signature | - |

  **`checkOpenId`**

  ``` Javascript
  // If an OpenID is cached, call it. If a catch is entered, then the OpenID is invalid (the current local login identity and relevant user data displayed on the page need to be cleared), and then call the sign method again according to the signature requirement

  moonGamingInstance.checkOpenId(openid).then(() => {
    console.log('success');
  }).catch(ex => {
    console.error(ex);
  });
  ```

  **```getAddress```**

  ``` Javascript
  // Get the user's wallet address
  const address = moonGamingInstance.getAddress();
  ```

  **```getOpenId```**

  ``` Javascript
  // Gets the user's unique identity
  const openid = moonGamingInstance.getOpenId();
  ```

  **```getBalance```**

  ``` Javascript
  // Get the user's wallet balance
  moonGamingInstance.getBalance().then(balance => {
    console.log(balance);
  }).catch(ex => {
    console.error(ex);
  });
  ```

  **```sendTransaction```**

  ``` Javascript
  // Send payment transaction
  const config = {
    amount: 1,
    order_no: '',
    _timestamp: 12312,
    _signature: '',
    seller: '',
    pay_asset: ''
  };
  moonGamingInstance.sendTransaction(config).then(data => {
    // Transaction Result
    console.log(data);
  }).catch(ex => {
    console.error(ex);
  });
  ```
  **config Parameter：**

  | Name|description|Is it required | Constraint |
  | --- | --- | --- | --- |
  | amount | trade amount | Y |  greater than 0 |
  | order_no | order no | Y | Each submission cannot be repeated, alphanumeric combination, and the length does not exceed 36 digits |
  | _timestamp | when order return _timestamp | Y | N |
  | _signature | when order return _signature | Y | N |
  | seller | If it is a transaction type, the wallet address of the seller needs to be passed | N | If it is a transaction type, the seller's wallet address needs to be passed |
  | pay_asset | pay mode | Y | CFX，cMOON，FC |

  **Return Value data Brief：**

  | Name | Description |
  | --- | --- |
  | order_no | Order no |
  | txid | transaction hash |


  **```depositProp```**

  ``` Javascript
  // 挂机
  const config = {
    order_no: '',
    _timestamp: 12312,
    _signature: '',
    token_id: '',
    hero_id: '',
  };
  moonGamingInstance.depositProp(config).then(data => {
    // 交易结果
    console.log(data);
  }).catch(ex => {
    console.error(ex);
  });
  ```
  **config Parameter：**

  | Name|Description|Is it required | Constraint |
  | --- | --- | --- | --- |
  | order_no |Order No | y | Each submission cannot be repeated, alphanumeric combination, and the length does not exceed 36 digits |
  | _timestamp | _Timestamp returned after the order is placed | Y | No |
  | _signature | _Signature returned after order | Y | No |
  | token_id | lock nft token id | yes | - |
  | hero_id | the hero id | yes | - |

  **Return Value data Brief：**

  | Name | Description |
  | --- | --- |
  | order_no | order no |
  | txid |  transaction hash |


  **```releaseProp```**

  ``` Javascript
  //  unlock
  const config = {
    order_no: '',
    _timestamp: 12312,
    _signature: '',
    token_id: ''
    hero_id: '',
  };
  moonGamingInstance.releaseProp(config).then(data => {
    // transaction result
    console.log(data);
  }).catch(ex => {
    console.error(ex);
  });
  ```
  **config Parameter：**

  | Name|description|Is it required | Constraint |
  | --- | --- | --- | --- |
  | order_no |Order No | y | Each submission cannot be repeated, alphanumeric combination, and the length does not exceed 36 digits |
  | _timestamp | _Timestamp returned after the order is placed | Y | No |
  | _signature | _Signature returned after order | Y | No |
  | token_id | lock nft token id | yes | - |
  | hero_id | the hero id | yes | - |

  **Return Value data Brief：**

  | Name | Description |
  | --- | --- |
  | order_no | order no |
  | txid |  transaction hash |


  ------------

  ### SDK error code list and definition

  Examples of all catch Error objects:：

  ``` Javascript
  {
    code: 'Error Code',
    msg:'error description information',
    desc:'Detailed description information or some auxiliary troubleshooting information'
  }
  ```

  **Error Code Brief：**

  | Value | Description |
  | --- | --- |
  | 1 | Configuration parameter error |
  | 2 | Interface request error |
  | 3 | Non-custom throw error, logic exception |
  | 10001 | Wallet environment detection failed, not installed |
  | 10002 | The wallet environment failed to initialize and the lock is not unlocked |
  | 10003 | User is not authorized |
  | 10004 | The user cancels the operation, such as sign to cancel, sendTransaction to cancel |
  | 10005 | User openid verification failed, please call sign again, such as sendTransaction method |
  | 10006 | The user has not created a wallet |
  | 10007 | The wallet address has not been activated |
  | 10008 | Insufficient user balance |
  | 10009 | Duplicate staking |

  ------------

  ### Download

  **SDK** download
  - moongaming-js-sdk  0.0.1 [download](http://jdgjfile-1251031594.file.myqcloud.com/2c52542498a9557566e726e482f59b55.zip)

  **Conflux wallet**
  - Conflux Portal： https://portal.conflux-chain.org
  - MoonSwap： https://moonswap.fi/app
