<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.jobEntryMail.tabBasic')" />
        <q-tab name="server" :label="$t('form.jobEntryMail.tabServer')" />
        <q-tab name="content" :label="$t('form.jobEntryMail.tabContent')" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.jobEntryMail.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.destination" :label="$t('form.jobEntryMail.destination')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.destinationCc" :label="$t('form.jobEntryMail.destinationCc')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.destinationBCc" :label="$t('form.jobEntryMail.destinationBCc')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.replyAddress" :label="$t('form.jobEntryMail.replyAddress')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.replyName" :label="$t('form.jobEntryMail.replyName')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.replyToAddresses" :label="$t('form.jobEntryMail.replyToAddresses')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.contactPerson" :label="$t('form.jobEntryMail.contactPerson')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.contactPhone" :label="$t('form.jobEntryMail.contactPhone')" hint=""/>
        </q-tab-panel>
        <q-tab-panel class="row q-col-gutter-xs" name="server">
          <q-input class="col-12 col-md-6" outlined v-model="form.server" :label="$t('form.jobEntryMail.server')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.port" :label="$t('form.jobEntryMail.port')" hint=""/>
          <q-checkbox class="col-12 col-md-12" v-model="form.usingAuthentication" :label="$t('form.jobEntryMail.usingAuthentication')"/>
          <q-input class="col-12 col-md-6" outlined v-model="form.authenticationUser" :label="$t('form.jobEntryMail.authenticationUser')" :disable="!form.usingAuthentication" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.authenticationPassword" :label="$t('form.jobEntryMail.authenticationPassword')" :disable="!form.usingAuthentication" hint=""/>
          <q-select class="col-12 col-md-6" outlined v-model="form.secureConnectionType" :options="priorityOptions" :label="$t('form.jobEntryMail.secureConnectionType')" :disable="!form.usingSecureAuthentication" hint=""></q-select>
          <q-checkbox class="col-12 col-md-6" v-model="form.usingSecureAuthentication" :label="$t('form.jobEntryMail.usingSecureAuthentication')"/>
        </q-tab-panel>
        <q-tab-panel class="row q-col-gutter-xs" name="content">
          <q-input class="col-12" outlined v-model="form.subject" :label="$t('form.jobEntryMail.subject')" hint=""/>
          <q-input class="col-12" type="textarea" rows="5" outlined v-model="form.comment" :label="$t('form.jobEntryMail.comment')" hint=""/>
          <q-checkbox class="col-12 col-md-3" v-model="form.includeDate" :label="$t('form.jobEntryMail.includeDate')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.useHTML" :label="$t('form.jobEntryMail.useHTML')"/>
          <q-checkbox class="col-12 col-md-6" v-model="form.includingFiles" :label="$t('form.jobEntryMail.includingFiles')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.onlySendComment" :label="$t('form.jobEntryMail.onlySendComment')"/>
        </q-tab-panel>
      </q-tab-panels>
    </q-form>
  </div>
</template>

<script>

export default {
  name: 'JobEntryMail',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        destination: null,
        destinationCc: null,
        destinationBCc: null,
        replyAddress: null,
        replyName: null,
        replyToAddresses: null,
        contactPerson: null,
        contactPhone: null,
        server: null,
        port: null,
        usingAuthentication: false,
        authenticationUser: null,
        authenticationPassword: null,
        usingSecureAuthentication: false,
        secureConnectionType: null,
        includeDate: false,
        useHTML: false,
        subject: null,
        comment: null,
        includingFiles: false,
        onlySendComment: false,
        parallel: false
      },
      priorityOptions: ['SSL', 'TSL'],
      selectShellDialog: {
        state: false,
        projectId: null,
        parentId: null,
        shells: []
      }
    }
  },
  methods: {
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form
      })
    },
  },
  mounted () {
    const vm = this
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
  }
}
</script>
