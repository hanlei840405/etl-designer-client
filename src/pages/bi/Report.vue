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
              <q-btn v-if="!props.row.publish" outline dense color="orange" @click="publishReport(props)">{{ $t('button.publish') }}</q-btn>
              <q-btn outline dense color="positive" @click="previewReportChartByGet(props)">{{ $t('button.preview') }}</q-btn>
              <q-btn v-if="!props.row.publishTime" outline dense color="negative" @click="deleteReport(props)">{{ $t('button.delete') }}</q-btn>
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
            <q-input class="col-12 col-md-6" outlined v-model="report.code" autofocus :label="$t('form.report.code')" hint="" :readonly="report.id !== null" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.report.code')]"/>
            <q-input class="col-12 col-md-6" outlined v-model="report.name" autofocus :label="$t('form.report.name')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.report.name')]"/>
            <q-select class="col-12 col-md-6" :readonly="report.publish" v-model="report.modelId" autofocus outlined :options="modelOptionsCopy" use-input emit-value map-options @filter="filterModel" @input="selectedModel" :label="$t('form.report.model')" :rules="[ val => validate(val) || $t('validation.notEmpty') + $t('form.report.model')]" hint="">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-select class="col-12 col-md-6" :readonly="report.publish" v-model="report.chartId" autofocus outlined :options="chartOptionsCopy" use-input emit-value map-options @filter="filterChart" @input="selectedChart" :label="$t('form.report.chart')" :rules="[ val => validate(val) || $t('validation.notEmpty') + $t('form.report.chart')]" hint="">
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
            <q-table v-show="report.modelId" class="col-12" dense :data="model.metadataList" :columns="metadataColumns" :rows-per-page-options="[0]" row-key="id" separator="cell" hide-bottom :title="this.$t('form.chart.modelTableName', [model.code])">
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="columnCode" :props="props">
                    {{ props.row.columnCode }}
                  </q-td>
                  <q-td key="columnName" :props="props">
                    {{ props.row.columnName }}
                  </q-td>
                  <q-td key="columnCategory" :props="props">
                    {{ props.row.columnCategory }}
                  </q-td>
                  <q-td key="columnLength" :props="props">
                    {{ props.row.columnLength }}
                  </q-td>
                  <q-td key="columnDecimal" :props="props">
                    {{ props.row.columnDecimal }}
                  </q-td>
                  <q-td key="columnNotNull" :props="props">
                    {{ getYesOrNoLabel(props.row.columnNotNull) }}
                  </q-td>
                </q-tr>
              </template>
            </q-table>
            <q-table v-show="report.chartId" class="col-12" :data="report.reportChartParamsList" :columns="reportChartParamsColumns" :rows-per-page-options="[0]" row-key="chartParamsId" separator="cell" hide-bottom :title="chart.name">
              <template v-slot:body="props">
                <q-tr :props="props">
                <q-td key="operate" :props="props">
                  <q-btn v-if="props.row.category === 'sql'" size="xs" outline round icon="visibility" @click="prewSql(props)"></q-btn>
                </q-td>
                <q-td key="field" :props="props">
                  {{ props.row.field }}
                </q-td>
                <q-td key="fieldCategory" :props="props">
                  {{ props.row.fieldCategory }}
                </q-td>
                <q-td key="description" :props="props">
                  {{ props.row.description }}
                </q-td>
                <q-td key="category" :props="props">
                  {{ props.row.category }}
                  <q-popup-edit v-model="props.row.category" :auto-save="true">
                    <q-select autofocus outlined v-model="props.row.category" :options="['constant', 'sql']"/>
                  </q-popup-edit>
                </q-td>
                <q-td key="script" :props="props">
                  {{ props.row.script }}
                    <q-popup-edit v-model="props.row.script" :auto-save="true">
                      <q-input autofocus outlined v-model="props.row.script" :type="props.row.category === 'sql' ? 'textarea' : 'input'"/>
                      <div v-if="props.row.category === 'sql' ? 'textarea' : 'input'" style="width: 100%;" class="text-right"><q-btn dense flat color="primary" @click.stop label="AI" @click="openAI"/></div>
                    </q-popup-edit>
                </q-td>
                </q-tr>
              </template>
            </q-table>
            <q-input class="col-12" type="textarea" rows="2" outlined v-model="report.description" :label="$t('form.report.description')"/>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn type="submit" :label="$t('button.save')" outline color="primary" icon="las la-save"/>
            <q-btn v-if="report.reportChartParamsList.length > 0" :label="$t('button.preview')" outline color="positive" icon="visibility" @click="previewReportChartByPost"/>
            <q-btn v-if="report.id && !report.publish" :label="$t('button.delete')" outline color="negative" icon="las la-trash" @click="deleteReport"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="previewChartDemoDialog.state">
      <q-card style="width: 50%; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <q-space/>
          <q-btn :label="$t('button.showOptions')" outline color="primary" icon="visibility" @click="previewChartDemoDialog.showOptions=!previewChartDemoDialog.showOptions"/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator />
        <q-card-section>
        <div ref="chartDemo" style="width: 100%; height: 40vh;"></div>
        <div v-show="previewChartDemoDialog.showOptions">
          <b>{{ $t('form.chart.options') }}</b>
          <pre>{{ chart.options }}</pre>
          <b>{{ $t('form.chart.data') }}</b>
          <pre>{{ chart.data }}</pre>
        </div>
      </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="previewDataDialog.mode">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.tableInput.preview') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-chip square text-color="primary" icon="bookmark" style="width: 100%; margin: 0px;">
            {{ $t('form.tableInput.limit', [20]) }}
          </q-chip>
          <q-table
            flat
            dense
            bordered
            :data="previewDataDialog.data"
            :columns="previewDataDialog.columns"
            row-key="index"
            :loading="previewDataDialog.loading"
            separator="cell"
            :rows-per-page-options="[0]"
            hide-bottom
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="previewReportDialog.state">
      <q-card style="width: 50%; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator />
        <q-card-section>
        <div ref="reportChart" style="width: 100%; height: 40vh;"></div>
      </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="aiDialog.state" position="right" fullHeight>
        <q-card style="width: 600px; max-width: 80vw;">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">AI</div>
            <q-space/>
            <q-space/>
            <q-btn icon="close" flat round dense v-close-popup/>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-input outlined v-model="aiDialog.content" type="textarea" rows="5" autofocus :label="$t('form.report.content')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.report.content')]"/>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn :disable="!aiDialog.content" :label="$t('button.send')" color="primary" @click="requestAi"/>
          </q-card-actions>
          <q-card-section>
            <div v-html="aiDialog.message" class="text-left"></div>
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
  publishReport,
  paintReportByGet,
  paintReportByPost,
  ai
} from 'src/service/bi/ReportService'
import { fetchModel, fetchModels } from 'src/service/bi/ModelService'
import { fetchChart, fetchCharts, previewChart } from 'src/service/bi/ChartService'
import { fetchProjects } from 'src/service/base/ProjectService'
import * as echarts from 'echarts'
import { preview } from 'src/service/kettle/PreviewService'

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
        projectId: null,
        chartId: null,
        modelId: null,
        publish: false,
        publishTime: null,
        description: null,
        status: null,
        reportChartParamsList: []
      },
      previewChartDemoDialog: {
        state: false,
        showOptions: false,
        chartDemo: null
      },
      modelOptions: [],
      modelOptionsCopy: [],
      chartOptions: [],
      chartOptionsCopy: [],
      metadataColumns: [
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
        }
      ],
      reportChartParamsColumns: [
        { name: 'operate', label: this.$t('form.report.columnOperate'), field: 'operate', align: 'right', headerStyle: 'width: 20px'},
        { name: 'field', label: this.$t('form.report.columnField'), align: 'left', field: 'field' },
        { name: 'fieldCategory', label: this.$t('form.report.columnCategory'), align: 'left', field: 'fieldCategory' },
        { name: 'description', label: this.$t('form.report.columnDescription'), align: 'left', field: 'description' },
        { name: 'category', label: this.$t('form.report.reportChartParams.category'), align: 'left', field: 'category' },
        { name: 'script', label: this.$t('form.report.reportChartParams.script'), align: 'left', field: 'script' }
      ],
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
      chart: {
        id: null,
        code: null,
        name: null,
        category: null,
        options: null,
        data: null
      },
      yesOrNo: [{value: true, label: this.$t('form.model.columnNotNull.true')}, {value: false, label: this.$t('form.model.columnNotNull.false')}],
      previewDataDialog: {
        mode: false,
        data: [],
        columns: [],
        loading: false
      },
      previewReportDialog: {
        state: false,
        reportChart: null
      },
      aiDialog: {
        state: false,
        content: null,
        message: null
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
        fetchCharts({}).then(res => {
          this.chartOptions = res.data.map(item => {
            return {
              label: item.name,
              value: item.id,
              description: item.description
            }
          })
          this.chartOptionsCopy = this.chartOptions
        })
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
          this.modelOptionsCopy = this.modelOptions
        })
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
          projectId: res.data.projectId,
          modelId: res.data.modelId,
          chartId: res.data.chartId,
          publish: res.data.publish,
          publishTime: res.data.publishTime,
          description: res.data.description,
          status: res.data.status,
          reportChartParamsList: res.data.reportChartParamsList || []
        })
        this.selectedModel(res.data.modelId)
        this.selectedChart(res.data.chartId, true)
      })
    },
    publishReport (props) {
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
        publishReport({id: props.key}).then(res => {
          this.searchReports()
          this.editReportDialog.state = false
          this.$q.notify({
            message: this.$t('response.success.publish'),
            position: 'top',
            color: 'teal'
          })
        })
      })
    },
    newReport () {
      this.editReportDialog.state = true
      Object.assign(this.report, this.$options.data.call(this).report)
      this.report.projectId = this.project.id
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
        })
      })
    },
    viewChartDemo () {
      previewChart(this.chart).then(res => {
        this.previewChartDemoDialog.state = true
        if (this.previewChartDemoDialog.chartDemo) {
          this.previewChartDemoDialog.chartDemo.dispose()
        }
        this.$nextTick(() => {
          this.previewChartDemoDialog.chartDemo = echarts.init(this.$refs.chartDemo)
          this.previewChartDemoDialog.chartDemo.setOption(res.data)
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
    filterChart (val, update) {
      if (val === '') {
        update(() => {
          this.chartOptionsCopy = this.chartOptions
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.chartOptionsCopy = this.chartOptions.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
      })
    },
    selectedModel (val) {
      if (val) {
        fetchModel(val).then(res => {
          this.model = Object.assign(this.model, {
            id: res.data.id,
            code: res.data.code,
            name: res.data.name,
            description: res.data.description,
            projectId: res.data.projectId,
            datasourceId: res.data.datasourceId,
            status: res.data.status,
            metadataList: res.data.metadataList || []
          })
        })
      }
    },
    selectedChart (val, update) {
      if (val) {
        fetchChart(val).then(res => {
          this.chart = Object.assign(this.chart, {
            id: res.data.id,
            code: res.data.code,
            name: res.data.name,
            category: res.data.category,
            options: res.data.options,
            data: res.data.data,
          })
          if (!update) {
            this.report.reportChartParamsList = res.data.chartParamsList.map(item => {
              return {
                chartParamsId: item.id,
                field: item.field,
                fieldCategory: item.category,
                description: item.description,
                category: null,
                script: null
              }
            })
          }
        })
      }
    },
    getYesOrNoLabel (val) {
      for (let i = 0; i < this.yesOrNo.length; i++) {
        if (this.yesOrNo[i].value === val) {
          return this.yesOrNo[i].label
        }
      }
    },
    prewSql (props) {
      if (!this.model.datasourceId) {
        this.$q.notify({
          position: 'top',
          message: this.$t('message.noDatasourceSelected'),
          color: 'negative'
        })
      } else {
        this.previewDataDialog.columns = []
        this.previewDataDialog.data = []
        this.previewDataDialog.mode = true
        this.previewDataDialog.loading = true
        preview({
          category: 'sql',
          datasourceId: this.model.datasourceId,
          sql: props.row.script,
        }).then(res => {
          const lineNo = {
            name: 'index',
            label: '#',
            field: 'index'
          }
          this.previewDataDialog.columns.push(lineNo)
          res.data.headers.forEach(ele => {
            const column = {
              name: ele,
              label: ele.toUpperCase(),
              field: ele
            }
            this.previewDataDialog.columns.push(column)
          })
          res.data.records.forEach((ele, index) => {
            this.previewDataDialog.data.push(Object.assign(ele, { index: index + 1 }))
          })
          this.previewDataDialog.loading = false
        })
      }
    },
    previewReportChartByGet (props) {
      paintReportByGet(props.key).then(res => {
        this.previewReportDialog.state = true
        if (this.previewReportDialog.reportChart) {
          this.previewReportDialog.reportChart.dispose()
        }
        this.$nextTick(() => {
          this.previewReportDialog.reportChart = echarts.init(this.$refs.reportChart)
          this.previewReportDialog.reportChart.setOption(res.data)
        })
      })
    },
    previewReportChartByPost () {
      paintReportByPost(this.report).then(res => {
        this.previewReportDialog.state = true
        if (this.previewReportDialog.reportChart) {
          this.previewReportDialog.reportChart.dispose()
        }
        this.$nextTick(() => {
          this.previewReportDialog.reportChart = echarts.init(this.$refs.reportChart)
          this.previewReportDialog.reportChart.setOption(res.data)
        })
      })
    },
    openAI () {
      this.aiDialog.state = true
      this.aiDialog.content = null
      this.aiDialog.message = null
    },
    requestAi () {
      this.$q.loading.show({
        message: this.$t('message.loading')
      })
      ai({ modelId: this.report.modelId, payload: this.aiDialog.content }).then(res => {
        this.aiDialog.message = res.data
        this.$q.loading.hide()
      })
    }
  },
  mounted () {
    this.fetchProjects()
  }
}
</script>
