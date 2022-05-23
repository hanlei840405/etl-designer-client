<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" :filter="table.filter" @request="searchLayout" hide-header
             :no-data-label="$t('table-empty')" :rows-per-page-options="[0]" hide-bottom>
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="table.filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search"/>
            <q-btn text-color="cyan-8" outline :label="$t('btn-new')" @click="newLayout"/>
          </template>
        </q-input>
      </template>
      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-4 col-md-3 col-lg-2 grid-style-transition"
        >
          <q-separator color="cyan-8" size="2px"/>
          <q-card :class="[props.row.status === '1' ? '' : 'bg-grey-5']">
            <q-list dense>
              <q-item v-for="col in props.cols.filter(col => col.name !== 'desc')" :key="col.name">
                <q-item-section>
                  <q-item-label>{{ col.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption lines="1">{{ col.value }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-card-actions align="right">
                <q-btn :label="$t('btn-edit')" outline text-color="cyan-8" icon="edit" @click="loadLayout(props)"/>
                <q-btn :label="$t('btn-layout')" outline text-color="negative" icon="dashboard_customize" @click="designLayout(props)"/>
              </q-card-actions>
            </q-list>
          </q-card>
        </div>
      </template>
    </q-table>
    <q-dialog v-model="editLayoutDialog.state" :position="editLayoutDialog.position" full-height>
      <q-card style="width: 100vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editLayoutDialog.title }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md">
            <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="layout.code" :label="$t('form-code')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
              <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="layout.name" :label="$t('form-name')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
              <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="layout.resourceCode" :label="$t('form-resource-code')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
              <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" type="textarea" v-model="layout.description" :label="$t('form-description')"/>
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn :label="$t('btn-save')" outline text-color="cyan-8" :icon="table.saveIcon" @click="saveEntity"/>
          <q-btn :label="$t('btn-delete')" outline text-color="negative" :icon="table.deleteIcon" @click="deleteLayout"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="designLayoutDialog.state" :full-width="true" :full-height="true">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ designLayoutDialog.title }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section class="row text-center">
          <div id="layoutGrid" class="col-sm-12 col-md-11 grid-stack"></div>
          <div class="col-md-1">
            <div id="trash" class="bg-deep-orange-2" style="padding: 5px; margin-bottom: 15px;">
              <div>
              <q-icon :name="table.deleteIcon" style="font-size: 2rem;"></q-icon>
              </div>
              <div>
                {{ $t('btn-delete-report') }}
              </div>
            </div>
            <div id="addBtn" class="newWidget grid-stack-item">
              <div class="grid-stack-item-content bg-indigo-1" style="padding: 5px;">
                <div>
                <q-icon name="add" style="font-size: 2rem;"></q-icon>
                </div>
                <div>
                  {{ $t('btn-add-report') }}
                </div>
              </div>
            </div>
            <div id="test"></div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn :label="$t('btn-save')" outline text-color="cyan-8" :icon="table.saveIcon" @click="saveDesign"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="selectReportDialog.state">
      <q-card style="width: 20vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('btn-select-report') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section class="row text-center">
          <q-select style="width: 100%;" outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="selectReportDialog.report"  option-value="id" option-label="name" :options="selectReportDialog.reportList" :label="$t('form-report')" clearable lazy-rules :rules="[ val => (val != null) || 'datasource is invalid' ]">
          </q-select>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn :label="$t('btn-save')" outline text-color="cyan-8" :icon="table.saveIcon" @click="selectedReport"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
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
import KLineChart from 'components/chart/KLineChart.vue'
import 'gridstack/dist/gridstack.min.css'
import { GridStack } from 'gridstack'
import 'gridstack/dist/h5/gridstack-dd-native'
import {
  deleteLayout,
  fetchAllLayouts,
  fetchLayout,
  saveLayout
} from 'src/service/LayoutService'
import { showActiveReports, fetchReport, deploy } from 'src/service/ReportService'
import { mdiContentSaveOutline, mdiTrashCanOutline } from '@quasar/extras/mdi-v5'

export default {
  data () {
    return {
      components: {
        lineChart: LineChart,
        areaChart: AreaChart,
        horizontalBarChart: HorizontalBarChart,
        verticalBarChart: VerticalBarChart,
        horizontalStackedBarChart: HorizontalStackedBarChart,
        verticalStackedBarChart: VerticalStackedBarChart,
        horizontalStackedPercentBarChart: HorizontalStackedPercentBarChart,
        verticalStackedPercentBarChart: VerticalStackedPercentBarChart,
        pieChart: PieChart,
        mixChart: MixChart,
        kLineChart: KLineChart
      },
      table: {
        saveIcon: mdiContentSaveOutline,
        deleteIcon: mdiTrashCanOutline,
        filter: null,
        loading: false,
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
            name: 'resourceCode',
            label: this.$t('column-resource-code'),
            field: 'resourceCode',
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
      editLayoutDialog: {
        state: false,
        position: 'right',
        title: this.$t('form-title-edit')
      },
      layout: {
        id: null,
        code: null,
        name: null,
        arrange: null,
        resourceCode: null,
        description: null,
        status: null
      },
      designLayoutDialog: {
        state: false,
        title: this.$t('form-layout'),
        grid: null
      },
      selectReportDialog: {
        state: false,
        report: null,
        reportList: [],
        fn: null
      },
      chart: null,
      config: {
        name: '',
        indexDimensions: [],
        subjectDimensions: [],
        amountDimensions: [],
        records: []
      }
    }
  },
  methods: {
    searchLayout () {
      const vm = this
      vm.table.loading = true
      const query = {
        payload: vm.table.filter
      }
      fetchAllLayouts(query).then(res => {
        vm.table.data = res.data
        this.table.loading = false
      })
    },
    loadLayout (props) {
      if (props.row.status === '0') {
        return
      }
      const vm = this
      fetchLayout(props.key).then(res => {
        vm.editLayoutDialog.state = true
        vm.layout = Object.assign(vm.layout, {
          id: res.data.id,
          code: res.data.code,
          name: res.data.name,
          arrange: res.data.arrange,
          description: res.data.description,
          resourceCode: res.data.resourceCode,
          status: res.data.status
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
    newLayout () {
      const vm = this
      var result = ''
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      var charactersLength = characters.length
      for (var i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      vm.editLayoutDialog.state = true
      vm.layout = Object.assign(vm.layout, {
        id: null,
        code: null,
        name: null,
        arrange: null,
        resourceCode: result,
        description: null,
        status: null
      })
    },
    designLayout (props) {
      const vm = this
      vm.designLayoutDialog.state = true
      fetchLayout(props.key).then(res => {
        vm.layout = Object.assign(vm.layout, {
          id: res.data.id,
          code: res.data.code,
          name: res.data.name,
          arrange: res.data.arrange,
          description: res.data.description,
          resourceCode: res.data.resourceCode,
          status: res.data.status
        })
        vm.designLayout.grid = GridStack.init({
          cellHeight: 60,
          margin: 1,
          acceptWidgets: true,
          dragIn: '.newWidget',
          dragInOptions: { revert: 'invalid', scroll: false, appendTo: 'body', helper: 'clone' },
          removable: '#trash'
        }, '#layoutGrid')
        if (vm.layout.arrange) {
          const cells = JSON.parse(vm.layout.arrange)
          cells.forEach(cell => {
            cell.content = '<div class="bg-indigo-1" style="height: 100%; width: width: 95%;"><div id="cell_' + cell.report.cellId + '"/></div></div>'
          })
          vm.designLayout.grid.load(cells)
          cells.forEach(cell => {
            fetchReport(cell.report.id).then(reportRes => {
              const report = Object.assign(reportRes.data, {
                indexDimensions: [],
                subjectDimensions: [],
                amountDimensions: []
              })
              reportRes.data.reportDimensions.forEach(item => {
                if (item.category === 'index') {
                  report.indexDimensions.push(item)
                } else if (item.category === 'subject') {
                  report.subjectDimensions.push(item)
                } else {
                  report.amountDimensions.push(item)
                }
              })
              deploy({
                id: cell.report.id
              }).then(depolyRes => {
                vm.config = {
                  name: report.name,
                  indexDimensions: report.indexDimensions,
                  subjectDimensions: report.subjectDimensions,
                  amountDimensions: report.amountDimensions,
                  records: depolyRes.data.records
                }
                new Vue({
                  render (h) {
                    return h(vm.components[report.chart], { props: { config: vm.config } })
                  }
                }).$mount('#cell_' + cell.report.cellId)
              })
            })
          })
        }
        vm.designLayout.grid.on('added', function (e, items) {
          items.forEach(function (item) {
            vm.showSelectReportDialog()
            vm.selectReportDialog.fn = function (val) {
              deploy({
                id: val.id
              }).then(res => {
                vm.config = {
                  name: val.name,
                  indexDimensions: val.indexDimensions,
                  subjectDimensions: val.subjectDimensions,
                  amountDimensions: val.amountDimensions,
                  records: res.data.records
                }
                const cellId = new Date().getTime()
                vm.designLayout.grid.update(item.el, { w: 2, h: 2, content: '<div class="bg-indigo-1" style="height: 100%; width: width: 95%;"><div id="cell_' + cellId + '"/></div>', report: { id: val.id, cellId: 'cell_' + cellId } })
                vm.$nextTick(() => {
                  new Vue({
                    render (h) {
                      return h(vm.components[val.chart], { props: { config: vm.config } })
                    }
                  }).$mount('#cell_' + cellId)
                })
              })
            }
          })
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
    showSelectReportDialog () {
      this.selectReportDialog.state = true
    },
    selectedReport () {
      const vm = this
      vm.selectReportDialog.state = false
      fetchReport(vm.selectReportDialog.report.id).then(res => {
        const report = Object.assign(res.data, {
          indexDimensions: [],
          subjectDimensions: [],
          amountDimensions: []
        })
        res.data.reportDimensions.forEach(item => {
          if (item.category === 'index') {
            report.indexDimensions.push(item)
          } else if (item.category === 'subject') {
            report.subjectDimensions.push(item)
          } else {
            report.amountDimensions.push(item)
          }
        })
        this.selectReportDialog.fn(report)
      })
    },
    saveDesign () {
      const vm = this
      vm.layout.arrange = JSON.stringify(vm.designLayout.grid.save(false, false))
      saveLayout(vm.layout).then(res => {
        vm.searchLayout()
        vm.designLayoutDialog.state = false
        vm.$q.notify({
          message: this.$t('response-save-success'),
          position: 'top',
          color: 'teal'
        })
      })
    },
    saveEntity () {
      const vm = this
      saveLayout(vm.layout).then(res => {
        vm.searchLayout()
        vm.editLayoutDialog.state = false
        vm.layout = Object.assign(vm.layout, {
          id: null,
          code: null,
          name: null,
          arrange: null,
          resourceCode: null,
          description: null,
          status: null
        })
        vm.$q.notify({
          message: this.$t('response-save-success'),
          position: 'top',
          color: 'teal'
        })
      })
    },
    deleteLayout () {
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
        deleteLayout(vm.layout.id).then(res => {
          vm.searchLayout()
          vm.editLayoutDialog.state = true
          vm.layout = Object.assign(vm.layout, {
            id: null,
            code: null,
            name: null,
            arrange: null,
            resourceCode: null,
            description: null,
            status: null
          })
        })
      })
    }
  },
  mounted () {
    const vm = this
    vm.searchLayout()
    showActiveReports({}).then(res => {
      vm.selectReportDialog.reportList = res.data
    })
  }
}
</script>
