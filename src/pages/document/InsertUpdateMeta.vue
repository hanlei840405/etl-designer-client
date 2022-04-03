<template>
  <div>
    <h5>插入/更新</h5>
    <img src="/images/doc/插入更新.jpg" width="80%">
    <p>在工具栏选择【输入】-【表输入】，拖拽到画布中，在右侧表单中选择数据源，并编辑查询SQL</p>
    <img src="/images/doc/表输入.jpg" width="80%">
    <p>在工具栏选择【输出】-【插入/更新】，拖拽到画布中，在右侧表单中选择数据源与表信息</p>
    <img src="/images/doc/插入更新.jpg" width="80%">
    <p>在【表输入】组件上拖拽箭头指向【插入/更新】组件，并选择【插入/更新】组件的查询条件，设置查询的条件</p>
    <img src="/images/doc/插入更新-查询条件.jpg" width="80%">
    <p>点击【插入/更新】组件的数据库字段，设置写入目标数据库表的字段信息，点击+按钮添加，点击-按钮删除</p>
    <img src="/images/doc/插入更新-输出.jpg" width="80%">
    <p>如果需要提交脚本运行效率，可以点击运行参数标签，调整执行线程数参数，最小值为1.</p>
    <img src="/images/doc/插入更新-线程.jpg" width="80%">
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
