# ETL CLIENT (client)

etl client

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Lint the files
```bash
yarn lint
# or
npm run lint
```

### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://v1.quasar.dev/quasar-cli/quasar-conf-js).

# Nxin Data Integration # 

基于Pentaho Data Integration产品(kettle)二次开发，将图形化设计由C/S架构升级为B/S架构，重写50余种常用组件

支持关系型数据库、NoSQL数据库、网络服务、文件操作等，可视化设计实现数据或流的提取、转换、加载全流程化处理

支持数据看板全生命周期管理，看板模型元数据在线设计、报表图形模板在线设计、报表数据实时更新、报表布局自由排版

## 工程结构

* **interface:**
  提供web-server与worker集群通信所依赖的数据结构
* **kettle-export:**
  依赖Pentaho Data Integration的jar包及数据库驱动包
* **web-server:**
  在线设计服务集群
* **worker:**
  任务调度集群，实现ETL执行及其他定时任务
* **client:**
  前端客户端页面，前端工程地址：https://gitee.com/team-designer/etl-designer-client

构建及部署
--------------

系统使用MySql数据库，数据库初始化执行init.sql及quartz.sql

Java工程使用Maven命令构建

前端工程使用Nodejs命令构建


## 环境要求
* Maven, version 3+
* Java JDK 8

## 编译

后端基于Maven的工程结构，使用下面命令编译

```
$ mvn clean install -DskipTests
```

