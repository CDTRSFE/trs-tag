var fs = require('fs');


var cbDataPackage = getPackageJson()
function getPackageJson() {
  var _packageJson = fs.readFileSync('./package.json')
  return JSON.parse(_packageJson)
}



module.exports = cbDataPackage