<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" :filter="table.filter" @request="searchModels" hide-header
             no-data-label="无数据" :rows-per-page-options="[0]" hide-bottom>
      <template v-slot:top-left>
        <q-select
          v-model="table.project"
          outlined
          dense
          label="选择工作区信息"
          :options="table.projectsCopy"
          option-value="id"
          option-label="name"
          label-color="cyan-8"
          color="cyan-8"
          use-input
          clearable
          @input="selectedProject"
          @filter="filterProject"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="scope.opt.status === '1' ? 'teal' : 'grey-5'" :label="scope.opt.status === '1' ? '有效' : '无效'" />
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </template>
      <template v-if="table.project && table.project.status === '1'" v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="table.filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search"/>
            <q-btn text-color="cyan-8" outline label="新建" @click="newModel"/>
          </template>
        </q-input>
      </template>
      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-4 col-md-3 col-lg-2 grid-style-transition"
        >
          <q-separator color="cyan-8" size="2px"/>
          <q-card :class="[props.row.status === '1' ? '' : 'bg-grey-5']" @click="loadModel(props)">
            <q-list dense>
              <q-item v-for="col in props.cols.filter(col => col.name !== 'desc')" :key="col.name">
                <q-item-section>
                  <q-item-label>{{ col.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption lines="1">{{ col.value }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </template>
    </q-table>
    <q-dialog v-model="editModelDialog.state" :position="editModelDialog.position" full-height>
      <q-card style="width: 100vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editModelDialog.title }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editModelDialog.model.code" label="模型编码 *" hint="数据库英文表名" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editModelDialog.model.name" label="模型名称 *" hint="数据库表名描述" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
          <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="editModelDialog.model.datasource.id" emit-value map-options option-value="id" :options="editModelDialog.datasourceList" label="数据库连接" clearable lazy-rules :rules="[ val => (val != null) || 'datasource is invalid' ]" @input="selectedDs">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section>
                  <q-item-label v-html="scope.opt.label" />
                  <q-item-label caption>host: {{ scope.opt.host }}</q-item-label>
                  <q-item-label caption>port: {{ scope.opt.port }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :label="scope.opt.category" color="cyan-8" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" type="textarea" rows="2" v-model="editModelDialog.model.description" label="描述" hint="描述"/>
          <q-table :data="editModelDialog.model.metadataList" :columns="editModelDialog.metadataColumns" :rows-per-page-options="[0]" row-key="id" separator="cell" hide-bottom title="字段">
            <template v-slot:top-right>
              <q-btn split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addMetadata"/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn size="xs" outline round color="negative" icon="remove"
                        @click="deleteMetadata(props)"></q-btn>
                </q-td>
                <q-td key="columnCode" :props="props">
                  {{ props.row.columnCode }}
                  <q-popup-edit v-model="props.row.columnCode" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.columnCode"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="columnName" :props="props">
                  {{ props.row.columnName }}
                  <q-popup-edit v-model="props.row.columnName" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.columnName"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="columnCategory" :props="props">
                  {{ props.row.columnCategory }}
                  <q-popup-edit v-model="props.row.columnCategory" :auto-save=true>
                    <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.columnCategory" :options="METADATA_CATEGORIES[editModelDialog.datasourceCategory]"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="primaryKey" :props="props">
                  {{ props.row.primaryKey ? '是' : '否' }}
                  <q-popup-edit v-model.number="props.row.primaryKey" :auto-save=true>
                    <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.primaryKey" />
                  </q-popup-edit>
                </q-td>
                <q-td key="notNull" :props="props">
                  {{ props.row.notNull ? '是' : '否' }}
                  <q-popup-edit v-model="props.row.notNull" :auto-save=true>
                    <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.notNull" />
                  </q-popup-edit>
                </q-td>
                <q-td key="autoIncrement" :props="props">
                  {{ props.row.autoIncrement ? '是' : '否' }}
                  <q-popup-edit v-model="props.row.autoIncrement" :auto-save=true>
                    <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.autoIncrement" />
                  </q-popup-edit>
                </q-td>
                <q-td key="columnLength" :props="props">
                  {{ props.row.columnLength }}
                  <q-popup-edit v-model="props.row.columnLength" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="props.row.columnLength" :disable="METADATA_CATEGORIES['columnLength'][props.row.columnCategory]"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="columnDecimal" :props="props">
                  {{ props.row.columnDecimal }}
                  <q-popup-edit v-model.number="props.row.columnDecimal" :auto-save=true>
                    <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="props.row.columnDecimal" :disable="METADATA_CATEGORIES['columnDecimal'][props.row.columnCategory]"/>
                  </q-popup-edit>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="保存" outline text-color="cyan-8" :icon="table.saveIcon" @click="saveModel"/>
          <q-btn label="生成SQL" outline text-color="cyan-8" :icon="table.saveIcon" @click="generateSql"/>
          <q-btn label="删除" outline text-color="negative" :icon="table.deleteIcon" @click="deleteModel"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import {
  deleteModel,
  fetchAllModels,
  fetchModel,
  saveModel,
  generateSql,
  executeSql
} from 'src/service/ModelService'
import { fetchAllProjects } from 'src/service/ProjectService'
import { fetchAllDatasource } from 'src/service/DatasourceService'
import { mdiContentSaveOutline, mdiTrashCanOutline } from '@quasar/extras/mdi-v5'
import Constant from 'src/constant/Constant'

export default {
  data () {
    return {
      table: {
        saveIcon: mdiContentSaveOutline,
        deleteIcon: mdiTrashCanOutline,
        project: null,
        filter: null,
        loading: false,
        projects: [],
        projectsCopy: [],
        data: [],
        columns: [
          {
            name: 'code',
            label: '模型编码',
            field: 'code',
            align: 'left'
          },
          {
            name: 'name',
            label: '模型名称',
            field: 'name',
            align: 'left'
          },
          {
            name: 'description',
            label: '描述',
            field: 'description',
            align: 'left'
          },
          {
            name: 'status',
            label: '状态',
            field: 'status',
            align: 'left',
            format: (val, row) => {
              return val === '1' ? '有效' : '无效'
            }
          }
        ]
      },
      editModelDialog: {
        state: false,
        position: 'right',
        title: '编辑',
        datasourceCategory: 'mysql',
        model: {
          id: null,
          code: null,
          name: null,
          description: null,
          status: null,
          project: {},
          datasource: {},
          metadataList: []
        },
        metadataColumns: [
          {
            name: 'operate',
            label: '操作',
            field: 'operate',
            align: 'right',
            headerStyle: 'width: 20px'
          },
          {
            name: 'columnCode',
            label: '编码',
            field: 'columnCode',
            align: 'left'
          },
          {
            name: 'columnName',
            label: '名称',
            field: 'columnName',
            align: 'left'
          },
          {
            name: 'columnCategory',
            label: '类型',
            field: 'columnCategory',
            align: 'left'
          },
          {
            name: 'primaryKey',
            label: '主键',
            field: 'primaryKey',
            align: 'left'
          },
          {
            name: 'notNull',
            label: '非空',
            field: 'notNull',
            align: 'left'
          },
          {
            name: 'autoIncrement',
            label: '自增',
            field: 'autoIncrement',
            align: 'left'
          },
          {
            name: 'columnLength',
            label: '长度',
            field: 'columnLength',
            align: 'left'
          },
          {
            name: 'columnDecimal',
            label: '小数位',
            field: 'columnDecimal',
            align: 'left'
          }
        ],
        datasourceList: [],
        columnCategories: Constant.METADATA_CATEGORIES.mysql
      },
      METADATA_CATEGORIES: Constant.METADATA_CATEGORIES
    }
  },
  methods: {
    searchProjects () {
      const vm = this
      fetchAllProjects({}).then(res => {
        vm.table.projects = res.data
      })
    },
    filterProject (val, update) {
      if (val === '') {
        update(() => {
          this.table.projectsCopy = this.table.projects
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.table.projectsCopy = this.table.projects.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    selectedProject (val) {
      const vm = this
      if (val) {
        this.searchModels()
        fetchAllDatasource({
          id: this.table.project.id,
          ignoreStatus: false
        }).then(res => {
          vm.editModelDialog.datasourceList = []
          res.data.forEach(ele => {
            vm.editModelDialog.datasourceList.push({
              id: ele.id,
              label: ele.name,
              category: ele.category,
              host: ele.host,
              port: ele.port
            })
          })
        })
      } else {
        vm.table.data = []
      }
    },
    searchModels () {
      const vm = this
      vm.table.loading = true
      const query = {
        id: vm.table.project.id,
        payload: vm.table.filter
      }
      fetchAllModels(query).then(res => {
        vm.table.data = res.data
        this.table.loading = false
      })
    },
    loadModel (props) {
      if (props.row.status === '0') {
        return
      }
      const vm = this
      fetchModel(props.key).then(res => {
        vm.editModelDialog = Object.assign(vm.editModelDialog, {
          state: true,
          model: {
            id: res.data.id,
            code: res.data.code,
            name: res.data.name,
            description: res.data.description,
            resourceCode: res.data.resourceCode,
            status: res.data.status,
            project: res.data.project,
            datasource: res.data.datasource,
            metadataList: res.data.metadataList
          }
        })
        vm.editModelDialog.datasourceCategory = res.data.datasource.category
      }).catch(err => {
        if (err.status === 10002) {
          vm.$q.notify({
            message: '未授权的模型!',
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
    },
    newModel () {
      const vm = this
      var result = ''
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      var charactersLength = characters.length
      for (var i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      vm.editModelDialog = Object.assign(vm.editModelDialog, {
        state: true,
        model: {
          id: null,
          code: null,
          name: null,
          description: null,
          resourceCode: result,
          status: null,
          project: { id: vm.table.project.id },
          datasource: {},
          metadataList: []
        }
      })
    },
    selectedDs (val) {
      if (val) {
        const vm = this
        vm.editModelDialog.datasourceList.forEach(ds => {
          if (val === ds.id) {
            vm.editModelDialog.datasourceCategory = ds.category
          }
        })
      }
    },
    saveModel () {
      const vm = this
      saveModel(vm.editModelDialog.model).then(res => {
        vm.searchModels()
        vm.editModelDialog = Object.assign(vm.editModelDialog, {
          state: false,
          model: {
            id: null,
            code: null,
            name: null,
            description: null,
            resourceCode: null,
            status: null,
            project: {},
            datasource: {},
            metadataList: []
          }
        })
        vm.$q.notify({
          message: '保存成功!',
          position: 'top',
          color: 'teal'
        })
      })
    },
    generateSql () {
      const vm = this
      generateSql(vm.editModelDialog.model.id).then(res => {
        this.$q.dialog({
          title: 'SQL',
          message: res.data,
          cancel: {
            label: '关闭',
            textColor: 'orange',
            outline: true
          },
          ok: {
            label: '执行SQL',
            textColor: 'teal',
            outline: true
          }
        }).onOk(() => {
          this.$q.dialog({
            title: 'Confirm',
            message: '确定执行SQL?',
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
            executeSql(vm.editModelDialog.model.id).then(res => {
              vm.$q.notify({
                message: '操作成功!',
                position: 'top',
                color: 'teal'
              })
            })
          })
        })
      })
    },
    deleteModel () {
      const vm = this
      this.$q.dialog({
        title: 'Confirm',
        message: '确定删除模型?',
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
        deleteModel(vm.editModelDialog.model.id).then(res => {
          vm.$q.notify({
            message: '删除成功!',
            position: 'top',
            color: 'teal'
          })
          vm.searchModels()
          vm.editModelDialog = Object.assign(vm.editModelDialog, {
            state: false,
            model: {
              id: null,
              code: null,
              name: null,
              description: null,
              resourceCode: null,
              status: null,
              project: {},
              datasource: {},
              metadataList: []
            }
          })
        })
      })
    },
    addMetadata () {
      this.editModelDialog.model.metadataList.push({
        columnCode: '',
        columnName: '',
        columnCategory: '',
        columnLength: 0,
        columnDecimal: 0,
        primaryKey: false,
        notNull: true,
        autoIncrement: false
      })
    },
    deleteMetadata (props) {
      this.editModelDialog.model.metadataList.splice(props.rowIndex, 1)
    },
    disabled (category, field) {
      return Constant.METADATA_CATEGORIES[field][category]
    }
  },
  computed: {
    metadataState () {
      return !this.editModelDialog.model.code
    }
  },
  mounted () {
    this.searchProjects()
  }
}
</script>
