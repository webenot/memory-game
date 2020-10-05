const path = require('path');
const formidable = require('formidable');

module.exports = (req, multiples = true) => new Promise(resolve => {
  const form = formidable({
    multiples,
    uploadDir: path.resolve('tmp'),
    keepExtensions: true,
  });
  form.parse(req, (err, fields, files) => {
    if (err) {
      resolve(req);
    }
    req.files = files;
    req.body = fields;
    resolve(req);
  });
});
