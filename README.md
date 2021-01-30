该文档的目的是让开发者可以快速接入 moongaming-js-sdk，主要包括以下内容：

- 相关环境介绍
- SDK 文件介绍及加载方式
- SDK 初始化
- SDK 关键方法描述
- 错误码列表及释义
- 资源下载

------------

### 相关环境描述

- DApp运行环境

  - Chrome 浏览器 （插件形式支撑）
  - 钱包客户端中的DApp浏览器 （iOS + Android）

- Demo 测试地址

  - 线上： [http://moongaming.demo.moonswap.fi](http://moongaming.demo.moonswap.fi "http://moongaming.demo.moonswap.fi")
  - 线下： [http://moongaming.demo.superlikeapp.com](http://moongaming.demo.superlikeapp.com "http://moongaming.demo.superlikeapp.com")

> 注意：体验线上或线下 Demo，需要切换到钱包对应的网络（TEST_NET, MAIN_NET）

------------

### SDK 文件介绍及加载方式

- SDK文件：
  - ```index.min.js```
  - ```index.html```  Demo 页面

- 加载方式：

  - 将 ```index.min.js``` 复制到项目中，通过 script 加载即可
  - 或直接引入 MoonGaming 提供的 CDN URL加载<br>
  ```//dapp.cdn.static.mmzhuli.com/static/moongaming-js-sdk/index.min.js?t=1611991391```

------------

### SDK 初始化

- 引入 SDK js 文件
- 参考以下代码进行接入

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

- enginConfig 参数：

  | 参数名 | 描述 | 是否必填 | 约束 |
  | --- | --- | --- | --- |
  | chain_type | 公链类型 | 是 | Conflux：17 |
  | test_mode | 是否测试环境 | 否 | 默认为：false，测试时可置为 true |

  > **上线前需将 test_mode 参数设置为 false, 或删除此参数，切记！**


- config 参数：

  | 参数名 | 描述 | 是否必填 | 约束 |
  | --- | --- | --- | --- |
  | app_id | 应用app_id | 是 | 由平台分配 |
  | contract_address  | 链上合约地址 | 是 | 由平台分配 |
  | silent_login  | 是否静默登录 | 否 | 静默登录, 设置1可以不验证签名登录 (须后台先配置参数)|
  | chain_sign_txt  | 签名字符串 | 否 | 链上签名时的字符串 |
  | invite_code  | 邀请码 | 否 | 邀请者的标识 |
  | contract_address_deposit | 挂机合约地址 | 否 | 由平台分配|
  | contract_address_nft | NFT 合约地址 | 否 | 由平台分配 |

------------

### SDK 关键方法描述

- ```sign(config)``` 用户签名
- ```checkOpenId(openid)``` 检测openid是否有效
- ```getAddress()``` 用户钱包地址
- ```getOpenId()``` 用户唯一标识
- ```getBalance()``` 钱包账户余额方法（公链上余额）
- ```sendTransaction(config)``` 发送交易
- ```depositProp(config)``` 挂机
- ```releaseProp(config)``` 取消挂机

**```sign```**

  ```javascript
  const config = { flag_chain: 0 };
  // 游戏第一次打开调用
  moonGamingInstance.sign(config).then(signData => {
    console.log(signData);
  }).catch(ex => {
    console.error(ex);
  });
  ```

  **config 参数：**

  | 参数名 | 描述 | 是否必填 | 约束 |
  | --- | --- | --- | --- |
  | flag_chain | 是否开启链上签名 | 否 | 默认不开启， 1：开启链上签名 |


  **返回值 signData 描述**

  | 名称 | 描述 |
  | --- | --- |
  | openid | 用户 openid，需要将 openid 本地缓存，下次进入游戏需要用 ```checkOpenId(openid)``` 检测是否有效 |
  | _timestamp | unix时间戳 |
  | _signature | 签名串 |


**```checkOpenId```**

```javascript
// 在有缓存 openid 的情况下调用，如果进入 catch，则说明 openid 无效（需要清空当前本地的登录标识，及页面展示的相关用户数据），然后按照签名需求重新调用 sign 方法
moonGamingInstance.checkOpenId(openid).then(() => {
  console.log('success');
}).catch(ex => {
  console.error(ex);
});
```


**```getAddress```**

```javascript
// 获取用户钱包地址
const address = moonGamingInstance.getAddress();
```

**```getOpenId```**

```javascript
// 获取用户唯一标识
const openid = moonGamingInstance.getOpenId();
```

**```getBalance```**

```javascript
// 获取用户钱包余额
moonGamingInstance.getBalance().then(balance => {
  console.log(balance);
}).catch(ex => {
  console.error(ex);
});
```

**```sendTransaction```**

```javascript
// 发送支付交易
const config = {
  amount: 1,
  order_no: '',
  _timestamp: 12312,
  _signature: '',
  seller: '',
  pay_asset: ''
};
moonGamingInstance.sendTransaction(config).then(data => {
  // 交易结果
  console.log(data);
}).catch(ex => {
  console.error(ex);
});
```
**config 参数：**

| 参数名 | 描述 | 是否必填 | 约束 |
| --- | --- | --- | --- |
| amount | 交易金额 | 是 |  大于0 |
| order_no | 订单号 | 是 | 每次提交不可重复，字母数字组合，长度不超过36位 |
| _timestamp | 下单后返回的 _timestamp | 是 | 无 |
| _signature | 下单后返回的 _signature | 是 | 无 |
| seller | 售卖方用户的钱包地址 | 否 | 如果是交易类型，需要传卖出者的钱包地址 |
| pay_asset | 支付方式 | 是 | CFX，cMOON，FC |

**返回值 data 描述：**

| 名称 | 描述 |
| --- | --- |
| order_no | 订单号 |
| txid | 交易流水号 |


**```depositProp```**

```javascript
// 发送支付交易
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
**config 参数：**

| 参数名 | 描述 | 是否必填 | 约束 |
| --- | --- | --- | --- |
| order_no | 订单号 | 是 | 每次提交不可重复，字母数字组合，长度不超过36位 |
| _timestamp | 下单后返回的 _timestamp | 是 | 无 |
| _signature | 下单后返回的 _signature | 是 | 无 |
| token_id | 挂机的NFT编号 | 是 | 无 |
| hero_id | 英雄编号 | 是 | 无 |

**返回值 data 描述：**

| 名称 | 描述 |
| --- | --- |
| order_no | 订单号 |
| txid | 交易流水号 |


**```releaseProp```**

```javascript
// 发送支付交易
const config = {
  order_no: '',
  _timestamp: 12312,
  _signature: '',
  token_id: ''
  hero_id: '',
};
moonGamingInstance.releaseProp(config).then(data => {
  // 交易结果
  console.log(data);
}).catch(ex => {
  console.error(ex);
});
```
**config 参数：**

| 参数名 | 描述 | 是否必填 | 约束 |
| --- | --- | --- | --- |
| order_no | 订单号 | 是 | 每次提交不可重复，字母数字组合，长度不超过36位 |
| _timestamp | 下单后返回的 _timestamp | 是 | 无 |
| _signature | 下单后返回的 _signature | 是 | 无 |
| token_id | 挂机的NFT编号 | 是 | 无 |
| hero_id | 英雄编号 | 是 | 无 |

**返回值 data 描述：**

| 名称 | 描述 |
| --- | --- |
| order_no | 订单号 |
| txid | 交易流水号 |


------------

### SDK 错误码列表及释义

所有```catch```的```Error```对象示例：

```javascript
{
  code: '错误码',
  msg: '错误描述信息',
  desc: '详细描述信息或一些辅助查错信息'
}
```

**错误码描述：**

| 值 | 描述 |
| --- | --- |
| 1 | 配置参数错误 |
| 2 | 接口请求出错 |
| 3 | 非自定义 throw 出错，逻辑异常 |
| 10001 | 钱包环境检测失败，未安装 |
| 10002 | 钱包环境初始化失败，未开锁 |
| 10003 | 用户没有授权 |
| 10004 | 用户取消操作，比如 sign 取消，sendTransaction 取消 |
| 10005 | 用户 openid 校验失败，请重新调用 sign 签名， 比如 sendTransaction 方法 |
| 10006 | 用户还没有创建钱包 |
| 10007 | 钱包地址还没有激活 |
| 10008 | 用户余额不足 |
| 10009 | 抵押重复 |

------------

### 资源下载

**SDK下载**
- moongaming-js-sdk 0.0.1 [下载](http://jdgjfile-1251031594.file.myqcloud.com/2c52542498a9557566e726e482f59b55.zip "下载")

**钱包下载**
- Conflux Portal： https://portal.conflux-chain.org/

**官方钱包下载**
- MoonSwap： https://moonswap.fi/app
