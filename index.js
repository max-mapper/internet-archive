var nets = require('nets')
var qs = require('querystring')
var through = require('through2')

module.exports.searchStream = function searchStream(collection) {
  var page = 1
  var readStream = through.obj()
  search(collection, page, readStream)
  return readStream
}

function search(collection, page, stream) {
  var opts = {
    q: 'collection:' + collection,
    'fl[]': 'identifier',
    'sort[]': [ '', '', '' ],
    rows: '50',
    page: page.toString(),
    output: 'json',
    save: 'yes'
  }
  
  var reqUrl = 'http://archive.org/advancedsearch.php?' + qs.stringify(opts)
  nets({ url: reqUrl, json: true}, function(err, res, results) {
    if (err) return stream.destroy(err)
    var start = results.response.start
    var found = results.response.numFound
    var docs = results.response.docs
    docs.forEach(function(result) {
      stream.push(result)
    })
    var hasMore = (start + docs.length) < found
    if (docs.length > 0 && hasMore) return search(collection, ++page, stream)
    stream.end()
  })
}

module.exports.detailsStream = function() {
  var stream = through.obj(function detailWrite(obj, enc, next) {
    var detailsUrl = "https://archive.org/details/" + obj.identifier + "?output=json"
    nets({url: detailsUrl, json: true}, function(err, resp, data) {
      if (err) return stream.destroy(err)
      stream.push(data)
      next()
    })
  })
  return stream
}