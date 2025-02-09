<template>
  <div style="width: 100%;">
    <q-form class="row q-col-gutter-xs">
      <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.jobEntryFTPPUT.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
      <q-input class="col-12 col-md-6" outlined v-model="form.shellName" :label="$t('form.jobEntryFTPPUT.localDirectory')" hint="">
        <template v-slot:append>
          <q-btn round dense flat icon="search" color="primary" @click="openShellSelectDialog"/>
        </template>
      </q-input>
      <q-select class="col-12 col-md-6" outlined v-model="form.server" emit-value map-options option-value="id" :options="ftpServerOptions" :label="$t('form.jobEntryFTPPUT.server')" clearable hint="">
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
      <q-input class="col-12 col-md-6" outlined v-model="form.wildcard" :label="$t('form.jobEntryFTPPUT.wildcard')" hint=""/>
      <q-input class="col-12 col-md-6" outlined v-model="form.remoteDirectory" :label="$t('form.jobEntryFTPPUT.remoteDirectory')" hint=""/>
      <q-input class="col-12 col-md-3" outlined type="number" v-model.number="form.timeout" :label="$t('form.jobEntryFTPPUT.timeout')" hint=""/>
      <q-select class="col-12 col-md-3" outlined v-model="form.controlEncoding" :options="encodingOptions" :label="$t('form.jobEntryFTPPUT.controlEncoding')" hint=""></q-select>
      <!-- <q-checkbox class="col-12 col-md-3" v-model="form.activeConnection" :label="$t('form.jobEntryFTPPUT.activeConnection')"/> -->
      <q-checkbox class="col-12 col-md-3" v-model="form.remove" :label="$t('form.jobEntryFTPPUT.remove')"/>
      <q-checkbox class="col-12 col-md-3" v-model="form.binaryMode" :label="$t('form.jobEntryFTPPUT.binaryMode')"/>
      <q-checkbox class="col-12 col-md-3" v-model="form.onlyPuttingNewFiles" :label="$t('form.jobEntryFTPPUT.onlyPuttingNewFiles')"/>
      <q-checkbox class="col-12 col-md-3" v-model="form.parallel" :label="$t('form.jobEntryFTPPUT.parallel')"/>
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
  name: 'JobEntryFTPPUT',
  data () {
    return {
      form: {
        name: null,
        binaryMode: false,
        timeout: 0,
        controlEncoding: null,
        shellId: null,
        shellName: null,
        wildcard: null,
        remoteDirectory: null,
        remove: false,
        onlyPuttingNewFiles: false,
        parallel: false
      },
      ftpServerOptions: [],
      encodingOptions: ['US-ASCII', 'ISO-8859-1', 'UTF-8', 'UTF-16BE', 'UTF-16LE', 'UTF-16'],
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
