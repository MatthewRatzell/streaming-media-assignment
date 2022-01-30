const fs = require('fs');// pull in the file system module
const path = require('path');

// creating local variables so we can break up this code
let currentStart;
let currentEnd;
let globalStats;

// function that figures out the length of the video and what part of the content is being used
const determineBytesAndSetInfo = (request, response, contentType) => {
  // check to see if we  got a range header if not ignore
  let { range } = request.headers;
  if (!range) {
    range = 'bytes=0';
  }

  // getting our byte range for the file so we dont load more than what we need
  const positions = range.replace(/bytes=/, '').split('-');

  currentStart = parseInt(positions[0], 10);

  const total = globalStats.size;
  // check if we sent end if not assume going all the way

  currentEnd = positions[1] ? parseInt(positions[1], 10) : total - 1;

  if (currentStart > currentEnd) {
    currentStart = currentEnd - 1;
  }

  // this will be how big of a chunk is being sent back in bytes
  const chunksize = (currentEnd - currentStart) + 1;

  // if everything works we want to sent back the 206 error code
  response.writeHead(206, {
    // how much we are sending out of the total
    'Content-Range': `bytes ${currentStart}-${currentEnd}/${total}`,
    // this is either bytes or none
    'Accept-Ranges': 'bytes',
    // how big the chunk is
    'Content-Length': chunksize,
    // its content type
    'Content-Type': `${contentType}`,
  });
};

const createStream = (response, file) => {
  const stream = fs.createReadStream(file, { currentStart, currentEnd });
  stream.on('open', () => {
    stream.pipe(response);
  });
  stream.on('error', (streamErr) => {
    response.end(streamErr);
  });
  // return stream;
};

const getResource = (request, response, filePath, contentType) => {
  // creating our file object, does not load
  const file = path.resolve(__dirname, `${filePath}`);

  // function that checks the file and makes sure its good to go
  fs.stat(file, (err, stats) => {
    // taking this stats variable and putting it into something that can be accessed more easily
    globalStats = stats;
    if (err) {
      if (err.cose === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    determineBytesAndSetInfo(request, response, contentType);

    // handling our stream creation and passing it along to our const
    const stream = createStream(response, file);
    // returning the file
    return stream;
  });
  currentEnd = null;
  currentStart = null;
  globalStats = null;
};


module.exports.getResource = getResource;
