<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" hide-header :filter="table.filter" @request="searchReports" 
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
        <q-btn v-if="project" outline color="primary" :label="$t('button.create')" @click="newReport"/>
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
              <q-btn outline dense color="primary" @click="loadReport(props)">{{ $t('button.modify') }}</q-btn>
              <q-btn outline dense color="primary" @click="generateSql(props)">{{ $t('button.generateSql') }}</q-btn>
              <q-btn outline dense color="negative" @click="deleteReport(props)">{{ $t('button.delete') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
    <div class="q-pa-md text-center" v-if="projects.length === 0">
      <a href="javascript:;" class="q-pa-md text-primary" @click="goProject" style="text-decoration: none;">{{ $t('message.noProject') }}</a>
      <a href="javascript:;" class="text-primary" @click="fetchProjects" style="text-decoration: none;">{{ $t('button.refresh') }}</a>
    </div>
    <q-dialog v-model="editReportDialog.state">
      <q-card style="width: 800px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.report.default') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator />
        <q-form @submit="submitForm">
          <q-card-section class="row q-col-gutter-xs">
            <q-input class="col-12 col-md-4" outlined v-model="report.code" :label="$t('form.report.code')" hint="" :readonly="report.id !== null" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.report.code')]"/>
            <q-input class="col-12 col-md-4" outlined v-model="report.name" :label="$t('form.report.name')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.report.name')]"/>
            <q-select class="col-12 col-md-4" v-model="report.modelId" autofocus outlined :options="modelOptionsCopy" use-input clearable emit-value map-options @filter="filterModel">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-select class="col-12 col-md-4" outlined v-model="report.chartId" emit-value map-options :options="chartOptions" :label="$t('form.report.chart')" 
              clearable :rules="[ val => validate(val) || $t('validation.notEmpty') + $t('form.report.chart')]" hint="">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:append>
                <q-btn round dense flat icon="visibility" @click.stop @click="viewChartDemo"/>
              </template>
            </q-select>
            <q-input class="col-12" type="textarea" rows="2" outlined v-model="report.description" :label="$t('form.report.description')"/>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn type="submit" :label="$t('button.save')" outline color="primary" icon="las la-save"/>
            <q-btn v-if="report.id" :label="$t('button.delete')" outline color="negative" icon="las la-trash" @click="deleteReport"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="previewChartDialog.state">
      <q-card style="width: 50%; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator />
        <q-card-section>
        <div ref="chartDemo" style="width: 100%; height: 40vh;"></div>
        {{ chart.options }}
        {{ chart.data }}
      </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import {
  deleteReport,
  paginationReports,
  fetchReport,
  saveReport,
} from 'src/service/bi/ReportService'
import { fetchModels } from 'src/service/bi/ModelService'
import { fetchCharts, previewChart } from 'src/service/bi/ChartService'
import { fetchProjects } from 'src/service/base/ProjectService'
import * as echarts from 'echarts'

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
            label: this.$t('form.report.code'),
            field: 'code',
            align: 'left'
          },
          {
            name: 'name',
            label: this.$t('form.report.name'),
            field: 'name',
            align: 'left'
          },
          {
            name: 'description',
            label: this.$t('form.report.description'),
            field: 'description',
            align: 'left'
          }
        ]
      },
      editReportDialog: {
        state: false
      },
      report: {
        id: null,
        code: null,
        name: null,
        description: null,
        status: null,
        projectId: null,
        modelList: []
      },
      chartOptions: [],
      previewChartDialog: {
        state: false
      },
      modelOptions: [],
      modelOptionsCopy: [],
      chart: {
        data: null,
        options: null,
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
        this.searchReports()
      } else {
        this.table.data = []
      }
    },
    searchReports () {
      this.table.loading = true
      const query = {
        projectId: this.project.id,
        payload: this.table.filter,
        pageNo: this.table.pagination.page,
        pageSize: this.table.pagination.rowsPerPage
      }
      paginationReports(query).then(res => {
        this.table.data = res.data.items
        this.table.pagination = Object.assign(this.table.pagination, {
          rowsNumber: res.data.total
        })
        this.table.loading = false
      })
    },
    loadReport (props) {
      fetchReport(props.key).then(res => {
        this.editReportDialog.state = true
        this.report = Object.assign(this.report, {
          id: res.data.id,
          code: res.data.code,
          name: res.data.name,
          description: res.data.description,
          projectId: res.data.projectId,
          status: res.data.status,
          modelList: res.data.modelList || []
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
    generateSql (props) {
    },
    newReport () {
      this.editReportDialog.state = true
      Object.assign(this.report, this.$options.data.call(this).report)
      this.report.projectId = this.project.id
      fetchCharts({}).then(res => {
        this.chartOptions = res.data.map(item => {
          return {
            label: item.name,
            value: item.id,
            description: item.description
          }
        })
      })
      this.loadModelOptions()
    },
    submitForm () {
      saveReport(this.report).then(res => {
        this.searchReports()
        this.editReportDialog.state = false
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
    deleteReport (props) {
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
        deleteReport(props.key || this.report.id).then(res => {
          this.searchReports()
          this.editReportDialog.state = false
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
    viewChartDemo () {
      previewChart({id: this.report.chartId}).then(res => {
        this.previewChartDialog.state = true
        this.$nextTick(() => {
          this.chartDemo = echarts.init(this.$refs.chartDemo)
          this.chartDemo.setOption(res.data)
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
  },
  mounted () {
    this.fetchProjects()
  }
}
</script>
