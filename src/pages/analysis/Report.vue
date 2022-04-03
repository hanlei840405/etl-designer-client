<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" :filter="table.filter" @request="searchReports" hide-header
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
            <q-btn text-color="cyan-8" outline label="新建" @click="newReport"/>
          </template>
        </q-input>
      </template>
      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-4 col-md-3 col-lg-2 grid-style-transition"
        >
          <q-separator color="cyan-8" size="2px"/>
          <q-card :class="[props.row.status === '1' ? '' : 'bg-grey-5']" @click="loadReport(props)">
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
    <q-dialog v-model="previewDataDialog.mode">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">预览</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-chip square text-color="cyan-8" icon="bookmark" style="width: 100%; margin: 0px;">
            预览数据最多显示10条
          </q-chip>
          <q-table
            color="cyan-8"
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
    <q-dialog v-model="previewChartDialog.mode">
      <q-card style="width: 40vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">预览</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <component ref="step" :is="previewChartDialog.comp" :config="previewChartDialog.config"></component>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="editReportDialog.state" :position="editReportDialog.position" full-height>
      <q-card style="width: 100vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editReportDialog.title }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section>
            <q-tabs v-model="editReportDialog.tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left" narrow-indicator>
              <q-tab name="report" label="报表信息"/>
              <q-tab name="reportDimension" label="统计维度" :disable="dimensionState"/>
            </q-tabs>
            <q-separator/>
            <q-tab-panels v-model="editReportDialog.tab" animated>
              <q-tab-panel name="report">
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editReportDialog.report.code" label="报表编码 *" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editReportDialog.report.name" label="报表名称 *" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
                <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="editReportDialog.report.model.id" emit-value map-options option-value="id" :options="editReportDialog.modelList" label="依赖模型 *" clearable lazy-rules :rules="[ val => (val != null) || 'model is invalid' ]">
                </q-select>
                <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editReportDialog.report.chart" :options="editReportDialog.charts" emit-value map-options label="展现形式 *" clearable lazy-rules :rules="[ val => (val != null) || 'chart is invalid' ]">
                </q-select>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editReportDialog.report.script" type="textarea" rows="6" label="SQL" placeholder="SELECT <values> FROM <table name> WHERE <conditions>" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']">
                  <template v-slot:append>
                    <div style="margin-top: 2vh;">
                      <q-btn round dense flat text-color="cyan-8" icon="visibility" @click="preview" :disable="editReportDialog.previewBtnDisable"/>
                    </div>
                  </template>
                </q-input>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" type="textarea" rows="2" v-model="editReportDialog.report.description" label="描述"/>
              </q-tab-panel>
              <q-tab-panel name="reportDimension">
                <q-table :data="editReportDialog.indexDimensions" :columns="editReportDialog.indexDimensionColumns" :rows-per-page-options="[0]" row-key="id" separator="cell" hide-bottom title="统计维度(与SQL结果字段对应)">
                  <template v-slot:top-right>
                    <q-btn split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addIndexDimension" :disable="editReportDialog.indexDimensions.length >= editReportDialog.limit[editReportDialog.report.chart].index"/>
                  </template>
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td key="operate" :props="props">
                        <q-btn size="xs" outline round color="negative" icon="remove"
                              @click="deleteIndexDimension(props)"></q-btn>
                      </q-td>
                      <q-td key="code" :props="props">
                        {{ props.row.code }}
                        <q-popup-edit v-model="props.row.code" :auto-save=true>
                          <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.code"/>
                        </q-popup-edit>
                      </q-td>
                      <q-td key="name" :props="props">
                        {{ props.row.name }}
                        <q-popup-edit v-model="props.row.name" :auto-save=true>
                          <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.name"/>
                        </q-popup-edit>
                      </q-td>
                      <q-td key="description" :props="props">
                        {{ props.row.description }}
                        <q-popup-edit v-model="props.row.description" :auto-save=true>
                          <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.description"/>
                        </q-popup-edit>
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
                <br/>
                <q-separator color="cyan-8" size="2px"/>
                <q-table :data="editReportDialog.subjectDimensions" :columns="editReportDialog.subjectDimensionColumns" :rows-per-page-options="[0]" row-key="id" separator="cell" hide-bottom title="统计对象(与SQL结果字段对应)">
                  <template v-slot:top-right>
                    <q-btn split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addSubjectDimension" :disable="editReportDialog.subjectDimensions.length >= editReportDialog.limit[editReportDialog.report.chart].subject"/>
                  </template>
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td key="operate" :props="props">
                        <q-btn size="xs" outline round color="negative" icon="remove"
                              @click="deleteSubjectDimension(props)"></q-btn>
                      </q-td>
                      <q-td key="code" :props="props">
                        {{ props.row.code }}
                        <q-popup-edit v-model="props.row.code" :auto-save=true>
                          <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.code"/>
                        </q-popup-edit>
                      </q-td>
                      <q-td key="name" :props="props">
                        {{ props.row.name }}
                        <q-popup-edit v-model="props.row.name" :auto-save=true>
                          <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.name"/>
                        </q-popup-edit>
                      </q-td>
                      <q-td key="description" :props="props">
                        {{ props.row.description }}
                        <q-popup-edit v-model="props.row.description" :auto-save=true>
                          <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.description"/>
                        </q-popup-edit>
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
                <br/>
                <q-separator color="cyan-8" size="2px"/>
                <br/>
                <q-table :data="editReportDialog.amountDimensions" :columns="editReportDialog.amountDimensionColumns" :visible-columns="editReportDialog.visibleAmountDimensionColumns" :rows-per-page-options="[0]" row-key="id" separator="cell" hide-bottom title="统计数据(与SQL结果字段对应)">
                  <template v-slot:top-right>
                    <q-btn split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addAmountDimension" :disable="editReportDialog.amountDimensions.length >= editReportDialog.limit[editReportDialog.report.chart].amount"/>
                  </template>
                  <template v-slot:top-row v-if="editReportDialog.report.chart === 'kLineChart'">
                  <q-tr>
                    <q-td colspan="100%" style="color: red;">
                      请按照开始，最高，最低，结束的顺序填写统计数据定义
                    </q-td>
                  </q-tr>
                </template>
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td key="operate" :props="props">
                        <q-btn size="xs" outline round color="negative" icon="remove"
                              @click="deleteAmountDimension(props)"></q-btn>
                      </q-td>
                      <q-td key="code" :props="props">
                        {{ props.row.code }}
                        <q-popup-edit v-model="props.row.code" :auto-save=true>
                          <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.code"/>
                        </q-popup-edit>
                      </q-td>
                      <q-td key="name" :props="props">
                        {{ props.row.name }}
                        <q-popup-edit v-model="props.row.name" :auto-save=true>
                          <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.name"/>
                        </q-popup-edit>
                      </q-td>
                      <q-td key="graph" :props="props">
                        {{ editReportDialog.graphMapping[props.row.graph] }}
                        <q-popup-edit v-model="props.row.graph" :auto-save=true>
                          <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.graph" emit-value map-options :options="editReportDialog.graphList"/>
                        </q-popup-edit>
                      </q-td>
                      <q-td key="anchor" :props="props">
                        {{ props.row.anchor }}
                        <q-popup-edit v-model="props.row.anchor" :auto-save=true>
                          <q-select autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.anchor" emit-value map-options option-value="code" option-label="code" :options="editReportDialog.amountDimensions"/>
                        </q-popup-edit>
                      </q-td>
                      <q-td key="description" :props="props">
                        {{ props.row.description }}
                        <q-popup-edit v-model="props.row.description" :auto-save=true>
                          <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.description"/>
                        </q-popup-edit>
                      </q-td>
                    </q-tr>
                  </template>
                  <template v-slot:bottom>
                    Bottom
                  </template>
                </q-table>
              </q-tab-panel>
            </q-tab-panels>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="预览" outline text-color="primary" icon="visibility" @click="priviewChart" v-if="editReportDialog.amountDimensions.length > 0 "/>
          <q-btn label="保存" outline text-color="cyan-8" :icon="table.saveIcon" @click="saveReport"/>
          <q-btn label="删除" outline text-color="negative" :icon="table.deleteIcon" @click="deleteReport"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import {
  deleteReport,
  fetchAllReports,
  fetchReport,
  saveReport
} from 'src/service/ReportService'

