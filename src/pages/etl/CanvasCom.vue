<template>
  <div style="width: 100%; margin-left: 0px;">
    <q-btn-group outline>
      <q-btn outline color="primary" :label="$t('button.component')" icon="keyboard_arrow_down">
        <q-menu fit>
          <q-list bordered v-if="shell.category === '1'">
            <q-item clickable v-for="(value,key) in toolbar.job" v-bind:key="key">
              <q-item-section>{{ toolbarName[key] }}</q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" />
              </q-item-section>
              <q-menu auto-close anchor="top end" self="top start" @show="dragable(key, '1')">
                <q-list>
                  <q-item clickable :ref="item.type" v-for="item in value" v-bind:key="item.type">
                    <q-item-section>{{ item.name }}</q-item-section>
                    <q-item-section avatar>
                      <q-avatar rounded size="sm">
                        <img :src="item.img">
                      </q-avatar>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
          </q-list>
          <q-list bordered v-if="shell.category === '2'">
            <q-item clickable v-for="(value,key) in toolbar.transform" v-bind:key="key">
              <q-item-section>{{ toolbarName[key] }}</q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" />
              </q-item-section>
              <q-menu anchor="top end" self="top start" @show="dragable(key, '2')">
                <q-list>
                  <q-item clickable :ref="item.type" v-for="item in value" v-bind:key="item.type">
                    <q-item-section>{{ item.name }}</q-item-section>
                    <q-item-section avatar>
                      <q-avatar rounded size="sm">
                        <img :src="item.img">
                      </q-avatar>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-btn outline color="primary" :label="executing ? $t('button.shutdown') : $t('button.execute')" :icon="executing ? 'las la-pause' : 'las la-play'" @click="execute"/>
      <q-btn outline color="primary" :label="$t('button.zoom-in')" icon="las la-search-plus" @click="graph.zoomIn()"/>
      <q-btn outline color="primary" :label="$t('button.zoom-out')" icon="las la-search-minus" @click="graph.zoomOut()"/>
      <q-btn outline color="primary" v-if="showDeleteButton > 0" :label="$t('button.delete')" icon="las la-trash" @click="confirmDeleteSelectedVertex"/>
      <q-btn-dropdown outline split text-color="primary" :label="$t('button.save')" icon="las la-save" @click="submitForm">
        <q-list separator>
          <q-item clickable v-close-popup @click="publish">
            <q-item-section avatar>
              <q-icon name="las la-arrow-up" color="primary" />
            </q-item-section>
            <q-item-section class="text-primary">
              <q-item-label>{{ $t('button.publish') }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="history">
            <q-item-section avatar>
              <q-icon name="las la-history" color="primary" />
            </q-item-section>
            <q-item-section class="text-primary">
              <q-item-label>{{ $t('button.version') }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-btn-group>
    <div ref="graphContainer" style="width: 100%; height: calc(100vh - 200px);"/>
    <div ref="outlineContainer" style="z-index:1;position:absolute;overflow:hidden;bottom:0px;right:0px;width:160px;height:120px;background:transparent;border-style:solid;border-color:lightgray;"/>
    <q-dialog v-model="propertiesDialog.state">
      <q-card style="width: 900px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ propertiesDialog.title }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator/>
        <q-card-section class="row items-center no-wrap">
          <component ref="step" :is="propertiesDialog.propertiesDialogCmp" @propertiesForm="closePropertiesDialog"></component>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn outline color="primary" :label="$t('button.save')" icon="save" @click="$refs.step.submitForm()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="logDialog.state" position="right">
      <q-card style="min-width: 25vw; min-height: 60vh">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ logDialog.title }}<q-circular-progress v-if="logDialog.showProcessing" indeterminate size="sm" class="q-ma-md"/></div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-tabs v-model="logDialog.tabOption" class="text-cyan-8" align="left">
          <q-tab name="trans" label="trans"/>
          <q-tab name="step" label="step"/>
        </q-tabs>
        <q-tab-panels v-model="logDialog.tabOption" animated swipeable vertical transition-prev="jump-up"
                      transition-next="jump-up">
          <q-tab-panel name="trans">
            <pre>{{ logDialog.log }}</pre>
          </q-tab-panel>
          <q-tab-panel name="step">
            <q-table :data="logDialog.logData" :columns="logDialog.transStepLogColumns"
                     :rows-per-page-options="[0]" row-key="index" hide-bottom/>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-dialog>
    <q-dialog v-model="publishDialog.state">
      <q-card style="min-width: 25vw; min-height: 45vh">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.shell.history') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section>
          <q-table
            flat
            dense
            bordered
            :data="publishDialog.publishes"
            :columns="publishDialog.columns"
            row-key="id"
            :loading="publishDialog.loading"
            separator="cell"
            :no-data-label="$t('table.empty')"
            @request="history"
            :pagination.sync="publishDialog.pagination"
          >
            <template v-slot:body-cell-createTime="props">
              <q-td style="padding: 1px;">
                {{ dateFormat(props.row.createTime) }}
              </q-td>
            </template>
            <template v-slot:body-cell-operate="props">
              <q-td style="padding: 1px; text-align: center">
                <a href="javascript:;" style="text-decoration: none;" @click="recover(props.row.id)">{{ $t('button.cover') }}</a>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>

