<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.mail.tabBasic')"/>
        <q-tab name="server" :label="$t('form.mail.tabServer')"/>
        <q-tab name="content" :label="$t('form.mail.tabContent')"/>
        <q-tab name="runningConfig" :label="$t('form.mail.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input outlined class="col-12 col-md-6" v-model="form.name" :label="$t('form.mail.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-select class="col-12 col-md-6" outlined v-model="form.to" :options="sourceFields" :label="$t('form.mail.destionationAddress')" hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.cc" :options="sourceFields" :label="$t('form.mail.cc')" hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.bcc" :options="sourceFields" :label="$t('form.mail.bcc')" hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.fromName" :options="sourceFields" :label="$t('form.mail.senderName')" hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.fromMail" :options="sourceFields" :label="$t('form.mail.senderAddress')" hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.replyTo" :options="sourceFields" :label="$t('form.mail.replyTo')" hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.contact" :options="sourceFields" :label="$t('form.mail.personContact')" hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.phoneNo" :options="sourceFields" :label="$t('form.mail.phoneContact')" hint=""></q-select>
        </q-tab-panel>
        <q-tab-panel class="row q-col-gutter-xs" name="server">
          <q-select class="col-12 col-md-6" outlined v-model="form.smtp" :options="sourceFields" :label="$t('form.mail.stmpAddress')" hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.port" :options="sourceFields" :label="$t('form.mail.stmpPort')" hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.username" :options="sourceFields" :label="$t('form.mail.stmpAuth')" hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.password" :options="sourceFields" :label="$t('form.mail.stmpPassword')" hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.safeMode" :options="safeModes" :disable="!form.useSafeMode" :label="$t('form.mail.stmpSecureConnectionType')" hint=""></q-select>
          <q-checkbox class="col-12 col-md-2" v-model="form.useAuth" :label="$t('form.mail.stmpUseAuth')"/>
          <q-checkbox class="col-12 col-md-2" v-model="form.useSafeMode" :label="$t('form.mail.stmpUseSecureAuth')"/>
        </q-tab-panel>
        <q-tab-panel class="row q-col-gutter-xs" name="content">
          <q-select class="col-12 col-md-6" outlined v-model="form.priority" :options="priorities" :disable="!form.usePriority" :label="$t('form.mail.priority')" hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.important" :options="importants" :disable="!form.usePriority" :label="$t('form.mail.importance')" hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.sensitivity" :options="sensitivities" :disable="!form.usePriority" label="Sensitivity" hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.subject" :options="sourceFields" :label="$t('form.mail.subject')" hint=""></q-select>
          <q-select class="col-12 col-md-6" outlined v-model="form.text" :options="sourceFields" :label="$t('form.mail.comment')" hint=""></q-select>
          <q-checkbox class="col-12 col-md-3" v-model="form.useDate" :label="$t('form.mail.includeDateInMessage')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.onlyText" :label="$t('form.mail.onlySendCommentInBody')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.useHtml" :label="$t('form.mail.useHtmlInBody')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.usePriority" :label="$t('form.mail.managePriority')"/>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined type="number" v-model.number="form.parallel" :label="$t('form.mail.threads')" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'SetValueFieldMeta']
export default {
  name: 'MailMeta',
  data () {
    return {
      tab: 'basic',
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
