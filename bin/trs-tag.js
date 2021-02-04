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
        let tagName;
        let tagMessage
        explorer.search().then( result => {
            if (!result) {
                shell.echo('对不起，没有trs-tag的配置文件, 请尝试使用trs init 命令生成配置文件');
                return;
            }
            config = result.config;
            const envs = config.envs;
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
            if (config.beforeTag) {
                console.log('执行beforeTag钩子');
                let r =shell.exec(`${config.beforeTag}`);
                if (r.stderr) {
                    console.log(r.stderr);
                }
            }
            if(args['-s']) {
                var inquirer = require('inquirer');
                let envList = Object.keys(envs)
                inquirer.prompt([ { 
                    type: 'list', 
                    name: 'env', 
                    message: '请选择要打tag的环境', 
                    choices: envList 
                }]).then((answers) => {
                    tagPrefix = envs[answers.env];
                    console.log('正在fetch远程仓库，请稍等...');
                    shell.exec(`git fetch`,{ silent:true});
                    let r = shell.exec(`git tag -l "${tagPrefix}*" --sort=-v:refname | head -n 1`, { silent: true });
                    if (!r.code && r.stdout) {
                        console.log(`${answers.env} 环境的上一个tag是：${r.stdout}`);
                    }
                    return inquirer.prompt([{
                        type: 'input',
                        name: 'version',
                        message: '请输入版本号',
                        default: version
                    }])
                }).then((answers) => { 
                    tagName  = tagPrefix + answers.version;
                    if (config.versionFilePath.length) {
                        console.log(config.versionFilePath);
                        console.log('将替换以下文件中的全局版本号');
                        for(let i = 0; i < config.versionFilePath.length; i++) {
                            console.log(config.versionFilePath[i]);
                        }
                        console.log('全局版本替换标识为：', config.versionFieldReg);
                        console.log('正在替换工程代码中的版本号,请稍等...');
                        shell.sed('-i',config.versionFieldReg, tagName, config.versionFilePath);
                        console.log('替换完毕，准备提交');
                        shell.exec(`git add .`, { silent: true});
                        shell.exec(`git commit -m "${config.versionCommitMsg}"`, { silent: true});
                        console.log('提交完毕');
                    }
                    return inquirer.prompt([
                        {
                            type: 'input',
                            name: 'tagMessage',
                            message: '请输入tag描述信息',
                            default: tagPrefix + answers.version
                        }
                    ]);
                }).then((answers) => {
                    let r = shell.exec(`git tag | grep "${tagName}"`);
                    if (!r.code && r.stdout && r.stdout === tagName) {
                        return Promise.reject('该tag已经存在');
                    } else {
                        tagMessage = answers.tagMessage;
                        let cr = shell.exec(`git tag -a ${tagName} -m ${tagMessage}`,{ silent: true });
                        if (!cr.code) {
                            console.log(`成功创建tag： ${tagName}`);
                            if (config.afterTag) {
                                console.log('执行afterTag钩子');
                                let r = shell.exec(`${config.afterTag}`);
                                if (r.stderr) {
                                    console.log(r.stderr);
                                }
                            }
                            return inquirer.prompt([{
                                type: 'confirm',
                                name: 'isPush',
                                message: '是否将tag推送到远程仓库？'
                            }]);
                        } else {
                            return Promise.reject('创建tag出错');
                        }
                    }
                }).then((answers) => {
                    if (answers.isPush) {
                        return inquirer.prompt([{
                            type: 'input',
                            name: 'remote',
                            message: '请输入远程仓库名称',
                            default: 'origin'
                        }])
                    } else {
                        return Promise.reject('');
                    }
                }).then((answers) => {
                    shell.exec(`git push ${answers.remote} ${tagName}`);
                }).catch((err) => {
                    console.log(err);
                });
            } else {
                let envKey = args['--env'] || 'dev';
                tagPrefix = envs[envKey];
                tagName = tagPrefix + version;
                tagMessage = args['--msg'] || `${tagName}`;
                var r = shell.exec(`git tag -a ${tagName} -m ${tagMessage}`);
                if (r.code === 0) {
                    console.log(`成功创建tag： ${tagName}`);
                    if (config.afterTag) {
                        console.log('执行afterTag钩子');
                        let r = shell.exec(`${config.afterTag}`);
                        if (r.stderr) {
                            console.log(r.stderr);
                        }
                    }
                    if (args['--push']){
                        let remoteRepo = args['--remote'] || 'origin';
                        shell.exec(`git push ${remoteRepo} ${tagName}`);
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
