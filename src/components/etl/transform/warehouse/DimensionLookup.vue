<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" active-color="primary" active-bg-color="grey-3" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.dimensionLookup.tabBasic')" />
        <q-tab name="lookup" :label="$t('form.dimensionLookup.tabLookupCondition')" />
        <q-tab name="field" :label="$t('form.dimensionLookup.tabField')" />
        <q-tab name="runningConfig" :label="$t('form.dimensionLookup.tabRunningConfig')"/>
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-4" outlined v-model="form.name" :label="$t('form.dimensionLookup.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-select class="col-12 col-md-4" outlined v-model="form.datasource" emit-value map-options option-value="id" :options="datasourceOptions" :label="$t('form.dimensionLookup.datasource')" clearable hint="">
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
          <q-input class="col-12 col-md-4" outlined v-model="form.schemaName" :label="$t('form.dimensionLookup.schema')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-input class="col-12 col-md-4" outlined v-model="form.tableName" :label="$t('form.dimensionLookup.table')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint="">
            <template v-slot:append>
              <q-btn round dense flat icon="search" @click="loadTables" color="primary"/>
            </template>
          </q-input>
          <q-input class="col-12 col-md-4" outlined type="number" v-model.number="form.commitSize" :label="$t('form.dimensionLookup.commitSize')" min="1" hint=""/>
          <q-checkbox class="col-12 col-md-2" outlined v-model="form.update" :label="$t('form.dimensionLookup.update')" hint=""/>
          <q-checkbox class="col-12 col-md-2" outlined v-model="form.preloadingCache" :label="$t('form.dimensionLookup.preloadingCache')" hint="" :disable="form.update"/>
          <q-input class="col-12 col-md-4" outlined type="number" v-model.number="form.cacheSize" :label="$t('form.dimensionLookup.cacheSize')" :disable="form.preloadingCache" hint="-1: without cache, 0: cache all"/>
          <q-select class="col-12 col-md-4" autofocus outlined v-model="form.key" :options="targetFields" :label="$t('form.dimensionLookup.key')" hint=""/>
          <q-input class="col-12 col-md-4" outlined v-model="form.keyRename" :label="$t('form.dimensionLookup.keyRename')" :disable="form.update" hint=""/>
          <q-select class="col-12 col-md-4" autofocus outlined emit-value map-options v-model="form.keyGenerateType" :options="keyGenerateTypeOptions" :label="$t('form.dimensionLookup.keyGenerateType.default')" hint=""/>
          <q-input class="col-12 col-md-4" outlined v-model="form.sequence" :label="$t('form.dimensionLookup.sequence')" :disable="form.keyGenerateType!=='CREATION_METHOD_SEQUENCE'" hint=""/>
          <q-select class="col-12 col-md-4" autofocus outlined v-model="form.versionField" :options="targetFields" :label="$t('form.dimensionLookup.versionField')" hint="" :disable="!form.update"/>
          <q-select class="col-12 col-md-4" autofocus outlined v-model="form.dateField" :options="sourceFields" :label="$t('form.dimensionLookup.dateField')" hint=""/>
          <q-select class="col-12 col-md-4" autofocus outlined v-model="form.dateFrom" :options="targetFields" :label="$t('form.dimensionLookup.dateFrom')" hint=""/>
          <q-input class="col-12 col-md-4" outlined type="number" v-model.number="form.minYear" :label="$t('form.dimensionLookup.minYear')" hint=""/>
          <q-checkbox class="col-12 col-md-4" outlined v-model="form.useAltStartDate" :label="$t('form.dimensionLookup.useAltStartDate')" hint=""/>
          <q-select class="col-12 col-md-4" autofocus outlined emit-value map-options v-model="form.altStartDate" :options="altStartDateOptions" :label="$t('form.dimensionLookup.altStartDate')" hint="" :disable="!form.useAltStartDate"/>
          <q-select class="col-12 col-md-4" autofocus outlined v-model="form.altStartDateField" :options="targetFields" :label="$t('form.dimensionLookup.altStartDateField')" hint="" :disable="!form.useAltStartDate || (form.useAltStartDate && form.altStartDate!=='4')"/>
          <q-select class="col-12 col-md-4" autofocus outlined v-model="form.dateTo" :options="targetFields" :label="$t('form.dimensionLookup.dateTo')" hint=""/>
          <q-input class="col-12 col-md-4" outlined type="number" v-model.number="form.maxYear" :label="$t('form.dimensionLookup.maxYear')" hint=""/>
        </q-tab-panel>
        <q-tab-panel name="lookup">
          <q-table :data="form.searchMappingData" :columns="searchMappingColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.dimensionLookup.tableField')">
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
                <q-td key="source" :props="props">
                  {{ props.row.source }}
                  <q-popup-edit v-model="props.row.source" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.source" :options="sourceFields" @new-value="createSourceField" use-input/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.fieldMappingData" :columns="fieldMappingColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.dimensionLookup.tableField')">
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
                <q-td key="updateType" :props="props">
                  {{ props.row.updateType }}
                  <q-popup-edit v-model="props.row.updateType" :auto-save="true">
                    <q-select autofocus outlined emit-value map-options v-model="props.row.updateType" :options="updateTypeOptions" :disable="!form.update"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined type="number" v-model.number="form.parallel" :label="$t('form.dimensionLookup.threads')" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
    <q-dialog v-model="selectTables.mode">
      <q-card style="width: 100vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.dimensionLookup.datasource') }}</div>
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
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'SetValueFieldMeta']
export default {
  name: 'DimensionLookupMeta',
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
        update: true,
        preloadingCache: false,
        cacheSize: -1,
        key: null,
        keyRename: null,
        keyGenerateType: null,
        sequence: null,
        versionField: null,
        dateField: null,
        dateFrom: null,
        minYear: 1900,
        maxYear: 2199,
        useAltStartDate: false,
        altStartDate: null,
        altStartDateField: null,
        dateTo: null,
        searchMappingData: [],
        fieldMappingData: [],
        parallel: 1,
        distribute: true
      },
      searchMappingColumns: [
        { name: 'operate', label: this.$t('form.dimensionLookup.columnOperate'), filed: 'operate', align: 'right', headerStyle: 'width: 20px' },
        { name: 'target', label: this.$t('form.dimensionLookup.columnTargetField'), field: 'target', align: 'left', headerStyle: 'width: 150px;' },
        { name: 'source', label: this.$t('form.dimensionLookup.columnSourceField'), field: 'source', align: 'left', headerStyle: 'width: 150px;' }
      ],
      fieldMappingColumns: [
        { name: 'operate', label: this.$t('form.dimensionLookup.columnOperate'), filed: 'operate', align: 'right', headerStyle: 'width: 20px' },
        { name: 'target', label: this.$t('form.dimensionLookup.columnTargetField'), field: 'target', align: 'left', headerStyle: 'width: 150px;' },
        { name: 'source', label: this.$t('form.dimensionLookup.columnSourceField'), field: 'source', align: 'left', headerStyle: 'width: 150px;' },
        { name: 'updateType', label: this.$t('form.dimensionLookup.columnUpdateType'), field: 'updateType', align: 'left', headerStyle: 'width: 150px;' }
      ],
      state: false,
      datasourceOptions: [],
      sourceFields: [],
      targetFields: [],
      selectTables: {
        mode: false,
        data: [],
        name: null,
        loading: false
      },
      forbiddenParallel: false,
      keyGenerateTypeOptions: [
        {label: this.$t('form.dimensionLookup.keyGenerateType.autoInc'), value: 'CREATION_METHOD_AUTOINC'}, 
        {label: this.$t('form.dimensionLookup.keyGenerateType.sequence'), value: 'CREATION_METHOD_SEQUENCE'}, 
        {label: this.$t('form.dimensionLookup.keyGenerateType.max'), value: 'CREATION_METHOD_TABLEMAX'}
      ],
      altStartDateOptions: [
        {label: 'System date', value: '1'}, 
        {label: 'Start date of transformation', value: '2'}, 
        {label: 'Empty (null) value', value: '3'}, 
        {label: 'A column value', value: '4'}
      ],
      updateTypeOptions: [
        {label: 'Insert', value: 0}, 
        {label: 'Update', value: 1}, 
        {label: 'Punch through', value: 2}, 
        {label: 'Date of last insert or update (without stream field as source)', value: 3}, 
        {label: 'Date of last insert (without stream field as source)', value: 4}, 
        {label: 'Date of last update (without stream field as source)', value: 5}, 
        {label: 'Last version (without stream field as source)', value: 6}
      ],
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
      projectId: root.projectId
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
