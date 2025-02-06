<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" hide-header :filter="table.filter" @request="searchModels" :no-data-label="$t('table.empty')" :rows-per-page-options="[0]" hide-bottom>
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
              <q-btn outline dense color="negative" @click="deleteModel(props)">{{ $t('button.delete') }}</q-btn>
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
          <q-card-section class="q-col-gutter-xs">
            <q-input class="col-12 col-md-6" outlined v-model="model.code" :label="$t('form.model.code')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.model.code')]"/>
            <q-input class="col-12 col-md-6" outlined v-model="model.name" :label="$t('form.model.name')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.model.name')]"/>
            <q-select class="col-12 col-md-6" outlined v-model.number="model.datasourceId" emit-value map-options option-value="id" :options="datasourceOptions" :label="$t('form.model.datasource')" clearable :rules="[ val => validate(val) || $t('validation.notEmpty') + $t('form.model.datasource')]" hint="">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption v-if="scope.opt.category !== 'jdbc'">host: {{ scope.opt.host }}</q-item-label>
                    <q-item-label caption v-if="scope.opt.category !== 'jdbc'">port: {{ scope.opt.port }}</q-item-label>
                    <q-item-label caption v-if="scope.opt.category === 'jdbc'">url: {{ scope.opt.url }}</q-item-label>
                    <q-item-label caption v-if="scope.opt.category === 'jdbc'">driver: {{ scope.opt.driver }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge :label="scope.opt.category" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-input class="col-12 col-md-6" type="textarea" rows="2" outlined v-model="model.description" :label="$t('form.model.description')"/>
            <q-table :data="model.metadataList" :columns="metadataColumns" :rows-per-page-options="[0]" row-key="id" separator="cell" hide-bottom :title="$t('form.model.tableField')">
              <template v-slot:top-right>
                <q-btn split outline color="primary" icon="add" @click="loadTables"/>
              </template>
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="operate" :props="props">
                    <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteMetadata(props)"></q-btn>
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
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn type="submit" :label="$t('button.save')" outline color="primary" icon="las la-save"/>
            <q-btn v-if="model.id" :label="$t('button.delete')" outline color="negative" icon="las la-trash" @click="deleteModel"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="selectTables.state">
      <q-card style="width: 600px; max-width: 60vw; max-height: 450px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('dialog-title-datasource') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator/>
        <q-card-section class="q-col-gutter-xs">
          <q-table
            :data="selectTables.data"
            :columns="selectTables.columns"
            row-key="id"
            hide-bottom
          >
          <template #body-cell-action="props">
            <q-td :props="props" color="primary" class="q-gutter-sm">
              <q-btn dense :label="$t('button.select')" outline color="primary" icon="las la-save" @click="addMetadata(props.row)"/>
            </q-td>
          </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import {
  deleteModel,
  fetchModels,
  fetchModel,
  saveModel,
  generateSql,
  executeSql
} from 'src/service/bi/ModelService'
import { fetchProjects } from 'src/service/base/ProjectService'
import { fetchDatasourceList } from 'src/service/base/DatasourceService'
import Constant from 'src/constant/Constant'
import { structure } from 'src/service/kettle/PreviewService'

export default {
  data () {
    return {
      project: null,
      projects: [],
      table: {
        filter: null,
        loading: false,
        projectsCopy: [],
        data: [],
        columns: [
          {
            name: 'code',
            label: this.$t('form.model.columnCode'),
            field: 'code',
            align: 'left'
          },
          {
            name: 'name',
            label: this.$t('form.model.columnName'),
            field: 'name',
            align: 'left'
          },
          {
            name: 'description',
            label: this.$t('form.model.columnDescription'),
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
      ],
      METADATA_CATEGORIES: Constant.METADATA_CATEGORIES,
      selectTables: {
        state: false,
        data: [],
        columns: [
          {
            name: 'name',
            label: this.$t('form.model.columnTableName'),
            field: 'name',
            align: 'left'
          }, {
            name: 'type',
            label: this.$t('form.model.columnTableType'),
            field: 'type',
            align: 'left'
          }, {
            name: 'action',
            label: this.$t('table.privilege.action')
          }
        ]
      }
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
        id: this.project.id,
        payload: this.table.filter
      }
      fetchModels(query).then(res => {
        this.table.data = res.data
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
          resourceCode: res.data.resourceCode,
          status: res.data.status,
          projectId: res.data.projectId,
          datasourceId: res.data.datasourceId,
          metadataList: res.data.metadataList || []
        })
        this.datasourceOptions.forEach(item => {
          if (item.id === res.data.datasourceId) {
            this.datasourceCategory = item.category
          }
        })
      }).catch(err => {
        if (err.status === 10002) {
          this.$q.notify({
            message: this.$t('response.error.10002'),
            position: 'top',
            color: 'negative'
          })
        } else {
          this.$q.notify({
            message: err.data.error,
            position: 'top',
            color: 'negative'
          })
        }
      })
    },
    newModel () {
      var result = ''
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      var charactersLength = characters.length
      for (var i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      this.editModelDialog.state = true
      Object.assign(this.model, this.$options.data.call(this).model)
      this.model.resourceCode = result
      this.model.projectId = this.project.id
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
      }).catch(err => {
        if (err.status === 10002) {
          this.$q.notify({
            message: this.$t('response.error.10002'),
            position: 'top',
            color: 'negative'
          })
        } else {
          this.$q.notify({
            message: err.data.error,
            position: 'top',
            color: 'negative'
          })
        }
      })
    },
    generateSql () {
      generateSql(this.model.id).then(res => {
        this.$q.dialog({
          title: 'SQL',
          message: res.data,
          cancel: {
            textColor: 'primary',
            outline: true
          },
          ok: {
            textColor: 'negative',
            outline: true
          },
        }).onOk(() => {
          this.$q.dialog({
            title: 'Confirm',
            message: this.$t('message.confirm.executeDdl'),
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
            executeSql(this.model.id).then(res => {
              this.$q.notify({
                message: this.$t('response.success.save'),
                position: 'top',
                color: 'teal'
              })
            })
          })
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
        }).catch(err => {
          if (err.status === 10002) {
            this.$q.notify({
              message: this.$t('response.error.10002'),
              position: 'top',
              color: 'negative'
            })
          } else {
            this.$q.notify({
              message: err.data.error,
              position: 'top',
              color: 'negative'
            })
          }
        })
      })
    },
    loadTables () {
      if (!this.model.datasourceId) {
        this.$q.notify({
          position: 'top',
          message: this.$t('message.noDatasourceSelected'),
          color: 'negative'
        })
      } else {
        this.selectTables.data = []
        this.$q.loading.show()
        structure({ datasourceId: this.model.datasourceId, category: 'db' }).then(res => {
          this.$q.loading.hide()
          this.selectTables.state = true
          res.data.forEach(ele => {
            this.selectTables.data.push({
              name: ele.name,
              type: ele.type
            })
          })
        }).catch(err => {
          this.$q.loading.hide()
          this.$q.notify({
            position: 'top',
            message: err.data.error,
            color: 'negative'
          })
        })
      }
    },
    addMetadata (row) {
      this.$q.loading.show()
      structure({ datasourceId: this.model.datasourceId, category: 'table', name: row.name }).then(res => {
        this.$q.loading.hide()
        this.selectTables.state = false
        if (!this.model.code) {
          this.model.code = row.name
        }
        res.data.forEach(element => {
          if (this.model.metadataList.map(item => item.columnCode).indexOf(element.name) < 0) {
            this.model.metadataList.push({
              columnCode: element.name,
              columnName: null,
              columnCategory: element.info
            })
          }
        })
      }).catch(err => {
        this.$q.loading.hide()
        this.$q.notify({
          position: 'top',
          message: err.data.error,
          color: 'negative'
        })
      })
    },
    deleteMetadata (props) {
      this.model.metadataList.splice(props.rowIndex, 1)
    },
    disabled (category, field) {
      return Constant.METADATA_CATEGORIES[field][category]
    }
  },
  computed: {
    metadataState () {
      return !this.model.code
    }
  },
  mounted () {
    this.fetchProjects()
  }
}
</script>
