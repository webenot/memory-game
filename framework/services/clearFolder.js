const fs = require('fs');
const path = require('path');

/**
 * Clear all files in folder
 *
 * @param {string=} dirPath='tmp'
 *
 * @version 1.0.0
 * @author webenot@mail.ua
 */
const clearFolder = (dirPath = 'tmp') => {
  if (fs.existsSync(dirPath)) {
    const stats = fs.lstatSync(dirPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        fs.unlinkSync(path.join(dirPath, file));
      }
    }
  }
};

module.exports = clearFolder;
