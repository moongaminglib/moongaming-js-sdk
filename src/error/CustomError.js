/**
 * CustomError
 */
class CustomError extends Error {
  constructor(code, msg, desc) {
    super(`code:${code}, msg:${msg}`);
    this.code = code;
    this.msg = msg;
    this.desc = desc;
  }

  static generate(err) {
    if (err && err.constructor === CustomError) {
      return err;
    }
    return new CustomError('3', (err && err.message) || '', JSON.stringify(err));
  }
}
export default CustomError;
