<template>
  <q-page>
    <q-card flat bordered style="width: 100vw;">
      <q-card-section>
        <div class="text-h6">产品说明</div>
      </q-card-section>

      <q-separator inset />

      <q-card-section class="q-pt-none">
        基于Pentaho data-integration产品二次开发，精选近50种常用组件进行重写，涵盖关系型数据库、网络服务、NoSQL数据库,将图形化设计由C/S架构升级为B/S架构，脱离客户端束缚，随时随地修改脚本,添加定时调度、项目管理、版本控制、发布回滚、日志追踪、性能监控等丰富实用的功能,新恩数造支持MySQL、Oracle、PostgreSQL、SqlServer、DB2等关系型数据库在内的多种数据库。
      </q-card-section>

      <q-card-section class="q-pt-none">
        接入条件：可在公网访问,如部署在阿里云、京东云、腾讯云、华为云等云平台的资源
      </q-card-section>

      <q-card-section class="q-pt-none">
        若系统提示无法连接，可发送<a href="mailto:jesse.18@163.com">邮件联系我们</a>，<br/>
        或联系微信：
        <img src="/images/contact.jpeg" width="80px" height="80px"/>
      </q-card-section>

    </q-card>
    <q-card flat bordered style="width: 100vw;">
      <q-card-section>
        <div class="text-h6">升级公告</div>
      </q-card-section>

      <q-separator inset />

      <q-card-section class="q-pt-none bg-grey-2">
        升级日期：2021-07-08
      </q-card-section>

      <q-card-section class="q-pt-none">
        升级版本号：V1.0.0.1
      </q-card-section>

      <q-card-section class="q-pt-none">
        升级内容：
      </q-card-section>

      <q-card-section class="q-pt-none">
        1、更新系统肤色
      </q-card-section>

      <q-card-section class="q-pt-none">
        2、修改在线设计器标签关闭后重新打开，无法加载原始内容的问题
      </q-card-section>

      <q-card-section class="q-pt-none">
        3、修复异常信息显示
      </q-card-section>

      <q-separator inset />

      <q-card-section class="q-pt-none bg-grey-2">
        升级日期：2021-07-13
      </q-card-section>

      <q-card-section class="q-pt-none">
        升级版本号：V1.0.0.2
      </q-card-section>

      <q-card-section class="q-pt-none">
        升级内容：
      </q-card-section>

      <q-card-section class="q-pt-none">
        1、增加流处理组件：kafka输入、kafka输出、读取流
      </q-card-section>

      <q-card-section class="q-pt-none">
        2、增加任务调度-进程管理功能，可随时中断异常进程
      </q-card-section>

      <q-card-section class="q-pt-none">
        3、优化组件布局、统一组件尺寸
      </q-card-section>

      <q-card-section class="q-pt-none">
        4、修复其他一些已知问题
      </q-card-section>

      <q-separator inset />

      <q-card-section class="q-pt-none bg-grey-2">
        升级日期：2021-07-15
      </q-card-section>

      <q-card-section class="q-pt-none">
        升级版本号：V1.0.0.3
      </q-card-section>

      <q-card-section class="q-pt-none">
        升级内容：
      </q-card-section>

      <q-card-section class="q-pt-none">
        1、增加mongoDB组件：通过etl可将数据批量写入mongo数据库
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex'
}
</script>
<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 250px
</style>
