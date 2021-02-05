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
        使用方法： gt ver --type=updateType
        updateType: 版本更新类型
            patch: 小版本更新（默认）
            minor: 中版本更新
            major: 大版本更新
            x.x.x：自定义版本号，如 1.1.1
    `);
    return;
}

shell.echo('正在更新版本号...');

let targetVersion = args['--type'] || 'patch';

var r = shell.exec(`npm version ${targetVersion}`, { silent: true });

if (r.stderr) {
    console.log(r.stderr);
}

if (r.code === 0) {
    console.log('版本号更新成功,当前版本', r.stdout);
    var cbDataPackage = require('../lib/util/read-package-json.js')
    let version = _getPackageVersion();
    shell.exec(`git tag -d v${version}`, { silent: true });
}

function _getPackageVersion() {
    return cbDataPackage.version
  }