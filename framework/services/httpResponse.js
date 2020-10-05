require('dotenv').config();

module.exports = ({ res, status, method, url, message, headers = {} }) => {
  res.writeHead(status, headers);
  res.end(message);
  if (process.env.NODE_ENV === 'development') {
    let statusString = '';
    switch (parseInt(status / 100)) {
      case 4:
        statusString = `\x1b[91m${status}\x1b[0m`;
        break;
      case 2:
        statusString = `\x1b[32m${status}\x1b[0m`;
        break;
      case 5:
        statusString = `\x1b[31m${status}\x1b[0m`;
        break;
      case 3:
        statusString = `\x1b[36m${status}\x1b[0m`;
        break;
    }
    console.log(
      `${new Date().toISOString()} \x1b[94m${method} \x1b[0m${url} - ${statusString}`,
    );
  }
};
