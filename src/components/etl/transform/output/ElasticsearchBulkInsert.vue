<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
              narrow-indicator>
        <q-tab name="main" label="主选项"/>
        <q-tab name="server" label="服务器配置"/>
        <q-tab name="mapping" label="字段映射"/>
        <q-tab name="parameter" label="运行参数"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" v-model="form.name" label="步骤名称" lazy-rules
                   :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" v-model="form.index" label="index"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" v-model="form.type" label="type"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" v-model="form.batchSize" label="batch size"/>
          <br/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" v-model="form.idField" :options="sourceFields" label="ID字段"/>
          <br/>
          <div class="row">
            <q-input class="col-sm-6" outlined text-color="cyan-8" color="cyan-8" v-model.number="form.time" label="batch timeout"/>
            <q-select class="col-sm-6" clearable outlined text-color="cyan-8" color="cyan-8" v-model="form.timeUnit" :options="timeUnits" label="时间单位"/>
          </div>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" v-model="form.stopOnError" label="出现错误即终止?" />
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" v-model="form.overwriteIfExist" label="覆盖重复数据?" />
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" v-model="form.outputRows" label="返回数据?" />
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" v-model="form.outputId" label="返回的ID字段" :disable="!form.outputRows"/>
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" v-model="form.fromJson" label="数据来源于JSON?" />
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" v-model="form.jsonField" label="JSON字段名"/>
        </q-tab-panel>
        <q-tab-panel name="server">
          <q-table :data="form.servers" :columns="serverColumns" :rows-per-page-options="[0]" row-key="name"
                   separator="cell" hide-bottom title="服务器设置">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addServer"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                         @click="deleteServer(props)"></q-btn>
                </q-td>
                <q-td key="address" :props="props">
                  {{ props.row.address }}
                  <q-popup-edit v-model="props.row.address" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" v-model="props.row.address"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="port" :props="props">
                  {{ props.row.port }}
                  <q-popup-edit v-model="props.row.port" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" v-model="props.row.port"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
          <q-table :data="form.settings" :columns="settingColumns" :rows-per-page-options="[0]" row-key="name"
                   separator="cell" hide-bottom title="连接参数">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addSetting"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                         @click="deleteSetting(props)"></q-btn>
                </q-td>
                <q-td key="setting" :props="props">
                  {{ props.row.setting }}
                  <q-popup-edit v-model="props.row.setting" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" v-model="props.row.setting"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="value" :props="props">
                  {{ props.row.value }}
                  <q-popup-edit v-model="props.row.value" :auto-save=true>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" v-model="props.row.value"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
          <q-card-actions align="left">
            <q-btn label="测试" outline text-color="cyan-8" :icon="testBtnIcon" @click="test"/>
          </q-card-actions>
        </q-tab-panel>
        <q-tab-panel name="mapping">
          <q-table :data="form.mappings" :columns="mappingColumns" :rows-per-page-options="[0]" row-key="name"
                   separator="cell" hide-bottom title="字段">
            <template v-slot:top-right>
              <q-btn-dropdown split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addMapping">
                <q-list>
                  <q-item clickable v-close-popup @click="appendDiffMapping">
                    <q-item-section>
                      <q-item-label>增加新的</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="addAllMapping">
                    <q-item-section>
                      <q-item-label>增加所有</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="clearAndAddMapping">
                    <q-item-section>
                      <q-item-label>清除并增加所有</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                         @click="deleteMapping(props)"></q-btn>
                </q-td>
                <q-td key="field" :props="props">
                  {{ props.row.field }}
                  <q-popup-edit v-model="props.row.field" :auto-save="true">
                    <q-select autofocus stack-label outlined text-color="cyan-8" color="cyan-8" v-model="props.row.field" :options="sourceFields" @input="props.row.target = toHump(props.row.field)" v-if="sourceFields.length > 0"/>
                    <q-input autofocus text-color="cyan-8" color="cyan-8" v-model="props.row.source" v-if="sourceFields.length === 0"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="target" :props="props">
                  {{ props.row.target }}
                  <q-popup-edit v-model="props.row.target" :auto-save="true">
                    <q-input autofocus text-color="cyan-8" color="cyan-8" v-model="props.row.target"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="parameter">
          <q-input outlined text-color="cyan-8" color="cyan-8" v-model.number="form.parallel" label="执行线程数" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
    </q-form>
  </div>
