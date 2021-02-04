var shell = require('shelljs');

var r = shell.exec(`git tag -l "xjzmy-prod-v*" --sort=-v:refname | head -n 1`, { silent: true });

