<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
              narrow-indicator>
        <q-tab name="main" :label="$t('tab-main')"/>
        <q-tab name="option" :label="$t('tab-option')"/>
        <q-tab name="field" :label="$t('tab-field')"/>
        <q-tab name="index" :label="$t('tab-index')"/>
        <q-tab name="runningConfig" :label="$t('tab-running-config')"/>
      </q-tabs>
      <q-separator/>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" class="col-8" v-model="form.name" :label="$t('form-name')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.host" :label="$t('form-host')" />
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.port" :label="$t('form-port')" />
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.ssl" :label="$t('form-ssl')"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.replica" :label="$t('form-replica')"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.authenticateDB" :label="$t('form-auth-database')"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.username" :label="$t('form-username')"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.password" :label="$t('form-password')"/>
          <br/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.mechanism" :options="mechanismOptions" :label="$t('form-auth-mechanism')"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.kerberos" :label="$t('form-auth-kerberos')"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.connectTimeout" :label="$t('form-connection-timeout')"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.socketTimeout" :label="$t('form-socket-timeout')"/>
        </q-tab-panel>
        <q-tab-panel name="option">
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.database" :options="databaseNames" :label="$t('form-database')">
            <template v-slot:append>
              <q-btn round dense flat icon="autorenew" text-color="cyan-8" @click="loadDBNames"/>
            </template>
          </q-select>
          <br/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.collection" :options="collectionNames" :label="$t('form-collection')">
            <template v-slot:append>
              <q-btn round dense flat icon="autorenew" text-color="cyan-8" @click="loadCollections"/>
            </template>
          </q-select>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.batchInsertSize" :label="$t('form-batch-insert-size')" />
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.truncate" :label="$t('form-truncate-collection')"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.update" :label="$t('form-update')" @click.native="changeUpdateStatus"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.upSert" :label="$t('form-upsert')" :disable="!form.update"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.modifierUpdate" :label="$t('form-modifier-update')" :disable="!form.update" @click.native="changeUpdateStatus"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.multiUpdate" :label="$t('form-multi-update')" :disable="!form.modifierUpdate"/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.writeCorn" :options="writeCorns" :label="$t('form-write-concern')">
            <template v-slot:append>
              <q-btn round dense flat icon="autorenew" text-color="cyan-8" @click="loadWriteConcerns"/>
            </template>
          </q-select>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.writeCornTimeout" :label="$t('form-write-timeout')"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.journaled" :label="$t('form-journaled')"/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.readPreference" :options="readPreferenceOptions" :label="$t('form-read-preference')" :disable="!form.modifierUpdate"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.writeRetryTimes" :label="$t('form-retry-write-number')"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.delay" :label="$t('form-between-retry-attempts')"/>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.fieldMapping" :columns="fieldMappingColumns" :rows-per-page-options="[0]"
                   row-key="name" separator="cell" hide-bottom :title="$t('table-title-field')">
            <template v-slot:top-right>
              <q-btn-dropdown split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addFieldMapping">
                <q-list>
                  <q-item clickable v-close-popup @click="appendDiffParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('btn-append') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="addAllParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('btn-add-all') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="clearAndAddParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('btn-remove-add') }}</q-item-label>
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
                <q-td key="source" :props="props">
                  {{ props.row.source }}
                  <q-popup-edit v-model="props.row.source" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.source" :options="sourceFields" v-if="sourceFields.length > 0"/>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.source" v-if="sourceFields.length === 0"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="target" :props="props">
                  {{ props.row.target }}
                  <q-popup-edit v-model="props.row.target" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.target"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="useSourceField" :props="props">
                  {{ props.row.useSourceField }}
                <q-popup-edit v-model="props.row.useSourceField" :auto-save=true>
                  <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.useSourceField" :options="yesOrNo"/>
                </q-popup-edit>
                </q-td>
                <q-td key="nullValue" :props="props">
                  {{ props.row.nullValue }}
                <q-popup-edit v-model="props.row.nullValue" :auto-save=true>
                  <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.nullValue" :options="nulValues"/>
                </q-popup-edit>
                </q-td>
                <q-td key="json" :props="props">
                  {{ props.row.json }}
                <q-popup-edit v-model="props.row.json" :auto-save=true>
                  <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.json" :options="yesOrNo"/>
                </q-popup-edit>
                </q-td>
                <q-td key="match" :props="props">
                  {{ props.row.match }}
                <q-popup-edit v-model="props.row.match" :auto-save=true>
                  <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.match" :options="yesOrNo"/>
                </q-popup-edit>
                </q-td>
                <q-td key="modifierMode" :props="props">
                  {{ props.row.modifierMode }}
                  <q-popup-edit v-model="props.row.modifierMode" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.modifierMode" :options="modifierModes"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="modifierPolicy" :props="props">
                  {{ props.row.modifierPolicy }}
                  <q-popup-edit v-model="props.row.modifierPolicy" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.modifierPolicy" :options="modifierPolicies"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="index">
          <q-table :data="form.indices" :columns="indexColumns" :rows-per-page-options="[0]"
                   row-key="name" separator="cell" hide-bottom :title="$t('table-title-field')">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addIndex"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                         @click="deleteIndex(props)"></q-btn>
                </q-td>
                <q-td key="index" :props="props">
                  {{ props.row.index }}
                  <q-popup-edit v-model="props.row.index" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.index"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="operation" :props="props">
                  {{ props.row.operation }}
                <q-popup-edit v-model="props.row.operation" :auto-save=true>
                  <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.operation" :options="indexOperations"/>
                </q-popup-edit>
                </q-td>
                <q-td key="unique" :props="props">
                  {{ props.row.unique }}
                <q-popup-edit v-model="props.row.unique" :auto-save=true>
                  <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.unique" :options="yesOrNo"/>
                </q-popup-edit>
                </q-td>
                <q-td key="sparse" :props="props">
                  {{ props.row.sparse }}
                <q-popup-edit v-model="props.row.sparse" :auto-save=true>
                  <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.sparse" :options="yesOrNo"/>
                </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined text-color="cyan-8" color="cyan-8" v-model.number="form.parallel" :label="$t('form-number-thread-copies')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
