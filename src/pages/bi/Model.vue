<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" hide-header :filter="table.filter" @request="searchModels" 
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
        <q-input v-if="project" dense v-model="table.filter">
          <template v-slot:append>
            <q-btn round flat dense icon="search"/>
          </template>
        </q-input>
        <q-btn v-if="project" outline color="primary" :label="$t('button.create')" @click="newModel"/>
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
              <q-btn outline dense color="primary" @click="loadModel(props)">{{ $t('button.modify') }}</q-btn>
              <q-btn v-if="!props.row.publish" outline dense color="orange" @click="publishModel(props)">{{ $t('button.publish') }}</q-btn>
              <q-btn outline dense color="positive" @click="generateSql(props)">{{ $t('button.generateSql') }}</q-btn>
              <q-btn v-if="!props.row.publishTime" outline dense color="negative" @click="deleteModel(props)">{{ $t('button.delete') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
    <div class="q-pa-md text-center" v-if="projects.length === 0">
      <a href="javascript:;" class="q-pa-md text-primary" @click="goProject" style="text-decoration: none;">{{ $t('message.noProject') }}</a>
      <a href="javascript:;" class="text-primary" @click="fetchProjects" style="text-decoration: none;">{{ $t('button.refresh') }}</a>
    </div>
    <q-dialog v-model="editModelDialog.state">
      <q-card style="width: 800px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.model.default') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator />
        <q-form @submit="submitForm">
          <q-card-section class="row q-col-gutter-xs">
            <q-input class="col-12 col-md-4" outlined v-model="model.code" :label="$t('form.model.code')" hint="" :readonly="model.id !== null" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.model.code')]"/>
            <q-input class="col-12 col-md-4" outlined v-model="model.name" :label="$t('form.model.name')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.model.name')]"/>
            <q-select class="col-12 col-md-4" outlined v-model.number="model.datasourceId" emit-value map-options option-value="id" :options="datasourceOptions" :label="$t('form.model.datasource')" 
              clearable :rules="[ val => validate(val) || $t('validation.notEmpty') + $t('form.model.datasource')]" hint="" @input="selectedDatasource">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption v-if="!scope.opt.generic">host: {{ scope.opt.host }}</q-item-label>
                    <q-item-label caption v-if="!scope.opt.generic">port: {{ scope.opt.port }}</q-item-label>
                    <q-item-label caption v-if="scope.opt.generic">url: {{ scope.opt.url }}</q-item-label>
                    <q-item-label caption v-if="scope.opt.generic">driver: {{ scope.opt.driver }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge :label="scope.opt.category" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-input class="col-12" type="textarea" rows="2" outlined v-model="model.description" :label="$t('form.model.description')"/>
          </q-card-section>
          <q-card-section>
            <q-table :data="model.metadataList" :columns="metadataColumns" :rows-per-page-options="[0]" row-key="id" separator="cell" hide-bottom :title="$t('form.model.tableField')">
              <template v-slot:top-right>
              <q-btn-dropdown split outline color="primary" icon="add" @click="addMetadata">
                <q-list>
                  <q-item clickable v-close-popup @click="add10Metadata">
                    <q-item-section>
                      <q-item-label>{{ $t('button.append10') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              </template>
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="operate" :props="props">
                    <q-btn v-if="!props.row.id || !model.publishTime || props.row.createTime > model.publishTime" size="xs" outline round color="negative" icon="remove" @click="deleteMetadata(props)"></q-btn>
                  </q-td>
                  <q-td key="columnCode" :props="props">
                    {{ props.row.columnCode }}
                    <q-popup-edit v-model="props.row.columnCode" :auto-save="true">
                      <q-input autofocus outlined v-model="props.row.columnCode"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="columnName" :props="props">
                    {{ props.row.columnName }}
                    <q-popup-edit v-model="props.row.columnName" :auto-save="true">
                      <q-input autofocus outlined v-model="props.row.columnName"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="columnCategory" :props="props">
                    {{ props.row.columnCategory }}
                    <q-popup-edit v-model="props.row.columnCategory" :auto-save="true">
                      <q-select autofocus outlined v-model="props.row.columnCategory" :options="METADATA_CATEGORIES[datasourceCategory]"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="columnLength" :props="props">
                    {{ props.row.columnLength }}
                    <q-popup-edit v-model="props.row.columnLength" :auto-save="true">
                      <q-input autofocus outlined v-model="props.row.columnLength"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="columnDecimal" :props="props">
                    {{ props.row.columnDecimal }}
                    <q-popup-edit v-model="props.row.columnDecimal" :auto-save="true">
                      <q-input autofocus outlined v-model="props.row.columnDecimal"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="columnNotNull" :props="props">
                    {{ getYesOrNoLabel(props.row.columnNotNull) }}
                    <q-popup-edit v-model="props.row.columnNotNull" :auto-save="true">
                      <q-select autofocus outlined v-model="props.row.columnNotNull" emit-value map-options :options="yesOrNo"/>
                    </q-popup-edit>
                  </q-td>
                  <!-- <q-td key="columnForeignModelId" :props="props">
                    {{ getForeignLabel(props.row.columnForeignModelId) }}
                    <q-popup-edit v-model="props.row.columnForeignModelId" :auto-save="true">
                      <q-select
                        v-model="props.row.columnForeignModelId"
                        autofocus
                        outlined
                        :options="modelOptionsCopy"
                        use-input
                        clearable
                        emit-value
                        map-options
                        @filter="filterModel"
                      >
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                            <q-item-section>
                              <q-item-label>{{ scope.opt.label }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </q-popup-edit>
                  </q-td> -->
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn type="submit" :label="$t('button.save')" outline color="primary" icon="las la-save"/>
            <q-btn v-if="model.id && !model.publish" :label="$t('button.delete')" outline color="negative" icon="las la-trash" @click="deleteModel"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showSqlDialog.state">
      <q-card style="width: 800px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">SQL</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator />
        <q-card-section>
        <pre>{{ createSql }}</pre>
      </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import {
  deleteModel,
  paginationModels,
  fetchModels,
  fetchModel,
  saveModel,
  sql,
  publishModel
} from 'src/service/bi/ModelService'
import { fetchProjects } from 'src/service/base/ProjectService'
import { fetchDatasourceList } from 'src/service/base/DatasourceService'
import { fetchDictionaryItemList } from 'src/service/base/DictionaryService'

export default {
  data () {
    return {
      project: null,
      projects: [],
      table: {
        filter: null,
        loading: false,
        pagination: {
          page: 1,
          rowsPerPage: 18,
          rowsNumber: 10
        },
        projectsCopy: [],
        data: [],
        columns: [
          {
            name: 'code',
            label: this.$t('form.model.code'),
            field: 'code',
            align: 'left'
          },
          {
            name: 'name',
            label: this.$t('form.model.name'),
            field: 'name',
            align: 'left'
          },
          {
            name: 'description',
            label: this.$t('form.model.description'),
            field: 'description',
            align: 'left'
          }
        ]
      },
      editModelDialog: {
        state: false
      },
      datasourceCategory: 'mysql',
      datasourceOptions: [],
      model: {
        id: null,
        code: null,
        name: null,
        description: null,
        status: null,
        projectId: null,
        datasourceId: null,
        publish: false,
        publishTime: null,
        metadataList: []
      },
      metadataColumns: [
        {
          name: 'operate',
          label: this.$t('form.model.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'columnCode',
          label: this.$t('form.model.columnCode'),
          field: 'columnCode',
          align: 'left'
        },
        {
          name: 'columnName',
          label: this.$t('form.model.columnName'),
          field: 'columnName',
          align: 'left'
        },
        {
          name: 'columnCategory',
          label: this.$t('form.model.columnType'),
          field: 'columnCategory',
          align: 'left'
        },
        {
          name: 'columnLength',
          label: this.$t('form.model.columnLength'),
          field: 'columnLength',
          align: 'left'
        },
        {
          name: 'columnDecimal',
          label: this.$t('form.model.columnDecimal'),
          field: 'columnDecimal',
          align: 'left'
        },
        {
          name: 'columnNotNull',
          label: this.$t('form.model.columnNotNull.default'),
          field: 'columnNotNull',
          align: 'left'
        },
        // {
        //   name: 'columnForeignModelId',
        //   label: this.$t('form.model.columnForeignModelId'),
        //   field: 'columnForeignModelId',
        //   align: 'left'
        // }
      ],
      METADATA_CATEGORIES: [],
      modelOptions: [],
      modelOptionsCopy: [],
      yesOrNo: [{value: true, label: this.$t('form.model.columnNotNull.true')}, {value: false, label: this.$t('form.model.columnNotNull.false')}],
      showSqlDialog: {
        state: false
      },
      createSql: null
    }
  },
  methods: {
    validate (val) {
      return val != null
    },
    goProject () {
      this.$emit('addRouteTab', {to: '/basic-project', url: '/basic-project'})
      this.$router.push({path: '/basic-project'})
    },
    fetchProjects () {
      fetchProjects({}).then(res => {
        this.projects = res.data
      })
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
        this.searchModels()
        fetchDatasourceList({
          projectId: this.project.id
        }).then(res => {
          this.datasourceOptions = []
          res.data.forEach(ele => {
            this.datasourceOptions.push({
              id: ele.id,
              label: ele.name,
              category: ele.category,
              host: ele.host,
              port: ele.port
            })
          })
        })
      } else {
        this.table.data = []
      }
    },
    searchModels () {
      this.table.loading = true
      const query = {
        projectId: this.project.id,
        payload: this.table.filter,
        pageNo: this.table.pagination.page,
        pageSize: this.table.pagination.rowsPerPage
      }
      paginationModels(query).then(res => {
        this.table.data = res.data.items
        this.table.pagination = Object.assign(this.table.pagination, {
          rowsNumber: res.data.total
        })
        this.table.loading = false
      })
    },
    loadModel (props) {
      fetchModel(props.key).then(res => {
        this.editModelDialog.state = true
        this.model = Object.assign(this.model, {
          id: res.data.id,
          code: res.data.code,
          name: res.data.name,
          description: res.data.description,
          projectId: res.data.projectId,
          datasourceId: res.data.datasourceId,
          publish: res.data.publish,
          publishTime: res.data.publishTime,
          status: res.data.status,
          metadataList: res.data.metadataList || []
        })
        this.datasourceOptions.forEach(item => {
          if (item.id === res.data.datasourceId) {
            this.datasourceCategory = item.category
          }
        })
        this.loadModelOptions()
      })
    },
    publishModel (props) {
      this.$q.dialog({
        title: 'Confirm',
        message: this.$t('message.confirm.publishAndCantDelete'),
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
        publishModel({id: props.key}).then(res => {
          this.searchModels()
          this.editModelDialog.state = false
          this.$q.notify({
            message: this.$t('response.success.publish'),
            position: 'top',
            color: 'teal'
          })
        })
      })
    },
    generateSql (props) {
      sql({
        id: props.key
      }).then(res => {
        this.showSqlDialog.state = true
        this.createSql = res.data
      })
    },
    newModel () {
      this.editModelDialog.state = true
      Object.assign(this.model, this.$options.data.call(this).model)
      this.model.projectId = this.project.id
      this.loadModelOptions()
    },
    loadModelOptions () {
      this.modelOptions = []
      const query = {
        projectId: this.project.id,
      }
      fetchModels(query).then(res => {
        res.data.forEach(item => {
          this.modelOptions.push({
            value: item.id,
            label: item.name
          })
        })
      })
    },
    filterModel (val, update) {
      if (val === '') {
        update(() => {
          this.modelOptionsCopy = this.modelOptions
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.modelOptionsCopy = this.modelOptions.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
      })
    },
    getYesOrNoLabel (val) {
      for (let i = 0; i < this.yesOrNo.length; i++) {
        if (this.yesOrNo[i].value === val) {
          return this.yesOrNo[i].label
        }
      }
    },
    getForeignLabel (val) {
      if (val) {
        for (let i = 0; i < this.modelOptionsCopy.length; i++) {
          if (this.modelOptionsCopy[i].value === val) {
            return this.modelOptionsCopy[i].label
          }
        }
      }
      return ''
    },
    selectedDatasource (val) {
      if (val) {
        this.datasourceOptions.forEach(item => {
          if (item.id === val) {
            this.datasourceCategory = item.category
          }
        })
      } else {
        this.datasourceCategory = 'mysql'
      }
    },
    submitForm () {
      saveModel(this.model).then(res => {
        this.searchModels()
        this.editModelDialog.state = false
        this.$q.notify({
          message: this.$t('response.success.save'),
          position: 'top',
          color: 'teal'
        })
      })
    },
    deleteModel (props) {
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
        deleteModel(props.key || this.model.id).then(res => {
          this.searchModels()
          this.editModelDialog.state = false
          this.$q.notify({
            message: this.$t('response.success.delete'),
            position: 'top',
            color: 'teal'
          })
        })
      })
    },
    addMetadata () {
      if (!this.model.datasourceId) {
        this.$q.notify({
          position: 'top',
          message: this.$t('message.noDatasourceSelected'),
          color: 'negative'
        })
      } else {
        this.model.metadataList.push({
          columnName: null,
          columnCode: null,
          columnCategory: null,
          columnLength: null,
          columnDecimal: null,
          columnNotNull: null,
          columnForeignModelId: null
        })
      }
    },
    add10Metadata () {
      if (!this.model.datasourceId) {
        this.$q.notify({
          position: 'top',
          message: this.$t('message.noDatasourceSelected'),
          color: 'negative'
        })
      } else {
        for (let i = 0; i < 10; i++) {
          this.model.metadataList.push({
            columnName: null,
            columnCode: null,
            columnCategory: null,
            columnLength: null,
            columnDecimal: null,
            columnNotNull: null,
            columnForeignModelId: null
          })
        }
      }
    },
    deleteMetadata (props) {
      this.model.metadataList.splice(props.rowIndex, 1)
    },
  },
  mounted () {
    this.fetchProjects()
    fetchDictionaryItemList('DATASOURCE').then(res => {
      this.METADATA_CATEGORIES = {}
      res.data.forEach(element => {
        fetchDictionaryItemList(element.value + '-COLUMN-CATEGORY').then(res1 => {
        this.METADATA_CATEGORIES[element.value] = []
          res1.data.forEach(ele => {
            this.METADATA_CATEGORIES[element.value].push(ele.value)
          });
        })
      });
    })
  }
}
</script>
