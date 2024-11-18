<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left"
              narrow-indicator>
        <q-tab name="basic" :label="$t('form.elasticSearchBulk.tabBasic')"/>
        <q-tab name="server" :label="$t('form.elasticSearchBulk.tabServer')"/>
        <q-tab name="field" :label="$t('form.elasticSearchBulk.tabField')"/>
        <q-tab name="runningConfig" :label="$t('form.elasticSearchBulk.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.elasticSearchBulk.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.index" :label="$t('form.elasticSearchBulk.index')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.type" :label="$t('form.elasticSearchBulk.type')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.batchSize" :label="$t('form.elasticSearchBulk.batchSize')" hint=""/>
          <q-select class="col-12 col-md-6" clearable outlined v-model="form.idField" :options="sourceFields" :label="$t('form.elasticSearchBulk.idField')" hint=""/>
          <q-input class="col-12 col-md-3" outlined v-model.number="form.time" :label="$t('form.elasticSearchBulk.batchTimeout')" hint=""/>
          <q-select class="col-12 col-md-3" clearable outlined v-model="form.timeUnit" :options="timeUnits" :label="$t('form.elasticSearchBulk.timeUint')" hint=""/>
          <q-checkbox class="col-12 col-md-3" v-model="form.fromJson" :label="$t('form.elasticSearchBulk.jsonInput')" hint=""/>
          <q-input class="col-12 col-md-3" outlined v-model="form.jsonField" :label="$t('form.elasticSearchBulk.jsonField')" :disable="!form.fromJson" hint=""/>
          <q-checkbox class="col-12 col-md-3" v-model="form.outputRows" :label="$t('form.elasticSearchBulk.outputRows')" hint=""/>
          <q-input class="col-12 col-md-3" outlined v-model="form.outputId" :label="$t('form.elasticSearchBulk.idOutputField')" :disable="!form.outputRows" hint=""/>
          <q-checkbox class="col-12 col-md-3" v-model="form.stopOnError" :label="$t('form.elasticSearchBulk.stopOnError')" hint=""/>
          <q-checkbox class="col-12 col-md-3" v-model="form.overwriteIfExist" :label="$t('form.elasticSearchBulk.overwriteExist')" hint=""/>
        </q-tab-panel>
        <q-tab-panel name="server">
          <q-table :data="form.servers" :columns="serverColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.elasticSearchBulk.tableServerConfig')">
            <template v-slot:top-right>
              <q-btn size="sm" outline color="primary" icon="add" @click="addServer"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteServer(props)"></q-btn>
                </q-td>
                <q-td key="address" :props="props">
                  {{ props.row.address }}
                  <q-popup-edit v-model="props.row.address" :auto-save="true">
                    <q-input autofocus v-model="props.row.address"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="port" :props="props">
                  {{ props.row.port }}
                  <q-popup-edit v-model="props.row.port" :auto-save="true">
                    <q-input autofocus v-model="props.row.port"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
          <q-table :data="form.settings" :columns="settingColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.elasticSearchBulk.tableCopnnectionConfig')">
            <template v-slot:top-right>
              <q-btn size="sm" outline color="primary" icon="add" @click="addSetting"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteSetting(props)"></q-btn>
                </q-td>
                <q-td key="setting" :props="props">
                  {{ props.row.setting }}
                  <q-popup-edit v-model="props.row.setting" :auto-save="true">
                    <q-input autofocus v-model="props.row.setting"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="value" :props="props">
                  {{ props.row.value }}
                  <q-popup-edit v-model="props.row.value" :auto-save="true">
                    <q-input autofocus v-model="props.row.value"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
          <q-card-actions align="right">
            <q-btn :label="$t('button.connect')" outline color="primary" :icon="testBtnIcon" @click="connect"/>
          </q-card-actions>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.mappings" :columns="mappingColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.elasticSearchBulk.tableField')">
            <template v-slot:top-right>
              <q-btn-dropdown split outline color="primary" icon="add" @click="addMapping">
                <q-list>
                  <q-item clickable v-close-popup @click="appendDiffMapping">
                    <q-item-section>
                      <q-item-label>{{ $t('button.append') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="addAllMapping">
                    <q-item-section>
                      <q-item-label>{{ $t('button.addAll') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="clearAndAddMapping">
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
                  <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteMapping(props)"></q-btn>
                </q-td>
                <q-td key="field" :props="props">
                  {{ props.row.field }}
                  <q-popup-edit v-model="props.row.field" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.field" :options="sourceFields" @input="props.row.target = toHump(props.row.field)" @new-value="createSourceField" use-input/>
                  </q-popup-edit>
                </q-td>
                <q-td key="target" :props="props">
                  {{ props.row.target }}
                  <q-popup-edit v-model="props.row.target" :auto-save="true">
                    <q-input autofocus v-model="props.row.target"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined v-model.number="form.parallel" :label="$t('form.elasticSearchBulk.threads')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
    </q-form>
  </div>
</template>

<script>
import { mdiBugOutline } from '@quasar/extras/mdi-v5'
import { testConnection } from 'src/service/kettle/ElasticSearchService'
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'SetValueFieldMeta']
export default {
  name: 'ElasticSearchBulkMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        index: null,
        type: null,
        idField: null,
        batchSize: 50000,
        time: null,
        timeUnit: 'SECONDS',
        stopOnError: true,
        overwriteIfExist: false,
        outputRows: false,
        fromJson: false,
        outputId: null,
        jsonField: null,
        servers: [],
        mappings: [],
        settings: [],
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
      testBtnIcon: mdiBugOutline,
      serverColumns: [
        {
          name: 'operate',
          label: this.$t('form.elasticSearchBulk.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'address',
          label: this.$t('form.elasticSearchBulk.columnAddress'),
          field: 'address',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'port',
          label: this.$t('form.elasticSearchBulk.columnPort'),
          field: 'port',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      mappingColumns: [
        {
          name: 'operate',
          label: this.$t('form.elasticSearchBulk.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.elasticSearchBulk.columnSourceField'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'target',
          label: this.$t('form.elasticSearchBulk.columnTargetField'),
          field: 'target',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      settingColumns: [
        {
          name: 'operate',
          label: this.$t('form.elasticSearchBulk.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'setting',
          label: this.$t('form.elasticSearchBulk.columnSetting'),
          field: 'setting',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'value',
          label: this.$t('form.elasticSearchBulk.columnValue'),
          field: 'value',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      timeUnits: ['NANOSECONDS', 'MICROSECONDS', 'MILLISECONDS', 'SECONDS', 'MINUTES', 'HOURS', 'HOURS', 'DAYS'],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    getCode (key) {
      const value = this.mappings.filter(mapping => mapping.label === key)
      if (value.length > 0) {
        return value[0].code
      }
      return null
    },
    validate (val) {
      return val != null
    },
    toHump (value) {
      return value.toLowerCase().replace(/_(\w)/g, function ($0, $1) {
        return $1.toUpperCase()
      })
    },
    addServer () {
      this.form.servers.push({
        address: null,
        port: null
      })
    },
    deleteServer (props) {
      this.form.servers.splice(props.rowIndex, 1)
    },
    addMapping () {
      this.form.mappings.push({
        field: null,
        target: null
      })
    },
    appendDiffMapping () {
      const vm = this
      const items = vm.form.mappings.filter(parameter => vm.sourceFields.indexOf(parameter.field) >= 0)
      const array = vm.sourceFields
      items.forEach(item => {
        array.splice(array.findIndex(i => i === item.field), 1)
      })
      array.forEach(field => {
        this.form.mappings.push({
          field: field,
          target: null
        })
      })
    },
    addAllMapping () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.mappings.push({
          field: field,
          target: null
        })
      })
    },
    clearAndAddMapping () {
      this.form.mappings = []
      this.addAllMapping()
    },
    deleteMapping (props) {
      this.form.mappings.splice(props.rowIndex, 1)
    },
    addSetting () {
      this.form.settings.push({
        setting: null,
        value: null
      })
    },
    deleteSetting (props) {
      this.form.settings.splice(props.rowIndex, 1)
    },
    connect () {
      const vm = this
      const payload = {
        servers: vm.form.servers,
        settings: vm.form.settings
      }
      testConnection({
        payload: JSON.stringify(payload)
      }).then(res => {
        vm.$q.notify({
          message: vm.$t('message.success.connect', [res.data.name, res.data.numNodes]),
          position: 'top',
          color: 'cyan-8'
        })
      }).catch(err => {
        if (err.status === 10013) {
          vm.$q.notify({
            message: vm.$t('message.error.10013'),
            position: 'top',
            color: 'negative'
          })
        }
      })
    },
    createSourceField (val, done) {
      if (val.length > 0) {
        if (!this.sourceFields.includes(val)) {
          this.sourceFields.push(val)
        }
        done(val, 'toggle')
      }
    },
    submitForm () {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: { sourceFields: [this.form.outputId] }
      })
    }
  },
  mounted () {
    const vm = this
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
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
            vm.sourceFields = ext.sourceFields
            if (vm.form.mappings.length === 0) {
              ext.sourceFields.forEach(field => {
                vm.form.mappings.push({
                  field: field,
                  target: vm.toHump(field)
                })
              })
            }
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
  }
}
</script>
