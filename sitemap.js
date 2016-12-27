var saxStream = require('sax').createStream(true, {trim: true})
var hh = require('http-https')
var streamify = require('streamify')
var stream = streamify()
var url = 'https://raw.githubusercontent.com/zrrrzzt/sitemap-to-array/master/test/data/sitemap.xml'

var list = []

function objectFromArray (arr) {
  var obj = {}
  while (arr.length > 0) {
    obj[arr.shift()] = arr.shift()
  }
  return obj
}

saxStream.on("opentag", function (node) {
  if (node.name !== 'urlset' && node.name !== 'sitemapindex') {
    if (node.name === 'url' && list.length > 0 || node.name === 'sitemap' && list.length > 0) {
      console.log(objectFromArray(list))
      list = []
    } else {
      if (node.name !== 'url' && node.name !== 'sitemap') {
          list.push(node.name)
      }
    }
  }
})

saxStream.on("text", function (text) {
  if (list.length > 0) {
      list.push(text)
  }
})

saxStream.on("end", function (node) {
  console.log(objectFromArray(list))
})

hh.get(url, function (response) {
  stream.resolve(response)
})

stream
.pipe(saxStream)
