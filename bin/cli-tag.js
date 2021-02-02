var shell = require('shelljs');
let cosmiconfig = require('cosmiconfig');
let explorer = cosmiconfig.cosmiconfig('trs-tag');
var cbDataPackage = require('../lib//util/read-package-json.js')
let config;
let tagPrefix;
const arg = require('arg');

const args = arg({
    '--help': Boolean,
    '--push': Boolean,
    '--remote': String,
    '--env': String,
    '--msg': String,
    '--ver': String,
    '-h': '--help',
});

if (args['--help']) {
    shell.echo(`
        使用方法： trs tag --env=envType --msg=tagMessage --ver=version --push --remote=origin 
        envType: 环境类型，需要在配置文件中配置类型及相应tag前缀,默认为‘dev’
        tagMessage：tag描述信息, 默认为tag名称
        version： x.x.x：自定义tag版本号，如 1.1.1， 默认为package.json中的version字段值
        --push: 是否推送远程，如不需要，可不传
        origin: 推送到的远程仓库名称，默认值为 origin
    `);
    return;
}

explorer.search().then( result => {
    if (!result) {
        shell.echo('对不起，没有trs-tag的配置文件');
        return;
    }
    config = result.config;
    let envKey = args['--env'] || 'dev';
    tagPrefix = config[envKey];
    let version = args['--ver'] || _getPackageVersion();
    let tagMessage = args['--msg'] || `${tagPrefix + version}`;
    var r = shell.exec(`git tag -a ${tagPrefix + version} -m ${tagMessage}`);
    if (r.code === 0) {
        console.log(`成功创建tag： ${tagPrefix + version}`);
        if (args['--push']){
            let remoteRepo = args['--remote'] || 'origin';
            shell.exec(`git push ${remoteRepo} ${tagPrefix + version}`);
        }
    }
}, err => {
    console.log('读取配置文件出错：');
    console.log(err);
});


function _getPackageVersion() {
    return cbDataPackage.version
  }
