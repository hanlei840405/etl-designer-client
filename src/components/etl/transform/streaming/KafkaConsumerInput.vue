<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.kafkaConsumerInput.tabBasic')" />
        <q-tab name="fields" :label="$t('form.kafkaConsumerInput.tabField')" />
        <q-tab name="options" :label="$t('form.kafkaConsumerInput.tabOption')" />
        <q-tab name="runningConfig" :label="$t('form.kafkaConsumerInput.tabRunningConfig')"/>
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.kafkaConsumerInput.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.servers" :label="$t('form.kafkaConsumerInput.server')" hint="host:port,host:port..."/>
          <q-input class="col-12 col-md-6" outlined v-model="form.shellName" :label="$t('form.kafkaConsumerInput.transformation')" hint="">
            <template v-slot:append>
              <q-btn round dense flat icon="search" @click="openShellSelectDialog"/>
            </template>
          </q-input>
          <q-input class="col-12 col-md-6" outlined v-model="form.consumerGroup" label="Consumer group" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model.number="form.duration" :label="$t('form.kafkaConsumerInput.duration')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model.number="form.records" :label="$t('form.kafkaConsumerInput.numberRecords')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model.number="form.batches" :label="$t('form.kafkaConsumerInput.maxBatches')" hint=""/>
          <q-radio class="col-12 col-md-2" v-model="form.commitMode" val="record" :label="$t('form.kafkaConsumerInput.commitModeRecordRead')" hint=""/>
          <q-radio class="col-12 col-md-4" v-model="form.commitMode" val="batch" :label="$t('form.kafkaConsumerInput.commitModeBatch')" hint=""/>
          <q-table class="col-12" dense :data="form.topics" :columns="topicColumns" :rows-per-page-fields="[0]" row-key="topic" separator="cell" hide-bottom title="Topic">
            <template v-slot:top-right>
              <q-btn dense split outline color="primary" icon="add" @click="addParameter"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn dense size="xs" outline round color="negative" icon="remove" @click="deleteParameter(props)"></q-btn>
                </q-td>
                <q-td key="topic" :props="props">
                  {{ props.row.topic }}
                  <q-popup-edit v-model="props.row.topic" :auto-save="true">
                    <q-input autofocus v-model="props.row.topic"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="fields">
          <q-table :data="form.fields" :columns="fieldColumns" :rows-per-page-fields="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.kafkaConsumerInput.tableField')">
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="inputName" :props="props">
                  {{ props.row.inputName }}
                </q-td>
                <q-td key="outputName" :props="props">
                  {{ props.row.outputName }}
                  <q-popup-edit v-model="props.row.outputName" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.outputName"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="category" :props="props">
                  {{ props.row.category }}
                  <q-popup-edit v-model="props.row.category" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.category" :fields="categories"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
          <q-select clearable outlined v-model="form.returnFieldByStepValue" :options="nextSteps" emit-value map-options :label="$t('form.kafkaConsumerInput.returnFieldFrom')" @input="setStepName"/>
        </q-tab-panel>
        <q-tab-panel name="options">
          <q-table :data="form.options" :columns="optionColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.kafkaConsumerInput.tableKafkaConnection')">
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                  <q-popup-edit v-model="props.row.name" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.name"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="value" :props="props">
                  {{ props.row.value }}
                  <q-popup-edit v-model="props.row.value" :auto-save="true">
                    <q-input autofocus outlined v-model="props.row.value"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined v-model.number="form.parallel" :label="$t('form.kafkaConsumerInput.threads')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
      <q-dialog v-model="selectShellDialog.state">
        <q-card style="min-height: 45vh; min-width: 700px;">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ $t('form.kafkaConsumerInput.transformation') }}</div>
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

import pako from 'pako'
import mxgraph from 'src/mxgraph/index'
import { fetchShellsByParent, fetchShell } from 'src/service/kettle/ShellService'

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
export default {
  name: 'KafkaConsumerInputMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        servers: null,
        shellId: null,
        shellName: null,
        topics: [],
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
      topicColumns: [
        { name: 'operate', label: this.$t('form.kafkaConsumerInput.columnOperate'), filed: 'operate', align: 'right', headerStyle: 'width: 20px' },
        { name: 'topic', label: "Topic", field: 'topic', align: 'left' }
      ],
      fieldColumns: [
        { name: 'inputName', label: this.$t('form.kafkaConsumerInput.columnInput'), field: 'inputName', align: 'left', headerStyle: 'width: 150px;' },
        { name: 'outputName', label: this.$t('form.kafkaConsumerInput.columnOutput'), field: 'outputName', align: 'left', headerStyle: 'width: 100px;' },
        { name: 'category', label: this.$t('form.kafkaConsumerInput.columnType'), field: 'category', align: 'left', headerStyle: 'width: 100px;' }
      ],
      optionColumns: [
        { name: 'name', label: this.$t('form.kafkaConsumerInput.columnName'), field: 'name', align: 'left', headerStyle: 'width: 150px;' },
        { name: 'value', label: this.$t('form.kafkaConsumerInput.columnValue'), field: 'value', align: 'left', headerStyle: 'width: 100px;' }
      ],
      categories: ['String', 'Integer', 'Binary', 'Number'],
      nextSteps: [],
      forbiddenParallel: false,
      selectShellDialog: {
        state: false,
        projectId: null,
        parentId: null,
        shells: []
      }
    }
  },
  methods: {
    setStepName () {
      this.nextSteps.forEach(item => {
        if (item.value === this.form.returnFieldByStepValue) {
          this.form.returnFieldByStep = item.label
        }
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
    selectShell (shell) {
      if (shell) {
        if (shell.category === '2') {
          this.form.shellId = shell.id
          this.form.shellName = shell.name
          this.selectShellDialog.state = false
          this.nextSteps = []
          const xml = this.unzip(res.data.content, { to: 'string' })
          const xmlDocument = mxgraph.mxUtils.parseXml(xml)
          if (xmlDocument.documentElement != null && xmlDocument.documentElement.nodeName === 'mxGraphModel') {
            const MxCodec = mxgraph.mxCodec
            const decoder = new MxCodec(xmlDocument)
            let node = xmlDocument.documentElement.children[0].firstChild
            while (node != null) {
              const cell = decoder.decodeCell(node)
              if (cell && cell.vertex === 1) {
                this.nextSteps.push({ value: cell.id, label: cell.getAttribute('title') })
              }
              node = node.nextSibling
            }
          }
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
    unzip (data) {
      const charData = atob(data).split('').map(function (x) {
        return x.charCodeAt(0)
      })
      const binData = new Uint8Array(charData)
      return pako.inflate(binData, { to: 'string' })
    },
    addParameter () {
      this.form.topics.push({
        topic: null
      })
    },
    deleteParameter (props) {
      this.form.topics.splice(props.rowIndex, 1)
    }
  },
  mounted () {
    const previousSteps = this.$store.getters['etl/getPreNodes']
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach((step, i) => {
        if (i === 0 && FORBIDDEN_NEXT_STEP_PARALLEL.indexOf(step.type) >= 0) {
          this.forbiddenParallel = true
        }
      })
    }
    const mxCellValue = this.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      if (this.form.name !== mxCellValue.name) {
        this.form = Object.assign(this.form, mxCellValue)
        // this.selectDependencyShell()
      }
    }
    const root = this.$store.getters['etl/getRoot']
    this.selectShellDialog.parentId = root.parentId
    this.selectShellDialog.projectId = root.projectId
  }
}
</script>
