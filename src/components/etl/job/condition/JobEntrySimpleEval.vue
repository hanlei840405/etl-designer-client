<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
        <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" label="作业名称" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
        <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.mode" :options="modes" label="检验" emit-value map-options></q-select>
        <br/>
        <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.fieldName" label="字段名" v-show="form.mode === 'field'"/>
        <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.variableName" label="变量名" v-show="form.mode === 'variable'"/>
        <br/>
        <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.category" :options="categories" label="类型"></q-select>
        <br/>
        {{form.condition}}
        <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.condition" :options="conditions" emit-value map-options label="成功条件"></q-select>
        <br/>
        <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.value" label="值" v-show="form.condition !== 'between'"/>
        <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.min" label="Min" v-show="form.condition === 'between'"/>
        <br/>
        <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.max" label="Max" v-show="form.condition === 'between'"/>
        <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.success" label="Success when variable set" v-show="form.mode === 'variable'"/>
        <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.parallel" label="后续节点并行进行"/>
    </q-form>
  </div>
</template>

<script>

export default {
  name: 'JobEntrySimpleEval',
  data () {
    return {
      form: {
        name: null,
        mode: 'variable',
        fieldName: null,
        variableName: null,
        category: null,
        success: false,
        condition: null,
        value: null,
        min: null,
        max: null,
        parallel: false
      },
      modes: [
        { value: 'variable', label: '变量' },
        { value: 'field', label: '上一步结果的字段' }
      ],
      categories: ['String', 'Number', 'Date time', 'Boolean'],
      conditions: [
        { value: 'equal', label: '等于' },
        { value: 'different', label: '不等于' },
        { value: 'smaller', label: '小于' },
        { value: 'smallequal', label: '小于等于' },
        { value: 'greater', label: '大于' },
        { value: 'greaterequal', label: '大于等于' },
        { value: 'between', label: '位于区间' }
      ]
    }
  },
  methods: {
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form
      })
    }
  },
  mounted () {
    const vm = this
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
  }
}
</script>
