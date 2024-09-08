<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="main" :label="$t('tab-main')" />
        <q-tab name="options" :label="$t('tab-option')" />
        <q-tab name="property" label="属性" />
        <q-tab name="runningConfig" :label="$t('tab-running-config')"/>
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined v-model="form.name" :label="$t('form-name')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-radio color="cyan-8" label-color="cyan-8" v-model="form.connection" val="ACTIVEMQ" label="Active MQ"/>
          <q-radio color="cyan-8" label-color="cyan-8" v-model="form.connection" val="ACTIVEMQ5" label="Active MQ5"/>
          <q-radio color="cyan-8" label-color="cyan-8" v-model="form.connection" val="WEBSPHERE" label="IBM MQ"/>
          <q-input outlined v-model="form.url" label="JMS URL"/>
          <br/>
          <q-radio color="cyan-8" label-color="cyan-8" v-model="form.destinationType" val="QUEUE" label="QUEUE"/>
          <q-radio color="cyan-8" label-color="cyan-8" v-model="form.destinationType" val="TOPIC" label="TOPIC"/>
          <q-input outlined v-model="form.destinationName" label="消息名称"/>
          <br/>
          <q-select clearable outlined v-model="form.messageField" :options="sourceFields" label="消息字段"/>
          <br/>
          <q-input outlined v-model="form.username" label="用户名"/>
          <br/>
          <q-input outlined v-model="form.password" label="密码"/>
        </q-tab-panel>
        <q-tab-panel name="options">
          <q-table :data="form.options" :columns="optionColumns" :rows-per-page-options="[0]"
                   row-key="name" separator="cell" hide-bottom title="选项">
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                </q-td>
                <q-td key="value" :props="props">
                  {{ props.row.value }}
                  <q-popup-edit v-model="props.row.value" :auto-save=true>
                    <q-input autofocus outlined v-model="props.row.value"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="property">
          <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]"
                   row-key="name" separator="cell" hide-bottom title="属性">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addParameter"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                         @click="deleteParameter(props)"></q-btn>
                </q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                  <q-popup-edit v-model="props.row.name" :auto-save=true>
                    <q-input autofocus outlined v-model="props.row.name"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="value" :props="props">
                  {{ props.row.value }}
                  <q-popup-edit v-model="props.row.value" :auto-save=true>
                    <q-input autofocus outlined v-model="props.row.value"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined v-model.number="form.parallel" :label="$t('form-number-thread-copies')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'UniqueRowsMeta', 'UniqueRowsByHashSetMeta', 'SetValueFieldMeta']
export default {
  name: 'JmsProducerMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        connection: null,
        url: null,
        destinationType: null,
        destinationName: null,
        messageField: null,
        username: null,
        password: null,
        options: [{
          name: 'DISABLE_MESSAGE_ID',
          value: null
        }, {
          name: 'DISABLE_MESSAGE_TIMESTAMP',
          value: null
        }, {
          name: 'DELIVERY_MODE',
          value: null
        }, {
          name: 'PRIORITY',
          value: null
        }, {
          name: 'TIME_TO_LIVE',
          value: null
        }, {
          name: 'DELIVERY_DELAY',
          value: null
        }, {
          name: 'JMS_CORRELATION_ID',
          value: null
        }, {
          name: 'JMS_TYPE',
          value: null
        }],
        parameters: [],
        parallel: 1,
        distribute: true
      },
      optionColumns: [
        { name: 'name', label: this.$t('column-name'), field: 'name', align: 'left', headerStyle: 'width: 150px;' },
        { name: 'value', label: this.$t('column-value'), field: 'value', align: 'left', headerStyle: 'width: 100px;' }
      ],
      parameterColumns: [
        { name: 'operate', label: this.$t('column-operate'), filed: 'operate', align: 'right', headerStyle: 'width: 20px' },
        { name: 'name', label: this.$t('column-name'), field: 'name', align: 'left', headerStyle: 'width: 150px;' },
        { name: 'value', label: this.$t('column-value'), field: 'value', align: 'left', headerStyle: 'width: 100px;' }
      ],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    addParameter () {
      this.form.parameters.push({
        field: null,
        name: null,
        category: 'String',
        lengthValue: -1,
        accuracy: -1,
        rename: null
      })
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
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
        title: vm.$t('dialog-title-error'),
        message: this.$t('warning-duplicate-source-field-name')
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
