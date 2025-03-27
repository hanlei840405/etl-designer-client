<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.rest.tabBasic')" />
        <q-tab name="auth" :label="$t('form.rest.tabAuth')"/>
        <q-tab name="header" :label="$t('form.rest.tabHeader')"/>
        <q-tab name="runningConfig" :label="$t('form.rest.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.rest.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-select class="col-12 col-md-6" clearable outlined v-model="form.urlField" :options="sourceFields" :label="$t('form.rest.urlField')" hint=""/>
          <q-select class="col-12 col-md-6" clearable outlined v-model="form.method" :options="methods" :label="$t('form.rest.httpMethod')" hint=""/>
          <q-select class="col-12 col-md-6" clearable outlined v-model="form.body" :options="sourceFields" label="BODY" :disable="(form.method !== 'POST' && form.method !== 'PUT' && form.method !== 'PATCH')" hint=""/>
          <q-select class="col-12 col-md-6" clearable outlined v-model="form.applicationType" :options="applicationTypes" label="Application Type" :disable="(form.method !== 'POST' && form.method !== 'PUT' && form.method !== 'PATCH')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.resultFieldName" :label="$t('form.rest.resultFieldName')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.statusFieldName" :label="$t('form.rest.httpStatusField')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.costTimeField" :label="$t('form.rest.responseTimeField')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.responseHeaderField" :label="$t('form.rest.responseHeaderField')" hint=""/>
        </q-tab-panel>
        <q-tab-panel name="auth">
          <q-input class="col-12 col-md-6" outlined v-model="form.login" :label="$t('form.rest.login')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.password" :label="$t('form.rest.password')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.proxyHost" :label="$t('form.rest.proxyHost')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.proxyPort" :label="$t('form.rest.proxyPort')" hint=""/>
          <q-checkbox class="col-12 col-md-6" v-model="form.preemptive" :label="$t('form.rest.preemptive')"/>
        </q-tab-panel>
        <q-tab-panel name="header">
          <q-table :data="form.headers" :columns="headerColumns" :rows-per-page-options="[0]" row-key="field" separator="cell" hide-bottom :title="$t('form.rest.tableField')">
            <template v-slot:top-right>
              <q-btn size="sm" outline color="primary" icon="add" @click="addHeader"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteHeader(props)"></q-btn>
                </q-td>
                <q-td key="field" :props="props">
                  {{ props.row.field }}
                  <q-popup-edit v-model="props.row.field" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.field"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                  <q-popup-edit v-model="props.row.name" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.name"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined type="number" v-model.number="form.parallel" :label="$t('form.rest.threads')" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'SetValueFieldMeta']
export default {
  name: 'RestMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        urlField: null,
        method: 'GET',
        methodInStream: false,
        methodField: null,
        body: null,
        applicationType: 'TEXT PLAIN',
        resultFieldName: null,
        statusFieldName: null,
        costTimeField: null,
        responseHeaderField: null,
        login: null,
        password: null,
        preemptive: false,
        proxyHost: null,
        proxyPort: null,
        headers: [],
        parallel: 1,
        distribute: true
      },
      headerColumns: [
        {
          name: 'operate',
          label: this.$t('form.rest.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.rest.columnField'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'name',
          label: this.$t('form.rest.columnName'),
          field: 'name',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'],
      applicationTypes: ['TEXT PLAIN', 'XML', 'JSON', 'OCTET STREAM', 'FORM URLENCODED', 'ATOM XML', 'SVG XML', 'TEXT XML'],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    addSourceFile () {
      this.form.sourceFileData.push({
        path: null,
        wildcard: null,
        excludeWildcard: null,
        required: null,
        includeChildrenFolder: null
      })
    },
    deleteSourceFile (props) {
      this.form.sourceFileData.splice(props.rowIndex, 1)
    },
    addHeader () {
      this.form.headers.push({
        field: null,
        name: null
      })
    },
    deleteHeader (props) {
      this.form.headers.splice(props.rowIndex, 1)
    },
    submitForm () {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: { sourceFields: [this.form.resultFieldName] }
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
      vm.form = Object.assign(vm.form, mxCellValue)
      if (vm.form.sheet) {
        vm.sheets.push(vm.form.sheet)
      }
    }
  }
}
</script>
