<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" hide-header no-data-label="无数据" :rows-per-page-options="[0]" hide-bottom>
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
        <q-btn text-color="cyan-8" outline label="新建" @click="newDatasource"/>
      </template>
      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-4 col-md-3 col-lg-2 grid-style-transition"
        >
          <q-separator color="cyan-8" size="2px"/>
          <q-card :class="[props.row.status === '1' ? '' : 'bg-grey-5']" @click="loadDatasource(props)">
            <q-list dense>
              <q-item v-for="col in props.cols.filter(col => col.name !== 'desc')" :key="col.name">
                <q-item-section>
                  <q-item-label lines="1">{{ col.label }}</q-item-label>
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
    <q-dialog v-model="editDatasourceDialog.state" :position="editDatasourceDialog.position" full-height>
      <q-card style="width: 100vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">数据源连接</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form>
            <q-tabs v-model="editDatasourceDialog.tabOption" class="text-cyan-8" align="left">
              <q-tab name="basic" label="一般" />
              <q-tab name="option" label="选项" />
              <q-tab name="pool" label="连接池" />
            </q-tabs>
            <q-tab-panels v-model="editDatasourceDialog.tabOption" animated swipeable vertical transition-prev="jump-up" transition-next="jump-up">
              <q-tab-panel name="basic">
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editDatasourceDialog.datasource.name" label="连接名" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
                <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editDatasourceDialog.datasource.category" :options="editDatasourceDialog.categories" label="数据库类型"/>
                <br/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editDatasourceDialog.datasource.host" label="主机HOST地址"/>
                <br/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editDatasourceDialog.datasource.port" label="端口"/>
                <br/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editDatasourceDialog.datasource.schemaName" label="数据库SCHEMA"/>
                <br/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-if="databaseDialogOracle" v-model="editDatasourceDialog.datasource.dataSpace" label="数据表空间"/>
                <br v-if="databaseDialogOracle"/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-if="databaseDialogOracle" v-model="editDatasourceDialog.datasource.indexSpace" label="索引表空间"/>
                <br v-if="databaseDialogOracle"/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editDatasourceDialog.datasource.username" label="用户名"/>
                <br/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editDatasourceDialog.datasource.password" type="password" label="密码"/>
                <br/>
                <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-if="databaseDialogMysql" v-model="editDatasourceDialog.datasource.useCursor" label="Use Result Streaming Cursor"/>
              </q-tab-panel>
              <q-tab-panel name="option">
                <q-table :data="editDatasourceDialog.datasource.parameter" :columns="editDatasourceDialog.parameterColumns" title="参数" :rows-per-page-options="[]" row-key="name">
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td key="name" :props="props">
                        {{ props.row.name }}
                        <q-popup-edit v-model="props.row.name">
                          <q-input outlined color="cyan-8" v-model="props.row.name" dense autofocus />
                        </q-popup-edit>
                      </q-td>
                      <q-td key="value" :props="props">
                        {{ props.row.value }}
                        <q-popup-edit v-model="props.row.value">
                          <q-input outlined color="cyan-8" v-model="props.row.value" dense autofocus />
                        </q-popup-edit>
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </q-tab-panel>
              <q-tab-panel name="pool">
                <q-checkbox outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editDatasourceDialog.datasource.usePool" label="使用连接池" />
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editDatasourceDialog.datasource.poolInitialSize" label="连接池大小"/>
                <br/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editDatasourceDialog.datasource.poolMaxSize" autogrow label="最大空闲空间"/>
                <br/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editDatasourceDialog.datasource.poolInitial" autogrow label="连接池启动时初始化连接数"/>
                <br/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editDatasourceDialog.datasource.poolMaxActive" autogrow label="连接池同时能维持的最大连接数"/>
                <br/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editDatasourceDialog.datasource.poolMaxIdle" autogrow label="最大维持空闲连接数"/>
                <br/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editDatasourceDialog.datasource.poolMinIdle" autogrow label="最小维持空闲连接数"/>
                <br/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editDatasourceDialog.datasource.poolMaxWait" autogrow label="最大建立连接等待时间"/>
              </q-tab-panel>
            </q-tab-panels>
            <q-card-actions align="right" v-if="editDatasourceDialog.datasource.status !== '0'">
              <q-btn label="测试" outline text-color="primary" :icon="table.testIcon" @click="testDatasource"/>
              <q-btn label="保存" outline text-color="cyan-8" :icon="table.saveIcon" @click="saveDatasource"/>
              <q-btn label="删除" outline text-color="negative" :icon="table.deleteIcon" @click="deleteDatasource"/>
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { fetchAllProjects } from 'src/service/ProjectService'
import { fetchDatasource, fetchAllDatasource, saveDatasource, deleteDatasource, testDatasource } from 'src/service/DatasourceService'
import { mdiBugOutline, mdiContentSaveOutline, mdiTrashCanOutline } from '@quasar/extras/mdi-v5'

