<template>
  <q-page style="width: 100%; min-height: calc(100vh - 120px); margin-left: 0px;">
    <q-btn-group>
      <q-btn :label="$t('btn-component')" icon="keyboard_arrow_down">
        <q-menu>
          <q-list bordered v-show="shell.category === '1'">
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
          <q-list bordered v-show="shell.category === '2'">
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
      <q-btn :label="executing ? $t('btn-shutdown') : $t('btn-execute')" :icon="executing ? pauseIcon : runIcon" @click="execute"/>
      <q-btn :label="$t('btn-save')" :icon="saveIcon" @click="submitForm"/>
      <q-btn :label="$t('btn-delete')" :icon="deleteIcon" @click="confirmDeleteSelectedVertex"/>
      <q-btn :label="$t('btn-zoom-in')" icon="zoom_in" @click="graph.zoomIn()"/>
      <q-btn :label="$t('btn-zoom-out')" icon="zoom_out" @click="graph.zoomOut()"/>
      <q-btn :label="$t('btn-robin')" icon="rule" @click="roundRobin"/>
    </q-btn-group>
    <div ref="graphContainer" style="height: calc(100vh - 125px);"></div>
    <div ref="outlineContainer" style="z-index:1;position:absolute;overflow:hidden;bottom:0px;right:0px;width:160px;height:120px;background:transparent;border-style:solid;border-color:lightgray;"/>
    <q-dialog v-model="propertiesDialog.state" :position="propertiesDialog.position" persistent transition-show="scale" transition-hide="scale" full-height @before-hide="beforeClose">
    <q-card style="width: 100vw;">
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
        <q-btn outline text-color="cyan-8" :label="$t('btn-save')" icon="save" @click="$refs.step.submitForm()"/>
      </q-card-actions>
    </q-card>
    </q-dialog>
    <q-dialog v-model="logDialog.state">
      <q-card style="min-width: 25vw; min-height: 45vh">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ logDialog.title }}<q-circular-progress v-if="logDialog.showProcessing" indeterminate size="sm" color="cyan-8" class="q-ma-md"/></div>
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
  </q-page>
</template>

<script>
import pako from 'pako'
import mxgraph from '../../graph/index'
import JsonInputMeta from 'components/etl/transform/input/JsonInput.vue'
import TableInputMeta from 'components/etl/transform/input/TableInput.vue'
import TableOutputMeta from 'components/etl/transform/output/TableOutput.vue'
import JsonOutputMeta from 'components/etl/transform/output/JsonOutput.vue'
import InsertUpdateMeta from 'components/etl/transform/output/TableInsertUpdate.vue'
import DeleteMeta from 'components/etl/transform/output/TableDelete.vue'
import UpdateMeta from 'components/etl/transform/output/TableUpdate.vue'
import DatabaseLookupMeta from 'components/etl/transform/lookup/DatabaseLookup.vue'
import DatabaseJoinMeta from 'components/etl/transform/lookup/DatabaseJoin.vue'
import JavaScriptMeta from 'components/etl/transform/shell/JavaScript.vue'
import ExecSQLMeta from 'components/etl/transform/shell/ExecSql.vue'
import DummyTransMeta from 'components/etl/transform/process/Dummy.vue'
import SwitchCaseMeta from 'components/etl/transform/process/Switchcase.vue'
import DetectEmptyStreamMeta from 'components/etl/transform/process/DetectEmptyStream.vue'
import DetectLastRowMeta from 'components/etl/transform/process/DetectLastRow.vue'
import MailMeta from 'components/etl/transform/process/Mail.vue'
import WriteToLogMeta from 'components/etl/transform/process/WriteToLog.vue'
import DataGridMeta from 'components/etl/transform/input/DataGrid.vue'
import SetVariableMeta from 'components/etl/transform/shell/SetVariable.vue'
import GetVariableMeta from 'components/etl/transform/shell/GetVariable.vue'
import JobEntrySpecial from 'components/etl/job/common/JobEntrySpecial.vue'
import JobEntryTrans from 'components/etl/job/common/JobEntryTrans.vue'
import JobEntryDummy from 'components/etl/job/common/JobEntryDummy.vue'
import JobEntrySuccess from 'components/etl/job/common/JobEntrySuccess.vue'
import JobEntryJob from 'components/etl/job/common/JobEntryJob.vue'
import JobEntryEval from 'components/etl/job/shell/JobEntryEval.vue'
import JobEntrySetVariables from 'components/etl/job/common/JobEntrySetVariables.vue'
import ValueMapperMeta from 'components/etl/transform/convert/ValueMapper.vue'
import SplitFieldToRowsMeta from 'components/etl/transform/convert/SplitFieldToRows.vue'
import DenormaliserMeta from 'components/etl/transform/convert/Denormaliser.vue'
import StringCutMeta from 'components/etl/transform/convert/StringCut.vue'
import UniqueRowsMeta from 'components/etl/transform/convert/UniqueRows.vue'
import UniqueRowsByHashSetMeta from 'components/etl/transform/convert/UniqueRowsByHashSet.vue'
import ConstantMeta from 'components/etl/transform/convert/Constant.vue'
import FlattenerMeta from 'components/etl/transform/convert/Flattener.vue'
import FieldSplitterMeta from 'components/etl/transform/convert/FieldSplitter.vue'
import ReplaceStringMeta from 'components/etl/transform/convert/ReplaceString.vue'
import NormaliserMeta from 'components/etl/transform/convert/Normaliser.vue'
import SelectValuesMeta from 'components/etl/transform/convert/SelectValues.vue'
import RowGeneratorMeta from 'components/etl/transform/input/RowGenerator.vue'
import RestMeta from 'components/etl/transform/lookup/Rest.vue'
import JobEntrySimpleEval from 'components/etl/job/condition/JobEntrySimpleEval.vue'
import UserDefinedJavaClassMeta from 'components/etl/transform/shell/UserDefinedJavaClass.vue'
import ElasticSearchBulkMeta from 'components/etl/transform/output/ElasticsearchBulkInsert.vue'
import ExcelWriterStepMeta from 'components/etl/transform/output/ExcelWriter.vue'
import RandomValueMeta from 'components/etl/transform/input/RandomValue.vue'
import ConcatFieldsMeta from 'components/etl/transform/convert/ConcatFields.vue'
import RecordsFromStreamMeta from 'components/etl/transform/streaming/RecordsFromStream.vue'
import KafkaProducerOutputMeta from 'components/etl/transform/streaming/KafkaProducerOutput.vue'
import KafkaConsumerInputMeta from 'components/etl/transform/streaming/KafkaConsumerInput.vue'
import SetValueFieldMeta from 'components/etl/transform/convert/SetValueField.vue'
import MongoDbOutputMeta from 'components/etl/transform/output/MongodbOutput.vue'
import RowsToResultMeta from 'components/etl/transform/shell/RowsToResult.vue'
import RowsFromResultMeta from 'components/etl/transform/shell/RowsFromResult.vue'
import MultiMergeJoinMeta from 'components/etl/transform/lookup/MultiMergeJoin.vue'
import SortRowsMeta from 'components/etl/transform/convert/SortRows.vue'
import { fetchShell, saveShellContent } from '../../service/ShellService'
import { execute, stop } from '../../service/DesignerService'
import { mdiContentSaveOutline, mdiPlayOutline, mdiTrashCanOutline, mdiPause } from '@quasar/extras/mdi-v5'
import { uid } from 'quasar'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