前端基于Nodejs的工程结构，使用quasar(https://quasar.dev)命令编译

```
$ quasar build
```

开发环境使用如下命令编译

```
$ quasar dev
```

## 功能简介

###  基础数据

####  工程管理

一切业务处理的顶端入口，ETL脚本的设计、发布、回滚等，数据看板相关业务的设计等都需要先有工程模块，

同时工程模块可绑定使用者，用户经绑定后可以看到同模块下的数据源、服务器信息、ETL脚本数据及数据看板信息

<img src="pic/工程.png" width="400" height="240">

####  数据源管理

所有ETL运行时依赖的数据库、数据看板依赖的数据库均在本模块下维护，系统自带支持MySql，Oracle，PostgreSql，支持用户扩展其他数据库产品

<img src="pic/数据库.png" width="400" height="240">

####  FTP服务器管理

所有ETL运行时依赖的FTP服务器，均在本模块下维护，例如导出的excel、csv数据等

<img src="pic/FTP.png" width="400" height="240">

####  字典管理

系统运行时依赖的配置数据

<img src="pic/字典.png" width="400" height="240">

###  系统管理

####  权限申请

用户通过权限申请功能，可加入其他工程模块，访问工程下的敏感资源（包含数据源、服务器、报表等，注：任何工程下的敏感资源，需再次申请资源的操作权限），权限申请有过期限制，超期后，权限会自动回收

<img src="pic/申请.png" width="400" height="240">

####  权限管理

资源所有者可主动添加资源的访问者及访问级别（读/读写）

<img src="pic/授权.png" width="400" height="240">

####  用户管理

新增及维护用户

<img src="pic/用户.png" width="400" height="240">

###  ETL管理

####  在线设计

用户通过可视化设计模块，完成ETL转换及任务的在线开发及调试，并将脚本更新为可发布状态

#####  目录管理

通过创建目录，将同意业务的多个脚本文件聚合在一起

<img src="pic/ETL在线设计1.png" width="400" height="240">

#####  Trans(转换)设计

数据转换的核心组件，用于对数据进行清洗、转换和整合

是ETL工具的核心功能模块，通过定义多个步骤（Step）实现复杂的数据处理流程

<img src="pic/ETL在线设计2.png" width="400" height="240">

#####  Job(任务)设计

用于定义整个数据处理流程的高级组件，包含多个作业项（Job Entry），可控制转换的执行逻辑和调度任务

通过图形化界面整合多个转换步骤（Transformation），支持定时执行、日志监控等功能，实现复杂的数据处理流程自动化

<img src="pic/ETL在线设计3.png" width="400" height="240">

####  脚本调试

通过调试日志，可以发现并处理设计过程中的缺陷，为数据处理提供质量保障

<img src="pic/ETL在线设计4.png" width="400" height="240">

####  脚本发布

用户通过该模块，可将“可发布“状态的脚本完成发布操作，发布动作完成后，【worker】工程会根据设定的执行频率定时执行ETL过程

<img src="pic/脚本发布.png" width="400" height="240">

###  任务管理

通过采集【worker】集群执行的任务清单，按照批或流分类进行管理

####  批处理任务管理

任务被【worker】工程调度执行后，用户可在该模块查看任务的执行情况，包括执行日志，调度时间等信息，并可在该模块对任务操作暂停、下线等

<img src="pic/批处理管理1.png" width="400" height="240">
<br/>
<br/>
<img src="pic/批处理管理2.png" width="400" height="240">

####  流处理任务管理

该模块功能与【批处理任务管理】相同，唯一区别为该模块管理的为实时数据处理，即任务进程为阻塞式执行，实时等待处理通过消息队列传输的数据

<img src="pic/流处理管理.png" width="400" height="240">

####  任务子进程管理

任务执行出现CPU或内存异常，需要终止任务时，可在该模块进行操作，该操作仅终止正在执行的当次任务，不影响后续任务的调度

<img src="pic/任务子进程管理.png" width="400" height="240">

###  BI分析

####  报表图形

集成Apache Echarts组件，提供饼状图、柱状图、折线图、散点图等图形模板，为不同业务提供图形支持

####  模板设计

使用freemarker脚本语言，生成echarts图形所必须的配置项

<img src="pic/报表图形1.png" width="400" height="240">

####  预览

在样例数据处填入演示数据，完成图形预览操作，方便报表设计套用时，直观的展示图形

<img src="pic/报表图形2.png" width="400" height="240">

####  模型管理

提供模型元数据维护及模型转成数据库表的功能，通过规范的元数据设计，降低用户进行数据统计分析时的难度

<img src="pic/模型管理1.png" width="400" height="240">

模型转换为数据库表，生成DDL：

<img src="pic/模型管理2.png" width="400" height="240">

####  报表设计

通过该模块，用户可将统计模型通过合适的图形模板展现出来，并可在线预览

<img src="pic/报表1.png" width="400" height="240">

在线预览:

<img src="pic/报表2.png" width="400" height="240">

####  布局管理

通过该模块，用户可任意选择多个报表自由组合拼装成数据看板页面，并通过生成的URL在线阅览

<img src="pic/布局管理.png" width="400" height="240">

用户可自由缩放、拖拽报表大小及位置，最终组合成完成的数据看板

####  数据看板

访问由布局管理模块生成的看板URL，可实时查看报表数据

<img src="pic/数据看板.png" width="400" height="240">

##  技术架构图

![system.jpg](pic/system.jpg)

###  二次开发

#### 开发依赖

- redis

  缓存找回密码的动态验证码

  为web-server与worker通信提供管道服务

- ftp服务

  需连接ftp服务器，用于存放etl运行的脚本，worker执行脚本时，会从ftp服务器拉取最新文件

  windows开启ftp/sftp功能：安装openSSH工具，下载地址：https://github.com/powershell/win32-openssh/releases 或https://pan.baidu.com/s/12TCh9a3YevUOpVLVrx2VWg?pwd=65xh

  macos开启ftp/sftp功能：https://blog.csdn.net/King_zj/article/details/125991856

####  数据库支持

- 在字典管理中，找到数据源字典项，将需要支持的数据源在此进行维护
- 在kettle-export工程引入驱动包

通过以上两步即可完成新增数据源的支持

####  KETTLE组件

- web-server工程，在com.nxin.framework.converter.kettle包下，根据新增组件的类型，选择job或transform目录添加新的插件责任链，并在TransformConvertFactory.java或JobConvertFactory.java类中进行注册
- client工程，在component\etl目录下，根据新增组件的类型，选择job或transform目录添加新的插件表单vue文件，并在pages\etl\CanvasCom.vue文件中引入该vue文件，并在components集合中注册该插件

##  联系方式
- 邮箱 

  jesse.18@163.com

- 微信 

  <img src="pic/身份二维码.jpg" width="200" height="200">

## 初始登录演示账号

用户名: jesse.18@163.com

密码: 123456