<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.kafkaProducerOutput.tabBasic')" />
        <q-tab name="options" :label="$t('form.kafkaProducerOutput.tabOption')" />
        <q-tab name="runningConfig" :label="$t('form.kafkaProducerOutput.tabRunningConfig')"/>
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.kafkaProducerOutput.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.servers" :label="$t('form.kafkaProducerOutput.server')" hint="host:port,host:port..."/>
          <q-input class="col-12 col-md-6" outlined v-model="form.clientId" :label="$t('form.kafkaProducerOutput.kafkaClientId')" hint=""/>
          <q-input class="col-12 col-md-6" outlined v-model="form.topic" label="Topic" hint=""/>
          <q-select class="col-12 col-md-6" clearable outlined v-model="form.keyField" :options="sourceFields" :label="$t('form.kafkaProducerOutput.KeyField')" hint=""/>
          <q-select class="col-12 col-md-6" clearable outlined v-model="form.messageField" :options="sourceFields" :label="$t('form.kafkaProducerOutput.messageField')" hint=""/>
        </q-tab-panel>
        <q-tab-panel name="options">
          <q-table :data="form.options" :columns="optionColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.kafkaProducerOutput.tableKafkaConnection')">
            <template v-slot:top-right>
              <q-btn size="sm" outline color="primary" icon="add" @click="addOptions"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteOptions(props)"></q-btn>
                </q-td>
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
          <q-input outlined type="number" v-model.number="form.parallel" :label="$t('form.kafkaProducerOutput.threads')" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'SetValueFieldMeta']
export default {
  name: 'KafkaProducerOutputMeta',
  data () {
    return {
      tab: 'basic',
      form: {
        name: null,
        servers: null,
        clientId: null,
        topic: null,
        keyField: null,
        messageField: null,
        options: [{
          name: 'compression.type',
          value: 'none'
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
      optionColumns: [
        { name: 'operate', label: this.$t('form.kafkaProducerOutput.columnOperate'), filed: 'operate', align: 'right', headerStyle: 'width: 20px' },
        { name: 'name', label: this.$t('form.kafkaProducerOutput.columnName'), field: 'name', align: 'left', headerStyle: 'width: 150px;' },
        { name: 'value', label: this.$t('form.kafkaProducerOutput.columnValue'), field: 'value', align: 'left', headerStyle: 'width: 100px;' }
      ],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    validate (val) {
      return val != null
    },
    addOptions () {
      this.form.options.push({
        name: null,
        value: null
      })
    },
    deleteOptions (props) {
      this.form.options.splice(props.rowIndex, 1)
    },
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form
      })
    }
  },
  computed: {
  },
  mounted () {
    const vm = this
    const previousSteps = vm.$store.getters['etl/getPreNodes']
    vm.sourceFields = []
    const replaceFields = []
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach((step, i) => {
        if (i === 0 && FORBIDDEN_NEXT_STEP_PARALLEL.indexOf(step.type) >= 0) {
          vm.forbiddenParallel = true
        }
        if (step.ext !== undefined && step.ext !== 'undefined' && IGNORE_REPEAT_WARNING_META.indexOf(step.type) < 0) {
          const ext = JSON.parse(step.ext)
          if (ext.sourceFields) {
            ext.sourceFields.forEach(field => {
              vm.sourceFields.push(field)
            })
          }
          if (ext.replaceFields) {
            ext.replaceFields.forEach(field => {
              replaceFields.push(field)
            })
          }
        }
      })
    }
    replaceFields.forEach(field => {
      vm.sourceFields.splice(vm.sourceFields.indexOf(field), 1)
    })
    if (new Set(vm.sourceFields).size !== vm.sourceFields.length) {
      vm.$q.dialog({
        dark: true,
        title: vm.$t('message.error.default'),
        message: this.$t('message.error.duplicateSourceField')
      }).onOk(() => {
        this.$emit('propertiesForm', {
          state: true,
          mxCellProperties: this.form,
          ext: {
            sourceFields: []
          }
        })
      })
    }
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      if (vm.form.name !== mxCellValue.name) {
        vm.form = Object.assign(vm.form, mxCellValue)
      }
    }
  }
}
</script>
