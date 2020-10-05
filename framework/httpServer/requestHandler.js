const fs = require('fs');

const serializer = require('framework/services/serializer');
const parseBody = require('framework/services/parseBody');
const parseQuery = require('framework/services/parseQuery');
const httpResponse = require('framework/services/httpResponse');
const getContentType = require('framework/services/getContentType');
const loadFiles = require('framework/services/loadFiles');
const normalizeUrl = require('framework/lib/normalizeUrl');
const runSandboxed = require('framework/httpServer/runSandboxed');
const clearFolder = require('framework/services/clearFolder');
const handleStyleRequest = require('framework/httpServer/handleStyleRequest');
const renderPug = require('framework/services/renderPug');

require('dotenv').config();

const requestHandler = async (req, res) => {
  const url = normalizeUrl(req.url);

  // Load static files
  if (url.indexOf('.') !== -1) {
    const splittedUrl = url.split('.');
    const ext = splittedUrl[splittedUrl.length - 1];
    res.setHeader('Process-Id', process.pid);
    const path = `applications/${process.env.CURRENT_APP}/public${url}`;
    if (ext === 'css') {
      const styleBuilded = handleStyleRequest(splittedUrl[0]);
      if (!styleBuilded) {
        httpResponse({
          res,
          url: req.url,
          status: 500,
          method: req.method,
          message: 'Error style building',
        });
        return;
      }
    }
    if (fs.existsSync(path)) {
      const data = fs.readFileSync(path);
      httpResponse({
        res,
        url: req.url,
        status: 200,
        method: req.method,
        message: data,
        headers: { 'Content-Type': getContentType(path) },
      });
    } else {
      httpResponse({
        res,
        url: req.url,
        status: 404,
        method: req.method,
        message: 'File is not found',
      });
    }
    return;
  }

  // Load POST data
  let params;
  if (req.headers['content-type'] &&
    req.headers['content-type'].indexOf('multipart/form-data') !== -1) {
    req = await loadFiles(req);
    params = req.body;
  } else {
    params = await parseBody(req, res);
  }

  // Parse query string
  const query = parseQuery(req.url);

  const request = {
    query,
    body: params,
    render: renderPug,
  };

  // Run sandboxed routes
  try {
    let result = await runSandboxed(url, request);
    if (result === false) {
      const parameters = url.substring(1).split('/');
      const newUrl = url.substring(1).split('/');
      while (!result && newUrl.length > 0) {
        newUrl.splice(newUrl.length - 1, 1);
        const tmpUrl = newUrl.join('/');
        request.params = parameters;
        request.body = params;
        result = await runSandboxed(tmpUrl, request);
      }
      if (!result) {
        result = await runSandboxed('/', request);
      }
    }
    const type = typeof result;
    res.setHeader('Process-Id', process.pid);
    res.end(serializer[type](result, req, res));
  } catch (err) {
    console.error(err);
    httpResponse({
      res,
      url: req.url,
      method: req.method,
      status: 500,
      message: 'Server error',
    });
  } finally {
    if (req.files) {
      clearFolder('tmp');
    }
  }
};

module.exports = requestHandler;
