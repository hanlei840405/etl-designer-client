<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" active-color="primary" active-bg-color="grey-3" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.tableUpdate.tabBasic')" />
        <q-tab name="lookup" :label="$t('form.tableUpdate.tabLookupCondition')" />
        <q-tab name="field" :label="$t('form.tableUpdate.tabField')" />
        <q-tab name="runningConfig" :label="$t('form.tableUpdate.tabRunningConfig')"/>
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.tableUpdate.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-select class="col-12 col-md-6" outlined v-model="form.datasource" emit-value map-options option-value="id" :options="datasourceOptions" :label="$t('form.tableUpdate.datasource')" clearable hint="">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption v-if="scope.opt.category !== 'jdbc'">host: {{ scope.opt.host }}</q-item-label>
                  <q-item-label caption v-if="scope.opt.category !== 'jdbc'">port: {{ scope.opt.port }}</q-item-label>
                  <q-item-label caption v-if="scope.opt.category === 'jdbc'">url: {{ scope.opt.url }}</q-item-label>
                  <q-item-label caption v-if="scope.opt.category === 'jdbc'">driver: {{ scope.opt.driver }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :label="scope.opt.category" color="primary"/>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-input class="col-12 col-md-6" outlined v-model="form.schemaName" :label="$t('form.tableUpdate.schema')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.tableName" :label="$t('form.tableUpdate.table')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint="">
            <template v-slot:append>
              <q-btn round dense flat icon="search" @click="loadTables" color="primary"/>
            </template>
          </q-input>
          <q-input class="col-12 col-md-6" outlined type="number" min="1" v-model.number="form.commitSize" :label="$t('form.tableUpdate.commitSize')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.ignoreFlagField" :label="$t('form.tableUpdate.ignoreFlagField')" :disable="form.skipLookup && form.errorIgnore" hint=""/>
          <q-checkbox class="col-12 col-sm-4 col-md-4" outlined v-model="form.useBatchUpdate" :label="$t('form.tableUpdate.useBatch')" hint=""/>
          <q-checkbox class="col-12 col-sm-4 col-md-4" outlined v-model="form.skipLookup" :label="$t('form.tableUpdate.skipLookup')" hint=""/>
          <q-checkbox class="col-12 col-sm-4 col-md-4" outlined v-model="form.errorIgnore" :disable="form.skipLookup" :label="$t('form.tableUpdate.ignoreLookupError')" hint=""/>
        </q-tab-panel>
        <q-tab-panel name="lookup">
          <q-table :data="form.searchMappingData" :columns="searchMappingColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.tableUpdate.tableField')">
            <template v-slot:top-right>
              <q-btn size="sm" outline color="primary" icon="add" @click="addSearchMapping"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteSearchMapping(props)"></q-btn>
                </q-td>
                <q-td key="target" :props="props">
                  {{ props.row.target }}
                  <q-popup-edit v-model="props.row.target" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.target" :options="targetFields"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="condition" :props="props">
                  {{ props.row.condition }}
                  <q-popup-edit v-model="props.row.condition" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.condition" :options="conditions"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="source" :props="props">
                  {{ props.row.source }}
                  <q-popup-edit v-model="props.row.source" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.source" :options="sourceFields" @new-value="createSourceField" use-input/>
                  </q-popup-edit>
                </q-td>
                <q-td key="source2" :props="props">
                  {{ props.row.source2 }}
                  <q-popup-edit v-model="props.row.source2" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.source2" :options="sourceFields" @new-value="createSourceField" use-input/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.fieldMappingData" :columns="fieldMappingColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.tableUpdate.tableField')">
            <template v-slot:top-right>
              <q-btn-dropdown split outline icon="add" color="primary" @click="addFieldMapping">
                <q-list>
                  <q-item clickable v-close-popup @click="appendDiffFieldMapping">
                    <q-item-section>
                      <q-item-label>{{ $t('button.append') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="addAllFieldMapping">
                    <q-item-section>
                      <q-item-label>{{ $t('button.addAll') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="clearAndAddFieldMapping">
                    <q-item-section>
                      <q-item-label>{{ $t('button.removeAndAdd') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteFieldMapping(props)"></q-btn>
                </q-td>
                <q-td key="target" :props="props">
                  {{ props.row.target }}
                  <q-popup-edit v-model="props.row.target" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.target" :options="targetFields"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="source" :props="props">
                  {{ props.row.source }}
                  <q-popup-edit v-model="props.row.source" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.source" :options="sourceFields"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined color="primary" v-model.number="form.parallel" :label="$t('form.tableUpdate.threads')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
    <q-dialog v-model="selectTables.mode">
      <q-card style="width: 100vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.tableUpdate.datasource') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section class="row items-center q-pb-none">
          <q-tree :nodes="selectTables.data" node-key="id" @lazy-load="loadColumns" @update:selected="initOutputTable" :selected.sync="selectTables.name"/>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-form>
  </div>
</template>

<script>
import { fetchDatasourceList } from 'src/service/base/DatasourceService'
import { structure } from 'src/service/kettle/PreviewService'
import { mdiGlasses, mdiTableLarge } from '@quasar/extras/mdi-v5'

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'UniqueRowsMeta', 'UniqueRowsByHashSetMeta', 'SetValueFieldMeta']
export default {
  name: 'UpdateMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        datasource: null,
        schemaName: null,
        tableName: null,
        ignoreFlagField: null,
        commitSize: 200,
        useBatchUpdate: false,
        skipLookup: false,
        errorIgnore: false,
        searchMappingData: [],
        fieldMappingData: [],
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
      searchMappingColumns: [
        { name: 'operate', label: this.$t('form.tableUpdate.columnOperate'), filed: 'operate', align: 'right', headerStyle: 'width: 20px' },
        { name: 'target', label: this.$t('form.tableUpdate.columnTargetField'), field: 'target', align: 'left', headerStyle: 'width: 150px;' },
        { name: 'condition', label: this.$t('form.tableUpdate.columnCondition'), field: 'condition', align: 'left', headerStyle: 'width: 100px;' },
        { name: 'source', label: this.$t('form.tableUpdate.columnSourceField'), field: 'source', align: 'left', headerStyle: 'width: 150px;' },
        { name: 'source2', label: this.$t('form.tableUpdate.columnSourceField2'), field: 'source2', align: 'left', headerStyle: 'width: 150px;' }
      ],
      fieldMappingColumns: [
        { name: 'operate', label: this.$t('form.tableUpdate.columnOperate'), filed: 'operate', align: 'right', headerStyle: 'width: 20px' },
        { name: 'target', label: this.$t('form.tableUpdate.columnTargetField'), field: 'target', align: 'left', headerStyle: 'width: 150px;' },
        { name: 'source', label: this.$t('form.tableUpdate.columnSourceField'), field: 'source', align: 'left', headerStyle: 'width: 150px;' }
      ],
      state: false,
      datasourceOptions: [],
      sourceFields: [],
      targetFields: [],
      conditions: ['=', '=~NULL', '<>', '<', '<=', '>', '>=', 'LIKE', 'BETWEEN', 'IS NULL', 'IS NOT NULL'],
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
      this.form.searchMappingData = []
      this.form.fieldMappingData = []
      this.targetFields = []
    },
    loadTables () {
      const vm = this
      if (!vm.form.datasource) {
        vm.$q.notify({
          position: 'top',
          message: vm.$t('message-select-datasource'),
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
    initOutputTable (target) {
      const vm = this
      const tableInfo = target.replace('t_', '').split('.')
      if (tableInfo.length === 2) {
        vm.form.schemaName = tableInfo[0]
        vm.form.tableName = tableInfo[1]
      } else {
        vm.form.tableName = tableInfo[0]
      }
      vm.form.searchMappingData = []
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
    addSearchMapping () {
      this.form.searchMappingData.push({
        target: null,
        condition: null,
        source: null,
        source2: null
      })
    },
    deleteSearchMapping (props) {
      this.form.searchMappingData.splice(props.rowIndex, 1)
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
    createSourceField (val, done) {
      if (val.length > 0) {
        if (!this.sourceFields.includes(val)) {
          this.sourceFields.push(val)
        }
        done(val, 'toggle')
      }
    },
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form
      })
    }
  },
  computed: {
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
        if (step.ext !== undefined && step.ext !== 'undefined' && IGNORE_REPEAT_WARNING_META.indexOf(step.type) < 0) {
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
        title: vm.$t('message.error.default'),
        message: this.$t('message.error.duplicateSourceField')
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
    fetchDatasourceList({
      id: root.projectId,
      ignoreStatus: false
    }).then(res => {
      res.data.forEach(ele => {
        vm.datasourceOptions.push({
          id: ele.id,
          label: ele.name,
          category: ele.category,
          host: ele.host,
          port: ele.port,
          url: ele.url,
          driver: ele.driver
        })
      })
    })
    this.initTargetFields()
  }
}
</script>
