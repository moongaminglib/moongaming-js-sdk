
export function setParam(name, value, str) {
  let result = str || window.location.href;
  result += `${result.indexOf('?') >= 0 ? '&' : '?'}${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  return result;
}

/**
 * load script from url
 * @param {String} url
 * @param {String} config.libraryName
 * @param {Boolean} config.addTimestamp
 */
export function loadScript(url, config) {
  const { libraryName, addTimestamp } = config || {};
  const loadUrl = addTimestamp ? setParam('lt', ((new Date()).getTime() / 1000 | 0), url) : url;
  return new Promise((resolve, reject) => {
    const win = window;
    const doc = win.document;
    const tag = 'script';
    const beforeTag = doc.getElementsByTagName(tag)[0];
    const script = doc.createElement(tag);
    script.async = true;
    script.charset = 'UTF-8';
    script.src = loadUrl;
    script.onload = () => {
      if (libraryName) {
        if (typeof win[libraryName] !== 'undefined') {
          resolve(win[libraryName]);
        } else {
          reject(new Error(`init resource error：${loadUrl}，variable 'window.${libraryName}' was not found！`));
        }
      } else {
        resolve({
          success: true,
          loadUrl,
        });
      }
    };
    script.onerror = () => {
      reject(new Error(`load resource error：${loadUrl} `));
    };
    beforeTag.parentNode.insertBefore(script, beforeTag);
  });
}
