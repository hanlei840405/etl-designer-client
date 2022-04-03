<template>
  <div>
    <h5>JSON输出</h5>
    <img src="/images/doc/JSON输出.jpg" width="80%">
    <p>在工具栏选择【输入】-【JSON输出】，拖拽到画布中，在右侧表单中选择数据源，并编辑查询SQL</p>
    <img src="/images/doc/表输入.jpg" width="80%">
    <p>在工具栏选择【输出】-【JSON输出】，拖拽到画布中，在右侧表单中设置返回的字段信息，输出JSON的形式（流/文件/流和文件）,输出条数限制，输出值定义</p>
    <p>一个数据条目的数据行数，0为不受限制，当操作选择文件时，需要定义输出的文件名、扩展名</p>
    <img src="/images/doc/JSON输出.jpg" width="80%">
    <p>点击【JSON输出】组件的字段标签，设置写入的字段信息，点击+按钮添加，点击-按钮删除</p>
    <img src="/images/doc/JSON输出-输出.jpg" width="80%">
    <p>如果需要提交脚本运行效率，可以点击运行参数标签，调整执行线程数参数，最小值为1.</p>
    <img src="/images/doc/JSON输出-线程.jpg" width="80%">
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
