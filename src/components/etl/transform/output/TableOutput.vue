<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
              narrow-indicator>
        <q-tab name="main" label="主选项"/>
        <q-tab name="field" label="数据库字段" :disable="!form.specifies"/>
        <q-tab name="parameter" label="运行参数"/>
      </q-tabs>
      <q-separator/>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" class="col-8" label-color="cyan-8" v-model="form.name" label="步骤名称" lazy-rules
                   :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.datasource" emit-value map-options option-value="id" :options="datasource"
                    label="数据库连接" clearable @input="inputDatasource">
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
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.schemaName" label="目标模式"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.tableName" label="目标表">
            <template v-slot:append>
              <q-btn round dense flat icon="search" @click="loadTables" text-color="cyan-8"/>
            </template>
          </q-input>
          <br/>
          <q-input outlined type="number" min="0" text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.commitSize" label="提交记录数量"/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.truncateTable" :disable="truncateDisable" label="裁剪表"/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.ignoreError" :disable="ignoreErrorDisable" label="忽略插入失败"/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.specifies" label="指定数据库字段"/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.useBatchUpdate" :disable="batchDisable" label="使用批量插入"/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.returningGeneratedKeys" label="返回自增ID"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.generatedKeyField" label="关键字名称"/>
          <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.isPartitioningEnabled" :disable="partitionDisable" label="表分区"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.partitionField" :disable="partitionItemDisable" label="分区字段名"/>
          <q-radio text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.partitionCycle" val="month" :disable="partitionItemDisable"
                   label="按月分区"/>
          <q-radio text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.partitionCycle" val="date" :disable="partitionItemDisable" label="按天分区"/>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-chip square text-color="cyan-8" icon="bookmark" style="width: 100%; margin: 0px;">
            点击添加按钮后，可直接单击单元格编辑
          </q-chip>
          <q-table :data="form.fieldMappingData" :columns="fieldMappingColumns" :rows-per-page-options="[0]"
                   row-key="name" separator="cell" hide-bottom title="字段">
            <template v-slot:top-right>
              <q-btn-dropdown split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addFieldMapping">
                <q-list>
                  <q-item clickable v-close-popup @click="appendDiffFieldMapping">
                    <q-item-section>
                      <q-item-label>增加新的</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="addAllFieldMapping">
                    <q-item-section>
                      <q-item-label>增加所有</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="clearAndAddFieldMapping">
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
                         @click="deleteFieldMapping(props)"></q-btn>
                </q-td>
                <q-td key="target" :props="props">
                  {{ props.row.target }}
                  <q-popup-edit v-model="props.row.target" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.target" :options="targetFields"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="source" :props="props">
                  {{ props.row.source }}
                  <q-popup-edit v-model="props.row.source" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.source" :options="sourceFields" v-if="sourceFields.length > 0"/>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.source" v-if="sourceFields.length === 0"/>
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
                  @update:selected="initOutPutTable" :selected.sync="selectTables.name"/>
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
  name: 'TableOutputMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        datasource: null,
        schemaName: null,
        tableName: null,
        commitSize: 200,
        truncateTable: false,
        ignoreError: false,
        specifies: true,
        isPartitioningEnabled: false,
        partitionField: null,
        partitionCycle: null,
        useBatchUpdate: false,
        returningGeneratedKeys: false,
        generatedKeyField: null,
        fieldMappingData: [],
        parallel: 1,
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
      fieldMappingColumns: [
        {
          name: 'operate',
          label: '操作',
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'target',
          label: '目标表字段',
          field: 'target',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'source',
          label: '来源流字段',
          field: 'source',
          align: 'left',
          headerStyle: 'width: 150px;'
        }
      ],
      sourceFields: [],
      targetFields: [],
      selectTables: {
        mode: false,
        data: [],
        name: null,
        loading: false
      },
      forbiddenParallel: false
    }
  },
  methods: {
    validate (val) {
      return val != null
    },
    inputDatasource (val) {
      if (val) {
        const ds = this.datasource.filter(ele => ele.id === val)
        if (ds) {
          this.form.schemaName = ds[0].schema
        }
      } else {
        this.form.schemaName = null
      }
      this.form.tableName = null
      this.form.fieldMappingData = []
      this.targetFields = []
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
    initOutPutTable (target) {
      const vm = this
      vm.form.tableName = target.replace('t_', '')
      vm.form.fieldMappingData = []
      vm.targetFields = []
      vm.$q.loading.show()
      structure({ datasourceId: vm.form.datasource, category: 'table', name: vm.form.tableName }).then(res => {
        vm.$q.loading.hide()
        res.data.forEach(element => {
          vm.form.fieldMappingData.push({
            target: element.name,
            source: null
          })
          vm.targetFields.push(element.name)
        })
        this.selectTables.mode = false
      }).catch(err => {
        vm.$q.loading.hide()
        vm.$q.notify({
          position: 'top',
          message: err.data.error,
          color: 'negative'
        })
      })
    },
    initTargetFields () {
      const vm = this
      if (vm.form.datasource && vm.form.tableName) {
        vm.targetFields = []
        vm.$q.loading.show()
        structure({ datasourceId: vm.form.datasource, category: 'table', name: vm.form.tableName }).then(res => {
          vm.$q.loading.hide()
          res.data.forEach(element => {
            vm.targetFields.push(element.name)
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
    addFieldMapping () {
      this.form.fieldMappingData.push({
        target: null,
        source: null
      })
    },
    appendDiffFieldMapping () {
      const vm = this
      const items = vm.form.fieldMappingData.filter(mapping => vm.sourceFields.indexOf(mapping.source) >= 0)
      const array = vm.sourceFields
      items.forEach(item => {
        array.splice(array.findIndex(i => i === item.source), 1)
      })
      array.forEach(field => {
        this.form.fieldMappingData.push({
          target: null,
          source: field
        })
      })
    },
    addAllFieldMapping () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.fieldMappingData.push({
          target: null,
          source: field
        })
      })
    },
    clearAndAddFieldMapping () {
      this.form.fieldMappingData = []
      this.addAllFieldMapping()
    },
    deleteFieldMapping (props) {
      this.form.fieldMappingData.splice(props.rowIndex, 1)
    },
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form
      })
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
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      if (vm.form.name !== mxCellValue.name) {
        vm.form = Object.assign(vm.form, mxCellValue)
      }
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
          port: ele.port,
          schema: ele.schemaName
        })
      })
    })
    this.initTargetFields()
  }
}
</script>
