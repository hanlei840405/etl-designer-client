<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="main" :label="$t('tab-main')" />
        <q-tab name="batch" label="批量" />
        <q-tab name="fields" :label="$t('tab-field')" />
        <q-tab name="runningConfig" :label="$t('tab-running-config')"/>
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined v-model="form.name" :label="$t('form-name')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-input outlined v-model="form.shellName" :label="$t('form-transformation')">
            <template v-slot:append>
              <q-btn round dense flat icon="search" text-color="cyan-8" @click="openShellSelectDialog"/>
            </template>
          </q-input>
          <q-radio color="cyan-8" label-color="cyan-8" v-model="form.connection" val="amq" label="Active MQ"/>
          <q-radio color="cyan-8" label-color="cyan-8" v-model="form.connection" val="ibm" label="IBM MQ"/>
          <q-input outlined v-model="form.url" label="JMS URL"/>
          <br/>
          <q-radio color="cyan-8" label-color="cyan-8" v-model="form.destinationType" val="QUEUE" label="QUEUE"/>
          <q-radio color="cyan-8" label-color="cyan-8" v-model="form.destinationType" val="TOPIC" label="TOPIC"/>
          <q-input outlined v-model="form.destinationName" label="消息名称"/>
          <br/>
          <q-input outlined v-model="form.username" label="用户名"/>
          <br/>
          <q-input outlined v-model="form.password" label="密码"/>
        </q-tab-panel>
        <q-tab-panel name="batch">
          <q-input outlined v-model.number="form.duration" label="每批次持续时间"/>
          <br/>
          <q-input outlined v-model.number="form.records" label="每批次处理条数" hint="0不限制"/>
          <q-input outlined v-model.number="form.batches" label="每批次最大并行数"/>
          <br/>
          <q-input outlined v-model.number="form.timeout" label="超时设置(ms)" hint="0不限制"/>
        </q-tab-panel>
        <q-tab-panel name="fields">
          <q-table :data="form.fields" :columns="fieldColumns" :rows-per-page-fields="[0]"
                   row-key="name" separator="cell" hide-bottom :title="$t('table-title-field')">
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="inputName" :props="props">
                  {{ props.row.inputName }}
                </q-td>
                <q-td key="outputName" :props="props">
                  {{ props.row.outputName }}
                  <q-popup-edit v-model="props.row.outputName" :auto-save=true>
                    <q-input autofocus outlined v-model="props.row.outputName"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="category" :props="props">
                  {{ props.row.category }}
                  <q-popup-edit v-model="props.row.category" :auto-save=true>
                    <q-select autofocus outlined v-model="props.row.category" :fields="categories"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
          <br/>
          <q-select clearable outlined v-model="form.returnFieldByStepValue" :options="nextSteps" emit-value map-options label="从步骤获取字段信息" @input="setStepName"/>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined v-model.number="form.parallel" :label="$t('form-number-thread-copies')" type="number" min="1" :disable="forbiddenParallel"/>
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
          <q-tree ref="shellTree" :nodes="selectShellDialog.shells" node-key="id" selected-color="cyan-8" :selected.sync="form.shellId" @update:selected="selectShell" :no-nodes-label="$t('table.empty')">
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

