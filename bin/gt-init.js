var fs = require('fs');
var inquirer = require('inquirer');
const cpFile = require('cp-file').sync;
const {cwd, exists, pwd, resolve} = require('../lib/util');
let path = '';
path = cwd(path || '.')
const target = file => resolve(path, file)
console.log('将为您初始化trs-tag配置文件');
inquirer.prompt([
    {
        type: 'confirm',
        name: 'isIgnore',
        message: '是否将配置文件加入gitIgnore文件？',
        default: true
    }
])
    .then((answers) => {
        if (answers.isIgnore) {
            fs.appendFile('./.gitignore', '.trs-tagrc', function(){
                console.log('写入忽略成功');
                cpRC();
            });
        } else {
            console.log('不写入忽略');
            cpRC();
        }
    });

function cpRC() {
    const trsTagRC = exists(cwd('template/.trs-tagrc')) || pwd('template/.trs-tagrc');
    cpFile(trsTagRC, target('.trs-tagrc'));
}