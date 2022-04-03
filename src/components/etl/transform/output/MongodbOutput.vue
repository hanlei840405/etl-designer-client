<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
              narrow-indicator>
        <q-tab name="main" label="主选项"/>
        <q-tab name="option" label="选项"/>
        <q-tab name="field" label="字段"/>
        <q-tab name="index" label="索引"/>
        <q-tab name="parameter" label="运行参数"/>
      </q-tabs>
      <q-separator/>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="main">
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" class="col-8" v-model="form.name" label="步骤名称" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.host" label="地址" />
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.port" label="端口" />
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.ssl" label="启用SSL连接"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.replica" label="当连接多个主机时，选择所有的集合副本"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.authenticateDB" label="验证的数据库"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.username" label="用户名"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.password" label="密码"/>
          <br/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.mechanism" :options="mechanismOptions" label="验证机制"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.kerberos" label="使用kerberos算法验证"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.connectTimeout" label="超时时间设置"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.socketTimeout" label="socket连接时间"/>
        </q-tab-panel>
        <q-tab-panel name="option">
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.database" :options="databaseNames" label="database">
            <template v-slot:append>
              <q-btn round dense flat icon="autorenew" text-color="cyan-8" @click="loadDBNames"/>
            </template>
          </q-select>
          <br/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.collection" :options="collectionNames" label="集合">
            <template v-slot:append>
              <q-btn round dense flat icon="autorenew" text-color="cyan-8" @click="loadCollections"/>
            </template>
          </q-select>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.batchInsertSize" label="批量写入阈值" />
          <br/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.truncate" label="清空集合"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.update" label="只更新" @click.native="changeUpdateStatus"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.upSert" label="更新或新增" :disable="!form.update"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.modifierUpdate" label="modifier update" :disable="!form.update" @click.native="changeUpdateStatus"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.multiUpdate" label="多个更新" :disable="!form.modifierUpdate"/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.writeCorn" :options="writeCorns" label="写入策略">
            <template v-slot:append>
              <q-btn round dense flat icon="autorenew" text-color="cyan-8" @click="loadWriteConcerns"/>
            </template>
          </q-select>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.writeCornTimeout" label="写入策略超时设置"/>
          <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.journaled" label="journaled方式"/>
          <q-select clearable outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.readPreference" :options="readPreferenceOptions" label="读偏好" :disable="!form.modifierUpdate"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.writeRetryTimes" label="写重试次数"/>
          <br/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.delay" label="距上次重试延迟时间(s)"/>
        </q-tab-panel>
        <q-tab-panel name="field">
          <q-chip square text-color="cyan-8" icon="bookmark" style="width: 100%; margin: 0px;">
            点击添加按钮后，可直接单击单元格编辑
          </q-chip>
          <q-table :data="form.fieldMapping" :columns="fieldMappingColumns" :rows-per-page-options="[0]"
                   row-key="name" separator="cell" hide-bottom title="字段">
            <template v-slot:top-right>
              <q-btn-dropdown split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addFieldMapping">
                <q-list>
                  <q-item clickable v-close-popup @click="appendDiffParameter">
                    <q-item-section>
                      <q-item-label>增加新的</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="addAllParameter">
                    <q-item-section>
                      <q-item-label>增加所有</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="clearAndAddParameter">
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
                         @click="deleteFieldMapping(props)"></q-btn>
                </q-td>
                <q-td key="source" :props="props">
                  {{ props.row.source }}
                  <q-popup-edit v-model="props.row.source" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.source" :options="sourceFields" v-if="sourceFields.length > 0"/>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.source" v-if="sourceFields.length === 0"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="target" :props="props">
                  {{ props.row.target }}
                  <q-popup-edit v-model="props.row.target" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.target"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="useSourceField" :props="props">
                  {{ props.row.useSourceField }}
                <q-popup-edit v-model="props.row.useSourceField" :auto-save=true>
                  <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.useSourceField" :options="yesOrNo"/>
                </q-popup-edit>
                </q-td>
                <q-td key="nullValue" :props="props">
                  {{ props.row.nullValue }}
                <q-popup-edit v-model="props.row.nullValue" :auto-save=true>
                  <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.nullValue" :options="nulValues"/>
                </q-popup-edit>
                </q-td>
                <q-td key="json" :props="props">
                  {{ props.row.json }}
                <q-popup-edit v-model="props.row.json" :auto-save=true>
                  <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.json" :options="yesOrNo"/>
                </q-popup-edit>
                </q-td>
                <q-td key="match" :props="props">
                  {{ props.row.match }}
                <q-popup-edit v-model="props.row.match" :auto-save=true>
                  <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.match" :options="yesOrNo"/>
                </q-popup-edit>
                </q-td>
                <q-td key="modifierMode" :props="props">
                  {{ props.row.modifierMode }}
                  <q-popup-edit v-model="props.row.modifierMode" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.modifierMode" :options="modifierModes"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="modifierPolicy" :props="props">
                  {{ props.row.modifierPolicy }}
                  <q-popup-edit v-model="props.row.modifierPolicy" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.modifierPolicy" :options="modifierPolicies"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-tab-panel>
        <q-tab-panel name="index">
          <q-chip square text-color="cyan-8" icon="bookmark" style="width: 100%; margin: 0px;">
            点击添加按钮后，可直接单击单元格编辑
          </q-chip>
          <q-table :data="form.indices" :columns="indexColumns" :rows-per-page-options="[0]"
                   row-key="name" separator="cell" hide-bottom title="字段">
            <template v-slot:top-right>
              <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addIndex"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                         @click="deleteIndex(props)"></q-btn>
                </q-td>
                <q-td key="index" :props="props">
                  {{ props.row.index }}
                  <q-popup-edit v-model="props.row.index" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.index"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="operation" :props="props">
                  {{ props.row.operation }}
                <q-popup-edit v-model="props.row.operation" :auto-save=true>
                  <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.operation" :options="indexOperations"/>
                </q-popup-edit>
                </q-td>
                <q-td key="unique" :props="props">
                  {{ props.row.unique }}
                <q-popup-edit v-model="props.row.unique" :auto-save=true>
                  <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.unique" :options="yesOrNo"/>
                </q-popup-edit>
                </q-td>
                <q-td key="sparse" :props="props">
                  {{ props.row.sparse }}
                <q-popup-edit v-model="props.row.sparse" :auto-save=true>
                  <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.sparse" :options="yesOrNo"/>
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
import { collections, dbNames, writeConcerns } from 'src/service/MongodbService'

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
export default {
  name: 'MongoDbOutputMeta',
  data () {
    return {
      tab: 'main',
      form: {
        name: null,
        host: null,
        port: null,
        ssl: false,
        replica: false,
        authenticateDB: null,
        username: null,
        password: null,
        mechanism: null,
        kerberos: false,
        connectTimeout: null,
        socketTimeout: null,
        database: null,
        collection: null,
        batchInsertSize: '10000',
        truncate: false,
        update: false,
        upSert: false,
        multiUpdate: false,
        modifierUpdate: false,
        writeCorn: null,
        writeCornTimeout: null,
        journaled: false,
        readPreference: null,
        writeRetryTimes: '5',
        delay: '10',
        fieldMapping: [],
        indices: [],
        parallel: 1,
        errorEnable: false,
        errorCountName: null,
        errorColumnDescription: null,
        errorColumnName: null,
        errorColumnCode: null,
        errorMaxCount: 0,
        errorRate: 0,
        errorMinRows: 0,
        distribute: true
      },
      mechanismOptions: ['SCRAM-SHA-1', 'MONGODB-CR'],
      readPreferenceOptions: ['primary', 'primaryPreferred', 'secondary', 'secondaryPreferred', 'nearest'],
      databaseNames: [],
      collectionNames: [],
      writeCorns: [],
      yesOrNo: ['Y', 'N'],
      nulValues: ['Insert NULL', 'Ignore'],
      modifierModes: ['N/A', '$set', '$inc', '$push'],
      modifierPolicies: ['Insert&Update', 'Insert', 'Update'],
      indexOperations: ['Create', 'Drop'],
      fieldMappingColumns: [
        {
          name: 'operate',
          label: '操作',
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'source',
          label: '来源流字段',
          field: 'source',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'target',
          label: '目标表字段',
          field: 'target',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'useSourceField',
          label: '使用源字段名字',
          field: 'useSourceField',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'nullValue',
          label: '空值策略',
          field: 'nullValue',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'json',
          label: '是否JSON',
          field: 'json',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'match',
          label: '匹配到字段更新',
          field: 'match',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'modifierMode',
          label: 'modifier模式',
          field: 'modifierMode',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'modifierPolicy',
          label: 'modifier策略',
          field: 'modifierPolicy',
          align: 'left',
          headerStyle: 'width: 150px;'
        }
      ],
      indexColumns: [
        {
          name: 'operate',
          label: '操作',
          filed: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'index',
          label: '索引',
          field: 'index',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'operation',
          label: '索引操作',
          field: 'operation',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'unique',
          label: '唯一',
          field: 'unique',
          align: 'left',
          headerStyle: 'width: 150px;'
        },
        {
          name: 'sparse',
          label: '稀疏索引',
          field: 'sparse',
          align: 'left',
          headerStyle: 'width: 150px;'
        }
      ],
      sourceFields: [],
      forbiddenParallel: false
    }
  },
  methods: {
    loadDBNames () {
      const vm = this
      const params = {
        host: vm.form.host,
        port: vm.form.port,
        replica: vm.form.replica,
        authenticateDB: vm.form.authenticateDB,
        mechanism: vm.form.mechanism,
        username: vm.form.username,
        password: vm.form.password,
        kerberos: vm.form.kerberos
      }
      dbNames({
        payload: JSON.stringify(params)
      }).then(res => {
        vm.databaseNames = res.data
      }).catch(err => {
        vm.$q.notify({
          position: 'top',
          message: err.data.error,
          color: 'negative'
        })
      })
    },
    loadCollections () {
      const vm = this
      const params = {
        host: vm.form.host,
        port: vm.form.port,
        replica: vm.form.replica,
        authenticateDB: vm.form.authenticateDB,
        mechanism: vm.form.mechanism,
        username: vm.form.username,
        password: vm.form.password,
        kerberos: vm.form.kerberos,
        database: vm.form.database
      }
      collections({
        payload: JSON.stringify(params)
      }).then(res => {
        vm.collectionNames = res.data
      }).catch(err => {
        vm.$q.notify({
          position: 'top',
          message: err.data.error,
          color: 'negative'
        })
      })
    },
    loadWriteConcerns () {
      const vm = this
      const params = {
        host: vm.form.host,
        port: vm.form.port,
        replica: vm.form.replica,
        authenticateDB: vm.form.authenticateDB,
        mechanism: vm.form.mechanism,
        username: vm.form.username,
        password: vm.form.password,
        kerberos: vm.form.kerberos,
        database: vm.form.database
      }
      writeConcerns({
        payload: JSON.stringify(params)
      }).then(res => {
        vm.writeCorns = res.data
      }).catch(err => {
        vm.$q.notify({
          position: 'top',
          message: err.data.error,
          color: 'negative'
        })
      })
    },
    addFieldMapping () {
      this.form.fieldMapping.push({
        source: null,
        target: null,
        useSourceField: null,
        nullValue: null,
        json: null,
        match: null,
        modifierMode: null,
        modifierPolicy: null
      })
    },
    appendDiffParameter () {
      const vm = this
      const items = vm.form.fieldMapping.filter(parameter => vm.sourceFields.indexOf(parameter.source) >= 0)
      const array = vm.sourceFields
      items.forEach(item => {
        array.splice(array.findIndex(i => i === item.source), 1)
      })
      array.forEach(field => {
        this.form.fieldMapping.push({
          source: field,
          target: null,
          useSourceField: null,
          nullValue: null,
          json: null,
          match: null,
          modifierMode: null,
          modifierPolicy: null
        })
      })
    },
    addAllParameter () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.fieldMapping.push({
          source: field,
          target: null,
          useSourceField: null,
          nullValue: null,
          json: null,
          match: null,
          modifierMode: null,
          modifierPolicy: null
        })
      })
    },
    clearAndAddParameter () {
      this.form.fieldMapping = []
      this.addAllParameter()
    },
    deleteFieldMapping (props) {
      this.form.fieldMapping.splice(props.rowIndex, 1)
    },
    addIndex () {
      this.form.indices.push({
        index: null,
        operation: null,
        unique: null,
        sparse: null
      })
    },
    deleteIndex (props) {
      this.form.indices.splice(props.rowIndex, 1)
    },
    changeUpdateStatus () {
      if (!this.form.update) {
        this.form.upSert = this.form.modifierUpdate = false
      }
      if (!this.form.modifierUpdate) {
        this.form.multiUpdate = false
        this.form.readPreference = null
      }
    },
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form
      })
    }
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
