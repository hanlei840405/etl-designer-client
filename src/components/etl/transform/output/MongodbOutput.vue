<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.mongodbOutput.tabBasic')"/>
        <q-tab name="option" :label="$t('form.mongodbOutput.tabOption')"/>
        <q-tab name="field" :label="$t('form.mongodbOutput.tabField')"/>
        <q-tab name="index" :label="$t('form.mongodbOutput.tabIndex')"/>
        <q-tab name="runningConfig" :label="$t('form.mongodbOutput.tabRunningConfig')"/>
      </q-tabs>
      <q-separator/>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.mongodbOutput.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.host" :label="$t('form.mongodbOutput.host')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.port" :label="$t('form.mongodbOutput.port')" hint=""/>
          <q-checkbox class="col-12 col-md-6" v-model="form.ssl" :label="$t('form.mongodbOutput.ssl')" hint=""/>
          <q-checkbox class="col-12 col-md-6" v-model="form.replica" :label="$t('form.mongodbOutput.replica')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.authenticateDB" :label="$t('form.mongodbOutput.authDatabase')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.username" :label="$t('form.mongodbOutput.username')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.password" :label="$t('form.mongodbOutput.password')" hint=""/>
          <q-select class="col-12 col-md-6" clearable outlined v-model="form.mechanism" :options="mechanismOptions" :label="$t('form.mongodbOutput.authMechanism')" hint=""/>
          <q-checkbox class="col-12 col-md-6" v-model="form.kerberos" :label="$t('form.mongodbOutput.authKerberos')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.connectTimeout" :label="$t('form.mongodbOutput.connectionTimeout')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.socketTimeout" :label="$t('form.mongodbOutput.socketTimeout')" hint=""/>
        </q-tab-panel>
        <q-tab-panel class="row q-col-gutter-xs" name="option">
          <q-select class="col-12 col-md-6" clearable outlined v-model="form.database" :options="databaseNames" :label="$t('form.mongodbOutput.database')" hint="">
            <template v-slot:append>
              <q-btn round dense flat icon="autorenew" text-color="cyan-8" @click="loadDBNames"/>
            </template>
          </q-select>
          <q-select class="col-12 col-md-6" clearable outlined v-model="form.collection" :options="collectionNames" :label="$t('form.mongodbOutput.collection')" hint="">
            <template v-slot:append>
              <q-btn round dense flat icon="autorenew" text-color="cyan-8" @click="loadCollections"/>
            </template>
          </q-select>
          <q-input class="col-12 col-md-6" outlined v-model="form.batchInsertSize" :label="$t('form.mongodbOutput.batchInsertSize')" hint=""/>
          <q-checkbox class="col-12 col-md-6" v-model="form.truncate" :label="$t('form.mongodbOutput.truncateCollection')" hint=""/>
          <q-checkbox class="col-12 col-md-6" v-model="form.update" :label="$t('form.mongodbOutput.update')" @click.native="changeUpdateStatus" hint=""/>
          <q-checkbox class="col-12 col-md-6" v-model="form.upSert" :label="$t('form.mongodbOutput.upsert')" :disable="!form.update" hint=""/>
          <q-checkbox class="col-12 col-md-6" v-model="form.modifierUpdate" :label="$t('form.mongodbOutput.modifierUpdate')" :disable="!form.update" @click.native="changeUpdateStatus" hint=""/>
          <q-checkbox class="col-12 col-md-6" v-model="form.multiUpdate" :label="$t('form.mongodbOutput.multiUpdate')" :disable="!form.modifierUpdate" hint=""/>
          <q-select class="col-12 col-md-6" clearable outlined v-model="form.writeCorn" :options="writeCorns" :label="$t('form.mongodbOutput.writeConcern')" hint="">
            <template v-slot:append>
              <q-btn round dense flat icon="autorenew" text-color="cyan-8" @click="loadWriteConcerns"/>
            </template>
          </q-select>
          <q-input class="col-12 col-md-6" outlined v-model="form.writeCornTimeout" :label="$t('form.mongodbOutput.writeTimeout')" hint=""/>
          <q-checkbox class="col-12 col-md-6" v-model="form.journaled" :label="$t('form.mongodbOutput.journaled')" hint=""/>
          <q-select class="col-12 col-md-6" clearable outlined v-model="form.readPreference" :options="readPreferenceOptions" :label="$t('form.mongodbOutput.readPreference')" :disable="!form.modifierUpdate" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.writeRetryTimes" :label="$t('form.mongodbOutput.retryWriteNumber')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.delay" :label="$t('form.mongodbOutput.betweenRetryAttempts')" hint=""/>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-table :data="form.fieldMapping" :columns="fieldMappingColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.mongodbOutput.tableField')">
            <template v-slot:top-right>
              <q-btn-dropdown split outline color="primary" icon="add" @click="addFieldMapping">
                <q-list>
                  <q-item clickable v-close-popup @click="appendDiffParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('button.append') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="addAllParameter">
                    <q-item-section>
                      <q-item-label>{{ $t('button.addAll') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="clearAndAddParameter">
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
                <q-td key="source" :props="props">
                  {{ props.row.source }}
                  <q-popup-edit v-model="props.row.source" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.source" :options="sourceFields" @new-value="createSourceField" use-input/>
                  </q-popup-edit>
                </q-td>
                <q-td key="target" :props="props">
                  {{ props.row.target }}
                  <q-popup-edit v-model="props.row.target" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.target"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="useSourceField" :props="props">
                  {{ props.row.useSourceField }}
                <q-popup-edit v-model="props.row.useSourceField" :auto-save="true">
                  <q-select autofocus outlined v-model="props.row.useSourceField" :options="yesOrNo"/>
                </q-popup-edit>
                </q-td>
                <q-td key="nullValue" :props="props">
                  {{ props.row.nullValue }}
                <q-popup-edit v-model="props.row.nullValue" :auto-save="true">
                  <q-select autofocus outlined v-model="props.row.nullValue" :options="nulValues"/>
                </q-popup-edit>
                </q-td>
                <q-td key="json" :props="props">
                  {{ props.row.json }}
                <q-popup-edit v-model="props.row.json" :auto-save="true">
                  <q-select autofocus outlined v-model="props.row.json" :options="yesOrNo"/>
                </q-popup-edit>
                </q-td>
                <q-td key="match" :props="props">
                  {{ props.row.match }}
                <q-popup-edit v-model="props.row.match" :auto-save="true">
                  <q-select autofocus outlined v-model="props.row.match" :options="yesOrNo"/>
                </q-popup-edit>
                </q-td>
                <q-td key="modifierMode" :props="props">
                  {{ props.row.modifierMode }}
                  <q-popup-edit v-model="props.row.modifierMode" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.modifierMode" :options="modifierModes"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="modifierPolicy" :props="props">
                  {{ props.row.modifierPolicy }}
                  <q-popup-edit v-model="props.row.modifierPolicy" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.modifierPolicy" :options="modifierPolicies"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="index">
          <q-table :data="form.indices" :columns="indexColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.mongodbOutput.tableField')">
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
                  <q-popup-edit v-model="props.row.index" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.index"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="operation" :props="props">
                  {{ props.row.operation }}
                <q-popup-edit v-model="props.row.operation" :auto-save="true">
                  <q-select autofocus outlined v-model="props.row.operation" :options="indexOperations"/>
                </q-popup-edit>
                </q-td>
                <q-td key="unique" :props="props">
                  {{ props.row.unique }}
                <q-popup-edit v-model="props.row.unique" :auto-save="true">
                  <q-select autofocus outlined v-model="props.row.unique" :options="yesOrNo"/>
                </q-popup-edit>
                </q-td>
                <q-td key="sparse" :props="props">
                  {{ props.row.sparse }}
                <q-popup-edit v-model="props.row.sparse" :auto-save="true">
                  <q-select autofocus outlined v-model="props.row.sparse" :options="yesOrNo"/>
                </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined text-color="cyan-8" color="cyan-8" v-model.number="form.parallel" :label="$t('form.mongodbOutput.threads')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
import { collections, dbNames, writeConcerns } from 'src/service/kettle/MongodbService'

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'UniqueRowsMeta', 'UniqueRowsByHashSetMeta']
export default {
  name: 'MongoDbOutputMeta',
  data () {
    return {
      tab: 'basic',
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
          label: this.$t('form.mongodbOutput.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'source',
          label: this.$t('form.mongodbOutput.columnSourceField'),
          field: 'source',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'target',
          label: this.$t('form.mongodbOutput.columnTargetField'),
          field: 'target',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'useSourceField',
          label: this.$t('form.mongodbOutput.columnUsingFieldName'),
          field: 'useSourceField',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'nullValue',
          label: this.$t('form.mongodbOutput.columnNullValue'),
          field: 'nullValue',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'json',
          label: this.$t('form.mongodbOutput.columnIsJson'),
          field: 'json',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'match',
          label: this.$t('form.mongodbOutput.columnMatchFieldForUpdate'),
          field: 'match',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'modifierMode',
          label: this.$t('form.mongodbOutput.columnModifyOperation'),
          field: 'modifierMode',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'modifierPolicy',
          label: this.$t('form.mongodbOutput.columnModifyPolicy'),
          field: 'modifierPolicy',
          align: 'left',
          headerStyle: 'width: 150px;'
        }
      ],
      indexColumns: [
        {
          name: 'operate',
          label: this.$t('form.mongodbOutput.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'index',
          label: this.$t('form.mongodbOutput.columnIndexField'),
          field: 'index',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'operation',
          label: this.$t('form.mongodbOutput.columnIndexOperation'),
          field: 'operation',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'unique',
          label: this.$t('form.mongodbOutput.columnUnique'),
          field: 'unique',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'sparse',
          label: this.$t('form.mongodbOutput.columnSparse'),
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
  }
}
</script>
