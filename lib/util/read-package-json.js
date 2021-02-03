var fs = require('fs');
var cbDataPackage = getPackageJson();
function getPackageJson() {
  var _packageJson = fs.readFileSync('./package.json');
  return _packageJson ? JSON.parse(_packageJson) : null;
}

module.exports = cbDataPackage