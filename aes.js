var crypto = require('crypto');

var AESCrypt = {};

AESCrypt.decrypt = function(cryptkey, iv, encryptdata) {
    encryptdata = new Buffer(encryptdata, 'base64').toString('binary');

    var decipher = crypto.createDecipheriv('aes-256-cbc', cryptkey, iv),
        decoded  = decipher.update(encryptdata);

    decoded += decipher.final();
    return decoded;
}

AESCrypt.encrypt = function(cryptkey, iv, cleardata) {
    var encipher = crypto.createCipheriv('aes-256-cbc', cryptkey, iv),
        encryptdata  = encipher.update(cleardata);

    encryptdata += encipher.final();
    encode_encryptdata = new Buffer(encryptdata, 'binary').toString('base64');
    return encode_encryptdata;
}

var cryptkey   = crypto.createHash('sha256').update('Nixnogen').digest(),
    iv         = 'a2xhcgAAAAAAAAAA',
    buf        = "Here is some data for the encrypt", // 32 chars
    enc        = AESCrypt.encrypt(cryptkey, iv, buf);
var dec        = AESCrypt.decrypt(cryptkey, iv, enc);

console.warn("encrypt length: ", enc.length);
console.warn("encrypt in Base64:", enc);
console.warn("decrypt all: " + dec);
