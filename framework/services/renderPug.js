const fs = require('fs');
const pug = require('pug');

require('dotenv').config();

module.exports = (template, params) => {
  const templatePath = `applications/${process.env.CURRENT_APP}/views/${template}.pug`;
  if (fs.existsSync(templatePath)) {
    const templateContent = fs.readFileSync(templatePath);
    const fn = pug.compile(templateContent, {
      compileDebug: process.env.NODE_ENV === 'development',
      pretty: process.env.NODE_ENV === 'development',
      basedir: `applications/${process.env.CURRENT_APP}/views/`,
      filename: templatePath,
    });
    return fn(params);
  }

  return '';
};
