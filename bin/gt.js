#!/usr/bin/env node

const program = require('commander');

program
    .usage('<command>')
    .version(require('../package.json').version)
    .command('ver', '更新版本号')
    .command('tag', '创建tag、推送tag')
    .command('init', '创建配置文件')
    .command('githelp', 'git命令速查')
    .parse(process.argv)