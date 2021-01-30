export function getCache(key) {
  let result = window.localStorage && window.localStorage.getItem(key);
  if (result) {
    try {
      result = JSON.parse(result);
    } catch (ex) {
      // console.error(ex)
    }
  }
  return result;
}

export function setCache(key, data) {
  if (window.localStorage) {
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (ex) {
      // console.error(ex)
    }
  }
  return false;
}

export function removeCache(key) {
  if (window.localStorage) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (ex) {
      // console.error(ex)
    }
  }
  return false;
}
