<template>
  <div style="width: 100%;">
    <q-form class="row q-col-gutter-xs">
      <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.jobEntryFTPPUT.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
      <q-input class="col-12 col-md-6" outlined v-model="form.serverName" :label="$t('form.jobEntryFTPPUT.serverName')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
      <q-input class="col-12 col-md-6" outlined v-model="form.serverPort" :label="$t('form.jobEntryFTPPUT.serverPort')" hint=""/>
      <q-input class="col-12 col-md-6" outlined v-model="form.userName" :label="$t('form.jobEntryFTPPUT.userName')" hint=""/>
      <q-input class="col-12 col-md-6" outlined v-model="form.password" :label="$t('form.jobEntryFTPPUT.password')" hint=""/>
      <q-input class="col-12 col-md-6" outlined v-model="form.shellName" :label="$t('form.jobEntryFTPPUT.localDirectory')" hint="">
        <template v-slot:append>
          <q-btn round dense flat icon="search" color="primary" @click="openShellSelectDialog"/>
        </template>
      </q-input>
      <q-input class="col-12 col-md-6" outlined v-model="form.wildcard" :label="$t('form.jobEntryFTPPUT.wildcard')" hint=""/>
      <q-input class="col-12 col-md-6" outlined v-model="form.remoteDirectory" :label="$t('form.jobEntryFTPPUT.remoteDirectory')" hint=""/>
      <q-input class="col-12 col-md-6" outlined v-model.number="form.timeout" :label="$t('form.jobEntryFTPPUT.timeout')" hint=""/>
      <q-select class="col-12 col-md-6" outlined v-model="form.controlEncoding" :options="encodingOptions" :label="$t('form.jobEntryFTPPUT.controlEncoding')" hint=""></q-select>
      <q-checkbox class="col-12 col-md-3" v-model="form.activeConnection" :label="$t('form.jobEntryFTPPUT.activeConnection')"/>
      <q-checkbox class="col-12 col-md-3" v-model="form.remove" :label="$t('form.jobEntryFTPPUT.remove')"/>
      <q-checkbox class="col-12 col-md-2" v-model="form.binaryMode" :label="$t('form.jobEntryFTPPUT.binaryMode')"/>
      <q-checkbox class="col-12 col-md-2" v-model="form.onlyPuttingNewFiles" :label="$t('form.jobEntryFTPPUT.onlyPuttingNewFiles')"/>
      <q-checkbox class="col-12 col-md-2" v-model="form.parallel" :label="$t('form.jobEntryFTPPUT.parallel')"/>
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

export default {
  name: 'JobEntryFTPPUT',
  data () {
    return {
      form: {
        name: null,
        serverName: null,
        serverPort: null,
        userName: null,
        password: null,
        binaryMode: false,
        timeout: 0,
        activeConnection: false,
        controlEncoding: null,
        shellId: null,
        shellName: null,
        wildcard: null,
        remoteDirectory: null,
        remove: false,
        onlyPuttingNewFiles: false,
        parallel: false
      },
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
    const vm = this
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    const root = vm.$store.getters['etl/getRoot']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
    this.selectShellDialog.parentId = root.parentId
    this.selectShellDialog.projectId = root.projectId
  }
}
</script>
