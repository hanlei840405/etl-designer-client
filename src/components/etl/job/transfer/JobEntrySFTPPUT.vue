<template>
  <div style="width: 100%;">
    <q-form class="row q-col-gutter-xs">
      <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.jobEntrySFTPPUT.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
      <q-input class="col-12 col-md-6" outlined v-model="form.shellName" :label="$t('form.jobEntryFTPPUT.localDirectory')" hint="">
        <template v-slot:append>
          <q-btn round dense flat icon="search" color="primary" @click="openShellSelectDialog"/>
        </template>
      </q-input>
      <q-select class="col-12 col-md-6" outlined v-model="form.server" emit-value map-options option-value="id" :options="ftpServerOptions" :label="$t('form.jobEntrySFTPPUT.server')" clearable hint="">
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
      <q-select class="col-12 col-md-6" outlined v-model="form.compression" :options="compressionOptions" :label="$t('form.jobEntrySFTPPUT.compressionOptions')" hint=""></q-select>
      <q-input class="col-12 col-md-6" outlined v-model="form.remoteDirectory" :label="$t('form.jobEntrySFTPPUT.remoteDirectory')" hint=""/>
      <q-checkbox class="col-12 col-md-3" v-model="form.createRemoteFolder" :label="$t('form.jobEntrySFTPPUT.createRemoteFolder')"/>
      <q-checkbox class="col-12 col-md-3" v-model="form.successWhenNoFile" :label="$t('form.jobEntrySFTPPUT.successWhenNoFile')"/>
      <q-checkbox class="col-12 col-md-3" v-model="form.parallel" :label="$t('form.jobEntrySFTPPUT.parallel')"/>
      <q-dialog v-model="selectShellDialog.state">
        <q-card style="min-height: 45vh; min-width: 700px;">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ $t('form.jobEntryFTPPUT.localDirectory') }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-separator/>
          <q-card-section class="q-pa-md row items-start q-gutter-md">
            <q-card v-for="shell in selectShellDialog.shells" :key="shell.id" style="width: 180px;" @click="selectShell(shell)">
              <q-item style="; cursor: pointer;">
                <q-item-section class="col-2">
                  <q-icon size="sm" :name="icon(shell.category)" :color="color(shell.category)"/>
                </q-item-section>
                <q-item-section class="col-10">
                  <q-item-label>{{ shell.name }}</q-item-label>
                  <q-item-label caption>{{ shell.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-card>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-form>
  </div>
</template>

<script>

import { fetchShellsByParent } from 'src/service/kettle/ShellService'
import { fetchFtpList } from 'src/service/base/FtpService'

export default {
  name: 'JobEntrySFTPPUT',
  data () {
    return {
      form: {
        name: null,
        server: null,
        shellId: null,
        shellName: null,
        remoteDirectory: null,
        successWhenNoFile: false,
        createRemoteFolder: false,
        compression: 'none',
        parallel: false
      },
      ftpServerOptions: [],
      compressionOptions: ['none', 'zlib'],
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
    openShellSelectDialog () {
      this.selectShellDialog.state = true
      this.selectShellDialog.shells = []
      fetchShellsByParent(this.selectShellDialog.projectId, this.selectShellDialog.parentId).then(res => {
        res.data.forEach (shell => {
          if (shell.category === '2') {
            this.selectShellDialog.shells.push(shell)
          }
        })
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
    selectShell (shell) {
      if (shell) {
        if (shell.category === '2') {
          this.form.shellId = shell.id
          this.form.shellName = shell.name
          this.selectShellDialog.state = false
        }
      }
    }
  },
  mounted () {
    const mxCellValue = this.$store.getters['etl/getMxCellForm']
    const root = this.$store.getters['etl/getRoot']
    if (mxCellValue) {
      this.form = Object.assign(this.form, mxCellValue)
    }
    this.selectShellDialog.parentId = root.parentId
    this.selectShellDialog.projectId = root.projectId
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
