<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.jobEntryJob.tabBasic')"/>
        <q-tab name="argument" :label="$t('form.jobEntryJob.tabArgumentParameter')"/>
        <q-tab name="names" :label="$t('form.jobEntryJob.tabNameParameter')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.jobEntryJob.name')" :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-input class="col-12 col-md-6" outlined v-model="form.shellName" :label="$t('form.jobEntryJob.job')">
            <template v-slot:append>
              <q-btn round dense flat icon="search" color="primary" @click="openShellSelectDialog"/>
            </template>
          </q-input>
          <q-checkbox class="col-12 col-md-4" v-model="form.executeEachRow" :label="$t('form.jobEntryJob.executeEveryInputRow')"/>
          <q-checkbox class="col-12 col-md-4" v-model="form.passingExport" :label="$t('form.jobEntryJob.passingExport')"/>
          <q-checkbox class="col-12 col-md-4" v-model="form.expandRemoteOnSlave" :label="$t('form.jobEntryJob.expandingRemoteJob')"/>
          <q-checkbox class="col-12 col-md-4" v-model="form.waitRemoteFinished" :label="$t('form.jobEntryJob.waitRemoteFinished')"/>
          <q-checkbox class="col-12 col-md-4" v-model="form.followingAbortRemotely" :label="$t('form.jobEntryJob.followingAbortRemotely')"/>
          <q-checkbox class="col-12 col-md-4" v-model="form.parallel" :label="$t('form.jobEntryJob.parallel')"/>
        </q-tab-panel>
        <q-tab-panel class="row q-col-gutter-xs" name="argument">
          <q-checkbox class="col-12" v-model="form.paramsFromPrevious" :label="$t('form.jobEntryJob.copyPreviousResultArgs')"/>
          <q-table class="col-12" :data="form.resultArguments" :title="$t('form.jobEntryJob.tableArgument')" :columns="resultArgumentsColumns" :rows-per-page-options="[0]"
                   row-key="name" separator="cell" hide-bottom>
            <template v-slot:top-right>
              <q-btn size="sm" outline color="primary" icon="add" @click="addResultArguments"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" round outline color="negative" icon="remove" @click="deleteResultArguments(props)"></q-btn>
                </q-td>
                <q-td key="argument" :props="props">
                  {{ props.row.argument }}
                  <q-popup-edit v-model="props.row.argument" :auto-save="true">
                    <q-input autofocus v-model="props.row.argument"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel class="row q-col-gutter-xs" name="names">
          <q-checkbox class="col-12 col-md-4" v-model="form.argFromPrevious" :label="$t('form.jobEntryJob.copyPreviousResultParameter')"/>
          <q-checkbox class="col-12 col-md-4" v-model="form.passingAllParameters" :label="$t('form.jobEntryJob.passParameterToSub')"/>
          <q-table class="col-12" :data="form.nameArguments" :title="$t('tableNameParameter')" :columns="nameArgumentsColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom>
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="primary" icon="add" @click="addNameArguments"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteNameArguments(props)"></q-btn>
                </q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                  <q-popup-edit v-model="props.row.name" :auto-save="true">
                    <q-input autofocus v-model="props.row.name"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="field" :props="props">
                  {{ props.row.field }}
                  <q-popup-edit v-model="props.row.field" :auto-save="true">
                    <q-input autofocus v-model="props.row.field"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="value" :props="props">
                  {{ props.row.value }}
                  <q-popup-edit v-model="props.row.value" :auto-save="true">
                    <q-input autofocus v-model="props.row.value"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
      <q-dialog v-model="selectShellDialog.state">
        <q-card style="min-height: 45vh; min-width: 700px;">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ $t('form.jobEntryJob.transformation') }}</div>
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
  name: 'JobEntryJob',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        shellId: null,
        shellName: null,
        executeEachRow: false,
        passingExport: false,
        expandRemoteOnSlave: false,
        waitRemoteFinished: true,
        followingAbortRemotely: false,
        paramsFromPrevious: false,
        resultArguments: [],
        argFromPrevious: false,
        passingAllParameters: true,
        nameArguments: [],
        parallel: false
      },
      resultArgumentsColumns: [
        {
          name: 'operate',
          label: this.$t('form.jobEntryJob.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'argument',
          label: this.$t('form.jobEntryJob.columnField'),
          field: 'argument',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      nameArgumentsColumns: [
        {
          name: 'operate',
          label: this.$t('form.jobEntryJob.columnOperate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'name',
          label: this.$t('form.jobEntryJob.columnParameter'),
          field: 'name',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'field',
          label: this.$t('form.jobEntryJob.columnSourceField'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'value',
          label: this.$t('form.jobEntryJob.columnValue'),
          field: 'value',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      selectShellDialog: {
        id: null,
        state: false,
        projectId: null,
        shells: []
      }
    }
  },
  methods: {
    addResultArguments () {
      this.form.resultArguments.push({
        argument: null
      })
    },
    deleteResultArguments (props) {
      this.form.resultArguments.splice(props.rowIndex, 1)
    },
    addNameArguments () {
      this.form.nameArguments.push({
        name: null,
        filed: null,
        value: null
      })
    },
    deleteNameArguments (props) {
      this.form.nameArguments.splice(props.rowIndex, 1)
    },
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
          if (shell.category === '1') {
            this.selectShellDialog.shells.push(shell)
          }
        })
      })
    },
    selectShell (shell) {
      if (shell) {
        if (shell.category === '1') {
          this.form.shellId = shell.id
          this.form.shellName = shell.name
          this.selectShellDialog.state = false
        }
      }
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
    buildTree (nodes, parentId) {
      const vm = this
      return nodes
        .filter((node) => node.parentId === parentId)
        .reduce(
          (tree, node) => [
            ...tree,
            {
              ...node,
              children: vm.buildTree(nodes, node.id)
            }
          ],
          []
        )
    }
  },
  mounted () {
    const vm = this
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    const root = vm.$store.getters['etl/getRoot']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
    vm.selectShellDialog.id = root.id
    vm.selectShellDialog.projectId = root.projectId
    vm.selectShellDialog.parentId = root.parentId
  }
}
</script>
