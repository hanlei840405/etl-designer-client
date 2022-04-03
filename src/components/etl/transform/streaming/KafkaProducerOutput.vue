<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left" narrow-indicator>
        <q-tab name="main" label="主选项" />
        <q-tab name="options" label="选项" />
        <q-tab name="parameter" label="运行参数"/>
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" label="步骤名称" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.servers" label="Kafka服务器地址" hint="host:port,多个服务器用,间隔"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.clientId" label="客户端ID"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.topic" label="Topic"/>
          <br/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.keyField" :options="sourceFields" label="Key字段"/>
          <br/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.messageField" :options="sourceFields" label="消息字段"/>
        </q-tab-panel>
        <q-tab-panel name="options">
          <q-table :data="form.options" :columns="optionColumns" :rows-per-page-options="[0]"
                   row-key="name" separator="cell" hide-bottom title="Kafka连接配置">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addOptions"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                         @click="deleteOptions(props)"></q-btn>
                </q-td>
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
  </q-form>
  </div>
</template>

<script>

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
export default {
  name: 'KafkaProducerOutputMeta',
  data () {
    return {
      tab: 'main',
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
        { name: 'operate', label: '操作', filed: 'operate', align: 'right', headerStyle: 'width: 20px' },
        { name: 'name', label: '属性', field: 'name', align: 'left', headerStyle: 'width: 150px;' },
        { name: 'value', label: '值', field: 'value', align: 'left', headerStyle: 'width: 100px;' }
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
        if (step.ext !== undefined && step.ext !== 'undefined') {
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
        title: '错误',
        message: '来源字段中存在重复名称，组件禁止使用'
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
