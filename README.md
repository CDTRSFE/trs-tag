# trs-tag

这是一个用来自动更新版本号|打tag|推送tag的命令行工具

## 安装方法

```
$ npm install trs-tag -g

```

### 更新本工具

```
$ npm update trs-tag -g

```

## 使用方法

### 更新版本号

```
$ trs ver --type=updateType      
```

`updateType`: 版本更新类型

* `patch`: 小版本更新（默认）
* `minor`: 中版本更新
* `major`: 大版本更新
* `x.x.x`：自定义版本号，如 `1.1.1`

### 生成配置文件

```
$trs init
```
### 打tag并推送到远程仓库（origin）

```
$ trs tag --env=envType --msg=tagMessage --ver=version --push --remote=origin
```

* `envType`: 环境类型，需要在配置文件中配置类型及相应tag前缀,默认为‘dev’
* `tagMessage`：`tag`描述信息, 默认为`tag`名称
* `version： x.x.x`：自定义tag版本号，如 `1.1.1`， 默认为`package.json`中的`version`字段值
* `--push`: 是否推送远程，如不需要，可不传
* `origin`: 推送到的远程仓库名称，默认值为 origin

或者，您可以运行：

```
$ trs tag -s
```

此命令将使用交互式命令完成以上各项操作。

#### 配置文件与格式

可预先配置不同环境的tag前缀

##### 配置支持：
* `package.json` 中新增名为 `'trs-tag'` 的属性
* `.trs-tagrc` 配置文件
* `.trs-tagrc.json` 或者 `.trs-tagrc.yaml` 或者 `.trs-tagrc.js` 或 `.trs-tagrc.cjs` 文件
* 遵循 `CommonJS` 模块化规范导出一个对象的 `trs-tag.config.js` 文件 或 `trs-tag.config.cjs` 文件


##### 配置项

```
   {
    "dev": "dev-v", 
    "test": "test-v",
    "prod": "prod-v",
    "beforeTag": "",
    "afterTag": ""
  }

```

  * `dev`: 开发环境tag前缀
  * `test`: 测试环境tag前缀
  * `prod`: 正式环境tag前缀
  * `beforeTag`: 创建tag之前的钩子，可配置shell命令
  * `afterTag`: 创建tag之后的钩子，可配置shell命令
  * 其它自定义环境tag前缀

