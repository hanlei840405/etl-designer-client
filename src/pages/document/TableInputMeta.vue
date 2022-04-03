<template>
  <div>
    <h5>表输入</h5>
    <img src="/images/doc/表输入.jpg" width="80%">
    <p>在工具栏选择【输入】-【表输入】，拖拽到画布中，在右侧表单中选择数据源，在SQL编辑区点击<q-icon name="search"/>查看需要查询的表或视图</p>
    <img src="/images/doc/表输入-查看表结构.jpg" width="80%">
    <p>单击需要查询的表，系统会自动生成查询SQL，点击<q-icon name="visibility"/>预览SQL查询到的数据（预览限制10条）</p>
    <img src="/images/doc/表输入-预览.jpg" width="80%">
    <p>如果查询语句依赖与上一个步骤的结果，可以在【从步骤查询】处选择上一步骤，如果查询语句的某些条件需要依赖上一步骤的出参，则勾选允许简易替换，替换SQL语句里的变量， 并勾选执行每一行</p>
    <p>如果需要查询指定数量的数据，则设置【记录设置限制】，0表示不限制.</p>
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
