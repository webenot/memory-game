const fs = require('fs');

const config = require('config');

const buildStyle = require('framework/services/buildStyle');

require('dotenv').config();

module.exports = fileName => {
  const path = `applications/${process.env.CURRENT_APP}/public${fileName}`;
  const sassPath = `${path}.sass`;
  const cssPath = `${path}.css`;
  if (fs.existsSync(cssPath) && process.env.NODE_ENV !== 'development') {
    const stats = fs.lstatSync(cssPath);
    if (stats.ctime.getMilliseconds() < Date.now() - config.styleCacheTime) {
      return buildStyle(sassPath);
    }
  } else if (fs.existsSync(sassPath)) {
    return buildStyle(sassPath);
  }
};
