<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left" narrow-indicator>
        <q-tab name="main" label="主选项" />
        <q-tab name="fields" label="字段" />
        <q-tab name="options" label="选项" />
        <q-tab name="parameter" label="运行参数"/>
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" label="步骤名称" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.servers" label="Kafka服务器地址" hint="host:port,多个服务器用,间隔"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.shellName" label="转换">
            <template v-slot:append>
              <q-btn round dense flat icon="search" text-color="cyan-8" label-color="cyan-8" @click="openShellSelectDialog"/>
            </template>
          </q-input>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.topic" label="Topic"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.consumerGroup" label="Consumer group"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.duration" label="每批次持续时间"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.records" label="每批次处理条数" hint="0不限制"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.batches" label="每批次最大并行数"/>
          <q-radio color="cyan-8" label-color="cyan-8" v-model="form.commitMode" val="record" label="逐条提交"/>
          <q-radio color="cyan-8" label-color="cyan-8" v-model="form.commitMode" val="batch" label="等待批处理结束后提交"/>
        </q-tab-panel>
        <q-tab-panel name="fields">
          <q-table :data="form.fields" :columns="fieldColumns" :rows-per-page-fields="[0]"
                   row-key="name" separator="cell" hide-bottom title="Kafka连接配置">
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="inputName" :props="props">
                  {{ props.row.inputName }}
                </q-td>
                <q-td key="outputName" :props="props">
                  {{ props.row.outputName }}
                  <q-popup-edit v-model="props.row.outputName" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.outputName"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="category" :props="props">
                  {{ props.row.category }}
                  <q-popup-edit v-model="props.row.category" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.category" :fields="categories"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
          <br/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.returnFieldByStepValue" :options="nextSteps" emit-value map-options label="从步骤获取字段信息" @input="setStepName"/>
        </q-tab-panel>
        <q-tab-panel name="options">
          <q-table :data="form.options" :columns="optionColumns" :rows-per-page-options="[0]"
                   row-key="name" separator="cell" hide-bottom title="Kafka连接配置">
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                  <q-popup-edit v-model="props.row.name" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.name"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="value" :props="props">
                  {{ props.row.value }}
                  <q-popup-edit v-model="props.row.value" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.value"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="parameter">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="form.parallel" label="执行线程数" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
    <q-dialog v-model="selectShellDialog.state">
      <q-card style="min-height: 45vh; min-width: 25vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">转换选择</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator/>
        <q-card-section class="row items-center q-pb-none">
          <q-tree ref="shellTree" :nodes="selectShellDialog.shells" node-key="id" selected-color="cyan-8" :selected.sync="form.shellId" @update:selected="selectShell" no-nodes-label="没有数据">
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
import mxgraph from '../../../../graph/index'
import { fetchAllShell, fetchShell } from 'src/service/ShellService'

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
export default {
  name: 'KafkaConsumerInputMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        servers: null,
        shellId: null,
        shellName: null,
        topic: null,
        consumerGroup: null,
        duration: 10000,
        records: 0,
        batches: 1,
        commitMode: 'record',
        returnFieldByStep: null,
        returnFieldByStepValue: null,
        fields: [{
          inputName: 'key',
          outputName: 'Key',
          category: 'String'
        }, {
          inputName: 'message',
          outputName: 'Message',
          category: 'String'
        }, {
          inputName: 'topic',
          outputName: 'Topic',
          category: 'String'
        }, {
          inputName: 'partition',
          outputName: 'Partition',
          category: 'Integer'
        }, {
          inputName: 'offset',
          outputName: 'Offset',
          category: 'Integer'
        }, {
          inputName: 'timestamp',
          outputName: 'Timestamp',
          category: 'Integer'
        }],
        options: [{
          name: 'auto.offset.reset',
          value: 'latest'
        }, {
          name: 'ssl.key.password',
          value: null
        }, {
          name: 'ssl.keystore.location',
          value: null
        }, {
          name: 'ssl.keystore.password',
          value: null
        }, {
          name: 'ssl.truststore.location',
          value: null
        }, {
          name: 'ssl.truststore.password',
          value: null
        }],
        parallel: 1,
        distribute: true
      },
      fieldColumns: [
        { name: 'inputName', label: '入参', field: 'inputName', align: 'left', headerStyle: 'width: 150px;' },
        { name: 'outputName', label: '出参', field: 'outputName', align: 'left', headerStyle: 'width: 100px;' },
        { name: 'category', label: '类型', field: 'category', align: 'left', headerStyle: 'width: 100px;' }
      ],
      optionColumns: [
        { name: 'name', label: '属性', field: 'name', align: 'left', headerStyle: 'width: 150px;' },
        { name: 'value', label: '值', field: 'value', align: 'left', headerStyle: 'width: 100px;' }
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
            title: '错误',
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
