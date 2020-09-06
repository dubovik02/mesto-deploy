const validator = require('validator');

module.exports.checkURL = (url) => {
  if (validator.isURL(url)) {
    return url;
  }
  throw new Error(`${url} is not a valid URL`);
};
