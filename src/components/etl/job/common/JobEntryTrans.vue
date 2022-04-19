<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
              narrow-indicator>
        <q-tab name="main" :label="$t('tab-main')"/>
        <q-tab name="argument" :label="$t('tab-argument-parameter')"/>
        <q-tab name="names" :label="$t('tab-name-parameter')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" :label="$t('form-name')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.shellName" :label="$t('form-transformation')">
            <template v-slot:append>
              <q-btn round dense flat icon="search" text-color="cyan-8" @click="openShellSelectDialog"/>
            </template>
          </q-input>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.executeEachRow" :label="$t('form-execute-every-input-row')"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.clearRecords" :label="$t('form-clear-result-rows')"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.clearFileRecords" :label="$t('form-clear-result-files')"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.waitRemoteFinished" :label="$t('form-wait-remote-finish')"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.notice" :label="$t('form-wait-follow-local-abort')"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.parallel" :label="$t('form-parallel')"/>
        </q-tab-panel>
        <q-tab-panel name="result">
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.paramsFromPrevious" :label="$t('form-copy-previous-result-args')"/>
          <br/>
          <q-table :data="form.resultArguments" :title="$t('table-title-argument')" :columns="resultArgumentsColumns" :rows-per-page-options="[0]"
                   row-key="name" separator="cell" hide-bottom>
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addResultArguments"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                         @click="deleteResultArguments(props)"></q-btn>
                </q-td>
                <q-td key="argument" :props="props">
                  {{ props.row.argument }}
                  <q-popup-edit v-model="props.row.argument" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.argument"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="names">
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.argFromPrevious" :label="$t('form-copy-previous-result-parameter')"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.passingAllParameters" :label="$t('form-pass-parameter-to-sub')"/>
          <br/>
          <q-table :data="form.nameArguments" :title="$t('table-title-name-parameter')" :columns="nameArgumentsColumns" :rows-per-page-options="[0]"
                   row-key="name" separator="cell" hide-bottom>
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addNameArguments"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                         @click="deleteNameArguments(props)"></q-btn>
                </q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                  <q-popup-edit v-model="props.row.name" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.name"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="field" :props="props">
                  {{ props.row.field }}
                  <q-popup-edit v-model="props.row.field" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.field"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="value" :props="props">
                  {{ props.row.value }}
                  <q-popup-edit v-model="props.row.value" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.value"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
      <q-dialog v-model="selectShellDialog.state">
        <q-card style="min-height: 45vh; min-width: 25vw;">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ $t('dialog-title-transformation') }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
          <q-separator/>
          <q-card-section class="row items-center q-pb-none">
            <q-tree ref="shellTree" :nodes="selectShellDialog.shells" node-key="id" selected-color="cyan-8" :selected.sync="form.shellId" @update:selected="selectShell" :no-nodes-label="$t('table-empty')">
              <template v-slot:default-header="prop">
                <div class="row items-center">
                  <q-icon :name="prop.node.icon" :color="prop.node.color" class="q-mr-sm"/>
                  {{ prop.node.label }}
                </div>
              </template>
            </q-tree>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-form>
  </div>
</template>

<script>

import { fetchAllShell } from 'src/service/ShellService'

export default {
  name: 'JobEntryTrans',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        shellName: null,
        shellId: null,
        executeEachRow: false,
        clearRecords: false,
        clearFileRecords: false,
        waitRemoteFinished: true,
        notice: false,
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
          label: this.$t('column-operate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'argument',
          label: this.$t('column-field'),
          field: 'argument',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      nameArgumentsColumns: [
        {
          name: 'operate',
          label: this.$t('column-operate'),
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'name',
          label: this.$t('column-parameter'),
          field: 'name',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'field',
          label: this.$t('column-source-field'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'value',
          label: this.$t('column-value'),
          field: 'value',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      selectShellDialog: {
        state: false,
        projectId: null,
        shells: [{
          id: 0,
          label: this.$t('dialog-title-transformation'),
          children: [],
          selectable: false,
          icon: 'folder_open',
          category: '0'
        }]
      }
    }
  },
  methods: {
    openShellSelectDialog () {
      const vm = this
      vm.selectShellDialog.state = true
      fetchAllShell(vm.selectShellDialog.projectId).then(res => {
        const array = []
        res.data.forEach((ele, index) => {
          if (ele.category === '0') {
            ele.icon = 'folder_open'
            ele.color = 'cyan-8'
            ele.selectable = false
            array.push(ele)
          } else if (ele.category === '2') {
            ele.icon = 'fullscreen_exit'
            ele.color = 'green'
            array.push(ele)
          }
        })
        vm.selectShellDialog.shells[0].children = vm.buildTree(array, 0)
      })
    },
    selectShell (target) {
      if (target) {
        const vm = this
        const selected = vm.$refs.shellTree.getNodeByKey(target)
        if (selected.category === '2') {
          vm.form.shellId = target
          vm.form.shellName = selected.label
          vm.selectShellDialog.state = false
        }
      }
    },
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
    submitForm () {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form
      })
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
    vm.selectShellDialog.projectId = root.projectId
  }
}
</script>