import Constant from 'src/constant/Constant'
import mxgraph from 'src/mxgraph/index'
import JsonInputMeta from 'src/components/etl/transform/input/JsonInput.vue'
import TableInputMeta from 'src/components/etl/transform/input/TableInput.vue'
import TableOutputMeta from 'src/components/etl/transform/output/TableOutput.vue'
import JsonOutputMeta from 'src/components/etl/transform/output/JsonOutput.vue'
import InsertUpdateMeta from 'src/components/etl/transform/output/TableInsertUpdate.vue'
import DeleteMeta from 'src/components/etl/transform/output/TableDelete.vue'
import UpdateMeta from 'src/components/etl/transform/output/TableUpdate.vue'
import DatabaseLookupMeta from 'src/components/etl/transform/lookup/DatabaseLookup.vue'
import DatabaseJoinMeta from 'src/components/etl/transform/lookup/DatabaseJoin.vue'
import JavaScriptMeta from 'src/components/etl/transform/shell/JavaScript.vue'
import ExecSQLMeta from 'src/components/etl/transform/shell/ExecSql.vue'
import DummyTransMeta from 'src/components/etl/transform/process/Dummy.vue'
import SwitchCaseMeta from 'src/components/etl/transform/process/Switchcase.vue'
import DetectEmptyStreamMeta from 'src/components/etl/transform/process/DetectEmptyStream.vue'
import DetectLastRowMeta from 'src/components/etl/transform/process/DetectLastRow.vue'
import MailMeta from 'src/components/etl/transform/process/Mail.vue'
import WriteToLogMeta from 'src/components/etl/transform/process/WriteToLog.vue'
import DataGridMeta from 'src/components/etl/transform/input/DataGrid.vue'
import SetVariableMeta from 'src/components/etl/transform/shell/SetVariable.vue'
import GetVariableMeta from 'src/components/etl/transform/shell/GetVariable.vue'
import JobEntrySpecial from 'src/components/etl/job/common/JobEntrySpecial.vue'
import JobEntryTrans from 'src/components/etl/job/common/JobEntryTrans.vue'
import JobEntryDummy from 'src/components/etl/job/common/JobEntryDummy.vue'
import JobEntrySuccess from 'src/components/etl/job/common/JobEntrySuccess.vue'
import JobEntryJob from 'src/components/etl/job/common/JobEntryJob.vue'
import JobEntryEval from 'src/components/etl/job/shell/JobEntryEval.vue'
import JobEntrySetVariables from 'src/components/etl/job/common/JobEntrySetVariables.vue'
import JobEntryFTPPUT from 'src/components/etl/job/transfer/JobEntryFTPPUT.vue'
import JobEntryMail from 'src/components/etl/job/transfer/JobEntryMail.vue'
import ValueMapperMeta from 'src/components/etl/transform/convert/ValueMapper.vue'
import SplitFieldToRowsMeta from 'src/components/etl/transform/convert/SplitFieldToRows.vue'
import DenormaliserMeta from 'src/components/etl/transform/convert/Denormaliser.vue'
import StringCutMeta from 'src/components/etl/transform/convert/StringCut.vue'
import UniqueRowsMeta from 'src/components/etl/transform/convert/UniqueRows.vue'
import UniqueRowsByHashSetMeta from 'src/components/etl/transform/convert/UniqueRowsByHashSet.vue'
import ConstantMeta from 'src/components/etl/transform/convert/Constant.vue'
import FlattenerMeta from 'src/components/etl/transform/convert/Flattener.vue'
import FieldSplitterMeta from 'src/components/etl/transform/convert/FieldSplitter.vue'
import ReplaceStringMeta from 'src/components/etl/transform/convert/ReplaceString.vue'
import NormaliserMeta from 'src/components/etl/transform/convert/Normaliser.vue'
import SelectValuesMeta from 'src/components/etl/transform/convert/SelectValues.vue'
import RowGeneratorMeta from 'src/components/etl/transform/input/RowGenerator.vue'
import RestMeta from 'src/components/etl/transform/lookup/Rest.vue'
import JobEntrySimpleEval from 'src/components/etl/job/condition/JobEntrySimpleEval.vue'
import UserDefinedJavaClassMeta from 'src/components/etl/transform/shell/UserDefinedJavaClass.vue'
import ElasticSearchBulkMeta from 'src/components/etl/transform/output/ElasticsearchBulkInsert.vue'
import ExcelWriterStepMeta from 'src/components/etl/transform/output/ExcelWriter.vue'
import RandomValueMeta from 'src/components/etl/transform/input/RandomValue.vue'
import ConcatFieldsMeta from 'src/components/etl/transform/convert/ConcatFields.vue'
import RecordsFromStreamMeta from 'src/components/etl/transform/streaming/RecordsFromStream.vue'
import KafkaProducerOutputMeta from 'src/components/etl/transform/streaming/KafkaProducerOutput.vue'
import KafkaConsumerInputMeta from 'src/components/etl/transform/streaming/KafkaConsumerInput.vue'
import SetValueFieldMeta from 'src/components/etl/transform/convert/SetValueField.vue'
import MongoDbOutputMeta from 'src/components/etl/transform/output/MongodbOutput.vue'
import RowsToResultMeta from 'src/components/etl/transform/shell/RowsToResult.vue'
import RowsFromResultMeta from 'src/components/etl/transform/shell/RowsFromResult.vue'
import MultiMergeJoinMeta from 'src/components/etl/transform/lookup/MultiMergeJoin.vue'
import SortRowsMeta from 'src/components/etl/transform/convert/SortRows.vue'
import { fetchShellContent, saveShellContent, publishShell, fetchShellPublishes, fetchShellPublishContent } from 'src/service/kettle/ShellService'
import { execute, stop } from 'src/service/kettle/DesignService'
import { date, uid } from 'quasar'
import pako from 'pako'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
const hasErrorPortCompArray = ['TableOutputMeta', 'InsertUpdateMeta', 'UpdateMeta', 'DeleteMeta', 'DatabaseLookupMeta', 'DatabaseJoinMeta', 'JsonInputMeta', 'ElasticSearchBulkMeta', 'JavaScriptMeta', 'UserDefinedJavaClassMeta', 'ExecSQLMeta', 'RestMeta', 'MailMeta', 'FieldSplitterMeta', 'StringCutMeta', 'ReplaceStringMeta', 'SetValueFieldMeta']
const hasCaseCompArray = ['SwitchCaseMeta']
const dragElt = document.createElement('div')
dragElt.style.border = 'dashed black 1px'
dragElt.style.width = '45px'
dragElt.style.height = '45px'
export default {
  name: 'CanvasCom',
  components: {
    TableInputMeta,
    TableOutputMeta,
    InsertUpdateMeta,
    DeleteMeta,
    UpdateMeta,
    DatabaseLookupMeta,
    DatabaseJoinMeta,
    JavaScriptMeta,
    ExecSQLMeta,
    DummyTransMeta,
    SwitchCaseMeta,
    DetectEmptyStreamMeta,
    DetectLastRowMeta,
    MailMeta,
    WriteToLogMeta,
    DataGridMeta,
    SetVariableMeta,
    GetVariableMeta,
    JobEntrySpecial,
    JobEntryTrans,
    JobEntryDummy,
    JobEntrySuccess,
    JobEntryJob,
    JobEntrySetVariables,
    JobEntryFTPPUT,
    JobEntryMail,
    ValueMapperMeta,
    SplitFieldToRowsMeta,
    DenormaliserMeta,
    StringCutMeta,
    UniqueRowsMeta,
    UniqueRowsByHashSetMeta,
    ConstantMeta,
    FlattenerMeta,
    FieldSplitterMeta,
    ReplaceStringMeta,
    NormaliserMeta,
    SelectValuesMeta,
    JobEntryEval,
    JsonInputMeta,
    JsonOutputMeta,
    RowGeneratorMeta,
    RestMeta,
    JobEntrySimpleEval,
    UserDefinedJavaClassMeta,
    ElasticSearchBulkMeta,
    ExcelWriterStepMeta,
    RandomValueMeta,
    ConcatFieldsMeta,
    RecordsFromStreamMeta,
    KafkaProducerOutputMeta,
    KafkaConsumerInputMeta,
    SetValueFieldMeta,
    MongoDbOutputMeta,
    RowsToResultMeta,
    RowsFromResultMeta,
    MultiMergeJoinMeta,
    SortRowsMeta
  },
  props: {
    shell: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      socket: null,
      stompClient: null,
      graph: null,
      clickFn: null,
      removeFn: null,
      connectedFn: null,
      undoMng: null,
      outline: null,
      toolbarName:{
        stepInput: this.$t('etl.transform.stepInput.default'),
        stepOutput: this.$t('etl.transform.stepOutput.default'),
        streaming: this.$t('etl.transform.streaming.default'),
        stepConvert: this.$t('etl.transform.stepConvert.default'),
        stepScript: this.$t('etl.transform.stepScript.default'),
        stepLookup: this.$t('etl.transform.stepLookup.default'),
        stepProcess: this.$t('etl.transform.stepProcess.default'),
        entryMail: this.$t('etl.transform.entryMail.default'),
        entryCommon: this.$t('etl.job.entryCommon.default'),
        entryScript: this.$t('etl.job.entryScript.default'),
        conditionShell: this.$t('etl.job.conditionShell.default'),
        fileTransfer: this.$t('etl.job.fileTransfer.default'),
      },
      toolbar: Constant.ETL_TOOLBAR,
      executing: false,
      nodeNames: {},
      propertiesDialog: {
        state: false,
        title: false,
        state: false,
      },
      init: false,
      showCellDialog: true,
      logDialog: {
        state: false,
        title: this.$t('kettle.log'),
        tabOption: 'trans',
        showProcessing: true,
        log: null,
        logData: [],
        transStepLogColumns: [
          {
            name: 'name',
            label: this.$t('kettle.column.name'),
            field: 'name'
          },
          {
            name: 'logDate',
            label: this.$t('kettle.column.logDate'),
            field: 'logDate'
          },
          {
            name: 'stepCopy',
            label: this.$t('kettle.column.stepCopy'),
            field: 'stepCopy',
            align: 'left'
          },
          {
            name: 'read',
            label: this.$t('kettle.column.read'),
            field: 'read',
            align: 'left'
          },
          {
            name: 'written',
            label: this.$t('kettle.column.written'),
            field: 'written',
            align: 'left'
          },
          {
            name: 'updated',
            label: this.$t('kettle.column.updated'),
            field: 'updated',
            align: 'left'
          },
          {
            name: 'input',
            label: this.$t('kettle.column.input'),
            field: 'input',
            align: 'left'
          },
          {
            name: 'output',
            label: this.$t('kettle.column.output'),
            field: 'output',
            align: 'left'
          },
          {
            name: 'rejected',
            label: this.$t('kettle.column.rejected'),
            field: 'rejected',
            align: 'left'
          },
          {
            name: 'errors',
            label: this.$t('kettle.column.errors'),
            field: 'errors',
            align: 'left'
          }
        ]
      },
      publishDialog: {
        state: false,
        xml: null,
        loading: false,
        publishes: [],
        pagination: {
          page: 1,
          rowsNumber: 0,
          rowsPerPage: 10
        },
        columns: [
          {
            name: 'createTime',
            label: this.$t('form.shellPublish.columnCreateTime'),
            field: 'createTime',
            align: 'left',
            headerStyle: 'width: 200px'
          },
          {
            name: 'description',
            label: this.$t('form.shellPublish.columnDescription'),
            field: 'description',
            align: 'left',
            headerStyle: 'width: 250px'
          },
          {
            name: 'operate',
            label: this.$t('form.shellPublish.columnOperate'),
            field: 'operate',
            align: 'right',
            headerStyle: 'width: 50px'
          }
        ]
      },
      uuid: null,
      cancel: null,
      timer: null,
    }
  },
  methods: {
    dragable (key, category) {
      const array = []
      if (category === '1') {
        this.toolbar.job[key].forEach(item => {
          array.push(item)
        })
      } else {
        this.toolbar.transform[key].forEach(item => {
          array.push(item)
        })
      }
      const vm = this
      array.forEach(bar => {
        mxgraph.mxEvent.addListener(this.$refs[bar.type][0].$el, 'dragstart', function (evt) {
          evt.returnValue = false
        })
        const ds = mxgraph.mxUtils.makeDraggable(this.$refs[bar.type][0].$el, this.graph, function (graph, evt, target, x, y) {
          graph.getModel().beginUpdate()
          try {
            const doc = mxgraph.mxUtils.createXmlDocument()
            const data = doc.createElement('data')
            const nr = bar.name.match(/\d+$/gi) || [0]
            let name = bar.name.replace(/\d+$/gi, '')
            name = vm.refreshNodeName(name, nr[0])
            data.setAttribute('title', name)
            const form = {
              name: name
            }
            data.setAttribute('form', JSON.stringify(form))
            const MxCell = mxgraph.mxCell
            const MxGeometry = mxgraph.mxGeometry
            const cell = new MxCell(data, new MxGeometry(0, 0, 45, 45), bar.type)
            cell.vertex = true
            var cells = graph.importCells([cell], x, y, target)
            if (cells != null && cells.length > 0) {
              graph.scrollCellToVisible(cells[0])
              graph.setSelectionCells(cells)
              vm.init = true
              // todo 验证完打开
              vm.showStepProperties(cell, JSON.stringify(form), [], [])
            }
          } finally {
            graph.getModel().endUpdate()
          }
        }, dragElt, null, null, vm.graph.autoscroll, true)
        ds.isGuidesEnabled = function () {
          return vm.graph.graphHandler.guidesEnabled
        }
      })
    },
    getClosedLoopNode (node, value) {
      for (let i = 0; this.graph.getModel().getIncomingEdges(node).length; i++) {
        const edge = this.graph.getModel().getIncomingEdges(node)[i]
        if (edge.source.id === value) {
          return edge.source
        } else if (edge.source.id === node.id) {
          return null
        } else if (edge.source.edges.length > 0) {
          return this.getClosedLoopNode(edge.source, value)
        }
      }
      return null
    },
    getPreNodes (node, root, depth, preNodes) {
      const incoming = this.graph.getModel().getIncomingEdges(node)
      for (let i = 0; i < incoming.length; i++) {
        const edge = incoming[i]
        if (edge.source && edge.source.id !== root.id) {
          const sourceCell = this.graph.getModel().getCell(edge.source.id)
          const linkNodes = []
          this.getLinkNodes(sourceCell, linkNodes)
          preNodes.push({
            value: edge.source.id,
            title: sourceCell.getAttribute('title'),
            ext: sourceCell.getAttribute('ext'),
            type: sourceCell.style,
            depth: depth,
            linkNodes: linkNodes
          })
          this.getPreNodes(edge.source, root, depth + 1, preNodes)
        }
      }
    },
    getLinkNodes (node, linkNodes) {
      const incoming = this.graph.getModel().getIncomingEdges(node)
      for (let i = 0; i < incoming.length; i++) {
        const edge = incoming[i]
        if (edge.source) {
          if (linkNodes.findIndex((item) =>item.id === edge.source.id) > -1) {
            // 循环指向，并且指向了自己，跳出递归
            return
          }
          const sourceCell = this.graph.getModel().getCell(edge.source.id)
          linkNodes.push({
            id: sourceCell.id,
            title: sourceCell.getAttribute('title'),
            ext: sourceCell.getAttribute('ext')
          })
          this.getLinkNodes(sourceCell, linkNodes)
        }
      }
    },
    getNextNodes (node, nextNodes) {
      const outgoing = this.graph.getModel().getOutgoingEdges(node)
      for (let i = 0; i < outgoing.length; i++) {
        const edge = outgoing[i]
        if (edge.target && edge.target.id !== node.id) {
          const targetCell = this.graph.getModel().getCell(edge.target.id)
          nextNodes.push(targetCell)
        }
      }
    },
    refreshNodeName (name, nv, ok, ov) {
      nv = Number(nv)
      ov = Number(ov)
      if (!this.nodeNames[name] || this.nodeNames[name].length === 0) {
        this.nodeNames[name] = [nv]
      } else {
        let assign = false
        for (let i = 0; i < this.nodeNames[name].length; i++) {
          if (this.nodeNames[name][i] !== i) {
            nv += i
            this.nodeNames[name].push(nv)
            assign = true
            break
          }
        }
        if (!assign && nv === 0) {
          nv += this.nodeNames[name].length
          this.nodeNames[name].push(nv)
        }
      }
      if (ov) {
        this.nodeNames[ok].splice(this.nodeNames[ok].indexOf(ov), 1)
        this.nodeNames[ok].sort()
      }
      this.nodeNames[name].sort()
      return name + (nv === 0 ? '' : nv)
    },
    deleteSelectedVertex () {
      this.graph.getModel().beginUpdate()
      try {
        const cells = this.graph.getSelectionCells()
        if (cells != null && cells.length > 0) {
          this.graph.removeCells(cells, true)
          cells.forEach(cell => {
            const title = cell.getAttribute('title')
            if (title) {
              const nr = title.match(/\d+$/gi) || [0]
              const name = title.replace(/\d+$/gi, '')
              this.nodeNames[name].splice(this.nodeNames[name].indexOf(Number(nr[0])), 1)
            }
          })
        }
      } finally {
        this.graph.getModel().endUpdate()
      }
    },
    showStepProperties (item, formVal, preNodes, nextNodes) {
      this.propertiesDialog.title = item.getAttribute('title', '')
      this.propertiesDialog.propertiesDialogCmp = item.style
      this.$store.commit('etl/setRoot', {
        id: this.shell.id,
        parentId: this.shell.parentId,
        projectId: this.shell.projectId
      })
      this.$store.commit('etl/setPreNodes', preNodes)
      this.$store.commit('etl/setNextNodes', nextNodes)
      const form = formVal ? JSON.parse(formVal) : {}
      form.name = this.propertiesDialog.title
      this.$store.commit('etl/setMxCellForm', form)
      this.propertiesDialog = Object.assign(this.propertiesDialog, {
        state: true
      })
    },
    execute () {
      this.logDialog.log = null
      if (this.executing) {
        this.cancel(this.$t('message.kettle.cancelRunningEtl'))
        stop({
          id: this.shell.id,
          payload: this.uuid
        }).then(res => {
          this.executing = false
          this.logDialog.state = true
          this.logDialog.showProcessing = false
          this.logDialog.log = res.data.log
          this.logDialog.logData = res.data.steps
        }).catch(err => {
          this.executing = false
          if (err.status === 10001) {
            this.$q.dialog({
              title: this.$t('message.error.default'),
              ok: {
                color: 'negative'
              },
              html: true,
              message: this.$t('response.error.10001')
            })
          } else if (err.status === 10002) {
            this.$q.dialog({
              title: this.$t('message.error.default'),
              ok: {
                color: 'negative'
              },
              html: true,
              message: this.$t('response.error.10002')
            })
          } else {
            this.$q.dialog({
              title: this.$t('message.error.default'),
              ok: {
                color: 'negative'
              },
              html: true,
              message: err.data.error
            })
          }
        })
      } else {
        this.cancelToken = this.$axios.CancelToken
        this.executing = true
        const MxCodec = mxgraph.mxCodec
        const encoder = new MxCodec()
        const node = encoder.encode(this.graph.getModel())
        const xml = mxgraph.mxUtils.getPrettyXml(node)
        this.uuid = uid()
        this.logDialog.state = true
        this.logDialog.showProcessing = true
        const vm = this
        execute(this.uuid, {
          id: this.shell.id,
          name: this.shell.name,
          category: this.shell.category,
          content: this.zip(xml)
        }, {
          cancelToken: new this.$axios.CancelToken(function executor (c) {
            vm.cancel = c
          })
        }).then(res => {
          vm.logDialog.logData = []
          vm.stompClient.subscribe(vm.uuid, (response) => {
            const body = JSON.parse(response.body)
            if (body.running) {
              vm.logDialog.log += body.log + "\n"
            } else {
              vm.logDialog.log = body.log
              vm.logDialog.logData = body.steps
              vm.executing = false
              vm.logDialog.showProcessing = false
            }
          })
        }).catch(err => {
          vm.executing = false
          vm.logDialog.showProcessing = false
          if (err.status === 10009) {
            vm.logDialog.state = true
            vm.logDialog.log = err.data.log
            vm.logDialog.logData = err.data.steps
          } else {
            vm.$q.dialog({
              title: vm.$t('response.error.default'),
              ok: {
                color: 'negative'
              },
              html: true,
              message: err.data.error
            })
          }
        })
      }
    },
    closePropertiesDialog (val) {
      this.init = false
      if (val.state) {
        this.propertiesDialog = Object.assign(this.propertiesDialog, {
          state: false
        })
        this.graph.getModel().beginUpdate()
        var cell = this.graph.getSelectionCell()
        try {
          if (cell.edge) {
            cell = cell.target
          }
          if (cell.vertex) {
            let name = val.mxCellProperties.name
            const data = this.graph.getModel().getValue(cell).cloneNode(true)
            const title = data.getAttribute('title')
            if (title && name !== title) {
              const nr = name.match(/\d+$/gi) || [0]
              name = name.replace(/\d+$/gi, '')
              const onr = title.match(/\d+$/gi) || [0]
              const oname = title.replace(/\d+$/gi, '')
              name = this.refreshNodeName(name, nr[0], oname, onr)
            }
            data.setAttribute('title', name)
            data.setAttribute('form', JSON.stringify(val.mxCellProperties))
            data.setAttribute('ext', JSON.stringify(val.ext))
            if (this.shell.category === '1' && val.mxCellProperties.parallel) {
              this.graph.getModel().getOutgoingEdges(cell).forEach(outgoing => {
                const span = outgoing.value
                const copySpan = document.createElement('span')
                copySpan.setAttribute('class', 'material-icons')
                copySpan.innerHTML = 'content_copy'
                if (span.innerText.indexOf('content_copy') < 0) {
                  span.append(copySpan)
                  this.graph.getModel().setValue(outgoing, span)
                }
              })
            }
            this.graph.getModel().setValue(cell, data)
          }
        } finally {
          this.graph.getModel().endUpdate()
        }
      }
    },
    submitForm () {
      this.$q.loading.show({
        message: this.$t('message.loading.save')
      })
      const MxCodec = mxgraph.mxCodec
      const encoder = new MxCodec()
      const node = encoder.encode(this.graph.getModel())
      const xml = mxgraph.mxUtils.getPrettyXml(node)
      const vm = this
      saveShellContent({
        id: vm.shell.id,
        content: vm.zip(xml)
      }).then(res => {
        this.$q.loading.hide()
        this.$q.notify({
          message: this.$t('response.success.save'),
          position: 'top',
          color: 'teal'
        })
      }).catch(err => {
        this.$q.loading.hide()
        this.$q.notify({
          message: err.data.error,
          position: 'top',
          color: 'negative'
        })
      })
    },
    publish () {
      this.$q.dialog({
        title: this.$t('message.confirm.default'),
        message: this.$t('message.confirm.publish'),
        html: true,
        prompt: {
          model: '',
          isValid: val => val.length > 5,
          type: 'text'
        },
        cancel: true,
        persistent: true
      }).onOk((data) => {
        publishShell({
          id: this.shell.id,
          payload: data
        }).then(res => {
          this.$q.notify({
            message: this.$t('response.success.publish'),
            position: 'top',
            color: 'teal'
          })
        }).catch(err => {
          let msg
          if (err.status === 10011) {
            msg = this.$t('response.error.10011')
          } else if (err.status === 10016) {
            msg = this.$t('response.error.10016')
          } else {
            msg = err.data.message
          }
          this.$q.notify({
            message: msg,
            position: 'top',
            color: 'negative'
          })
        })
      })
    },
    history () {
      const query = {
        pageNo: this.publishDialog.pagination.page,
        pageSize: this.publishDialog.pagination.rowsPerPage,
        id: this.shell.id
      }
      fetchShellPublishes(query).then(res => {
        this.publishDialog.state = true
        this.publishDialog.pagination.rowsNumber = res.data.total
        this.publishDialog.publishes = res.data.items
      })
    },
    recover (id) {
      this.$q.dialog({
        title: this.$t('message.confirm.default'),
        message: this.$t('message.confirm.recover'),
        cancel: true,
        persistent: true
      }).onOk(() => {
        fetchShellPublishContent(id).then(res => {
          if (res.data) {
            this.paint(this.unzip(res.data))
          }
        }).catch(err => {
          if (err.status === 10002) {
            this.$q.notify({
              message: this.$t('response.error.10002'),
              position: 'top',
              color: 'negative'
            })
          } else {
            this.$q.notify({
              message: err.data.error,
              position: 'top',
              color: 'negative'
            })
          }
        })
      })
    },
    confirmDeleteSelectedVertex () {
      if (this.graph.getSelectionCells().length > 0) {
        this.$q.dialog({
          title: 'Confirm',
          message: this.$t('confirm.delete'),
          cancel: {
            textColor: 'orange',
            outline: true,
            color: ''
          },
          ok: {
            textColor: 'teal',
            outline: true,
            color: ''
          },
          persistent: true
        }).onOk(() => {
          this.deleteSelectedVertex()
        })
      } else {
        this.$q.notify({
          position: 'top',
          message: this.$t('message.noComponentSelected'),
          color: 'negative'
        })
      }
    },
    currentShell () {
      return this.shell
    },
    paint (val) {
      const xmlDocument = mxgraph.mxUtils.parseXml(val)
      if (xmlDocument.documentElement != null && xmlDocument.documentElement.nodeName === 'mxGraphModel') {
        const MxCodec = mxgraph.mxCodec
        const decoder = new MxCodec(xmlDocument)
        const node = xmlDocument.documentElement
        decoder.decode(node, this.graph.getModel())
        this.graph.refresh()
      }
    },
    unzip (data) {
      const charData = atob(data).split('').map(function (x) {
        return x.charCodeAt(0)
      })
      const binData = new Uint8Array(charData)
      return pako.inflate(binData, { to: 'string' })
    },
    zip (text) {
      return btoa(pako.gzip(text, { to: 'string' }))
    },
    connectSocketServer () {
      const vm = this
      const fn = () => {
        if (!vm.stompClient || !vm.stompClient.connected) {
          if (vm.timer) {
            vm.$q.notify({
              message: this.$t('message.reconnectingServer'),
              position: 'top',
              color: 'negative'
            })
          }
          vm.socket = new SockJS(process.env.API + '/socket')
          vm.stompClient = Stomp.over(vm.socket)
          vm.stompClient.connect({}, () => {
            vm.$q.notify({
              message: this.$t('message.connectedServer'),
              position: 'top',
              color: 'green-10'
            })
          })
        }
      }
      fn()
      vm.timer = setInterval(() => fn(), 5000)
    },
    dateFormat (value) {
      return date.formatDate(value, 'YYYY-MM-DD HH:mm:ss')
    }
  },
  computed: {
    showDeleteButton () {
      return this.graph ? this.graph.getSelectionCells().length : 0
    }
  },
  activated () {
    const vm = this
    if (vm.clickFn) {
      vm.graph.removeListener(vm.clickFn)
    } else {
      vm.clickFn = function (sender, evt) {
        if (!vm.showCellDialog) {
          vm.showCellDialog = true
          return false
        }
        const cell = evt.getProperty('cell')
        const mouse = evt.getProperty('event')
        if (cell && cell.isVertex() && mouse.button === 0) {
          const preNodes = []
          const nextNodes = []
          vm.getPreNodes(cell, cell, 0, preNodes)
          vm.getNextNodes(cell, nextNodes)
          nextNodes.forEach(node => {
            nextNodes.push({
              value: node.id,
              title: node.getAttribute('title'),
              ext: node.getAttribute('ext')
            })
          })
          vm.init = false
          vm.showStepProperties(cell, cell.getAttribute('form', ''), preNodes, nextNodes)
        } else if (cell && cell.isEdge() && mouse.button === 0) {
          const form = JSON.parse(cell.source.getAttribute('form'))
          const error = JSON.parse(cell.source.getAttribute('error')) || {}
          if (error[cell.target.id]) {
            return false
          }
          if (form.hasOwnProperty('distribute') && !form.distribute) {
            cell.source.edges.forEach(edge => {
              if (cell.source.id !== edge.target.id && !error[edge.target.id]) {
                sender.getModel().setValue(edge, null)
              }
            })
            form.distribute = true
            cell.source.setAttribute('form', JSON.stringify(form))
          } else {
            var errorTargetSize = 0
            cell.source.edges.forEach(edge => {
              if (cell.source.id !== edge.target.id && error[edge.target.id]) {
                errorTargetSize ++
              }
            })
            if (cell.source.edges.length - errorTargetSize > 1) {
              cell.source.edges.forEach(edge => {
                if (cell.source.id !== edge.target.id && !error[edge.target.id]) {
                    const span = document.createElement('span')
                    span.setAttribute('class', 'material-icons')
                    span.innerHTML = 'content_copy'
                    sender.getModel().setValue(edge, span)
                }
              })
              form.distribute = false
              cell.source.setAttribute('form', JSON.stringify(form))
            }
          }
          // vm.graph.refresh(cell.source)
        }
      }
    }
    vm.graph.addListener(mxgraph.mxEvent.CLICK, vm.clickFn)
    if (vm.removeFn) {
      vm.graph.removeListener(vm.removeFn)
    } else {
      vm.removeFn = function (sender, evt) {
        const cells = evt.getProperty('cells') || []
        const sources = []
        cells.forEach(cell => {
          if (cell.isEdge() && sender.selectionModel.cells.findIndex(item => item.id === cell.source.id) < 0) {
            if (sources.findIndex(item => item.id === cell.source.id) < 0) {
              sources.push(cell.source)
            }
          }
        })
        if (sources.length > 0) {
          sources.forEach(source => {
            var error = {}
            if (source.getAttribute('error')) {
              error = Object.assign(error, JSON.parse(source.getAttribute('error')))
            }
            const errorCount = Object.keys(error).length
            var outgoings = 0
            source.edges.forEach(edge => {
              if (edge.target.id === source.id) {
                outgoings ++
              }
            })
            const edgeCount = source.edges.length - errorCount - outgoings
            if (edgeCount < 2) {
              var form = {}
              if (source.getAttribute('form')) {
                form = Object.assign(form, JSON.parse(source.getAttribute('form')))
              }
              form.distribute = true
              source.setAttribute('form', JSON.stringify(form))
              source.edges.forEach(edge => {
                if (edge.target.id !== source.id) {
                  sender.getModel().setValue(edge, null)
                }
              })
            }
            source.edges.forEach(edge => {
              delete error[edge.target.id]
            })
              source.setAttribute('error', JSON.stringify(error))
          })
        }
      }
    }
    vm.graph.addListener(mxgraph.mxEvent.REMOVE_CELLS, vm.removeFn)
    if (vm.connectedFn) {
      vm.graph.removeListener(vm.connectedFn)
    } else {
      vm.connectedFn = function (sender, evt) {
        const source = evt.getProperty('edge').source
        const target = evt.getProperty('edge').target
        if (target) {
          const node = vm.getClosedLoopNode(source, target.id)
          if (vm.shell.category === '1') {
            // 脚本类型为job时
            var style = mxgraph.mxConstants.STYLE_STROKECOLOR + '=#00897C;' + mxgraph.mxConstants.STYLE_FONTCOLOR + '=#00897C;'
            const outgoings = sender.getModel().getOutgoingEdges(source)
            const link = source.getAttribute('link') ? JSON.parse(source.getAttribute('link')) : {}
            if (source.style !== 'JobEntrySpecial') {
              vm.$q.dialog({
                title: vm.$t('message.kettle.outputCondition'),
                options: {
                  type: 'radio',
                  model: outgoings.length > 0 ? 2 : 1,
                  items: [
                    {
                      label: vm.$t('message.kettle.outputUnconditional'),
                      value: 0
                    },
                    {
                      label: vm.$t('message.kettle.outputTrue'),
                      value: 1
                    },
                    {
                      label: vm.$t('message.kettle.outputFalse'),
                      value: 2
                    }
                  ]
                },
                persistent: true,
                ok: {
                  outline: true,
                  color: 'teal',
                  textLine: 'teal'
                }
              }).onOk((d) => {
                const span = document.createElement('span')
                span.setAttribute('class', 'material-icons')
                if (d === 0) {
                  span.innerHTML = 'lock'
                  link[target.id] = 0
                } else if (d === 1) {
                  style = mxgraph.mxConstants.STYLE_STROKECOLOR + '=#00a300;' + mxgraph.mxConstants.STYLE_FONTCOLOR + '=#00a300;'
                  span.innerHTML = 'check_circle'
                  link[target.id] = 1
                } else {
                  style = mxgraph.mxConstants.STYLE_STROKECOLOR + '=#ff0000;' + mxgraph.mxConstants.STYLE_FONTCOLOR + '=#ff0000;'
                  span.innerHTML = 'dangerous'
                  link[target.id] = 2
                }
                source.setAttribute('link', JSON.stringify(link))
                sender.getModel().setValue(evt.getProperty('edge'), span)
                sender.getModel().setStyle(evt.getProperty('edge'), style)
              })
            } else {
              const span = document.createElement('span')
              span.setAttribute('class', 'material-icons')
              span.innerHTML = 'lock'
              link[target.id] = 0
              source.setAttribute('link', JSON.stringify(link))
              sender.getModel().setValue(evt.getProperty('edge'), span)
              sender.getModel().setStyle(evt.getProperty('edge'), style)
            }
          } else if (vm.shell.category === '2') {
            const error = source.getAttribute('error') ? JSON.parse(source.getAttribute('error')) : {}
            // 脚本类型为trans时
            if (node) {
              vm.$q.notify({
                position: 'top',
                message: vm.$t('message.kettle.loopCallProhibited'),
                color: 'negative'
              })
            } else if (hasErrorPortCompArray.indexOf(source.style) > -1) {
              vm.$q.dialog({
                title: vm.$t('message.kettle.outputMode'),
                ok: {
                  outline: true,
                  color: 'teal',
                  label: vm.$t('message.kettle.outputNormal')
                },
                cancel: {
                  outline: true,
                  color: 'negative',
                  label: vm.$t('message.kettle.outputAbnormal')
                },
                persistent: true
              }).onOk(() => {
                if (error[target.id]) {
                  delete error[target.id]
                }
              }).onCancel(() => {
                error[target.id] = true
                source.setAttribute('error', JSON.stringify(error))
                const span = document.createElement('span')
                span.setAttribute('class', 'material-icons')
                span.innerHTML = 'error_outline'
                sender.getModel().setValue(evt.getProperty('edge'), span)
                sender.getModel().setStyle(evt.getProperty('edge'), mxgraph.mxConstants.STYLE_STROKECOLOR + '=#ff0000;' + mxgraph.mxConstants.STYLE_FONTCOLOR + '=#ff0000;')
              })
            } else if (hasCaseCompArray.indexOf(source.style) > -1) {
              vm.$q.dialog({
                title: vm.$t('message.kettle.outputMode'),
                ok: {
                  outline: true,
                  color: 'teal',
                  label: vm.$t('message.kettle.outputDefalut')
                },
                cancel: {
                  outline: true,
                  color: 'negative',
                  label: vm.$t('message.kettle.outputConditional')
                },
                persistent: true
              }).onOk(() => {
                const span = document.createElement('span')
                span.setAttribute('class', 'material-icons')
                span.innerHTML = 'info'
                sender.getModel().setValue(evt.getProperty('edge'), span)
              }).onCancel(() => {
                const span = document.createElement('span')
                span.setAttribute('class', 'material-icons')
                span.innerHTML = 'help'
                sender.getModel().setValue(evt.getProperty('edge'), span)
              })
            }
          }
        }
      }
    }
    vm.graph.addListener(mxgraph.mxEvent.CELL_CONNECTED, vm.connectedFn)
    // 添加连接线事件
    mxgraph.mxConnectionHandler.prototype.insertEdge = function (parent, id, value, source, target, style) {
      vm.showCellDialog = false
      vm.graph.insertEdge(parent, id, value, source, target, style)
    }
  },
  mounted () {
    const vm = this
    mxgraph.mxConstants.VERTEX_SELECTION_COLOR = '#1976D2'
    mxgraph.mxConstants.EDGE_SELECTION_COLOR = '#1976D2'
    mxgraph.mxConstants.VERTEX_SELECTION_STROKEWIDTH = '2'
    mxgraph.mxConstants.EDGE_SELECTION_STROKEWIDTH = '2'
    mxgraph.mxConstants.HANDLE_FILLCOLOR = '#1976D2'
    mxgraph.mxConstants.HANDLE_STROKECOLOR = '#1976D2'
    mxgraph.mxConstants.VERTEX_SELECTION_DASHED = false
    mxgraph.mxConstants.EDGE_SELECTION_DASHED = false
    mxgraph.mxConstants.STYLE_FONTSIZE = '16'
    mxgraph.mxGraphHandler.prototype.guidesEnabled = true
    mxgraph.mxConnectionHandler.prototype.movePreviewAway = false
    mxgraph.mxConnectionHandler.prototype.waypointsEnabled = false
    const MxImage = mxgraph.mxImage
    mxgraph.mxConnectionHandler.prototype.connectImage = new MxImage('/images/graph/connector.gif', 16, 16)
    // 拖动时，按下Alt键不显示导航线
    mxgraph.mxGuide.prototype.isEnabledForEvent = function (evt) {
      return !mxgraph.mxEvent.isAltDown(evt)
    }
    mxgraph.mxEdgeHandler.prototype.snapToTerminals = true
    mxgraph.mxGraph.prototype.resetEdgesOnConnect = false
    mxgraph.mxEvent.disableContextMenu(vm.$refs.graphContainer)
    const MxGraph = mxgraph.mxGraph
    vm.graph = new MxGraph(vm.$refs.graphContainer)
    vm.graph.setHtmlLabels(true)
    vm.graph.setConnectable(true)
    vm.graph.setMultigraph(false)
    vm.graph.setCellsResizable(false)
    // 禁止连接线独立存在
    vm.graph.setAllowDanglingEdges(false)
    vm.graph.setDisconnectOnMove(false)
    vm.graph.keepEdgesInBackground = true
    vm.graph.edgeLabelsMovable = false
    // 不以画布中心放大
    vm.graph.centerZoom = false
    const MxOutline = mxgraph.mxOutline
    vm.outline = new MxOutline(vm.graph, vm.$refs.outlineContainer)
    // 禁止在节点内拉出连线
    // mxgraph.mxEdgeHandler.prototype.isConnectableCell = function (cell) {
    //   return vm.graph.connectionHandler.isConnectableCell(cell)
    // }
    // 创建可用于预览的边缘状态
    // vm.graph.connectionHandler.createEdgeState = function (me) {
    //   const edge = vm.graph.createEdge(vm.graph, null, null, null, null)
    //   const MxCellState = mxgraph.mxCellState
    //   return new MxCellState(vm.graph.view, edge, vm.graph.getCellStyle(edge))
    // }

    vm.graph.convertValueToString = function (cell) {
      if (cell.edge) {
        return cell.value
      } else if (cell.vertex) {
        return cell.getAttribute('title', '')
      }
      return cell.value
    }
    // 添加step执行的并行数
    const redrawShape = vm.graph.cellRenderer.redrawShape
    vm.graph.cellRenderer.redrawShape = function (state, force, rendering) {
      let form = state.cell.getAttribute('form')
      if (state.secondLabel) {
        state.secondLabel.destroy()
        state.secondLabel = null
      }
      if (form) {
        form = JSON.parse(form)
        const parallel = form.parallel || 1
        const MxRectangle = mxgraph.mxRectangle
        if (parallel && parallel > 1) {
          const MxText = mxgraph.mxText
          state.secondLabel = new MxText(parallel, new MxRectangle(), mxgraph.mxConstants.ALIGN_LEFT, mxgraph.mxConstants.ALIGN_BOTTOM)
          state.secondLabel.color = 'black'
          vm.graph.cellRenderer.initializeLabel(state, state.secondLabel)
        }
        if (state.secondLabel != null) {
          const bounds = new MxRectangle(state.x + 45, state.y, 35, 0)
          state.secondLabel.state = state
          state.secondLabel.value = 'x' + parallel
          state.secondLabel.bounds = bounds
          state.secondLabel.redraw()
        }
      }
      return redrawShape.apply(this, arguments)
    }
    // 添加step执行的并行数
    const destroy = vm.graph.cellRenderer.destroy
    vm.graph.cellRenderer.destroy = function (state) {
      destroy.apply(this, arguments)
      if (state.secondLabel != null) {
        state.secondLabel.destroy()
        state.secondLabel = null
      }
    }
    const undoListener = function (sender, evt) {
      if (vm.undoMng) {
        vm.undoMng.undoableEditHappened(evt.getProperty('edit'))
      }
    }
    vm.graph.getModel().addListener(mxgraph.mxEvent.UNDO, undoListener)
    vm.graph.getView().addListener(mxgraph.mxEvent.UNDO, undoListener)
    const MxKeyHandler = mxgraph.mxKeyHandler
    const keyHandler = new MxKeyHandler(vm.graph)
    keyHandler.getFunction = function (evt) {
      if (evt != null) {
        return (mxgraph.mxEvent.isControlDown(evt) || (mxgraph.mxClient.IS_MAC && evt.metaKey)) ? this.controlKeys[evt.keyCode] : this.normalKeys[evt.keyCode]
      }
      return null
    }
    keyHandler.isControlDown = function (evt) {
      return mxgraph.mxEvent.isControlDown(evt) || (mxgraph.mxClient.IS_MAC && evt.metaKey)
    }
    keyHandler.isShiftDown = function (evt) {
      return mxgraph.mxEvent.isShiftDown(evt) || (mxgraph.mxClient.IS_MAC && evt.metaKey)
    }
    keyHandler.bindControlShiftKey(90, function (evt) {
      vm.undoMng.redo()
    })
    keyHandler.bindControlKey(90, function (evt) {
      if (mxgraph.mxEvent.isShiftDown(evt)) {
        vm.undoMng.redo()
      } else {
        vm.undoMng.undo()
      }
    })
    keyHandler.bindControlKey(89, function (evt) {
      vm.undoMng.redo()
    })
    keyHandler.bindControlKey(83, function (evt) {
      vm.submitForm()
    })
    // keyHandler.bindKey(46, function (evt) {
    //   vm.deleteSelectedVertex()
    // })
    // keyHandler.bindKey(8, function (evt) {
    //   vm.deleteSelectedVertex()
    // })
    keyHandler.bindControlKey(65, function (evt) {
      vm.graph.selectAll()
    })
    mxgraph.mxClipboard.cellsToString = function (cells) {
      const MxCodec = mxgraph.mxCodec
      const MxGraphModel = mxgraph.mxGraphModel
      const codec = new MxCodec()
      const model = new MxGraphModel()
      const parent = model.getChildAt(model.getRoot(), 0)
      for (let i = 0; i < cells.length; i++) {
        model.add(parent, cells[i])
      }
      return mxgraph.mxUtils.getXml(codec.encode(model))
    }
    const textInput = document.createElement('textarea')
    mxgraph.mxUtils.setOpacity(textInput, 0)
    textInput.style.width = '1px'
    textInput.style.height = '1px'
    let restoreFocus = false
    const gs = vm.graph.gridSize
    let lastPaste = null
    let dx = 0
    let dy = 0
    textInput.value = ' '
    mxgraph.mxEvent.addListener(document, 'keydown', function (evt) {
      const source = mxgraph.mxEvent.getSource(evt)
      if (vm.graph.isEnabled() && !vm.graph.isMouseDown && !vm.graph.isEditing() && source.nodeName !== 'INPUT') {
        if (evt.keyCode === 224 /* FF */ || (!mxgraph.mxClient.IS_MAC && evt.keyCode === 17 /* Control */) || (mxgraph.mxClient.IS_MAC && (evt.keyCode === 91 || evt.keyCode === 93) /* Left/Right Meta */)) {
          if (!restoreFocus) {
            // Avoid autoscroll but allow handling of events
            textInput.style.position = 'absolute'
            textInput.style.left = (vm.graph.container.scrollLeft + 10) + 'px'
            textInput.style.top = (vm.graph.container.scrollTop + 10) + 'px'
            vm.graph.container.appendChild(textInput)
            restoreFocus = true
            textInput.focus()
            textInput.select()
          }
        }
      }
    })
    // Restores focus on graph container and removes text input from DOM
    mxgraph.mxEvent.addListener(document, 'keyup', function (evt) {
      if (restoreFocus && (evt.keyCode === 224 /* FF */ || evt.keyCode === 17 /* Control */ || evt.keyCode === 91 || evt.keyCode === 93 /* Meta */)) {
        restoreFocus = false
        if (!vm.graph.isEditing()) {
          vm.graph.container.focus()
        }
        textInput.parentNode.removeChild(textInput)
      }
    })
    const copyCells = function (graph, cells) {
      if (cells.length > 0) {
        const clones = graph.cloneCells(cells)
        for (let i = 0; i < clones.length; i++) {
          const state = graph.view.getState(cells[i])
          if (state != null) {
            const geo = graph.getCellGeometry(clones[i])
            if (geo != null && geo.relative) {
              geo.relative = false
              geo.x = state.x / state.view.scale - state.view.translate.x
              geo.y = state.y / state.view.scale - state.view.translate.y
            }
          }
        }
        textInput.value = mxgraph.mxClipboard.cellsToString(clones)
      }
      textInput.select()
      lastPaste = textInput.value
    }
    mxgraph.mxEvent.addListener(textInput, 'copy', mxgraph.mxUtils.bind(this, function (evt) {
      if (vm.graph.isEnabled() && !vm.graph.isSelectionEmpty()) {
        copyCells(vm.graph, mxgraph.mxUtils.sortCells(vm.graph.model.getTopmostCells(vm.graph.getSelectionCells())))
        dx = 0
        dy = 0
      }
    }))
    const importXml = function (xml, dx, dy) {
      dx = (dx != null) ? dx : 0
      dy = (dy != null) ? dy : 0
      let cells = []
      try {
        const doc = mxgraph.mxUtils.parseXml(xml)
        const node = doc.documentElement
        if (node != null) {
          const MxGraphModel = mxgraph.mxGraphModel
          const MxCodec = mxgraph.mxCodec
          const model = new MxGraphModel()
          const codec = new MxCodec(node.ownerDocument)
          codec.decode(node, model)
          const childCount = model.getChildCount(model.getRoot())
          const targetChildCount = vm.graph.model.getChildCount(vm.graph.model.getRoot())
          vm.graph.model.beginUpdate()
          for (let i = 0; i < childCount; i++) {
            let parent = model.getChildAt(model.getRoot(), i)
            if (targetChildCount > i) {
              const target = (childCount === 1) ? vm.graph.getDefaultParent() : vm.graph.model.getChildAt(vm.graph.model.getRoot(), i)
              if (!vm.graph.isCellLocked(target)) {
                const children = model.getChildren(parent)
                children.forEach(child => {
                  const title = child.getAttribute('title')
                  if (title) {
                    const nr = title.match(/\d+$/gi) || [0]
                    let name = title.replace(/\d+$/gi, '')
                    name = vm.refreshNodeName(name, nr[0])
                    child.setAttribute('title', name)
                  }
                })
                cells = cells.concat(vm.graph.importCells(children, dx, dy, target))
              }
            } else {
              parent = vm.graph.importCells([parent], 0, 0, vm.graph.model.getRoot())[0]
              const children = vm.graph.model.getChildren(parent)
              vm.graph.moveCells(children, dx, dy)
              cells = cells.concat(children)
            }
          }
        }
      } finally {
        vm.graph.model.endUpdate()
      }
      return cells
    }
    const pasteText = function (text) {
      const xml = mxgraph.mxUtils.trim(text)
      if (xml.length > 0) {
        if (lastPaste !== xml) {
          lastPaste = xml
          dx = 0
          dy = 0
        } else {
          dx += gs
          dy += gs
        }
        if (xml.substring(0, 14) === '<mxGraphModel>') {
          vm.graph.setSelectionCells(importXml(xml, dx, dy))
          vm.graph.scrollCellToVisible(vm.graph.getSelectionCell())
        }
      }
    }
    const extractGraphModelFromEvent = function (evt) {
      let data = null
      if (evt != null) {
        const provider = (evt.dataTransfer != null) ? evt.dataTransfer : evt.clipboardData
        if (provider != null) {
          if (document.documentMode === 10 || document.documentMode === 11) {
            data = provider.getData('Text')
          } else {
            data = (mxgraph.mxUtils.indexOf(provider.types, 'text/html') >= 0) ? provider.getData('text/html') : null
            if (mxgraph.mxUtils.indexOf(provider.types, 'text/plain' && (data === null || data.length === 0))) {
              data = provider.getData('text/plain')
            }
          }
        }
      }
      return data
    }
    mxgraph.mxEvent.addListener(textInput, 'paste', function (evt) {
      textInput.value = ''
      if (vm.graph.isEnabled()) {
        const data = extractGraphModelFromEvent(evt)
        if (data !== null && data.length > 0) {
          pasteText(data)
        } else {
          window.setTimeout(mxgraph.mxUtils.bind(this, function () {
            pasteText(textInput.value)
          }), 0)
        }
      }
      textInput.select()
    })
    const types = ['job', 'transform']
    types.forEach(type => {
      for (const key in vm.toolbar[type]) {
        vm.toolbar[type][key].forEach(bar => {
          const style = {}
          style[mxgraph.mxConstants.STYLE_PERIMETER] = mxgraph.mxPerimeter.RectanglePerimeter
          style[mxgraph.mxConstants.STYLE_SHAPE] = mxgraph.mxConstants.SHAPE_LABEL
          style[mxgraph.mxConstants.STYLE_STROKECOLOR] = '#00897C'
          style[mxgraph.mxConstants.STYLE_ALIGN] = mxgraph.mxConstants.ALIGN_CENTER
          style[mxgraph.mxConstants.STYLE_VERTICAL_ALIGN] = mxgraph.mxConstants.ALIGN_TOP
          style[mxgraph.mxConstants.STYLE_IMAGE_ALIGN] = mxgraph.mxConstants.ALIGN_CENTER
          style[mxgraph.mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = mxgraph.mxConstants.ALIGN_CENTER
          style[mxgraph.mxConstants.STYLE_IMAGE_WIDTH] = '45'
          style[mxgraph.mxConstants.STYLE_IMAGE_HEIGHT] = '45'
          style[mxgraph.mxConstants.STYLE_SPACING_TOP] = '45'
          style[mxgraph.mxConstants.STYLE_SPACING] = '6'
          style[mxgraph.mxConstants.STYLE_FILLCOLOR] = '#FFFFFF'
          style[mxgraph.mxConstants.STYLE_FONTCOLOR] = '#000000'
          style[mxgraph.mxConstants.STYLE_FONTSIZE] = '14'
          style[mxgraph.mxConstants.STYLE_ROUNDED] = true
          style[mxgraph.mxConstants.STYLE_IMAGE] = bar.img
          vm.graph.getStylesheet().putCellStyle(bar.type, style)
        })
      }
    })
    const MxRubberband = mxgraph.mxRubberband
    const rubberband = new MxRubberband(vm.graph)
    rubberband.setEnabled(true)
    const MxUndoManager = mxgraph.mxUndoManager
    this.undoMng = new MxUndoManager()
    vm.connectSocketServer()
    fetchShellContent(vm.shell.id).then(res => {
      if (res.data) {
        vm.paint(vm.unzip(res.data))
      }
    }).catch(err => {
      if (err.status === 10002) {
        vm.$q.notify({
          message: vm.$t('response.error.10002'),
          position: 'top',
          color: 'negative'
        })
      } else {
        vm.$q.notify({
          message: err.data.error,
          position: 'top',
          color: 'negative'
        })
      }
    })
  }
}
</script>
