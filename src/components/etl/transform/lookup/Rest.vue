<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left" narrow-indicator>
        <q-tab name="general" label="基本信息"/>
        <q-tab name="auth" label="鉴权"/>
        <q-tab name="header" label="头信息"/>
        <q-tab name="parameter" label="运行参数"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="general">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" label="步骤名称" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.url" label="URL" :disable="form.urlInStream"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.urlInStream" label="从流里接收URL?" />
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.urlField" :options="sourceFields" label="URL字段" :disable="!form.urlInStream"/>
          <br/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.method" :options="methods" label="Method字段" :disable="form.methodInStream"/>
          <q-checkbox v-model="form.methodInStream" label="从流里接收Method?" text-color="cyan-8" color="cyan-8" label-color="cyan-8" />
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.methodField" :options="sourceFields" label="Method字段" :disable="!form.methodInStream"/>
          <br/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.body" :options="sourceFields" label="BODY"/>
          <br/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.applicationType" :options="applicationTypes" label="Application Type"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.resultFieldName" label="返回字段名称"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.statusFieldName" label="HTTP状态字段"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.costTimeField" label="返回耗时字段"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.responseHeaderField" label="返回头名称"/>
          <br/>
        </q-tab-panel>
        <q-tab-panel name="auth">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.login" label="用户名"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.password" label="密码"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.preemptive" label="优先?" />
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.proxyHost" label="代理主机"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.proxyPort" label="代理域名"/>
          <br/>
        </q-tab-panel>
        <q-tab-panel name="header">
          <q-table :data="form.headers" :columns="headerColumns" :rows-per-page-options="[0]" row-key="field" separator="cell" hide-bottom title="字段">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addHeader"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteHeader(props)"></q-btn>
                </q-td>
                <q-td key="field" :props="props">
                  {{ props.row.field }}
                  <q-popup-edit v-model="props.row.field" :auto-save="true">
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.field"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                  <q-popup-edit v-model="props.row.name" :auto-save="true">
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.name"/>
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
  name: 'RestMeta',
  data () {
    return {
      tab: 'general',
      form: {
        name: null,
        url: null,
        urlInStream: false,
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
      headerColumns: [
        {
          name: 'operate',
          label: '操作',
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: '流中header定义',
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'name',
          label: 'rest请求中的header定义',
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
      if (vm.form.sheet) {
        vm.sheets.push(vm.form.sheet)
      }
    }
    const root = vm.$store.getters['etl/getRoot']
    vm.auto = root.auto
  }
}
</script>
