var stream = require('stream');

class Transformer extends stream.Transform {

  constructor(options) {
    super({
      readableObjectMode : true,
      writableObjectMode: true
    });
  }

  _transform(chunk, encoding, done) {
    this.push(chunk.email)
    done()
  }

}
