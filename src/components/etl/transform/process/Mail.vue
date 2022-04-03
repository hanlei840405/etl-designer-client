<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
              narrow-indicator>
        <q-tab name="main" label="主选项"/>
        <q-tab name="server" label="服务器"/>
        <q-tab name="content" label="邮件正文"/>
        <q-tab name="parameter" label="运行参数"/>
      </q-tabs>
      <q-separator/>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" class="col-8" v-model="form.name" label="步骤名称" lazy-rules
                   :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.to" :options="sourceFields" label="收件人地址"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.cc" :options="sourceFields" label="收件人抄送"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.bcc" :options="sourceFields" label="收件人暗抄"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.fromName" :options="sourceFields" label="发件人姓名"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.fromMail" :options="sourceFields" label="发件人地址"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.replyTo" :options="sourceFields" label="回复"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.contact" :options="sourceFields" label="联系人"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.phoneNo" :options="sourceFields" label="联系电话"></q-select>
        </q-tab-panel>
        <q-tab-panel name="server">
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.smtp" :options="sourceFields" label="smtp地址"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.port" :options="sourceFields" label="端口"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.username" :options="sourceFields" label="用户名"></q-select>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.useAuth" label="用户验证"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.password" :options="sourceFields" label="密码"></q-select>
          <q-checkbox v-model="form.useSafeMode" label="使用安全认证" text-color="cyan-8" color="cyan-8" label-color="cyan-8"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.safeMode" :options="safeModes" :disable="!form.useSafeMode" label="安全连接类型"></q-select>
        </q-tab-panel>
        <q-tab-panel name="content">
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.useDate" label="在邮件中包含日期"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.onlyText" label="只发送邮件正文"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.useHtml" label="邮件正文使用html格式"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.usePriority" label="优先级设置"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.priority" :options="priorities" :disable="!form.usePriority" label="优先级"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.important" :options="importants" :disable="!form.usePriority" label="重要性"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.sensitivity" :options="sensitivities" :disable="!form.usePriority" label="Sensitivity"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.subject" :options="sourceFields" label="主题"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.text" :options="sourceFields" label="正文"></q-select>
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
  name: 'MailMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        to: null,
        cc: null,
        bcc: null,
        fromName: null,
        fromMail: null,
        replyTo: null,
        contact: null,
        phoneNo: null,
        smtp: null,
        port: null,
        username: null,
        useAuth: false,
        password: null,
        useSafeMode: false,
        safeMode: null,
        useDate: false,
        onlyText: false,
        useHtml: false,
        usePriority: false,
        priority: null,
        important: null,
        sensitivity: null,
        subject: null,
        text: null,
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
      safeModes: ['SSL', 'TSL'],
      priorities: ['low', 'normal', 'high'],
      importants: ['low', 'normal', 'high'],
      sensitivities: ['normal', 'personal', 'private', 'confidential'],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
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
  }
}
</script>
