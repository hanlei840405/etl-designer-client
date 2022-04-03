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
          <q-select outlined text-color="cyan-8" color="cyan-8" v-model="form.datasource" emit-value map-options option-value="id" :options="datasource"
                    label="数据库连接" clearable>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section>
                  <q-item-label v-html="scope.opt.label"/>
                  <q-item-label caption>host: {{ scope.opt.host }}</q-item-label>
                  <q-item-label caption>port: {{ scope.opt.port }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :label="scope.opt.category" color="cyan-8"/>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.sql" type="textarea" rows="12" label="SQL"/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.executeEachInputRow" label="执行每一行"/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.executeInOneStatement" label="在同一个statement中执行"/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.variableReplace" label="变量替换"/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.bindParameters" label="绑定参数" :disable="!form.executeEachInputRow"/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.quoteString" label="转为String" :disable="!form.executeEachInputRow"/>
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name"
                   separator="cell" hide-bottom title="字段">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addParameter"/>
            </template>
            <template v-slot:body="props">
              <q-tr>
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                         @click="deleteParameter(props)"></q-btn>
                </q-td>
                <q-td key="parameter" :props="props">
                  {{ props.row.parameter }}
                  <q-popup-edit v-model="props.row.parameter" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.parameter" :options="sourceFields"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="parameter">
          <q-input outlined text-color="cyan-8" color="cyan-8" v-model.number="form.parallel" label="执行线程数" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
import { fetchAllDatasource } from 'src/service/DatasourceService'
import { structure } from 'src/service/PreviewService'

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
export default {
  name: 'ExecSQLMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        datasource: null,
        sql: null,
        executeEachInputRow: false,
        executeInOneStatement: false,
        variableReplace: false,
        bindParameters: false,
        quoteString: false,
        parameters: [],
        parallel: 1,
        errorNext: null,
        errorEnable: false,
        errorCountName: null,
        errorColumnDescription: null,
        errorColumnName: null,
        errorColumnCode: null,
        errorMaxCount: 0,
        errorRate: 0,
        errorMinRows: 0,
        distribute: true
      },
      datasource: [],
      parameterColumns: [
        {
          name: 'operate',
          label: '操作',
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'parameter',
          label: '参数',
          field: 'parameter',
          align: 'left',
          headerStyle: 'width: 150px;'
        }
      ],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    validate (val) {
      return val != null
    },
    loadColumns ({
      node,
      key,
      done,
      fail
    }) {
      const vm = this
      vm.$q.loading.show()
      structure({ datasourceId: vm.form.datasource, category: 'table', name: key.replace('t_', '') }).then(res => {
        vm.$q.loading.hide()
        const children = []
        res.data.forEach(element => {
          children.push({
            id: 'c_' + element.name,
            label: element.name + '【' + element.info + '】',
            selectable: false
          })
        })
        done(children)
      }).catch(err => {
        vm.$q.loading.hide()
        vm.$q.notify({
          position: 'top',
          message: err.data.error,
          color: 'negative'
        })
      })
    },
    addParameter () {
      this.form.parameters.push({
        parameter: null
      })
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    submitForm () {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form
      })
    }
  },
  computed: {
    previewBtnDisable () {
      return this.form.lookupFromStepName !== null || (this.form.sql === null || (this.form.sql !== null && this.form.sql.trim() === '')) || this.form.datasource === null
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
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
    const root = vm.$store.getters['etl/getRoot']
    fetchAllDatasource({
      id: root.projectId,
      ignoreStatus: false
    }).then(res => {
      res.data.forEach(ele => {
        vm.datasource.push({
          id: ele.id,
          label: ele.name,
          category: ele.category,
          host: ele.host,
          port: ele.port
        })
      })
    })
  }
}
</script>