</template>

<script>
import { mdiBugOutline } from '@quasar/extras/mdi-v5'
import { testConnection } from '../../../../service/ElasticSearchService'
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
export default {
  name: 'ElasticSearchBulkMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        index: null,
        type: null,
        idField: null,
        batchSize: 50000,
        time: null,
        timeUnit: 'SECONDS',
        stopOnError: true,
        overwriteIfExist: false,
        outputRows: false,
        fromJson: false,
        outputId: null,
        jsonField: null,
        servers: [],
        mappings: [],
        settings: [],
        parallel: 1,
        errorNext: null,
        errorEnable: false,
        errorCountName: null,
        errorColumnDescription: null,
        errorColumnName: null,
        errorColumnCode: null,
        errorMaxCount: 0,
        errorRate: 0,
        errorMinRows: 0
      },
      testBtnIcon: mdiBugOutline,
      serverColumns: [
        {
          name: 'operate',
          label: '操作',
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'address',
          label: '地址',
          field: 'address',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'port',
          label: '端口',
          field: 'port',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      mappingColumns: [
        {
          name: 'operate',
          label: '操作',
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: '流中字段',
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'target',
          label: '目标字段',
          field: 'target',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      settingColumns: [
        {
          name: 'operate',
          label: '操作',
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'setting',
          label: '连接参数',
          field: 'setting',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'value',
          label: '值',
          field: 'value',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      timeUnits: ['NANOSECONDS', 'MICROSECONDS', 'MILLISECONDS', 'SECONDS', 'MINUTES', 'HOURS', 'HOURS', 'DAYS'],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    getCode (key) {
      const value = this.mappings.filter(mapping => mapping.label === key)
      if (value.length > 0) {
        return value[0].code
      }
      return null
    },
    validate (val) {
      return val != null
    },
    toHump (value) {
      return value.toLowerCase().replace(/_(\w)/g, function ($0, $1) {
        return $1.toUpperCase()
      })
    },
    addServer () {
      this.form.servers.push({
        address: null,
        port: null
      })
    },
    deleteServer (props) {
      this.form.servers.splice(props.rowIndex, 1)
    },
    addMapping () {
      this.form.mappings.push({
        field: null,
        target: null
      })
    },
    appendDiffMapping () {
      const vm = this
      const items = vm.form.mappings.filter(parameter => vm.sourceFields.indexOf(parameter.field) >= 0)
      const array = vm.sourceFields
      items.forEach(item => {
        array.splice(array.findIndex(i => i === item.field), 1)
      })
      array.forEach(field => {
        this.form.mappings.push({
          field: field,
          target: null
        })
      })
    },
    addAllMapping () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.mappings.push({
          field: field,
          target: null
        })
      })
    },
    clearAndAddMapping () {
      this.form.mappings = []
      this.addAllMapping()
    },
    deleteMapping (props) {
      this.form.mappings.splice(props.rowIndex, 1)
    },
    addSetting () {
      this.form.settings.push({
        setting: null,
        value: null
      })
    },
    deleteSetting (props) {
      this.form.settings.splice(props.rowIndex, 1)
    },
    test () {
      const vm = this
      const payload = {
        servers: vm.form.servers,
        settings: vm.form.settings
      }
      testConnection({
        payload: JSON.stringify(payload)
      }).then(res => {
        vm.$q.notify({
          message: '连接成功!集群名称: ' + res.data.name + ', 分片数量: ' + res.data.numNodes,
          position: 'top',
          color: 'cyan-8'
        })
      }).catch(err => {
        if (err.status === 10013) {
          vm.$q.notify({
            message: '连接失败',
            position: 'top',
            color: 'negative'
          })
        }
      })
    },
    submitForm () {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: { sourceFields: [this.form.outputId] }
      })
    }
  },
  mounted () {
    const vm = this
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
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
            vm.sourceFields = ext.sourceFields
            if (vm.form.mappings.length === 0) {
              ext.sourceFields.forEach(field => {
                vm.form.mappings.push({
                  field: field,
                  target: vm.toHump(field)
                })
              })
            }
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
  }
}
</script>
