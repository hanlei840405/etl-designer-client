<template>
  <div style="width: 100%;">
    <q-form class="row q-col-gutter-xs">
      <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.jobEntrySFTP.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
      <q-select class="col-12 col-md-6" outlined v-model="form.server" emit-value map-options option-value="id" :options="ftpServerOptions" :label="$t('form.jobEntrySFTP.server')" clearable hint="">
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
      <q-select class="col-12 col-md-6" outlined v-model="form.compression" :options="compressionOptions" :label="$t('form.jobEntrySFTP.compressionOptions')" hint=""></q-select>
      <q-input class="col-12 col-md-6" outlined v-model="form.remoteDirectory" :label="$t('form.jobEntrySFTP.remoteDirectory')" hint=""/>
      <q-input class="col-12 col-md-6" outlined v-model="form.wildcard" :label="$t('form.jobEntrySFTP.wildcard')" hint=""/>
      <q-checkbox class="col-12 col-md-3" v-model="form.remove" :label="$t('form.jobEntrySFTP.remove')"/>
      <q-checkbox class="col-12 col-md-3" v-model="form.isAddResult" :label="$t('form.jobEntrySFTP.isAddResult')"/>
      <q-checkbox class="col-12 col-md-3" v-model="form.parallel" :label="$t('form.jobEntrySFTP.parallel')"/>
    </q-form>
  </div>
</template>

<script>

import { fetchFtpList } from 'src/service/base/FtpService'

export default {
  name: 'JobEntrySFTP',
  data () {
    return {
      form: {
        name: null,
        server: null,
        remoteDirectory: null,
        wildcard: null,
        remove: false,
        isAddResult: true,
        compression: 'none',
        parallel: false
      },
      ftpServerOptions: [],
      compressionOptions: ['none', 'zlib'],
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
    },
  },
  mounted () {
    const mxCellValue = this.$store.getters['etl/getMxCellForm']
    const root = this.$store.getters['etl/getRoot']
    if (mxCellValue) {
      this.form = Object.assign(this.form, mxCellValue)
    }
    fetchFtpList({
      projectId: root.projectId,
      category: 'SFTP'
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
