## 客户端安装文件打包

### 安装环境

打包开始前，需要安装下列软件

* `Node` [点击下载](https://nodejs.org/en/download/)
* `Inno Setup`  [点击下载](https://pan.baidu.com/s/1c18kJ0O)

### 克隆打包代码

```shell
git clone http://192.168.1.211/root/client-package.git
```

### 安装依赖

联网环境下，在工程根目录执行

```shell
npm install
```

完成后生成`node_modules` 文件夹，即使该文件夹已经存在，也请再执行一次。


### 修改配置

根据`Inno Setup`安装路径和`Inno Setup`打包配置文件路径的不同

修改`setup`文件夹下的`setup.js` 文件，修改下列2处

```javascript
exports.InnoSetupPath = "D:\\InnoSetup5\\ISCC.exe";

exports.InnoSetupConfig = "E:\\work\\one\\setup\\";
```

`InnoSetupPath` 是`Inno Setup`安装根目录下`ISCC.exe`的绝对路径

`InnoSetupConfig` 是`setup`文件夹的绝对路径

### 拷贝应用代码

将应用代码拷贝到`app`文件夹 下, 需要拷贝`dist`、`data`、`package.json` 。拷贝前最好先删除。

注意确保`package.json`中的配置配置正确，主要是确认`serverPath`

### 生成安装包

在工程根目录执行

```shell
gulp package -name=工程名
```

工程名目前可以填写

`imms`  实施管理系统

`ythpt` 一体化平台

`xlcb` 小类串并

完成后在C盘生成windows安装包。


