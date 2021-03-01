var fs = require('fs');
exports.fileReplace = function fileReplace(config,tagName){
    const reg =new RegExp(config.reg) ;
    const rep = config.replace;
    const replaceTemplate = rep.replace(/__VERSION__/,`${tagName}`)
    const data = fs.readFileSync(config.path, 'utf-8');
    const str = data.replace(reg,replaceTemplate);
    fs.writeFileSync(config.path,str)
}
