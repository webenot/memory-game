const fs = require('fs');
const sass = require('node-sass');

require('dotenv').config();

module.exports = sassPath => {
  const splittedUrl = sassPath.split('.');
  const outFile = `${splittedUrl[0]}.css`;
  if (fs.existsSync(sassPath)) {
    try {
      const result = sass.renderSync({
        file: sassPath,
        outputStyle: process.env.NODE_ENV === 'development' ? 'expanded' : 'compressed',
        outFile,
        sourceMap: process.env.NODE_ENV === 'development',
      });
      if (result.css) {
        fs.writeFileSync(outFile, result.css);
      }
      if (result.map) {
        fs.writeFileSync(`${outFile}.map`, result.map);
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};
