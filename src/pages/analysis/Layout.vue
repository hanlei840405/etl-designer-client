<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" :filter="table.filter" @request="searchLayout" hide-header
             no-data-label="无数据" :rows-per-page-options="[0]" hide-bottom>
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="table.filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search"/>
            <q-btn text-color="cyan-8" outline label="新建" @click="newLayout"/>
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
                <q-btn label="编辑" outline text-color="cyan-8" icon="edit" @click="loadLayout(props)"/>
                <q-btn label="布局" outline text-color="negative" icon="dashboard_customize" @click="designLayout(props)"/>
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
            <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="layout.code" label="布局编码 *" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
              <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="layout.name" label="布局名称 *" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
              <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="layout.resourceCode" label="资源码 *" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
              <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" type="textarea" v-model="layout.description" label="描述"/>
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="保存" outline text-color="cyan-8" :icon="table.saveIcon" @click="saveEntity"/>
          <q-btn label="删除" outline text-color="negative" :icon="table.deleteIcon" @click="deleteLayout"/>
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
                移除报表
              </div>
            </div>
            <div id="addBtn" class="newWidget grid-stack-item">
              <div class="grid-stack-item-content bg-indigo-1" style="padding: 5px;">
                <div>
                <q-icon name="add" style="font-size: 2rem;"></q-icon>
                </div>
                <div>
                  添加报表
                </div>
              </div>
            </div>
            <div id="test"></div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="保存" outline text-color="cyan-8" :icon="table.saveIcon" @click="saveDesign"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="selectReportDialog.state">
      <q-card style="width: 20vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">选择报表</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section class="row text-center">
          <q-select style="width: 100%;" outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="selectReportDialog.report"  option-value="id" option-label="name" :options="selectReportDialog.reportList" label="报表 *" clearable lazy-rules :rules="[ val => (val != null) || 'datasource is invalid' ]">
          </q-select>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="确定" outline text-color="cyan-8" :icon="table.saveIcon" @click="selectedReport"/>
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
            label: '布局编码',
            field: 'code',
            align: 'left'
          },
          {
            name: 'name',
            label: '布局名称',
            field: 'name',
            align: 'left'
          },
          {
            name: 'resourceCode',
            label: '资源码',
            field: 'resourceCode',
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
      editLayoutDialog: {
        state: false,
        position: 'right',
        title: '编辑'
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
        title: '设计布局',
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
            message: '未授权的布局!',
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
                vm.designLayout.grid.update(item.el, { w: 2, h: item.h, content: '<div class="bg-indigo-1" style="height: 100%; width: width: 95%;"><div id="cell_' + item._id + '"/></div>', report: { id: val.id, cellId: 'cell_' + item._id } })
                new Vue({
                  render (h) {
                    return h(vm.components[val.chart], { props: { config: vm.config } })
                  }
                }).$mount('#cell_' + item._id)
              })
            }
          })
        })
      }).catch(err => {
        if (err.status === 10002) {
          vm.$q.notify({
            message: '未授权的布局!',
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
          message: '保存成功!',
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
          message: '保存成功!',
          position: 'top',
          color: 'teal'
        })
      })
    },
    deleteLayout () {
      const vm = this
      this.$q.dialog({
        title: 'Confirm',
        message: '确定删除布局?',
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
<style scoped>
</style>
