<template>
  <div class="q-gutter-y-md" style="width: 100%;">
    <q-form>
      <q-tabs v-model="tab" active-color="primary" active-bg-color="grey-3" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.jobEntryFTP.tab.basic')" />
        <q-tab name="remote" :label="$t('form.jobEntryFTP.tab.remote')" />
      </q-tabs>
      <q-tab-panels v-model="tab" animated swipeable vertical transition-prev="jump-up" transition-next="jump-up">
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.jobEntryFTP.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-select class="col-12 col-md-6" outlined v-model="form.existFile" emit-value map-options :options="existFileOptions" :label="$t('form.jobEntryFTP.existFile.default')" clearable hint=""></q-select>
          <q-select class="col-12 col-md-6" :disable="form.includeDate || form.includeTime" outlined v-model="form.dateFormat" :options="formats" :label="$t('form.jobEntryFTP.useDateFormat')" clearable hint=""></q-select>
          <q-checkbox class="col-12 col-md-3" v-model="form.includeDate" :label="$t('form.jobEntryFTP.includeDate')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.includeTime" :label="$t('form.jobEntryFTP.includeTime')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.includeDateInExtension" :label="$t('form.jobEntryFTP.includeDateInExtension')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.appendFilename" :label="$t('form.jobEntryFTP.appendFilename')"/>
          <!-- <q-checkbox class="col-12 col-md-3" v-model="form.activeConnection" :label="$t('form.jobEntryFTP.activeConnection')"/> -->
          <q-checkbox class="col-12 col-md-3" v-model="form.binaryMode" :label="$t('form.jobEntryFTP.binaryMode')"/>
          <q-checkbox class="col-12 col-md-3" v-model="form.parallel" :label="$t('form.jobEntryFTP.parallel')"/>
        </q-tab-panel>
        <q-tab-panel class="row q-col-gutter-xs" name="remote">
          <q-select class="col-12 col-md-6" outlined v-model="form.server" emit-value map-options option-value="id" :options="ftpServerOptions" :label="$t('form.jobEntryFTP.server')" clearable hint="">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>host: {{ scope.opt.host }}</q-item-label>
                  <q-item-label caption>port: {{ scope.opt.port }}</q-item-label>
                  <q-item-label caption>username: {{ scope.opt.username }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-input class="col-12 col-md-6" outlined v-model="form.wildcard" :label="$t('form.jobEntryFTP.wildcard')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.remoteDirectory" :label="$t('form.jobEntryFTP.remoteDirectory')" hint=""/>
          <q-input class="col-12 col-md-3" outlined type="number" v-model.number="form.timeout" :label="$t('form.jobEntryFTP.timeout')" hint=""/>
          <q-select class="col-12 col-md-3" outlined v-model="form.controlEncoding" :options="encodingOptions" :label="$t('form.jobEntryFTP.controlEncoding')" hint=""></q-select>
          <q-input class="col-12 col-md-6" :disable="form.remove" outlined v-model="form.remoteTargetDirectory" :label="$t('form.jobEntryFTP.remoteTargetDirectory')" hint=""/>
          <q-checkbox class="col-12 col-md-3" v-model="form.remove" :label="$t('form.jobEntryFTP.deleteRemoteDirectory')"/>
        </q-tab-panel>
      </q-tab-panels>
    </q-form>
  </div>
</template>

<script>

import { fetchFtpList } from 'src/service/base/FtpService'

export default {
  name: 'JobEntryFTPPUT',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        binaryMode: false,
        timeout: 0,
        controlEncoding: null,
        shellId: null,
        shellName: null,
        wildcard: null,
        remoteDirectory: null,
        move: false,
        remove: false,
        includeDate: false,
        includeTime: false,
        dateFormat: null,
        includeDateInExtension: false,
        existFile: null,
        appendFilename: true,
        parallel: false
      },
      ftpServerOptions: [],
      formats: ['yyyy/MM/dd HH:mm:ss.SSS', 'yyyy/MM/dd HH:mm:ss.SSS XXX', 'yyyy/MM/dd HH:mm:ss', 'yyyy/MM/dd HH:mm:ss XXX', 'yyyyMMddHHmmss', 'yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm:ss XXX',
        'yyyyMMdd', 'MM/dd/yyyy', 'MM/dd/yyyy HH:mm:ss', 'MM-dd-yyyy', 'MM-dd-yyyy HH:mm:ss', 'MM/dd/yy', 'MM-dd-yy', 'dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX', 'yyyy-MM-dd HH:mm:ss.SSS'],
      encodingOptions: ['US-ASCII', 'ISO-8859-1', 'UTF-8', 'UTF-16BE', 'UTF-16LE', 'UTF-16'],
      existFileOptions: [
        {value: '0', label: this.$t('form.jobEntryFTP.existFile.skip')},
        {value: '1', label: this.$t('form.jobEntryFTP.existFile.useUnique')},
        {value: '2', label: this.$t('form.jobEntryFTP.existFile.failure')}
      ],
    }
  },
  methods: {
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form
      })
    },
    icon (category) {
      if (category === '0') {
        return 'folder'
      } else if (category === '1') {
        return 'fullscreen'
      }
        return 'fullscreen_exit'
    },
    color (category) {
      if (category === '0') {
        return 'yellow-7'
      } else if (category === '1') {
        return 'orange-7'
      }
      return 'green-7'
    }
  },
  watch: {
    'form.remove' (val) {
      if (val) {
        this.form.move = false
        this.form.remoteTargetDirectory = null
      }
    }
  },
  mounted () {
    const mxCellValue = this.$store.getters['etl/getMxCellForm']
    const root = this.$store.getters['etl/getRoot']
    if (mxCellValue) {
      this.form = Object.assign(this.form, mxCellValue)
    }
    this.form.shellId = root.id
    fetchFtpList({
      projectId: root.projectId,
      category: 'FTP'
    }).then(res => {
      res.data.forEach(ele => {
        this.ftpServerOptions.push({
          id: ele.id,
          label: ele.name,
          host: ele.host,
          port: ele.port,
          username: ele.username
        })
      })
    })
  }
}
</script>
