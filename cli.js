var ndj = require('ndjson')
var archive = require('./')

archive.searchStream(process.argv[2])
  .pipe(archive.detailsStream())
  .pipe(ndj.serialize())
  .pipe(process.stdout)