const dragElt = document.createElement('div')
dragElt.style.border = 'dashed black 1px'
dragElt.style.width = '45px'
dragElt.style.height = '45px'
export default {
  name: 'Editor',
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
  data () {
    return {
      socket: null,
      stompClient: null,
      saveIcon: mdiContentSaveOutline,
      runIcon: mdiPlayOutline,
      deleteIcon: mdiTrashCanOutline,
      pauseIcon: mdiPause,
      executing: false,
      nodeNames: {},
      preNodes: [],
      nextNodes: [],
      graph: null,
      undoMng: null,
      outline: null,
      shell: {
        id: null,
        name: null,
        category: null,
        shellId: null,
        projectId: null,
        content: null
      },
      toolbar: {
        extend: false,
        transform: {
          stepInput: [{
            img: '/images/etl/TIP.svg',
            name: this.$t('component-category-input-table'),
            type: 'TableInputMeta'
          }, {
            img: '/images/etl/GNR.svg',
            name: this.$t('component-category-input-datagrid'),
            type: 'DataGridMeta'
          }, {
            img: '/images/etl/GEN.svg',
            name: this.$t('component-category-input-row-generator'),
            type: 'RowGeneratorMeta'
          }, {
            img: '/images/etl/JSI.svg',
            name: this.$t('component-category-input-json'),
            type: 'JsonInputMeta'
          }, {
            img: '/images/etl/RVA.svg',
            name: this.$t('component-category-input-random'),
            type: 'RandomValueMeta'
          }],
          stepOutput: [{
            img: '/images/etl/Delete.svg',
            name: this.$t('component-category-output-delete'),
            type: 'DeleteMeta'
          }, {
            img: '/images/etl/INU.svg',
            name: this.$t('component-category-output-upsert'),
            type: 'InsertUpdateMeta'
          }, {
            img: '/images/etl/UPD.svg',
            name: this.$t('component-category-output-update'),
            type: 'UpdateMeta'
          }, {
            img: '/images/etl/TOP.svg',
            name: this.$t('component-category-output-table'),
            type: 'TableOutputMeta'
          }, {
            img: '/images/etl/JSO.svg',
            name: this.$t('component-category-output-json'),
            type: 'JsonOutputMeta'
          }, {
            img: '/images/etl/XWS.svg',
            name: this.$t('component-category-output-excel'),
            type: 'ExcelWriterStepMeta'
          }, {
            img: '/images/etl/ESB.svg',
            name: this.$t('component-category-output-es'),
            type: 'ElasticSearchBulkMeta'
          }, {
            img: '/images/etl/MongoDB.svg',
            name: this.$t('component-category-output-mongo'),
            type: 'MongoDbOutputMeta'
          }],
          streaming: [{
            img: '/images/etl/get-records-from-stream.svg',
            name: this.$t('component-category-streaming-records-from'),
            type: 'RecordsFromStreamMeta'
          }, {
            img: '/images/etl/KafkaProducerOutput.svg',
            name: this.$t('component-category-streaming-kafka-producer'),
            type: 'KafkaProducerOutputMeta'
          }, {
            img: '/images/etl/KafkaConsumerInput.svg',
            name: this.$t('component-category-streaming-kafka-consumer'),
            type: 'KafkaConsumerInputMeta'
          }],
          stepConvert: [{
            img: '/images/etl/VMAP.svg',
            name: this.$t('component-category-convert-value-mapper'),
            type: 'ValueMapperMeta'
          }, {
            img: '/images/etl/SFtR.svg',
            name: this.$t('component-category-convert-split-field-to-rows'),
            type: 'SplitFieldToRowsMeta'
          }, {
            img: '/images/etl/UNP.svg',
            name: this.$t('component-category-convert-denormaliser'),
            type: 'DenormaliserMeta'
          }, {
            img: '/images/etl/SRC.svg',
            name: this.$t('component-category-convert-string-cut'),
            type: 'StringCutMeta'
          }, {
            img: '/images/etl/UNQ.svg',
            name: this.$t('component-category-convert-unique-rows'),
            type: 'UniqueRowsMeta'
          }, {
            img: '/images/etl/URH.svg',
            name: this.$t('component-category-convert-unique-rows-by-hash'),
            type: 'UniqueRowsByHashSetMeta'
          }, {
            img: '/images/etl/CST.svg',
            name: this.$t('component-category-convert-constant'),
            type: 'ConstantMeta'
          }, {
            img: '/images/etl/SEL.svg',
            name: this.$t('component-category-convert-select-values'),
            type: 'SelectValuesMeta'
          }, {
            img: '/images/etl/RST.svg',
            name: this.$t('component-category-convert-replace-string'),
            type: 'ReplaceStringMeta'
          }, {
            img: '/images/etl/SPL.svg',
            name: this.$t('component-category-convert-field-splitter'),
            type: 'FieldSplitterMeta'
          }, {
            img: '/images/etl/FLA.svg',
            name: this.$t('component-category-convert-flattener'),
            type: 'FlattenerMeta'
          }, {
            img: '/images/etl/NRM.svg',
            name: this.$t('component-category-convert-normaliser'),
            type: 'NormaliserMeta'
          }, {
            img: '/images/etl/ConcatFields.svg',
            name: this.$t('component-category-convert-concat-fields'),
            type: 'ConcatFieldsMeta'
          }, {
            img: '/images/etl/SVF.svg',
            name: this.$t('component-category-convert-set-value-field'),
            type: 'SetValueFieldMeta'
          }, {
            img: '/images/etl/SRT.svg',
            name: this.$t('component-category-convert-sort-rows'),
            type: 'SortRowsMeta'
          }],
          stepScript: [{
            img: '/images/etl/janino.svg',
            name: this.$t('component-category-script-java'),
            type: 'UserDefinedJavaClassMeta'
          }, {
            img: '/images/etl/SCR_mod.svg',
            name: this.$t('component-category-script-javaScript'),
            type: 'JavaScriptMeta'
          }, {
            img: '/images/etl/SQL.svg',
            name: this.$t('component-category-script-exec-sql'),
            type: 'ExecSQLMeta'
          }, {
            img: '/images/etl/SVA.svg',
            name: this.$t('component-category-script-set-variable'),
            type: 'SetVariableMeta'
          }, {
            img: '/images/etl/GVA.svg',
            name: this.$t('component-category-script-get-variable'),
            type: 'GetVariableMeta'
          }, {
            img: '/images/etl/TCH.svg',
            name: this.$t('component-category-script-rows-to-result'),
            type: 'RowsToResultMeta'
          }, {
            img: '/images/etl/FCH.svg',
            name: this.$t('component-category-script-rows-from-result'),
            type: 'RowsFromResultMeta'
          }],
          stepLookup: [{
            img: '/images/etl/DLU.svg',
            name: this.$t('component-category-lookup-database-lookup'),
            type: 'DatabaseLookupMeta'
          }, {
            img: '/images/etl/DBJ.svg',
            name: this.$t('component-category-lookup-database-join'),
            type: 'DatabaseJoinMeta'
          }, {
            img: '/images/etl/MJOINS.svg',
            name: this.$t('component-category-lookup-multi-merge-join'),
            type: 'MultiMergeJoinMeta'
          }, {
            img: '/images/etl/REST.svg',
            name: this.$t('component-category-lookup-rest'),
            type: 'RestMeta'
          }],
          stepWorkflow: [{
            img: '/images/etl/SWC.svg',
            name: this.$t('component-category-workflow-switch-case'),
            type: 'SwitchCaseMeta'
          }, {
            img: '/images/etl/DUM.svg',
            name: this.$t('component-category-workflow-dummy'),
            type: 'DummyTransMeta'
          }, {
            img: '/images/etl/MAIL.svg',
            name: this.$t('component-category-workflow-mail'),
            type: 'MailMeta'
          }, {
            img: '/images/etl/EMS.svg',
            name: this.$t('component-category-workflow-detect-empty-stream'),
            type: 'DetectEmptyStreamMeta'
          }, {
            img: '/images/etl/DLR.svg',
            name: this.$t('component-category-workflow-detect-last-row'),
            type: 'DetectLastRowMeta'
          }, {
            img: '/images/etl/WTL.svg',
            name: this.$t('component-category-workflow-write-to-log'),
            type: 'WriteToLogMeta'
          }]
        },
        job: {
          entryCommon: [{
            img: '/images/etl/STR.svg',
            name: this.$t('component-category-common-job-entry-special'),
            type: 'JobEntrySpecial'
          }, {
            img: '/images/etl/TRN.svg',
            name: this.$t('component-category-common-job-entry-trans'),
            type: 'JobEntryTrans'
          }, {
            img: '/images/etl/SUC.svg',
            name: this.$t('component-category-common-job-entry-success'),
            type: 'JobEntrySuccess'
          }, {
            img: '/images/etl/DUM.svg',
            name: this.$t('component-category-workflow-dummy'),
            type: 'JobEntryDummy'
          }, {
            img: '/images/etl/SVA.svg',
            name: this.$t('component-category-script-set-variable'),
            type: 'JobEntrySetVariables'
          }, {
            img: '/images/etl/JOB.svg',
            name: this.$t('component-category-common-job-entry-job'),
            type: 'JobEntryJob'
          }],
          entryScript: [
            {
              img: '/images/etl/SCR_mod.svg',
              name: this.$t('component-category-script-javaScript'),
              type: 'JobEntryEval'
            }
          ],
          conditionShell: [
            {
              img: '/images/etl/SEV.svg',
              name: this.$t('component-category-job-simple-eval'),
              type: 'JobEntrySimpleEval'
            }
          ]
        }
      },
      toolbarName: {
        stepInput: this.$t('component-category-input'),
        stepOutput: this.$t('component-category-output'),
        streaming: this.$t('component-category-streaming'),
        stepConvert: this.$t('component-category-convert'),
        stepScript: this.$t('component-category-script'),
        stepLookup: this.$t('component-category-lookup'),
        stepWorkflow: this.$t('component-category-process'),
        entryCommon: this.$t('component-category-common'),
        entryMail: this.$t('component-category-mail'),
        entryScript: this.$t('component-category-script'),
        conditionShell: this.$t('component-category-condition')
      },
      propertiesDialog: {
        state: false,
        position: 'right',
        title: null,
        propertiesDialogCmp: null
      },
      logDialog: {
        state: false,
        title: this.$t('dialog-title-log'),
        tabOption: 'trans',
        showProcessing: true,
        log: null,
        logData: [],
        transStepLogColumns: [
          {
            name: 'name',
            label: this.$t('column-name'),
            field: 'name'
          },
          {
            name: 'logDate',
            label: this.$t('column-logDate'),
            field: 'logDate'
          },
          {
            name: 'stepCopy',
            label: this.$t('column-stepCopy'),
            field: 'stepCopy',
            align: 'left'
          },
          {
            name: 'read',
            label: this.$t('column-read'),
            field: 'read',
            align: 'left'
          },
          {
            name: 'written',
            label: this.$t('column-written'),
            field: 'written',
            align: 'left'
          },
          {
            name: 'updated',
            label: this.$t('column-updated'),
            field: 'updated',
            align: 'left'
          },
          {
            name: 'input',
            label: this.$t('column-input'),
            field: 'input',
            align: 'left'
          },
          {
            name: 'output',
            label: this.$t('column-output'),
            field: 'output',
            align: 'left'
          },
          {
            name: 'rejected',
            label: this.$t('column-rejected'),
            field: 'rejected',
            align: 'left'
          },
          {
            name: 'errors',
            label: this.$t('column-errors'),
            field: 'errors',
            align: 'left'
          }
        ]
      },
      uuid: null,
      cancel: null,
      init: false,
      timer: null,
      showCellDialog: true
    }
  },
  methods: {
    execute () {
      const vm = this
      if (vm.executing) {
        vm.cancel(vm.$t('message-cancel-running-etl'))
        stop({
          id: vm.shell.id,
          payload: vm.uuid
        }).then(res => {
          vm.executing = false
          vm.logDialog.state = true
          vm.logDialog.showProcessing = false
          vm.logDialog.log = res.data.log
          vm.logDialog.logData = res.data.steps
        }).catch(err => {
          vm.executing = false
          if (err.status === 10001) {
            vm.$q.dialog({
              title: vm.$t('dialog-title-error'),
              ok: {
                color: 'negative'
              },
              html: true,
              message: vm.$t('dialog-message-not-found')
            })
          } else if (err.status === 10002) {
            vm.$q.dialog({
              title: vm.$t('dialog-title-error'),
              ok: {
                color: 'negative'
              },
              html: true,
              message: vm.$t('response-error-10002')
            })
          } else {
            vm.$q.dialog({
              title: vm.$t('dialog-title-error'),
              ok: {
                color: 'negative'
              },
              html: true,
              message: err.data.error
            })
          }
        })
      } else {
        vm.cancelToken = this.$axios.CancelToken
        vm.executing = true
        const MxCodec = mxgraph.mxCodec
        const encoder = new MxCodec()
        const node = encoder.encode(this.graph.getModel())
        const xml = mxgraph.mxUtils.getPrettyXml(node)
        vm.uuid = uid()
        vm.logDialog.state = true
        vm.logDialog.showProcessing = true
        execute(vm.uuid, {
          id: vm.shell.id,
          name: vm.shell.name,
          category: vm.shell.category,
          content: vm.zip(xml)
        }, {
          cancelToken: new vm.$axios.CancelToken(function executor (c) {
            vm.cancel = c
          })
        }).then(res => {
          vm.logDialog.log = null
          vm.logDialog.logData = []
          vm.stompClient.subscribe(vm.uuid, (response) => {
            const body = JSON.parse(response.body)
            vm.logDialog.log = body.log
            vm.logDialog.logData = body.steps
            if (!body.running) {
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
              title: vm.$t('dialog-title-error'),
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
    confirmDeleteSelectedVertex () {
      if (this.graph.getSelectionCells().length > 0) {
        this.$q.dialog({
          title: 'Confirm',
          message: this.$t('confirm-delete'),
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
          message: this.$t('message-no-component-selected'),
          color: 'negative'
        })
      }
    },
    roundRobin () {
      const vm = this
      const cells = this.graph.getSelectionCells()
      if (cells.length === 1 && !cells[0].edge) {
        const cell = cells[0]
        const form = JSON.parse(cell.getAttribute('form'))
        if (form.distribute) {
          this.$q.notify({
            position: 'top',
            message: this.$t('message-robin-mode'),
            color: 'negative'
          })
        } else {
          this.$q.dialog({
            title: 'Confirm',
            message: this.$t('confirm-robin-mode'),
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
            vm.graph.getModel().getOutgoingEdges(cell).forEach(edge => {
              // step运行出错时的容错操作
              const error = cell.getAttribute('error') ? JSON.parse(cell.getAttribute('error')) : {}
              if (error[edge.target.id]) {
                const span = document.createElement('span')
                span.setAttribute('class', 'material-icons')
                span.innerHTML = 'error_outline'
                vm.graph.getModel().setValue(edge, span)
              } else {
                vm.graph.getModel().setValue(edge, null)
              }
              form.distribute = true
              const data = this.graph.getModel().getValue(cell).cloneNode(true)
              data.setAttribute('form', JSON.stringify(form))
              vm.graph.getModel().setValue(cell, data)
              vm.graph.refresh(edge)
            })
          })
        }
      } else {
        this.$q.notify({
          position: 'top',
          message: this.$t('message-select-component'),
          color: 'negative'
        })
      }
    },
    deleteSelectedVertex () {
      const vm = this
      vm.graph.getModel().beginUpdate()
      try {
        const cells = vm.graph.getSelectionCells()
        if (cells != null && cells.length > 0) {
          vm.graph.removeCells(cells, true)
          cells.forEach(cell => {
            const title = cell.getAttribute('title')
            if (title) {
              const nr = title.match(/\d+$/gi) || [0]
              const name = title.replace(/\d+$/gi, '')
              vm.nodeNames[name].splice(vm.nodeNames[name].indexOf(Number(nr[0])), 1)
            }
          })
        }
      } finally {
        vm.graph.getModel().endUpdate()
      }
    },
    showStepProperties (item, formVal) {
      this.propertiesDialog.title = item.getAttribute('title', '')
      this.propertiesDialog.propertiesDialogCmp = item.style
      this.$store.commit('etl/setRoot', {
        id: this.shell.id,
        shellId: this.shell.shellId,
        projectId: this.shell.projectId
      })
      this.$store.commit('etl/setPreNodes', this.preNodes)
      this.$store.commit('etl/setNextNodes', this.nextNodes)
      const form = formVal ? JSON.parse(formVal) : {}
      form.name = this.propertiesDialog.title
      this.$store.commit('etl/setMxCellForm', form)
      this.propertiesDialog = Object.assign(this.propertiesDialog, {
        state: true
      })
    },
    beforeClose () {
      if (this.init) {
        this.$refs.step.submitForm()
      }
    },
    closePropertiesDialog (val) {
      this.init = false
      if (val.state) {
        this.propertiesDialog = Object.assign(this.propertiesDialog, {
          state: false
        })
        this.graph.getModel().beginUpdate()
        const cell = this.graph.getSelectionCell()
        try {
          if (cell && cell.vertex) {
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
        message: this.$t('message-loading-save')
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
        vm.$q.notify({
          position: 'top',
          message: vm.$t('response-save-success-file', [vm.shell.name]),
          color: 'green-10',
          html: true
        })
      }).catch(err => {
        this.$q.loading.hide()
        if (err.data.code === 400) {
          vm.$q.notify({
            position: 'top',
            message: vm.$t('response-check-error-file'),
            color: 'negative'
          })
        } else {
          vm.$q.notify({
            position: 'top',
            message: vm.$t('response-save-error-file', [vm.shell.name]),
            color: 'negative',
            html: true
          })
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
    getPreNodes (node, root, depth) {
      const incoming = this.graph.getModel().getIncomingEdges(node)
      for (let i = 0; i < incoming.length; i++) {
        const edge = incoming[i]
        if (edge.source && edge.source.id !== root.id) {
          const sourceCell = this.graph.getModel().getCell(edge.source.id)
          this.preNodes.push({
            value: edge.source.id,
            title: sourceCell.getAttribute('title'),
            ext: sourceCell.getAttribute('ext'),
            type: sourceCell.style,
            depth: depth
          })
          this.getPreNodes(edge.source, root, depth + 1)
        }
      }
    },
    getNextNodes (node) {
      const outgoing = this.graph.getModel().getOutgoingEdges(node)
      const array = []
      for (let i = 0; i < outgoing.length; i++) {
        const edge = outgoing[i]
        if (edge.target && edge.target.id !== node.id) {
          const targetCell = this.graph.getModel().getCell(edge.target.id)
          array.push(targetCell)
        }
      }
      return array
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
    load (xml) {
      const xmlDocument = mxgraph.mxUtils.parseXml(this.unzip(xml, { to: 'string' }))
      if (xmlDocument.documentElement != null && xmlDocument.documentElement.nodeName === 'mxGraphModel') {
        const MxCodec = mxgraph.mxCodec
        const decoder = new MxCodec(xmlDocument)
        const node = xmlDocument.documentElement
        const cells = decoder.decode(node, this.graph.getModel()).cells
        for (const cell in cells) {
          if (cells[cell].vertex === 1) {
            const title = cells[cell].getAttribute('title')
            if (title) {
              const nr = title.match(/\d+$/gi) || [0]
              const name = title.replace(/\d+$/gi, '')
              this.refreshNodeName(name, nr[0])
            }
          }
        }
      }
      this.graph.refresh()
      this.graph.clearSelection()
    },
    dragable (key, category) {
      const vm = this
      const array = []
      if (category === '1') {
        vm.toolbar.job[key].forEach(item => {
          array.push(item)
        })
      } else {
        vm.toolbar.transform[key].forEach(item => {
          array.push(item)
        })
      }
      array.forEach(bar => {
        mxgraph.mxEvent.addListener(vm.$refs[bar.type][0].$el, 'dragstart', function (evt) {
          evt.returnValue = false
        })
        const ds = mxgraph.mxUtils.makeDraggable(vm.$refs[bar.type][0].$el, vm.graph, function (graph, evt, target, x, y) {
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
              vm.preNodes = []
              vm.nextNodes = []
              vm.showStepProperties(cell, JSON.stringify(form))
            }
            // const vertex = graph.insertVertex(graph.getDefaultParent(), null, data, x - 22, y - 22, 45, 45, bar.type)
            // graph.setSelectionCells([vertex])
            // graph.stopEditing(false)
            // vm.init = true
            // vm.preNodes = []
            // vm.nextNodes = []
            // vm.showStepProperties(vertex, JSON.stringify(form))
          } finally {
            graph.getModel().endUpdate()
          }
        }, dragElt, null, null, vm.graph.autoscroll, true)
        ds.isGuidesEnabled = function () {
          return vm.graph.graphHandler.guidesEnabled
        }
      })
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
              message: this.$t('message-reconnect-server'),
              position: 'top',
              color: 'negative'
            })
          }
          vm.socket = new SockJS(process.env.API + '/socket')
          vm.stompClient = Stomp.over(vm.socket)
          vm.stompClient.connect({}, () => {
            vm.$q.notify({
              message: this.$t('message-connected-server'),
              position: 'top',
              color: 'green-10'
            })
          })
        }
      }
      fn()
      vm.timer = setInterval(() => fn(), 5000)
    }
  },
  mounted () {
    const vm = this
    const hasErrorPortCompArray = ['TableOutputMeta', 'InsertUpdateMeta', 'UpdateMeta', 'DeleteMeta', 'DatabaseLookupMeta', 'DatabaseJoinMeta', 'JsonInputMeta', 'ElasticSearchBulkMeta', 'JavaScriptMeta', 'UserDefinedJavaClassMeta', 'ExecSQLMeta', 'RestMeta', 'MailMeta', 'FieldSplitterMeta', 'StringCutMeta', 'ReplaceStringMeta', 'SetValueFieldMeta']
    const hasCaseCompArray = ['SwitchCaseMeta']
    mxgraph.mxConstants.VERTEX_SELECTION_COLOR = '#00897C'
    mxgraph.mxConstants.STYLE_STROKECOLOR = '#00897C'
    mxgraph.mxConstants.EDGE_SELECTION_COLOR = '#00897C'
    mxgraph.mxConstants.VERTEX_SELECTION_STROKEWIDTH = '2'
    mxgraph.mxConstants.EDGE_SELECTION_STROKEWIDTH = '2'
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
    vm.graph.addListener(mxgraph.mxEvent.CLICK, function (sender, evt) {
      if (!vm.showCellDialog) {
        vm.showCellDialog = true
        return false
      }
      const cell = evt.getProperty('cell')
      const mouse = evt.getProperty('event')
      if (cell && cell.isVertex() && mouse.button === 0) {
        vm.preNodes = []
        vm.nextNodes = []
        vm.getPreNodes(cell, cell, 0)
        vm.getNextNodes(cell).forEach(node => {
          vm.nextNodes.push({
            value: node.id,
            title: node.getAttribute('title'),
            ext: node.getAttribute('ext')
          })
        })
        vm.init = false
        vm.showStepProperties(cell, cell.getAttribute('form', ''))
      }
    })
    vm.graph.addListener(mxgraph.mxEvent.REMOVE_CELLS, (sender, evt) => {
      const cells = evt.getProperty('cells') || []
      const previews = {}
      const deleted = []
      cells.forEach(cell => {
        if (cell.isEdge()) {
          const source = vm.graph.getModel().getCell(cell.source.id)
          if (source) {
            previews[cell.source.id] = source
          }
        } else {
          deleted.push(cell.id)
        }
      })
      for (const id in previews) {
        const source = previews[id]
        const data = vm.graph.getModel().getValue(source).cloneNode(true)
        // 清理无目标的error容错对象
        const error = data.getAttribute('error') ? JSON.parse(data.getAttribute('error')) : {}
        for (const key in error) {
          if (deleted.indexOf(key) >= 0) {
            delete error[key]
          }
        }
        data.setAttribute('error', JSON.stringify(error))
        const form = data.getAttribute('form') ? JSON.parse(data.getAttribute('form')) : null
        if (form) {
          if (!form.distribute) {
            // 出口如果小于2时，将模式改为轮询模式，将edge的样式取消复制图标
            if (vm.graph.getModel().getOutgoingEdges(source).length < 2) {
              form.distribute = true
              data.setAttribute('form', JSON.stringify(form))
              // 将edge的样式取消复制图标
              vm.graph.getModel().getOutgoingEdges(source).forEach(edge => {
                if (error[edge.target.id]) {
                  const span = document.createElement('span')
                  span.setAttribute('class', 'material-icons')
                  span.innerHTML = 'error_outline'
                  vm.graph.getModel().setValue(edge, span)
                } else {
                  vm.graph.getModel().setValue(edge, null)
                }
                // vm.graph.refresh(edge)
              })
            }
          }
        }
        vm.graph.getModel().setValue(source, data)
      }
    })
    // cell添加连接事件
    vm.graph.addListener(mxgraph.mxEvent.CELL_CONNECTED, (sender, evt) => {
      const source = evt.getProperty('edge').source
      // vm.graph.removeSelectionCell(source)
      const target = evt.getProperty('edge').target
      // vm.graph.addSelectionCell(target)
      // cell加入选中集合
      vm.graph.addSelectionCell(evt.getProperty('edge'))
      const data = vm.graph.getModel().getValue(source)
      if (vm.shell.category === '2' && source.style !== 'SwitchCaseMeta' && target && vm.graph.getModel().getOutgoingEdges(source).length > 1) {
        const form = JSON.parse(data.getAttribute('form'))
        vm.$q.dialog({
          title: vm.$t('confirm-title-output-mode'),
          ok: {
            outline: true,
            textColor: 'white',
            color: 'teal',
            label: vm.$t('confirm-output-robin-mode')
          },
          cancel: {
            outline: true,
            textColor: 'white',
            color: 'negative',
            label: vm.$t('confirm-output-copy-mode')
          },
          persistent: true
        }).onOk(() => {
          form.distribute = true
        }).onCancel(() => {
          vm.graph.getModel().getOutgoingEdges(source).forEach(outgoing => {
            const span = outgoing.value
            const copySpan = document.createElement('span')
            copySpan.setAttribute('class', 'material-icons')
            copySpan.innerHTML = 'content_copy'
            if (span) {
              if (span.innerText.indexOf('content_copy') < 0) {
                span.append(copySpan)
                vm.graph.getModel().setValue(outgoing, span)
              }
            } else {
              vm.graph.getModel().setValue(outgoing, copySpan)
            }
            form.distribute = false
          })
        }).onDismiss(() => {
          data.setAttribute('form', JSON.stringify(form))
          vm.graph.getModel().setValue(source, data)
        })
      }
    })
    // 添加连接线事件
    mxgraph.mxConnectionHandler.prototype.insertEdge = function (parent, id, value, source, target, style) {
      vm.showCellDialog = false
      // style = mxgraph.mxConstants.STYLE_STROKECOLOR + '=#00897C;' + mxgraph.mxConstants.STYLE_FONTCOLOR + '=#00897C;'
      const node = vm.getClosedLoopNode(source, target.id)
      const data = vm.graph.getModel().getValue(source).cloneNode(true)
      if (vm.shell.category === '1') {
        // 脚本类型为job时
        const outgoings = vm.graph.getModel().getOutgoingEdges(source)
        const link = data.getAttribute('link') ? JSON.parse(data.getAttribute('link')) : {}
        if (source.style !== 'JobEntrySpecial') {
          vm.$q.dialog({
            title: vm.$t('confirm-title-output-condition'),
            options: {
              type: 'radio',
              model: outgoings.length > 0 ? 2 : 1,
              items: [
                {
                  label: vm.$t('confirm-output-unconditional'),
                  value: 0
                },
                {
                  label: vm.$t('confirm-output-true'),
                  value: 1
                },
                {
                  label: vm.$t('confirm-output-false'),
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
            vm.graph.insertEdge(parent, null, span, source, target, style)
            data.setAttribute('link', JSON.stringify(link))
            vm.graph.getModel().setValue(source, data)
          })
        } else {
          const span = document.createElement('span')
          span.setAttribute('class', 'material-icons')
          span.innerHTML = 'lock'
          link[target.id] = 0
          vm.graph.insertEdge(parent, null, span, source, target, style)
          data.setAttribute('link', JSON.stringify(link))
          vm.graph.getModel().setValue(source, data)
        }
      } else if (vm.shell.category === '2') {
        const error = data.getAttribute('error') ? JSON.parse(data.getAttribute('error')) : {}
        // 脚本类型为trans时
        if (node) {
          vm.$q.notify({
            position: 'top',
            message: vm.$t('message-loop-call-prohibited'),
            color: 'negative'
          })
        } else if (hasErrorPortCompArray.indexOf(source.style) > -1) {
          vm.$q.dialog({
            title: vm.$t('confirm-title-output-mode'),
            ok: {
              outline: true,
              color: 'teal',
              textLine: 'teal',
              label: vm.$t('confirm-output-normal')
            },
            cancel: {
              outline: true,
              textLine: 'negative',
              color: 'negative',
              label: vm.$t('confirm-output-abnormal')
            },
            persistent: true
          }).onOk(() => {
            if (error[target.id]) {
              delete error[target.id]
            }
            vm.graph.getModel().setValue(source, data)
            vm.graph.insertEdge(parent, null, value, source, target, style)
          }).onCancel(() => {
            error[target.id] = true
            data.setAttribute('error', JSON.stringify(error))
            style = mxgraph.mxConstants.STYLE_STROKECOLOR + '=#ff0000;' + mxgraph.mxConstants.STYLE_FONTCOLOR + '=#ff0000;'
            const span = document.createElement('span')
            span.setAttribute('class', 'material-icons')
            span.innerHTML = 'error_outline'
            vm.graph.insertEdge(parent, null, span, source, target, style)
            vm.graph.getModel().setValue(source, data)
          })
        } else if (hasCaseCompArray.indexOf(source.style) > -1) {
          vm.$q.dialog({
            title: vm.$t('confirm-title-output-mode'),
            ok: {
              outline: true,
              textColor: 'teal',
              color: 'teal',
              label: vm.$t('confirm-output-defalut')
            },
            cancel: {
              outline: true,
              textColor: 'negative',
              color: 'negative',
              label: vm.$t('confirm-output-conditional')
            },
            persistent: true
          }).onOk(() => {
            const span = document.createElement('span')
            span.setAttribute('class', 'material-icons')
            span.innerHTML = 'info'
            vm.graph.insertEdge(parent, null, span, source, target, style)
          }).onCancel(() => {
            style = mxgraph.mxConstants.STYLE_STROKECOLOR + '=#ff0000;' + mxgraph.mxConstants.STYLE_FONTCOLOR + '=#ff0000;'
            const span = document.createElement('span')
            span.setAttribute('class', 'material-icons')
            span.innerHTML = 'help'
            vm.graph.insertEdge(parent, null, span, source, target, style)
          })
        } else {
          vm.graph.insertEdge(parent, null, value, source, target, style)
        }
      } else {
        vm.graph.insertEdge(parent, null, value, source, target, style)
      }
    }
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
          const bounds = new MxRectangle(state.x - 10, state.y, 35, 0)
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
    vm.graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
      const popFn = function (graph, menu, cell, evt) {
        if (cell != null) {
          menu.addItem(vm.$t('btn-delete'), null, function () {
            vm.deleteSelectedVertex()
          })
          if (vm.shell.category === '2' && cell.isVertex()) {
            menu.addItem(vm.$t('btn-robin'), null, function () {
              graph.getModel().getOutgoingEdges(cell).forEach(edge => {
                const error = cell.getAttribute('error') ? JSON.parse(cell.getAttribute('error')) : {}
                if (error[edge.target.id]) {
                  const span = document.createElement('span')
                  span.setAttribute('class', 'material-icons')
                  span.innerHTML = 'error_outline'
                  graph.getModel().setValue(edge, span)
                } else {
                  graph.getModel().setValue(edge, null)
                }
                const form = JSON.parse(cell.getAttribute('form'))
                form.distribute = false
                const data = graph.getModel().getValue(cell).cloneNode(true)
                data.setAttribute('form', JSON.stringify(form))
                graph.getModel().setValue(cell, data)
                graph.refresh(edge)
              })
            })
          }
        }
      }
      return popFn(vm.graph, menu, cell, evt)
    }
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
    fetchShell(vm.$route.params.id).then(res => {
      vm.$q.loading.hide()
      vm.shell = Object.assign(vm.shell, {
        id: res.data.id,
        name: res.data.name,
        category: res.data.category,
        shellId: res.data.shell ? res.data.shell.id : null,
        projectId: res.data.project.id,
        content: res.data.content
      })
      vm.load(res.data.content)
    }).catch(err => {
      if (err !== 'incorrect header check') {
        vm.$q.dialog({
          title: vm.$t('dialog-title-error'),
          ok: {
            color: 'negative'
          },
          html: true,
          message: err.data ? err.data.error : vm.$t('response-error-connect')
        })
      }
    })
  },
  activated () {
  },
  destroyed () {
    const vm = this
    if (vm.timer) {
      clearInterval(vm.timer)
      if (vm.stompClient.connected) {
        vm.stompClient.disconnect(() => {
          console.log('disconnect success')
        })
      }
    }
  }
}
</script>
