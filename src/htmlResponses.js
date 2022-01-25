const fs = require('fs');// pull in the file system module

// loading some files in
const index = fs.readFileSync(`${__dirname}/../client/client.html`);

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

// making sure we export our newly made response functions
module.exports.getIndex = getIndex;
