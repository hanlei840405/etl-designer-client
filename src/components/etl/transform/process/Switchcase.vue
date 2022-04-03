<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
              narrow-indicator>
        <q-tab name="main" label="主选项"/>
        <q-tab name="parameter" label="运行参数"/>
      </q-tabs>
      <q-separator/>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" label="步骤名称" lazy-rules
                   :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.field" :options="sourceFields" label="switch字段" clearable v-if="sourceFields.length > 0"></q-select>
          <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.field" label="switch字段" v-if="sourceFields.length === 0"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.useStringIn" label="使用字符串包含比较"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.category" :options="categories" label="case值数据类型"></q-select>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.mask" label="case值转换掩码"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.decimalSymbol" label="case值小数点符号"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.groupBy" label="case值分组标志"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.nextStep" :options="nextSteps" label="默认目标步骤" map-options emit-value clearable lazy-rules :rules="[ val => validate(val) || 'field is invalid' ]"></q-select>
          <q-table :data="form.cases" :columns="caseColumns" :rows-per-page-options="[0]" row-key="name"
                   separator="cell" hide-bottom title="条件">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addCase"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                         @click="deleteCase(props)"></q-btn>
                </q-td>
                <q-td key="value" :props="props">
                  {{ props.row.value }}
                  <q-popup-edit v-model="props.row.value" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.value"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="step" :props="props">
                  {{ showLabel(props.row.step) }}
                  <q-popup-edit v-model="props.row.step" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.step" :options="nextSteps" emit-value map-options/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="parameter">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.parallel" label="执行线程数" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
export default {
  name: 'SwitchCaseMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        field: null,
        useStringIn: false,
        category: null,
        mask: null,
        decimalSymbol: null,
        groupBy: null,
        nextStep: null,
        cases: [],
        parallel: 1,
        distribute: true
      },
      caseColumns: [
        {
          name: 'operate',
          label: '操作',
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'value',
          label: '值',
          field: 'value',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'step',
          label: '步骤',
          field: 'step',
          align: 'left',
          headerStyle: 'width: 150px;'
        }
      ],
      sourceFields: [],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      nextSteps: [],
      forbiddenParallel: false
    }
  },
  methods: {
    validate (val) {
      return val != null
    },
    addCase () {
      this.form.cases.push({
        value: null,
        step: null
      })
    },
    deleteCase (props) {
      this.form.cases.splice(props.rowIndex, 1)
    },
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form
      })
    },
    showLabel (val) {
      const steps = this.nextSteps.filter(step => step.value === val)
      if (steps.length > 0) {
        return steps[0].label
      }
      return null
    }
  },
  computed: {
    truncateDisable () {
      return this.form.isPartitioningEnabled
    },
    partitionDisable () {
      return this.form.truncateTable
    },
    partitionItemDisable () {
      return !this.form.isPartitioningEnabled
    },
    ignoreErrorDisable () {
      return this.form.useBatchUpdate
    },
    batchDisable () {
      return this.form.ignoreError
    }
  },
  mounted () {
    const vm = this
    const previousSteps = vm.$store.getters['etl/getPreNodes']
    vm.sourceFields = []
    const replaceFields = []
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach((step, i) => {
        if (i === 0 && FORBIDDEN_NEXT_STEP_PARALLEL.indexOf(step.type) >= 0) {
          vm.forbiddenParallel = true
        }
        if (step.ext !== undefined && step.ext !== 'undefined') {
          const ext = JSON.parse(step.ext)
          if (ext.sourceFields) {
            ext.sourceFields.forEach(field => {
              vm.sourceFields.push(field)
            })
          }
          if (ext.replaceFields) {
            ext.replaceFields.forEach(field => {
              replaceFields.push(field)
            })
          }
        }
      })
    }
    replaceFields.forEach(field => {
      vm.sourceFields.splice(vm.sourceFields.indexOf(field), 1)
    })
    if (new Set(vm.sourceFields).size !== vm.sourceFields.length) {
      vm.$q.dialog({
        dark: true,
        title: '错误',
        message: '来源字段中存在重复名称，组件禁止使用'
      }).onOk(() => {
        this.$emit('propertiesForm', {
          state: true,
          mxCellProperties: this.form,
          ext: {
            sourceFields: []
          }
        })
      })
    }
    const nextSteps = vm.$store.getters['etl/getNextNodes']
    vm.nextSteps = []
    if (nextSteps && nextSteps.length > 0) {
      nextSteps.forEach(step => {
        vm.nextSteps.push({ value: step.value, label: step.title })
      })
    }
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      if (vm.form.name !== mxCellValue.name) {
        vm.form = Object.assign(vm.form, mxCellValue)
      }
    }
  }
}
</script>
