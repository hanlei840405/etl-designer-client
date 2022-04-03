<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
              narrow-indicator>
        <q-tab name="main" label="主选项"/>
        <q-tab name="parameter" label="运行参数"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" label="步骤名称" lazy-rules
                   :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.datasource" emit-value map-options option-value="id" :options="datasource"
                    label="数据库连接" clearable lazy-rules :rules="[ val => validate(val) || 'datasource is invalid' ]">
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
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.sql" type="textarea" rows="12" label="SQL" lazy-rules
                   :rules="[ val => val && val.length > 0 || 'Please type something']">
          </q-input>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.returnRows" label="返回行数"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.outerJoin" label="外链接"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.variableReplacementActive" label="替换SQL语句里的变量"/>
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]"
                   row-key="name" separator="cell" hide-bottom title="变量">
            <template v-slot:top-right>
              <q-btn-dropdown split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addParameter">
                <q-list>
                  <q-item clickable v-close-popup @click="appendDiffParameter">
                    <q-item-section>
                      <q-item-label>增加新的</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="addAllParameter">
                    <q-item-section>
                      <q-item-label>增加所有</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="clearAndAddParameter">
                    <q-item-section>
                      <q-item-label>清除并增加所有</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                         @click="deleteParameter(props)"></q-btn>
                </q-td>
                <q-td key="field" :props="props">
                  {{ props.row.field }}
                  <q-popup-edit v-model="props.row.field" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.field" :options="sourceFields" v-if="sourceFields.length > 0"/>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.field" v-if="sourceFields.length === 0"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="category" :props="props">
                  {{ props.row.category }}
                  <q-popup-edit v-model="props.row.category" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.category" :options="categories"/>
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
    <q-dialog v-model="selectTables.mode">
      <q-card style="width: 100vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">数据库信息</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section class="row items-center q-pb-none">
          <q-tree :nodes="selectTables.data" node-key="id" @lazy-load="loadColumns" selected-color="cyan-8"
                  :selected.sync="selectTables.name"/>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-form>
  </div>
</template>

<script>
import { fetchAllDatasource } from 'src/service/DatasourceService'
import { structure } from 'src/service/PreviewService'
import { mdiGlasses, mdiTableLarge } from '@quasar/extras/mdi-v5'

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
export default {
  name: 'DatabaseJoinMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        datasource: null,
        sql: null,
        outerJoin: false,
        variableReplacementActive: false,
        returnRows: 0,
        distribute: true,
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
        errorMinRows: 0
      },
      datasource: [],
      sourceFields: [],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      selectTables: {
        mode: false,
        data: [],
        name: null,
        loading: false
      },
      parameterColumns: [
        { name: 'operate', label: '操作', filed: 'operate', align: 'right', headerStyle: 'width: 20px' },
        { name: 'field', label: '参数', field: 'field', align: 'left', headerStyle: 'width: 200px;' },
        { name: 'category', label: '类型', field: 'category', align: 'left', headerStyle: 'width: 200px;' }
      ],
      forbiddenParallel: false
    }
  },
  methods: {
    validate (val) {
      return val != null
    },
    loadTables () {
      const vm = this
      if (!vm.form.datasource) {
        vm.$q.notify({
          position: 'top',
          message: '请先选择数据源',
          color: 'negative'
        })
      } else {
        vm.selectTables.data = []
        vm.$q.loading.show()
        structure({ datasourceId: vm.form.datasource, category: 'db' }).then(res => {
          vm.$q.loading.hide()
          vm.selectTables.mode = true
          res.data.forEach(ele => {
            vm.selectTables.data.push({
              id: 't_' + ele.name,
              label: ele.name,
              lazy: true,
              icon: ele.type === 'TABLE' ? mdiTableLarge : mdiGlasses
            })
          })
        }).catch(err => {
          vm.$q.loading.hide()
          vm.$q.notify({
            position: 'top',
            message: err.data.error,
            color: 'negative'
          })
        })
      }
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
        field: null,
        category: null
      })
    },
    appendDiffParameter () {
      const vm = this
      const items = vm.form.parameters.filter(parameter => vm.sourceFields.indexOf(parameter.field) >= 0)
      const array = vm.sourceFields
      items.forEach(item => {
        array.splice(array.findIndex(i => i === item.field), 1)
      })
      array.forEach(field => {
        this.form.parameters.push({
          field: field,
          category: null
        })
      })
    },
    addAllParameter () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.parameters.push({
          field: field,
          category: null
        })
      })
    },
    clearAndAddParameter () {
      this.form.parameters = []
      this.addAllParameter()
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