import { collections, dbNames, writeConcerns } from 'src/service/MongodbService'

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
export default {
  name: 'MongoDbOutputMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        host: null,
        port: null,
        ssl: false,
        replica: false,
        authenticateDB: null,
        username: null,
        password: null,
        mechanism: null,
        kerberos: false,
        connectTimeout: null,
        socketTimeout: null,
        database: null,
        collection: null,
        batchInsertSize: '10000',
        truncate: false,
        update: false,
        upSert: false,
        multiUpdate: false,
        modifierUpdate: false,
        writeCorn: null,
        writeCornTimeout: null,
        journaled: false,
        readPreference: null,
        writeRetryTimes: '5',
        delay: '10',
        fieldMapping: [],
        indices: [],
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
      mechanismOptions: ['SCRAM-SHA-1', 'MONGODB-CR'],
      readPreferenceOptions: ['primary', 'primaryPreferred', 'secondary', 'secondaryPreferred', 'nearest'],
      databaseNames: [],
      collectionNames: [],
      writeCorns: [],
      yesOrNo: ['Y', 'N'],
      nulValues: ['Insert NULL', 'Ignore'],
      modifierModes: ['N/A', '$set', '$inc', '$push'],
      modifierPolicies: ['Insert&Update', 'Insert', 'Update'],
      indexOperations: ['Create', 'Drop'],
      fieldMappingColumns: [
        {
          name: 'operate',
          label: this.$t('column-operate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'source',
          label: this.$t('column-source-field'),
          field: 'source',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'target',
          label: this.$t('column-target-field'),
          field: 'target',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'useSourceField',
          label: this.$t('column-using-field-name'),
          field: 'useSourceField',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'nullValue',
          label: this.$t('column-null-value'),
          field: 'nullValue',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'json',
          label: this.$t('column-is-json'),
          field: 'json',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'match',
          label: this.$t('column-match-field-for-update'),
          field: 'match',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'modifierMode',
          label: this.$t('column-modify-operation'),
          field: 'modifierMode',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'modifierPolicy',
          label: this.$t('column-modify-policy'),
          field: 'modifierPolicy',
          align: 'left',
          headerStyle: 'width: 150px;'
        }
      ],
      indexColumns: [
        {
          name: 'operate',
          label: this.$t('column-operate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'index',
          label: this.$t('column-index-field'),
          field: 'index',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'operation',
          label: this.$t('column-index-operation'),
          field: 'operation',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'unique',
          label: this.$t('column-unique'),
          field: 'unique',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'sparse',
          label: this.$t('column-sparse'),
          field: 'sparse',
          align: 'left',
          headerStyle: 'width: 150px;'
        }
      ],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    loadDBNames () {
      const vm = this
      const params = {
        host: vm.form.host,
        port: vm.form.port,
        replica: vm.form.replica,
        authenticateDB: vm.form.authenticateDB,
        mechanism: vm.form.mechanism,
        username: vm.form.username,
        password: vm.form.password,
        kerberos: vm.form.kerberos
      }
      dbNames({
        payload: JSON.stringify(params)
      }).then(res => {
        vm.databaseNames = res.data
      }).catch(err => {
        vm.$q.notify({
          position: 'top',
          message: err.data.error,
          color: 'negative'
        })
      })
    },
    loadCollections () {
      const vm = this
      const params = {
        host: vm.form.host,
        port: vm.form.port,
        replica: vm.form.replica,
        authenticateDB: vm.form.authenticateDB,
        mechanism: vm.form.mechanism,
        username: vm.form.username,
        password: vm.form.password,
        kerberos: vm.form.kerberos,
        database: vm.form.database
      }
      collections({
        payload: JSON.stringify(params)
      }).then(res => {
        vm.collectionNames = res.data
      }).catch(err => {
        vm.$q.notify({
          position: 'top',
          message: err.data.error,
          color: 'negative'
        })
      })
    },
    loadWriteConcerns () {
      const vm = this
      const params = {
        host: vm.form.host,
        port: vm.form.port,
        replica: vm.form.replica,
        authenticateDB: vm.form.authenticateDB,
        mechanism: vm.form.mechanism,
        username: vm.form.username,
        password: vm.form.password,
        kerberos: vm.form.kerberos,
        database: vm.form.database
      }
      writeConcerns({
        payload: JSON.stringify(params)
      }).then(res => {
        vm.writeCorns = res.data
      }).catch(err => {
        vm.$q.notify({
          position: 'top',
          message: err.data.error,
          color: 'negative'
        })
      })
    },
    addFieldMapping () {
      this.form.fieldMapping.push({
        source: null,
        target: null,
        useSourceField: null,
        nullValue: null,
        json: null,
        match: null,
        modifierMode: null,
        modifierPolicy: null
      })
    },
    appendDiffParameter () {
      const vm = this
      const items = vm.form.fieldMapping.filter(parameter => vm.sourceFields.indexOf(parameter.source) >= 0)
      const array = vm.sourceFields
      items.forEach(item => {
        array.splice(array.findIndex(i => i === item.source), 1)
      })
      array.forEach(field => {
        this.form.fieldMapping.push({
          source: field,
          target: null,
          useSourceField: null,
          nullValue: null,
          json: null,
          match: null,
          modifierMode: null,
          modifierPolicy: null
        })
      })
    },
    addAllParameter () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.fieldMapping.push({
          source: field,
          target: null,
          useSourceField: null,
          nullValue: null,
          json: null,
          match: null,
          modifierMode: null,
          modifierPolicy: null
        })
      })
    },
    clearAndAddParameter () {
      this.form.fieldMapping = []
      this.addAllParameter()
    },
    deleteFieldMapping (props) {
      this.form.fieldMapping.splice(props.rowIndex, 1)
    },
    addIndex () {
      this.form.indices.push({
        index: null,
        operation: null,
        unique: null,
        sparse: null
      })
    },
    deleteIndex (props) {
      this.form.indices.splice(props.rowIndex, 1)
    },
    changeUpdateStatus () {
      if (!this.form.update) {
        this.form.upSert = this.form.modifierUpdate = false
      }
      if (!this.form.modifierUpdate) {
        this.form.multiUpdate = false
        this.form.readPreference = null
      }
    },
    submitForm (e) {
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
        title: vm.$t('dialog-title-error'),
        message: this.$t('warning-duplicate-source-field-name')
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
  }
}
</script>
