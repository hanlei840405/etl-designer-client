<template>
  <div>
    <h5>ElasticSearch输出</h5>
    <img src="/images/doc/ES输出.jpg" width="80%">
    <p>在工具栏选择【输入】-【ES输出】，拖拽到画布中，在右侧表单中选择数据源，并编辑查询SQL</p>
    <img src="/images/doc/表输入.jpg" width="80%">
    <p>在工具栏选择【输出】-【ES输出】，拖拽到画布中，在右侧表单中设置索引信息，写入策略等</p>
    <img src="/images/doc/ES输出.jpg" width="80%">
    <p>点击【ES输出】组件的服务器配置标签，设置连接地址和用户名密码等信息,点击测试按钮，查看连接是否正常</p>
    <img src="/images/doc/ES输出-服务器.jpg" width="80%">
    <p>点击【ES输出】组件的字段标签，设置写入的字段信息，点击+按钮添加，点击-按钮删除</p>
    <img src="/images/doc/ES输出-字段.jpg" width="80%">
    <p>如果需要提交脚本运行效率，可以点击运行参数标签，调整执行线程数参数，最小值为1.</p>
    <img src="/images/doc/ES输出-线程.jpg" width="80%">
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
