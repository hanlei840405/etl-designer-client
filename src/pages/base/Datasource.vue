<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" hide-header :filter="table.filter" @request="searchDatasourceList" 
    :no-data-label="$t('table.empty')" :rows-per-page-options="[18,36,60]" :pagination.sync="table.pagination">
      <template v-slot:top-left>
        <q-select
          v-model="project"
          outlined
          :label="$t('form.project.select.default')"
          :options="table.projectsCopy"
          option-value="id"
          option-label="name"
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
            </q-item>
          </template>
        </q-select>
      </template>
      <template v-slot:top-right>
        <q-btn v-if="project" outline color="primary" :label="$t('button.create')" @click="newDatasource"/>
      </template>
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-3 grid-style-transition">
          <q-card>
            <q-separator color="primary" size="2px"/>
            <q-card-section>
              <q-list dense>
                <q-item v-for="col in props.cols" :key="col.name">
                  <q-item-section class="col-4">
                    <q-item-label caption lines="1" class="text-primary">{{ col.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section class="col-8">
                    <q-item-label caption lines="1">
                      {{ col.value }}
                      <q-tooltip>
                        {{ col.value }}
                      </q-tooltip>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            <q-separator color="primary" size="2px"/>
            <q-card-actions align="right">
              <q-btn outline dense color="primary" @click="loadDatasource(props)">{{ $t('button.modify') }}</q-btn>
              <q-btn outline dense color="negative" @click="deleteDatasource(props)">{{ $t('button.delete') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
    <div class="q-pa-md text-center" v-if="projects.length === 0">
      <a href="javascript:;" class="q-pa-md text-primary" @click="goProject" style="text-decoration: none;">{{ $t('message.noProject') }}</a>
      <a href="javascript:;" class="text-primary" @click="fetchProjects" style="text-decoration: none;">{{ $t('button.refresh') }}</a>
    </div>
    <q-dialog v-model="editDatasourceDialog.state">
      <q-card style="width: 800px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.datasource.default') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator />
        <q-form>
          <q-tabs v-model="editDatasourceDialog.tabOption" align="left">
            <q-tab name="basic" :label="$t('form.datasource.tab.basic')" />
            <q-tab name="option" :label="$t('form.datasource.tab.option')" />
            <q-tab name="pool" :label="$t('form.datasource.tab.pool')" />
          </q-tabs>
          <q-tab-panels v-model="editDatasourceDialog.tabOption" animated swipeable vertical transition-prev="jump-up" transition-next="jump-up">
            <q-tab-panel class="row q-col-gutter-xs" name="basic">
              <q-input class="col-12 col-md-6" outlined v-model="datasource.name" :label="$t('form.datasource.name')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.datasource.name')]"/>
              <q-select class="col-12 col-md-4" outlined v-model="datasource.category" :options="editDatasourceDialog.categories" :label="$t('form.datasource.type')" hint=""/>
              <q-checkbox class="col-12 col-md-2" outlined v-model="datasource.generic" :label="$t('form.datasource.generic')"/>
              <q-input class="col-12 col-md-6" outlined v-model="datasource.host" :label="$t('form.datasource.host')" hint="" v-if="!datasource.generic"/>
              <q-input class="col-12 col-md-6" outlined v-model="datasource.port" :label="$t('form.datasource.port')" hint="" v-if="!datasource.generic"/>
              <q-input class="col-12 col-md-6" outlined v-model="datasource.schemaName" :label="$t('form.datasource.schema')" hint="" v-if="!datasource.generic"/>
              <q-input class="col-12 col-md-6" outlined v-if="databaseDialogOracle && !datasource.generic" v-model="datasource.dataSpace" :label="$t('form.datasource.tableSpace')" hint=""/>
              <q-input class="col-12 col-md-6" outlined v-if="databaseDialogOracle && !datasource.generic" v-model="datasource.indexSpace" :label="$t('form.datasource.indexSpace')" hint=""/>
              <q-input class="col-12 col-md-6" outlined v-model="datasource.url" :label="$t('form.datasource.url')" hint="" v-if="datasource.generic"/>
              <q-input class="col-12 col-md-6" outlined v-model="datasource.driver" :label="$t('form.datasource.driver')" hint="" v-if="datasource.generic"/>
              <q-input class="col-12 col-md-6" outlined v-model="datasource.username" :label="$t('form.datasource.username')" hint=""/>
              <q-input class="col-12 col-md-6" outlined v-model="datasource.password" :label="$t('form.datasource.password')" hint=""/>
              <q-checkbox class="col-12 col-md-6" outlined v-if="databaseDialogMysql && !datasource.generic" v-model="datasource.useCursor" :label="$t('form.datasource.userResultStreamCursor')"/>
            </q-tab-panel>
            <q-tab-panel name="option">
              <q-table :data="datasource.parameter" :columns="editDatasourceDialog.parameterColumns" :title="$t('form.datasource.option.argument')" :rows-per-page-options="[]" row-key="name">
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="name" :props="props">
                      {{ props.row.name }}
                      <q-popup-edit v-model="props.row.name">
                        <q-input outlined v-model="props.row.name" dense autofocus />
                      </q-popup-edit>
                    </q-td>
                    <q-td key="value" :props="props">
                      {{ props.row.value }}
                      <q-popup-edit v-model="props.row.value">
                        <q-input outlined v-model="props.row.value" dense autofocus />
                      </q-popup-edit>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-tab-panel>
            <q-tab-panel class="row q-col-gutter-xs" name="pool">
              <q-input class="col-12 col-md-6" outlined v-model="datasource.poolInitialSize" :label="$t('form.datasource.pool.initialSize')" hint=""/>
              <q-input class="col-12 col-md-6" outlined v-model="datasource.poolMaxSize" autogrow :label="$t('form.datasource.pool.maxSize')" hint=""/>
              <q-input class="col-12 col-md-6" outlined v-model="datasource.poolInitial" autogrow :label="$t('form.datasource.pool.initial')" hint=""/>
              <q-input class="col-12 col-md-6" outlined v-model="datasource.poolMaxActive" autogrow :label="$t('form.datasource.pool.maxActive')" hint=""/>
              <q-input class="col-12 col-md-6" outlined v-model="datasource.poolMaxIdle" autogrow :label="$t('form.datasource.pool.maxIdle')" hint=""/>
              <q-input class="col-12 col-md-6" outlined v-model="datasource.poolMinIdle" autogrow :label="$t('form.datasource.pool.minIdle')" hint=""/>
              <q-input class="col-12 col-md-6" outlined v-model="datasource.poolMaxWait" autogrow :label="$t('form.datasource.pool.maxWait')" hint=""/>
              <q-checkbox class="col-12 col-md-6" outlined v-model="datasource.usePool" :label="$t('form.datasource.pool.usePool')" hint=""/>
            </q-tab-panel>
          </q-tab-panels>
        </q-form>
        <q-separator />
          <q-card-actions align="right">
            <q-btn :label="$t('button.test')" outline color="orange" icon="las la-spider" @click="testDatasource"/>
            <q-btn :label="$t('button.save')" outline color="primary" icon="las la-save" @click="saveDatasource"/>
            <q-btn v-if="datasource.id" :label="$t('button.delete')" outline color="negative" icon="las la-trash" @click="deleteDatasource"/>
          </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { fetchProjects } from 'src/service/base/ProjectService'
import { fetchDatasource, paginationDatasourceList, saveDatasource, deleteDatasource, testDatasource } from 'src/service/base/DatasourceService'
import { fetchDictionaryItemList } from 'src/service/base/DictionaryService'

export default {
  data () {
    return {
      table: {
        loading: false,
        projectsCopy: [],
        data: [],
        columns: [
          {
            name: 'name',
            label: this.$t('table.datasource.name'),
            field: 'name',
            align: 'left'
          },
          {
            name: 'category',
            label: this.$t('table.datasource.type'),
            field: 'category',
            align: 'left'
          },
          {
            name: 'generic',
            label: this.$t('table.datasource.generic'),
            field: 'generic',
            align: 'left'
          },
          {
            name: 'host',
            label: this.$t('table.datasource.host'),
            field: 'host',
            align: 'left'
          },
          {
            name: 'port',
            label: this.$t('table.datasource.port'),
            field: 'port',
            align: 'left'
          },
          {
            name: 'schemaName',
            label: this.$t('table.datasource.schema'),
            field: 'schemaName',
            align: 'left'
          },
          {
            name: 'url',
            label: this.$t('table.datasource.url'),
            field: 'url',
            align: 'left'
          },
          {
            name: 'driver',
            label: this.$t('table.datasource.driver'),
            field: 'driver',
            align: 'left'
          }
        ]
      },
      editDatasourceDialog: {
        state: false,
        tabOption: 'basic',
        categories: [],
        parameterColumns: [
          { name: 'name', align: 'left', label: this.$t('form.datasource.option.argumentName'), field: 'name' },
          { name: 'value', align: 'left', label: this.$t('form.datasource.option.argumentValue'), field: 'value' }
        ]
      },
      projects: [],
      project: null,
      datasource: {
        id: null,
        name: null,
        category: null,
        generic: false,
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
        projectId: null,
        url: null,
        driver: null
      }
    }
  },
  methods: {
    goProject () {
      this.$emit('addRouteTab', {to: '/basic-project', url: '/basic-project'})
      this.$router.push({path: '/basic-project'})
    },
    filterProject (val, update) {
      if (val === '') {
        update(() => {
          this.table.projectsCopy = this.projects
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.table.projectsCopy = this.projects.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    selectedProject (val) {
      if (val) {
        this.searchDatasourceList()
      } else {
        this.table.data = []
      }
    },
    searchDatasourceList () {
      this.table.loading = true
      const query = {
        projectId: this.project.id,
        payload: this.table.filter,
        pageNo: this.table.pagination.page,
        pageSize: this.table.pagination.rowsPerPage
      }
      paginationDatasourceList(query).then(res => {
        this.table.data = res.data.items
        this.table.pagination = Object.assign(this.table.pagination, {
          rowsNumber: res.data.total
        })
        this.table.loading = false
      })
    },
    loadDatasource (props) {
      fetchDatasource(props.key).then(res => {
        this.editDatasourceDialog.state = true
        this.datasource = Object.assign(this.datasource, {
          id: res.data.id,
          name: res.data.name,
          category: res.data.category,
          generic: res.data.generic || false,
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
          projectId: res.data.projectId,
          url: res.data.url,
          driver: res.data.driver,
          parameter: JSON.parse(res.data.parameter)
        })
      })
    },
    newDatasource () {
      Object.assign(this.datasource, this.$options.data.call(this).datasource)
      this.editDatasourceDialog.state = true
      for (let index = 0; index < 5; index++) {
        this.datasource.parameter.push({ name: '', value: '' })
      }
    },
    saveDatasource () {
      const submitForm = Object.assign({}, this.datasource, {
        projectId: this.project.id,
        parameter: null
      })
      submitForm.parameter = JSON.stringify(this.datasource.parameter)
      saveDatasource(submitForm).then(res => {
        this.searchDatasourceList()
        this.editDatasourceDialog.state = false
        this.$q.notify({
          message: this.$t('response.success.save'),
          position: 'top',
          color: 'teal'
        })
      })
    },
    testDatasource () {
      this.$q.loading.show()
      testDatasource({
        name: this.datasource.name,
        category: this.datasource.category,
        generic: this.datasource.generic || false,
        host: this.datasource.host,
        port: this.datasource.port,
        schemaName: this.datasource.schemaName,
        username: this.datasource.username,
        password: this.datasource.password,
        url: this.datasource.url,
        driver: this.datasource.driver
      }).then(res => {
        this.$q.loading.hide()
        this.$q.notify({
          message: this.$t('response.success.test'),
          position: 'top',
          color: 'teal'
        })
      })
    },
    deleteDatasource (props) {
      this.$q.dialog({
        title: 'Confirm',
        message: this.$t('message.confirm.delete'),
        cancel: {
          textColor: 'primary',
          outline: true
        },
        ok: {
          textColor: 'negative',
          outline: true
        },
        persistent: true
      }).onOk(() => {
        deleteDatasource(props.key || this.datasource.id).then(() => {
          this.searchDatasourceList()
          if (this.editDatasourceDialog.state) {
            this.editDatasourceDialog.state = false
          }
          this.$q.notify({
            message: this.$t('response.success.delete'),
            position: 'top',
            color: 'teal'
          })
        })
      })
    },
    fetchProjects () {
      fetchProjects({}).then(res => {
        this.projects = res.data
      })
    }
  },
  computed: {
    databaseDialogOracle: function () {
      if (this.datasource.category === 'oracle') {
        return true
      }
      return false
    },
    databaseDialogMysql: function () {
      if (this.datasource.category === 'mysql') {
        return true
      }
      return false
    }
  },
  mounted () {
    this.fetchProjects()
    fetchDictionaryItemList('DATASOURCE').then(res => {
      this.editDatasourceDialog.categories = []
      res.data.forEach(element => {
        this.editDatasourceDialog.categories.push(element.value)
      });
    })
    if (this.$route.query.projectId) {
      this.selectedProject({id: this.$route.query.projectId})
    }
  }
}
</script>