export default {
  data () {
    return {
      table: {
        testIcon: mdiBugOutline,
        saveIcon: mdiContentSaveOutline,
        deleteIcon: mdiTrashCanOutline,
        project: null,
        loading: false,
        projects: [],
        projectsCopy: [],
        data: [],
        columns: [
          {
            name: 'name',
            label: '名称',
            field: 'name',
            align: 'left'
          },
          {
            name: 'category',
            label: '类型',
            field: 'category',
            align: 'left'
          },
          {
            name: 'host',
            label: '主机地址',
            field: 'host',
            align: 'left'
          },
          {
            name: 'port',
            label: '端口',
            field: 'port',
            align: 'left'
          },
          {
            name: 'schemaName',
            label: 'schema',
            field: 'schemaName',
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
      editDatasourceDialog: {
        state: false,
        position: 'right',
        title: '数据库配置',
        tabOption: 'basic',
        datasource: {
          id: null,
          name: null,
          category: null,
          host: null,
          schemaName: null,
          port: null,
          username: null,
          password: null,
          dataSpace: null,
          indexSpace: null,
          useCursor: false,
          parameter: [],
          usePool: false,
          poolInitialSize: null,
          poolMaxSize: null,
          poolInitial: null,
          poolMaxActive: null,
          poolMaxIdle: null,
          poolMinIdle: null,
          poolMaxWait: null,
          status: null,
          project: {
            id: null
          }
        },
        categories: ['mysql', 'oracle'],
        parameterColumns: [
          { name: 'name', align: 'left', label: '参数名称', field: 'name' },
          { name: 'value', align: 'left', label: '参数值', field: 'value' }
        ]
      }
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
        fetchAllDatasource({
          id: val.id,
          ignoreStatus: true
        }).then(res => {
          vm.table.data = res.data
        })
      } else {
        vm.table.data = []
      }
    },
    loadDatasource (props) {
      const vm = this
      fetchDatasource(props.key).then(res => {
        vm.editDatasourceDialog = Object.assign(vm.editDatasourceDialog, {
          state: true,
          datasource: {
            id: res.data.id,
            name: res.data.name,
            category: res.data.category,
            host: res.data.host,
            schemaName: res.data.schemaName,
            port: res.data.port,
            username: res.data.username,
            password: res.data.password,
            dataSpace: res.data.dataSpace,
            indexSpace: res.data.indexSpace,
            usePool: res.data.usePool,
            useCursor: res.data.useCursor,
            poolInitialSize: res.data.poolInitialSize,
            poolMaxSize: res.data.poolMaxSize,
            poolInitial: res.data.poolInitial,
            poolMaxActive: res.data.poolMaxActive,
            poolMaxIdle: res.data.poolMaxIdle,
            poolMinIdle: res.data.poolMinIdle,
            poolMaxWait: res.data.poolMaxWait,
            status: res.data.status,
            project: {
              id: res.data.project.id
            }
          }
        })
      })
    },
    newDatasource () {
      this.editDatasourceDialog = Object.assign(this.editDatasourceDialog, {
        state: true,
        datasource: {
          id: null,
          name: null,
          category: null,
          host: null,
          schemaName: null,
          port: null,
          username: null,
          password: null,
          dataSpace: null,
          indexSpace: null,
          useCursor: false,
          parameter: [],
          usePool: false,
          poolInitialSize: null,
          poolMaxSize: null,
          poolInitial: null,
          poolMaxActive: null,
          poolMaxIdle: null,
          poolMinIdle: null,
          poolMaxWait: null,
          status: null,
          project: {
            id: null
          }
        }
      })
      for (let index = 0; index < 5; index++) {
        this.editDatasourceDialog.datasource.parameter.push({ name: '', value: '' })
      }
    },
    saveDatasource () {
      const vm = this
      const submitForm = Object.assign({}, vm.editDatasourceDialog.datasource, {
        project: {
          id: vm.table.project.id
        },
        parameter: null
      })
      submitForm.parameter = JSON.stringify(vm.editDatasourceDialog.datasource.parameter)
      saveDatasource(submitForm).then(res => {
        fetchAllDatasource({
          id: vm.table.project.id,
          ignoreStatus: true
        }).then(res => {
          vm.editDatasourceDialog.state = false
          vm.table.data = res.data
        })
        vm.$q.notify({
          message: '保存成功!',
          position: 'top',
          color: 'teal'
        })
      })
    },
    testDatasource () {
      const vm = this
      testDatasource({
        category: vm.editDatasourceDialog.datasource.category,
        host: vm.editDatasourceDialog.datasource.host,
        port: vm.editDatasourceDialog.datasource.port,
        schemaName: vm.editDatasourceDialog.datasource.schemaName,
        username: vm.editDatasourceDialog.datasource.username,
        password: vm.editDatasourceDialog.datasource.password
      }).then(res => {
        if (res.data) {
          vm.$q.notify({
            message: '连接成功!',
            position: 'top',
            color: 'teal'
          })
        } else {
          vm.$q.notify({
            message: '数据库连接失败!',
            position: 'top',
            color: 'negative'
          })
        }
      }).catch(err => {
        vm.$q.notify({
          message: err.data.error,
          position: 'top',
          color: 'negative'
        })
      })
    },
    deleteDatasource () {
      const vm = this
      this.$q.dialog({
        title: 'Confirm',
        message: '确定删除数据源?',
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
        deleteDatasource(vm.editDatasourceDialog.datasource.id).then(res => {
          fetchAllDatasource({
            id: vm.table.project.id,
            ignoreStatus: true
          }).then(res => {
            vm.table.data = res.data
            vm.editDatasourceDialog.state = false
          })
        })
      })
    }
  },
  computed: {
    databaseDialogOracle: function () {
      if (this.editDatasourceDialog.datasource.category === 'oracle') {
        return true
      }
      return false
    },
    databaseDialogMysql: function () {
      if (this.editDatasourceDialog.datasource.category === 'mysql567' || this.editDatasourceDialog.datasource.category === 'mysql8') {
        return true
      }
      return false
    }
  },
  mounted () {
    this.searchProjects()
  }
}
</script>
