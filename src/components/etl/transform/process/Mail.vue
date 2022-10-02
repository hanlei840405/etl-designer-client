<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
              narrow-indicator>
        <q-tab name="main" :label="$t('tab-main')"/>
        <q-tab name="server" :label="$t('tab-server')"/>
        <q-tab name="content" :label="$t('tab-content')"/>
        <q-tab name="runningConfig" :label="$t('tab-running-config')"/>
      </q-tabs>
      <q-separator/>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" class="col-8" v-model="form.name" :label="$t('form-name')" lazy-rules
                   :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.to" :options="sourceFields" :label="$t('form-destionation-address')"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.cc" :options="sourceFields" :label="$t('form-cc')"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.bcc" :options="sourceFields" :label="$t('form-bcc')"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.fromName" :options="sourceFields" :label="$t('form-sender-name')"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.fromMail" :options="sourceFields" :label="$t('form-sender-address')"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.replyTo" :options="sourceFields" :label="$t('form-reply-to')"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.contact" :options="sourceFields" :label="$t('form-person-contact')"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.phoneNo" :options="sourceFields" :label="$t('form-phone-contact')"></q-select>
        </q-tab-panel>
        <q-tab-panel name="server">
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.smtp" :options="sourceFields" :label="$t('form-stmp-address')"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.port" :options="sourceFields" :label="$t('form-stmp-port')"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.username" :options="sourceFields" :label="$t('form-stmp-auth')"></q-select>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.useAuth" :label="$t('form-stmp-use-auth')"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.password" :options="sourceFields" :label="$t('form-stmp-password')"></q-select>
          <q-checkbox v-model="form.useSafeMode" :label="$t('form-stmp-use-secure-auth')" text-color="cyan-8" color="cyan-8" label-color="cyan-8"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.safeMode" :options="safeModes" :disable="!form.useSafeMode" :label="$t('form-stmp-secure-connection-type')"></q-select>
        </q-tab-panel>
        <q-tab-panel name="content">
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.useDate" :label="$t('form-include-date-in-message')"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.onlyText" :label="$t('form-only-send-comment-in-body')"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.useHtml" :label="$t('form-use-html-in-body')"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.usePriority" :label="$t('form-manage-priority')"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.priority" :options="priorities" :disable="!form.usePriority" :label="$t('form-priority')"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.important" :options="importants" :disable="!form.usePriority" :label="$t('form-importance')"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.sensitivity" :options="sensitivities" :disable="!form.usePriority" label="Sensitivity"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.subject" :options="sourceFields" :label="$t('form-subject')"></q-select>
          <br/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.text" :options="sourceFields" :label="$t('form-comment')"></q-select>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.parallel" :label="$t('form-number-thread-copies')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta']
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
