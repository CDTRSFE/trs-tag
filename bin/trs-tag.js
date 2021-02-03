var shell = require('shelljs');
var fs = require('fs');
fs.access("./package.json",function(err){
    if(err && err.code == "ENOENT"){
        console.log("未发现package.json文件，请尝试使用 npm init 命令创建")
    } else {
        var cbDataPackage = require('../lib/util/read-package-json.js');
        if (!cbDataPackage.version) {
            console.log('版本号未定义, 程序将退出');
            shell.exit(1);
        }
        let version = cbDataPackage.version;
        let cosmiconfig = require('cosmiconfig');
        let explorer = cosmiconfig.cosmiconfig('trs-tag');
        let config;
        let tagPrefix;
        explorer.search().then( result => {
            if (!result) {
                shell.echo('对不起，没有trs-tag的配置文件');
                return;
            }
            config = result.config;
            const arg = require('arg');
            const args = arg({
                '--help': Boolean,
                '--push': Boolean,
                '--remote': String,
                '--env': String,
                '--msg': String,
                '--ver': String,
                '-s': Boolean,
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
            if(args['-s']) {
                var inquirer = require('inquirer');
                let envList = Object.keys(config);
                let result;
                inquirer.prompt([ { 
                    type: 'list', 
                    name: 'env', 
                    message: '请选择要打tag的环境', 
                    choices: envList 
                }, {
                    type: 'input',
                    name: 'version',
                    message: '请输入版本号',
                    default: version
                }]).then((answers) => { 
                    result = Object.assign({}, answers);
                    return inquirer.prompt([
                        {
                            type: 'input',
                            name: 'tagMessage',
                            message: '请输入tag描述信息',
                            default: config[answers.env] + answers.version
                        }
                    ]);
                }).then((answers) => {
                    let tagName  = config[result.env] + result.version;
                    var r = shell.exec(`git tag -a ${tagName} -m ${answers.tagMessage}`);
                    if (r.code === 0) {
                        console.log(`成功创建tag： ${tagName}`);
                        return inquirer.prompt([{
                            type: 'confirm',
                            name: 'isPush',
                            message: '是否将tag推送到远程仓库？'
                        }]);
                    }
                }).then((answers) => {
                    if (answers.isPush) {
                        return inquirer.prompt([{
                            type: 'input',
                            name: 'remote',
                            message: '请输入远程仓库名称',
                            default: 'origin'
                        }]);
                    }
                }).then((answers) => {
                    let tagName  = config[result.env] + result.version;
                    shell.exec(`git push ${answers.remote} ${tagName}`);
                });
            } else {
                let envKey = args['--env'] || 'dev';
                tagPrefix = config[envKey];
                let tagMessage = args['--msg'] || `${tagPrefix + version}`;
                var r = shell.exec(`git tag -a ${tagPrefix + version} -m ${tagMessage}`);
                if (r.code === 0) {
                    console.log(`成功创建tag： ${tagPrefix + version}`);
                    if (args['--push']){
                        let remoteRepo = args['--remote'] || 'origin';
                        shell.exec(`git push ${remoteRepo} ${tagPrefix + version}`);
                    }
                }
            }
        }, err => {
            console.log('读取配置文件出错：');
            console.log(err);
        });
    }
})

function _getPackageVersion() {
    return cbDataPackage ? cbDataPackage.version : null;
  }
