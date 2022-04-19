<template>
  <div>
    <h5>MongoDB输出</h5>
    <img src="/images/doc/MongoDB.jpg" width="80%">
    <p>在工具栏选择【输入】-【表输入】，拖拽到画布中，在右侧表单中选择数据源，并编辑查询SQL</p>
    <img src="/images/doc/表输入.jpg" width="80%">
    <p>在工具栏选择【输出】-【MongoDB输出】，拖拽到画布中，在右侧表单中设置数据库地址、端口、用户名密码等</p>
    <img src="/images/doc/MongoDB.jpg" width="80%">
    <p>点击【MongoDB输出】组件的选项标签，选择{{ $t('dialog-title-datasource') }}，集合信息，批次大小，写入策略等</p>
    <img src="/images/doc/MongoDB-选项.jpg" width="80%">
    <p>点击【MongoDB输出】组件的字段标签，设置写入的字段信息，点击+按钮添加，点击-按钮删除</p>
    <img src="/images/doc/MongoDB-字段.jpg" width="80%">
    <p>点击【MongoDB输出】组件的索引标签，设置索引相关配置，点击+按钮添加，点击-按钮删除</p>
    <img src="/images/doc/MongoDB-索引.jpg" width="80%">
    <p>如果需要提交脚本运行效率，可以点击运行参数标签，调整执行线程数参数，最小值为1.</p>
    <img src="/images/doc/MongoDB-线程.jpg" width="80%">
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  }
}
</script>