import pako from 'pako'
import mxgraph from 'src/mxgraph/index'
import { fetchShellsByProject, fetchShell } from 'src/service/kettle/ShellService'

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
export default {
  name: 'JmsConsumerMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        shellId: null,
        connection: null,
        url: null,
        destinationType: null,
        messageField: null,
        username: null,
        password: null,
        duration: 10000,
        records: 0,
        batches: 1,
        timeout: 0,
        returnFieldByStep: null,
        returnFieldByStepValue: null,
        fields: [{
          inputName: 'message',
          outputName: 'message',
          category: 'String'
        }, {
          inputName: 'destination',
          outputName: 'destination',
          category: 'String'
        }, {
          inputName: 'messageId',
          outputName: 'messageId',
          category: 'String'
        }, {
          inputName: 'jmsTimestamp',
          outputName: 'jmsTimestamp',
          category: 'Integer'
        }, {
          inputName: 'jmsRedelivered',
          outputName: 'jmsRedelivered',
          category: 'Integer'
        }],
        parallel: 1,
        distribute: true
      },
      fieldColumns: [
        { name: 'inputName', label: this.$t('column-input'), field: 'inputName', align: 'left', headerStyle: 'width: 150px;' },
        { name: 'outputName', label: this.$t('column-output'), field: 'outputName', align: 'left', headerStyle: 'width: 100px;' },
        { name: 'category', label: this.$t('column-type'), field: 'category', align: 'left', headerStyle: 'width: 100px;' }
      ],
      categories: ['String', 'Integer', 'Binary', 'Number'],
      nextSteps: [],
      forbiddenParallel: false,
      selectShellDialog: {
        state: false,
        projectId: null,
        shells: [{
          id: 0,
          label: '转换',
          children: [],
          selectable: false,
          icon: 'folder_open',
          category: '0'
        }]
      }
    }
  },
  methods: {
    setStepName () {
      const vm = this
      vm.nextSteps.forEach(item => {
        if (item.value === vm.form.returnFieldByStepValue) {
          vm.form.returnFieldByStep = item.label
        }
      })
    },
    openShellSelectDialog () {
      const vm = this
      vm.selectShellDialog.state = true
      fetchShellsByProject(vm.selectShellDialog.projectId).then(res => {
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
    selectDependencyShell () {
      const vm = this
      if (vm.form.shellId) {
        fetchShell(vm.form.shellId).then(res => {
          const xml = vm.unzip(res.data.content, { to: 'string' })
          const xmlDocument = mxgraph.mxUtils.parseXml(xml)
          if (xmlDocument.documentElement != null && xmlDocument.documentElement.nodeName === 'mxGraphModel') {
            const MxCodec = mxgraph.mxCodec
            const decoder = new MxCodec(xmlDocument)
            let node = xmlDocument.documentElement.children[0].firstChild
            while (node != null) {
              const cell = decoder.decodeCell(node)
              if (cell && cell.vertex === 1) {
                vm.nextSteps.push({ value: cell.id, label: cell.getAttribute('title') })
              }
              node = node.nextSibling
            }
          }
        }).catch(err => {
          vm.$q.dialog({
            title: vm.$t('dialog-title-error'),
            ok: {
              color: 'negative'
            },
            html: true,
            message: err.data.error
          })
        })
      }
    },
    selectShell (target) {
      if (target) {
        const vm = this
        const selected = vm.$refs.shellTree.getNodeByKey(target)
        if (selected.category === '2') {
          vm.form.shellId = target
          vm.form.shellName = selected.label
          vm.selectShellDialog.state = false
          vm.nextSteps = []
          vm.selectDependencyShell()
        }
      }
    },
    deleteOptions (props) {
      this.form.fields.splice(props.rowIndex, 1)
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
    },
    unzip (data) {
      const charData = atob(data).split('').map(function (x) {
        return x.charCodeAt(0)
      })
      const binData = new Uint8Array(charData)
      return pako.inflate(binData, { to: 'string' })
    }
  },
  mounted () {
    const vm = this
    const previousSteps = vm.$store.getters['etl/getPreNodes']
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach((step, i) => {
        if (i === 0 && FORBIDDEN_NEXT_STEP_PARALLEL.indexOf(step.type) >= 0) {
          vm.forbiddenParallel = true
        }
      })
    }
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      if (vm.form.name !== mxCellValue.name) {
        vm.form = Object.assign(vm.form, mxCellValue)
        vm.selectDependencyShell()
      }
    }
    const root = vm.$store.getters['etl/getRoot']
    vm.selectShellDialog.projectId = root.projectId
  }
}
</script>
