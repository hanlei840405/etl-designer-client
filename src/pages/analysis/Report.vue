<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" :filter="table.filter" @request="searchReports" hide-header
             :no-data-label="$t('table-empty')" :rows-per-page-options="[0]" hide-bottom>
      <template v-slot:top-left>
        <q-select
          v-model="table.project"
          outlined
          dense
          :label="$t('select-workspace')"
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
                <q-badge :color="scope.opt.status === '1' ? 'teal' : 'grey-5'" :label="scope.opt.status === '1' ? $t('column-status-active') : $t('column-status-inactive')" />
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </template>
      <template v-if="table.project && table.project.status === '1'" v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="table.filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search"/>
            <q-btn text-color="cyan-8" outline :label="$t('btn-new')" @click="newReport"/>
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
          <div class="text-h6">{{ $t('dialog-title-preview') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-chip square text-color="cyan-8" icon="bookmark" style="width: 100%; margin: 0px;">
            {{ $t('dialog-bottom-limit', [20]) }}
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
          <div class="text-h6">{{ $t('dialog-title-preview') }}</div>
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
              <q-tab name="main" :label="$t('tab-main')"/>
              <q-tab name="reportDimension" :label="$t('tab-dimension')" :disable="dimensionState"/>
            </q-tabs>
            <q-separator/>
            <q-tab-panels v-model="editReportDialog.tab" animated>
              <q-tab-panel name="main">
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editReportDialog.report.code" :label="$t('form-code')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editReportDialog.report.name" :label="$t('form-name')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
                <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model.number="editReportDialog.report.model.id" emit-value map-options option-value="id" :options="editReportDialog.modelList" :label="$t('form-reference-model')" clearable lazy-rules :rules="[ val => (val != null) || 'model is invalid' ]" @input="selectedModel">
                </q-select>
                <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editReportDialog.report.chart" :options="editReportDialog.charts" emit-value map-options :label="$t('form-chart')" clearable lazy-rules :rules="[ val => (val != null) || 'chart is invalid' ]">
                </q-select>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" type="textarea" rows="2" v-model="editReportDialog.report.description" :label="$t('form-description')"/>
              </q-tab-panel>
              <q-tab-panel name="reportDimension">
                <q-table :data="editReportDialog.indexDimensions" :columns="editReportDialog.indexDimensionColumns" :rows-per-page-options="[0]" row-key="id" separator="cell" hide-bottom :title="$t('table-title-statistical-dimension')">
                  <template v-slot:top-right>
                    <q-btn-dropdown split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addIndexDimension(true)" :disable="editReportDialog.indexDimensions.length >= editReportDialog.limit[editReportDialog.report.chart].index">
                      <q-list>
                        <q-item clickable v-close-popup @click="addIndexDimension(true)" :disable="editReportDialog.indexDimensions.length >= editReportDialog.limit[editReportDialog.report.chart].index">
                          <q-item-section>
                            <q-item-label>{{ $t('btn-add-standard-selection') }}</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="addIndexDimension(false)" :disable="editReportDialog.indexDimensions.length >= editReportDialog.limit[editReportDialog.report.chart].index">
                          <q-item-section>
                            <q-item-label>{{ $t('btn-add-custom-input') }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
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
                          <q-select v-if="props.row.standard" autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" emit-value map-options v-model="props.row.code" :options="editReportDialog.metadataList" @input="(e) => selectedMetadata (e, props.row)"/>
                          <q-input v-if="!props.row.standard" autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.code"/>
                        </q-popup-edit>
                      </q-td>
                      <q-td key="name" :props="props">
                        {{ props.row.name }}
                        <q-popup-edit v-if="!props.row.standard" v-model="props.row.name" :auto-save=true>
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
                <q-table :data="editReportDialog.subjectDimensions" :columns="editReportDialog.subjectDimensionColumns" :rows-per-page-options="[0]" row-key="id" separator="cell" hide-bottom :title="$t('table-title-statistical-object')">
                  <template v-slot:top-right>
                    <q-btn-dropdown split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addSubjectDimension(true)" :disable="editReportDialog.subjectDimensions.length >= editReportDialog.limit[editReportDialog.report.chart].subject">
                      <q-list>
                        <q-item clickable v-close-popup @click="addSubjectDimension(true)" :disable="editReportDialog.subjectDimensions.length >= editReportDialog.limit[editReportDialog.report.chart].subject">
                          <q-item-section>
                            <q-item-label>{{ $t('btn-add-standard-selection') }}</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="addSubjectDimension(false)" :disable="editReportDialog.subjectDimensions.length >= editReportDialog.limit[editReportDialog.report.chart].subject">
                          <q-item-section>
                            <q-item-label>{{ $t('btn-add-custom-input') }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
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
                          <q-select v-if="props.row.standard" autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" emit-value map-options v-model="props.row.code" :options="editReportDialog.metadataList" @input="(e) => selectedMetadata (e, props.row)"/>
                          <q-input v-if="!props.row.standard" autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.code"/>
                        </q-popup-edit>
                      </q-td>
                      <q-td key="name" :props="props">
                        {{ props.row.name }}
                        <q-popup-edit v-if="!props.row.standard" v-model="props.row.name" :auto-save=true>
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
                <q-table :data="editReportDialog.amountDimensions" :columns="editReportDialog.amountDimensionColumns" :visible-columns="editReportDialog.visibleAmountDimensionColumns" :rows-per-page-options="[0]" row-key="id" separator="cell" hide-bottom :title="$t('table-title-statistical-data')">
                  <template v-slot:top-right>
                    <q-btn-dropdown split outline color="cyan-8" icon="add" text-color="cyan-8" @click="addAmountDimension(true)" :disable="editReportDialog.amountDimensions.length >= editReportDialog.limit[editReportDialog.report.chart].amount">
                      <q-list>
                        <q-item clickable v-close-popup @click="addAmountDimension(true)" :disable="editReportDialog.amountDimensions.length >= editReportDialog.limit[editReportDialog.report.chart].amount">
                          <q-item-section>
                            <q-item-label>{{ $t('btn-add-standard-selection') }}</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="addAmountDimension(false)" :disable="editReportDialog.amountDimensions.length >= editReportDialog.limit[editReportDialog.report.chart].amount">
                          <q-item-section>
                            <q-item-label>{{ $t('btn-add-custom-input') }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                  </template>
                  <template v-slot:top-row v-if="editReportDialog.report.chart === 'kLineChart'">
                  <q-tr>
                    <q-td colspan="100%" style="color: red;">
                      {{ $t('table-title-report-order') }}
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
                        <q-select v-if="props.row.standard" autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" emit-value map-options v-model="props.row.code" :options="editReportDialog.metadataList" @input="(e) => selectedMetadata (e, props.row)"/>
                        <q-input v-if="!props.row.standard" autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.code"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="name" :props="props">
                      {{ props.row.name }}
                      <q-popup-edit v-if="!props.row.standard" v-model="props.row.name" :auto-save=true>
                        <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.name"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="description" :props="props">
                      {{ props.row.description }}
                      <q-popup-edit v-model="props.row.description" :auto-save=true>
                        <q-input autofocus outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.description"/>
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
                  </q-tr>
                </template>
                </q-table>
                <br/>
                <q-separator color="cyan-8" size="2px"/>
                <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="editReportDialog.report.script" type="textarea" rows="6" label="SQL" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']">
                  <template v-slot:append>
                    <div style="margin-top: 2vh;">
                      <q-btn round dense flat text-color="cyan-8" icon="visibility" @click="preview" :disable="editReportDialog.previewBtnDisable"/>
                    </div>
                  </template>
                </q-input>
              </q-tab-panel>
            </q-tab-panels>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn :label="$t('btn-preview')" outline text-color="primary" icon="visibility" @click="priviewChart" v-if="editReportDialog.amountDimensions.length > 0 "/>
          <q-btn :label="$t('btn-save')" outline text-color="cyan-8" :icon="table.saveIcon" @click="saveReport"/>
          <q-btn :label="$t('btn-delete')" outline text-color="negative" :icon="table.deleteIcon" @click="deleteReport"/>
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
import { fetchAllModels, fetchModel } from 'src/service/ModelService'
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
            label: this.$t('column-code'),
            field: 'code',
            align: 'left'
          },
          {
            name: 'name',
            label: this.$t('column-name'),
            field: 'name',
            align: 'left'
          },
          {
            name: 'description',
            label: this.$t('column-description'),
            field: 'description',
            align: 'left'
          },
          {
            name: 'status',
            label: this.$t('column-status'),
            field: 'status',
            align: 'left',
            format: (val, row) => {
              return val === '1' ? this.$t('column-status-active') : this.$t('column-status-inactive')
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
        title: this.$t('form-title-edit'),
        tab: 'main',
        report: {
          id: null,
          code: null,
          name: null,
          script: '',
          description: null,
          chart: null,
          status: null,
          project: {},
          model: {},
          reportDimensions: []
        },
        indexDimensionColumns: [
          {
            name: 'operate',
            label: this.$t('column-operate'),
            field: 'operate',
            align: 'right',
            headerStyle: 'width: 20px'
          },
          {
            name: 'code',
            label: this.$t('column-code'),
            field: 'code',
            align: 'left'
          },
          {
            name: 'name',
            label: this.$t('column-name'),
            field: 'name',
            align: 'left'
          },
          {
            name: 'description',
            label: this.$t('column-description'),
            field: 'description',
            align: 'left'
          }
        ],
        subjectDimensionColumns: [
          {
            name: 'operate',
            label: this.$t('column-operate'),
            field: 'operate',
            align: 'right',
            headerStyle: 'width: 20px'
          },
          {
            name: 'code',
            label: this.$t('column-code'),
            field: 'code',
            align: 'left'
          },
          {
            name: 'name',
            label: this.$t('column-name'),
            field: 'name',
            align: 'left'
          },
          {
            name: 'description',
            label: this.$t('column-description'),
            align: 'left'
          }
        ],
        amountDimensionColumns: [
          {
            name: 'operate',
            label: this.$t('column-operate'),
            field: 'operate',
            align: 'right',
            headerStyle: 'width: 20px'
          },
          {
            name: 'code',
            label: this.$t('column-code'),
            field: 'code',
            align: 'left'
          },
          {
            name: 'name',
            label: this.$t('column-name'),
            field: 'name',
            align: 'left'
          },
          {
            name: 'description',
            label: this.$t('column-description'),
            field: 'description',
            align: 'left'
          },
          {
            name: 'graph',
            label: this.$t('column-graph'),
            field: 'graph',
            align: 'left'
          },
          {
            name: 'anchor',
            label: this.$t('column-anchor'),
            field: 'anchor',
            align: 'left'
          }
        ],
        visibleAmountDimensionColumns: ['operate', 'code', 'name', 'description'],
        modelList: [],
        previewBtnDisable: false,
        datasource: {},
        charts: [
          { value: 'lineChart', label: this.$t('form-chart-line') },
          { value: 'pieChart', label: this.$t('form-chart-pie') },
          { value: 'verticalBarChart', label: this.$t('form-chart-vertical-bar') },
          { value: 'verticalStackedBarChart', label: this.$t('form-chart-vertical-stacked-bar') },
          { value: 'verticalStackedPercentBarChart', label: this.$t('form-chart-vertical-stacked-percent-bar') },
          { value: 'horizontalBarChart', label: this.$t('form-chart-horizontal-bar') },
          { value: 'horizontalStackedBarChart', label: this.$t('form-chart-horizontal-stacked-bar') },
          { value: 'horizontalStackedPercentBarChart', label: this.$t('form-chart-horizontal-stacked-percent-bar') },
          { value: 'areaChart', label: this.$t('form-chart-area') },
          { value: 'radarChart', label: this.$t('form-chart-radar') },
          { value: 'mixChart', label: this.$t('form-chart-mix') },
          { value: 'kLineChart', label: this.$t('form-chart-kLine') }

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
          { value: 'line', label: this.$t('column-line') },
          { value: 'column', label: this.$t('column-column') }
        ],
        anchorList: [],
        graphMapping: {
          line: this.$t('column-line'),
          column: this.$t('column-column'),
          null: ''
        },
        metadata: {},
        metadataList: []
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
            description: res.data.description,
            status: res.data.status,
            project: res.data.project,
            model: res.data.model,
            reportDimensions: res.data.reportDimensions
          }
        })
        vm.selectedModel(res.data.model.id)
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
            message: vm.$t('response-error-10002'),
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
    selectedModel (val) {
      const vm = this
      fetchModel(val).then(res => {
        vm.editReportDialog.metadataList = []
        res.data.metadataList.forEach(item => {
          vm.editReportDialog.metadataList.push({
            value: item.columnCode,
            label: item.columnName
          })
          vm.editReportDialog.metadata[item.columnCode] = item.columnName
        })
      }).catch(err => {
        if (err.status === 10002) {
          vm.$q.notify({
            message: vm.$t('response-error-10002'),
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
    selectedMetadata (val, row) {
      row = Object.assign(row, {
        name: this.editReportDialog.metadata[val]
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
          message: vm.$t('response-error-grammer'),
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
          script: '',
          chart: 'lineChart',
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
            script: '',
            chart: 'lineChart',
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
          message: this.$t('response-save-success'),
          position: 'top',
          color: 'teal'
        })
      })
    },
    deleteReport () {
      const vm = this
      this.$q.dialog({
        title: 'Confirm',
        message: vm.$t('confirm-delete'),
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
              script: '',
              chart: 'lineChart',
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
    addIndexDimension (standard) {
      this.editReportDialog.indexDimensions.push({
        code: '',
        name: '',
        description: '',
        category: 'index',
        standard: standard
      })
    },
    addSubjectDimension (standard) {
      this.editReportDialog.subjectDimensions.push({
        code: '',
        name: '',
        description: '',
        category: 'subject',
        standard: standard
      })
    },
    addAmountDimension (standard) {
      this.editReportDialog.amountDimensions.push({
        code: '',
        name: '',
        description: '',
        category: 'amount',
        anchor: '',
        graph: '',
        standard: standard
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
