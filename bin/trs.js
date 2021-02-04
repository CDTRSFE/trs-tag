#!/usr/bin/env node

const program = require('commander');

program
    .usage('<command> --[env]')
    .version(require('../package.json').version)
    .command('ver', '更新版本号')
    .command('tag', '创建tag、推送tag')
    .command('init', '创建配置文件')
    .command('last', '查看最后一个tag')
    .parse(process.argv)