var krpc = require('k-rpc')
var rpc = krpc()
 
var target = new Buffer('aaaabbbbccccddddeeeeffffaaaabbbbccccdddd', 'hex')
 
// query the BitTorrent DHT to find nodes near the target buffer 
rpc.closest(target, {q: 'get_peers', a: {info_hash: target}}, onreply, done)
 
function onreply (message, node) {
  console.log('visited peer', message, node)
}
 
function done () {
  console.log('(done)')
}
