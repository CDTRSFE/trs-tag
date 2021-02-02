var shell = require('shelljs');
const arg = require('arg');
const args = arg({
    '--help': Boolean,
    '--type': String,
    '-h': '--help',
    '-t': '--type',
});

if (args['--help']) {
    shell.echo(`
        使用方法： trs ver --type=updateType
        updateType: 版本更新类型
            patch: 小版本更新（默认）
            minor: 中版本更新
            major: 大版本更新
            x.x.x：自定义版本号，如 1.1.1
    `);
    return;
}

shell.echo('update package.json.version');

let targetVersion = args['--type'] || 'patch';

var r = shell.exec(`npm version ${targetVersion}`);
if (r.code === 0) {
    var cbDataPackage = require('../lib//util/read-package-json.js')
    let version = _getPackageVersion();
    shell.exec(`git tag -d v${version}`);
}

function _getPackageVersion() {
    return cbDataPackage.version
  }