import LineChart from 'components/chart/LineChart.vue'
import AreaChart from 'components/chart/AreaChart.vue'
import HorizontalBarChart from 'components/chart/HorizontalBarChart.vue'
import VerticalBarChart from 'components/chart/VerticalBarChart.vue'
import VerticalStackedBarChart from 'components/chart/VerticalStackedBarChart.vue'
import HorizontalStackedBarChart from 'components/chart/HorizontalStackedBarChart.vue'
import VerticalStackedPercentBarChart from 'components/chart/VerticalStackedPercentBarChart.vue'
import HorizontalStackedPercentBarChart from 'components/chart/HorizontalStackedPercentBarChart.vue'
import MixChart from 'components/chart/MixChart.vue'
import PieChart from 'components/chart/PieChart.vue'
import RadarChart from 'components/chart/RadarChart.vue'
import KLineChart from 'components/chart/KLineChart.vue'
import { fetchAllProjects } from 'src/service/ProjectService'
import { fetchAllModels } from 'src/service/ModelService'
import { preview } from 'src/service/PreviewService'
import { mdiContentSaveOutline, mdiTrashCanOutline } from '@quasar/extras/mdi-v5'

export default {
  components: {
    lineChart: LineChart,
    areaChart: AreaChart,
    horizontalBarChart: HorizontalBarChart,
    verticalBarChart: VerticalBarChart,
    pieChart: PieChart,
    radarChart: RadarChart,
    verticalStackedBarChart: VerticalStackedBarChart,
    horizontalStackedBarChart: HorizontalStackedBarChart,
    verticalStackedPercentBarChart: VerticalStackedPercentBarChart,
    horizontalStackedPercentBarChart: HorizontalStackedPercentBarChart,
    mixChart: MixChart,
    kLineChart: KLineChart
  },
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
            label: '报表编码',
            field: 'code',
            align: 'left'
          },
          {
            name: 'name',
            label: '报表名称',
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
      previewDataDialog: {
        mode: false,
        columns: [],
        data: [],
        loading: false
      },
      previewChartDialog: {
        mode: false,
        comp: 'lineChart',
        config: {
          name: null,
          indexDimensions: [],
          amountDimensions: [],
          records: []
        },
        previewSeries: [],
        previewOptions: {}
      },
      editReportDialog: {
        state: false,
        position: 'right',
        title: '编辑',
        tab: 'report',
        report: {
          id: null,
          code: null,
          name: null,
          script: null,
          description: null,
          chart: null,
          direction: null,
          background: null,
          color: null,
          status: null,
          project: {},
          model: {},
          reportDimensions: []
        },
        indexDimensionColumns: [
          {
            name: 'operate',
            label: '操作',
            field: 'operate',
            align: 'right',
            headerStyle: 'width: 20px'
          },
          {
            name: 'code',
            label: '编码',
            field: 'code',
            align: 'left'
          },
          {
            name: 'name',
            label: '名称',
            field: 'name',
            align: 'left'
          },
          {
            name: 'description',
            label: '描述',
            field: 'description',
            align: 'left'
          }
        ],
        subjectDimensionColumns: [
          {
            name: 'operate',
            label: '操作',
            field: 'operate',
            align: 'right',
            headerStyle: 'width: 20px'
          },
          {
            name: 'code',
            label: '编码',
            field: 'code',
            align: 'left'
          },
          {
            name: 'name',
            label: '名称',
            field: 'name',
            align: 'left'
          },
          {
            name: 'description',
            label: '描述',
            field: 'description',
            align: 'left'
          }
        ],
        amountDimensionColumns: [
          {
            name: 'operate',
            label: '操作',
            field: 'operate',
            align: 'right',
            headerStyle: 'width: 20px'
          },
          {
            name: 'code',
            label: '编码',
            field: 'code',
            align: 'left'
          },
          {
            name: 'name',
            label: '名称',
            field: 'name',
            align: 'left'
          },
          {
            name: 'graph',
            label: '形状',
            field: 'graph',
            align: 'left'
          },
          {
            name: 'anchor',
            label: '锚定度量',
            field: 'anchor',
            align: 'left'
          },
          {
            name: 'description',
            label: '描述',
            field: 'description',
            align: 'left'
          }
        ],
        visibleAmountDimensionColumns: ['operate', 'code', 'name', 'description'],
        modelList: [],
        previewBtnDisable: false,
        datasource: {},
        charts: [
          { value: 'lineChart', label: '折线图' },
          { value: 'pieChart', label: '饼图' },
          { value: 'verticalBarChart', label: '垂直柱状图' },
          { value: 'verticalStackedBarChart', label: '垂直堆叠柱状图' },
          { value: 'verticalStackedPercentBarChart', label: '垂直堆叠百分比柱状图' },
          { value: 'horizontalBarChart', label: '水平柱状图' },
          { value: 'horizontalStackedBarChart', label: '水平堆叠柱状图' },
          { value: 'horizontalStackedPercentBarChart', label: '水平堆叠百分比柱状图' },
          { value: 'areaChart', label: '堆叠面积图' },
          { value: 'radarChart', label: '雷达图' },
          { value: 'mixChart', label: '混合图(折线、面积、柱状图)' },
          { value: 'kLineChart', label: 'K线图' }

        ],
        directions: [
          { value: 'h', label: '水平' },
          { value: 'v', label: '垂直' }
        ],
        indexDimensions: [],
        subjectDimensions: [],
        amountDimensions: [],
        limit: {
          lineChart: {
            index: 1,
            subject: 1,
            amount: 2
          },
          areaChart: {
            index: 1,
            subject: 1,
            amount: 2
          },
          horizontalBarChart: {
            index: 1,
            subject: 1,
            amount: 2
          },
          verticalBarChart: {
            index: 1,
            subject: 1,
            amount: 2
          },
          pieChart: {
            index: 1,
            subject: 0,
            amount: 1
          },
          radarChart: {
            index: 1,
            subject: 1,
            amount: 1
          },
          verticalStackedBarChart: {
            index: 1,
            subject: 1,
            amount: 2
          },
          horizontalStackedBarChart: {
            index: 1,
            subject: 1,
            amount: 2
          },
          verticalStackedPercentBarChart: {
            index: 1,
            subject: 1,
            amount: 2
          },
          horizontalStackedPercentBarChart: {
            index: 1,
            subject: 1,
            amount: 2
          },
          mixChart: {
            index: 1,
            subject: 1,
            amount: 10
          },
          kLineChart: {
            index: 1,
            subject: 0,
            amount: 4
          }
        },
        graphList: [
          { value: 'line', label: '线性' },
          { value: 'column', label: '柱形' }
        ],
        anchorList: [],
        graphMapping: {
          line: '线性',
          column: '柱形',
          null: ''
        }
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
        this.searchReports()
        fetchAllModels({
          id: val.id
        }).then(res => {
          res.data.forEach(item => {
            vm.editReportDialog.datasource[item.id] = item.datasource.id
            vm.editReportDialog.modelList.push({
              id: item.id,
              label: item.name
            })
          })
        })
      } else {
        vm.table.data = []
      }
    },
    searchReports () {
      const vm = this
      vm.table.loading = true
      const query = {
        id: vm.table.project.id,
        payload: vm.table.filter
      }
      fetchAllReports(query).then(res => {
        vm.table.data = res.data
        this.table.loading = false
      })
    },
    loadReport (props) {
      if (props.row.status === '0') {
        return
      }
      const vm = this
      fetchReport(props.key).then(res => {
        vm.editReportDialog = Object.assign(vm.editReportDialog, {
          state: true,
          report: {
            id: res.data.id,
            code: res.data.code,
            name: res.data.name,
            script: res.data.script,
            chart: res.data.chart || 'lineChart',
            direction: res.data.direction || 'h',
            background: res.data.background,
            color: res.data.color,
            description: res.data.description,
            status: res.data.status,
            project: res.data.project,
            model: res.data.model,
            reportDimensions: res.data.reportDimensions
          }
        })
        vm.editReportDialog.indexDimensions = []
        vm.editReportDialog.subjectDimensions = []
        vm.editReportDialog.amountDimensions = []
        res.data.reportDimensions.forEach(item => {
          if (item.category === 'index') {
            vm.editReportDialog.indexDimensions.push(item)
          } else if (item.category === 'subject') {
            vm.editReportDialog.subjectDimensions.push(item)
          } else {
            vm.editReportDialog.amountDimensions.push(item)
          }
        })
      }).catch(err => {
        if (err.status === 10002) {
          vm.$q.notify({
            message: '未授权的报表!',
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
    preview () {
      const vm = this
      vm.previewDataDialog.columns = []
      vm.previewDataDialog.data = []
      vm.previewDataDialog.mode = true
      vm.previewDataDialog.loading = true
      preview({
        category: 'sql',
        datasourceId: vm.editReportDialog.datasource[vm.editReportDialog.report.model.id],
        sql: vm.editReportDialog.report.script
      }).then(res => {
        const lineNo = {
          name: 'index',
          label: '#',
          field: 'index'
        }
        vm.previewDataDialog.columns.push(lineNo)
        res.data.headers.forEach(ele => {
          const column = {
            name: ele,
            label: ele.toUpperCase(),
            field: ele
          }
          vm.previewDataDialog.columns.push(column)
        })
        res.data.records.forEach((ele, index) => {
          vm.previewDataDialog.data.push(Object.assign(ele, { index: index + 1 }))
        })
        vm.previewDataDialog.loading = false
      }).catch(() => {
        vm.$q.notify({
          position: 'top',
          message: 'SQL语法错误或存在特殊字符等，请仔细检查',
          color: 'negative'
        })
      })
    },
    priviewChart () {
      const vm = this
      vm.previewChartDialog.comp = vm.editReportDialog.report.chart
      preview({
        category: 'sql',
        datasourceId: vm.editReportDialog.datasource[vm.editReportDialog.report.model.id],
        sql: vm.editReportDialog.report.script
      }).then(res => {
        vm.previewChartDialog.config.name = vm.editReportDialog.report.name
        vm.previewChartDialog.config.indexDimensions = vm.editReportDialog.indexDimensions
        vm.previewChartDialog.config.subjectDimensions = vm.editReportDialog.subjectDimensions
        vm.previewChartDialog.config.amountDimensions = vm.editReportDialog.amountDimensions
        vm.previewChartDialog.config.records = res.data.records
        vm.previewChartDialog.mode = true
      })
    },
    newReport () {
      const vm = this
      vm.editReportDialog.indexDimensions = []
      vm.editReportDialog.subjectDimensions = []
      vm.editReportDialog.amountDimensions = []
      vm.editReportDialog = Object.assign(vm.editReportDialog, {
        state: true,
        report: {
          id: null,
          code: null,
          name: null,
          script: null,
          chart: 'lineChart',
          direction: 'h',
          background: null,
          color: null,
          description: null,
          status: null,
          project: { id: vm.table.project.id },
          model: {},
          reportDimensions: []
        }
      })
    },
    saveReport () {
      const vm = this
      vm.editReportDialog.report.reportDimensions = vm.editReportDialog.indexDimensions.concat(vm.editReportDialog.subjectDimensions, vm.editReportDialog.amountDimensions)
      saveReport(vm.editReportDialog.report).then(res => {
        vm.searchReports()
        vm.editReportDialog = Object.assign(vm.editReportDialog, {
          state: false,
          report: {
            id: null,
            code: null,
            name: null,
            script: null,
            chart: 'lineChart',
            direction: 'h',
            background: null,
            color: null,
            description: null,
            status: null,
            project: {},
            model: {},
            reportDimensions: []
          },
          indexDimensions: [],
          subjectDimensions: [],
          amountDimensions: []
        })
        vm.$q.notify({
          message: '保存成功!',
          position: 'top',
          color: 'teal'
        })
      })
    },
    deleteReport () {
      const vm = this
      this.$q.dialog({
        title: 'Confirm',
        message: '确定删除报表?',
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
        deleteReport(vm.editReportDialog.report.id).then(res => {
          vm.searchReports()
          vm.editReportDialog = Object.assign(vm.editReportDialog, {
            state: false,
            report: {
              id: null,
              code: null,
              name: null,
              script: null,
              chart: 'lineChart',
              direction: 'h',
              background: null,
              color: null,
              description: null,
              status: null,
              project: {},
              model: {},
              reportDimensions: []
            },
            indexDimensions: [],
            subjectDimensions: [],
            amountDimensions: []
          })
        })
      })
    },
    addIndexDimension () {
      this.editReportDialog.indexDimensions.push({
        code: '',
        name: '',
        category: 'index',
        description: ''
      })
    },
    addSubjectDimension () {
      this.editReportDialog.subjectDimensions.push({
        code: '',
        name: '',
        category: 'subject',
        description: ''
      })
    },
    addAmountDimension () {
      this.editReportDialog.amountDimensions.push({
        code: '',
        name: '',
        category: 'amount',
        anchor: '',
        graph: '',
        description: ''
      })
    },
    deleteIndexDimension (props) {
      this.editReportDialog.indexDimensions.splice(props.rowIndex, 1)
    },
    deleteSubjectDimension (props) {
      this.editReportDialog.subjectDimensions.splice(props.rowIndex, 1)
    },
    deleteAmountDimension (props) {
      this.editReportDialog.amountDimensions.splice(props.rowIndex, 1)
    }
  },
  computed: {
    dimensionState () {
      return !this.editReportDialog.report.code
    }
  },
  watch: {
    'editReportDialog.report.chart' (newValue) {
      if (newValue === 'mixChart') {
        this.editReportDialog.visibleAmountDimensionColumns = ['operate', 'code', 'name', 'graph', 'anchor', 'description']
      } else {
        this.editReportDialog.visibleAmountDimensionColumns = ['operate', 'code', 'name', 'description']
      }
    }
  },
  mounted () {
    const vm = this
    vm.searchProjects()
  }
}
</script>
