<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" hide-header :filter="table.filter" @request="searchLayouts" 
    :no-data-label="$t('table.empty')" :rows-per-page-options="[18,36,60]" :pagination.sync="table.pagination">
      <template v-slot:top-right>
        <q-input dense v-model="table.filter">
          <template v-slot:append>
            <q-btn round flat dense icon="search"/>
          </template>
        </q-input>
        <q-btn outline color="primary" :label="$t('button.create')" @click="newLayout"/>
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
              <q-btn outline dense color="primary" @click="loadLayout(props)">{{ $t('button.modify') }}</q-btn>
              <q-btn outline dense color="negative" @click="deleteLayout(props)">{{ $t('button.delete') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
    <q-dialog v-model="editLayoutDialog.state">
      <q-card style="width: 1200px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.layout.default') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator />
        <q-form @submit="submitForm">
          <q-card-section class="row q-col-gutter-xs">
            <q-input class="col-12 col-md-5" autofocus outlined v-model="layout.name" :label="$t('form.layout.name')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.layout.name')]"/>
            <q-select class="col-12 col-md-5" v-model="editLayoutDialog.reportId" autofocus outlined clearable :options="editLayoutDialog.reportOptionsCopy" use-input emit-value map-options @filter="filterReports" @input="selectReport" :label="$t('form.layout.report')" hint=""/>
            <q-checkbox class="col-12 col-md-2" outlined v-model="layout.authenticate" :label="$t('form.layout.authenticate')"/>
            <q-input class="col-12 col-md-10" type="textarea" rows="3" autofocus outlined v-model="layout.description" :label="$t('form.layout.description')" hint=""/>
            <div id="trash" class="col-12 col-md-2 bg-red-1 trash text-center" style="display: grid; place-items: center; height: 95px;">
              {{ $t('button.dropAndRemove') }}
            </div>
            <div id="layoutGrid" class="col-12 grid-stack bg-grey-2">
            </div>
          </q-card-section>
          <q-card-section>
            
          </q-card-section>
          <q-card-actions align="right">
            <q-btn type="submit" :label="$t('button.save')" outline color="primary" icon="las la-save"/>
            <q-btn v-if="layout.id && !layout.publish" :label="$t('button.delete')" outline color="negative" icon="las la-trash" @click="deleteLayout"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="reportFrequencyDialog.state">
      <q-card style="width: 400px; max-width: 40vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.layout.schedule') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator />
        <q-form @submit="submitFrequencyForm">
          <q-card-section class="row q-col-gutter-xs">
            <q-input :disable="!reportFrequencyDialog.useScedule" class="col-12 col-md-8" autofocus outlined type="number" v-model.number="reportFrequencyDialog.frequency" min="5" :label="$t('form.layout.frequency')" hint="" :rules="[ val => val || $t('validation.notEmpty') + $t('form.layout.frequency')]"/>
            <q-checkbox class="col-12 col-md-4" outlined v-model="reportFrequencyDialog.useScedule" :label="$t('form.layout.useScedule')"/>
          </q-card-section>
          <q-card-section>
            
          </q-card-section>
          <q-card-actions align="right">
            <q-btn type="submit" :label="$t('button.save')" outline color="primary" icon="las la-save"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import {
  paginationLayouts,
  fetchLayout,
  saveLayout,
  deleteLayout
} from 'src/service/bi/LayoutService'
import { fetchReports } from 'src/service/bi/ReportService'
import 'gridstack/dist/gridstack.min.css'
import { GridStack } from 'gridstack'
import 'gridstack/dist/h5/gridstack-dd-native'
import * as echarts from 'echarts'
import { paintReportByGet } from 'src/service/bi/ReportService'
export default {
  data () {
    return {
      table: {
        filter: null,
        loading: false,
        pagination: {
          page: 1,
          rowsPerPage: 18,
          rowsNumber: 10
        },
        data: [],
        columns: [
          {
            name: 'name',
            label: this.$t('form.layout.name'),
            field: 'name',
            align: 'left'
          },
          {
            name: 'description',
            label: this.$t('form.layout.description'),
            field: 'description',
            align: 'left'
          }
        ]
      },
      editLayoutDialog: {
        state: false,
        reportId: null,
        reportOptions: [],
        reportOptionsCopy: [],
        reportChart: null,
        layoutGrid: null
      },
      reportFrequencyDialog: {
        state: false,
        reportId: null,
        frequency: null,
        useScedule: false
      },
      layout: {
        id: null,
        name: null,
        authenticate: false,
        description: null,
        layoutReportList: []
      },
    }
  },
  methods: {
    validate (val) {
      return val != null
    },
    searchLayouts () {
      this.table.loading = true
      const query = {
        payload: this.table.filter,
        pageNo: this.table.pagination.page,
        pageSize: this.table.pagination.rowsPerPage
      }
      paginationLayouts(query).then(res => {
        this.table.data = res.data.items
        this.table.pagination = Object.assign(this.table.pagination, {
          rowsNumber: res.data.total
        })
        this.table.loading = false
      })
    },
    loadLayout (props) {
      Object.assign(this.editLayoutDialog, this.$options.data.call(this).editLayoutDialog)
      fetchReports({}).then(res => {
        this.editLayoutDialog.reportOptions = res.data.map(item => {
          return {  
            label: item.name,
            value: item.id
          }
        }) 
        this.editLayoutDialog.reportOptionsCopy = this.editLayoutDialog.reportOptions
      })
      fetchLayout(props.key).then(res => {
        this.editLayoutDialog.state = true
        this.layout = Object.assign(this.layout, {
          id: res.data.id,
          name: res.data.name,
          authenticate: res.data.authenticate,
          description: res.data.description
        })
        const layoutReportList = res.data.layoutReportList || []
        this.$nextTick(() => {
          this.editLayoutDialog.layoutGrid = GridStack.init({
            column: 12,
            minRow: 8,
            float: true,
            cellHeight: 80,
            margin: 5,
            acceptWidgets: true,
            dragIn: '.newWidget',
            dragInOptions: { revert: 'invalid', scroll: false, appendTo: '#layoutGrid', helper: 'clone' },
            removable: '#trash'
          }, '#layoutGrid')
          this.editLayoutDialog.layoutGrid.on('resize', function(event, element) {
            const node = element.gridstackNode
            const parser = new DOMParser()
            const content = parser.parseFromString(node.content, 'text/html')
            echarts.getInstanceByDom(document.getElementById(content.body.firstChild.id)).resize()
          })
          layoutReportList.forEach(item => {
            this.editLayoutDialog.layoutGrid.addWidget({
              w: item.w,
              h: item.h,
              x: item.x,
              y: item.y,
              id: item.reportId,
              originId: item.id,
              frequency: item.frequency,
              content: '<div class="bg-white" id="reportChart_' + item.reportId + '" style="width: 100%; height: 100%;"></div>'
            })
            paintReportByGet(item.reportId).then(res => {
              const reportChart = echarts.init(document.getElementById('reportChart_' + item.reportId));
              reportChart.setOption(res.data)
              window.addEventListener('resize', function() {
                reportChart.resize();
              })
            })
          })
        })
      })
    },
    newLayout () {
      Object.assign(this.editLayoutDialog, this.$options.data.call(this).editLayoutDialog)
      this.editLayoutDialog.state = true
      Object.assign(this.layout, this.$options.data.call(this).layout)
      fetchReports({}).then(res => {
        this.editLayoutDialog.reportOptions = res.data.map(item => {
          return {  
            label: item.name,
            value: item.id
          }
        }) 
        this.editLayoutDialog.reportOptionsCopy = this.editLayoutDialog.reportOptions
      })
      this.$nextTick(() => {
        this.editLayoutDialog.layoutGrid = GridStack.init({
          column: 12,
          minRow: 8,
          float: true,
          cellHeight: 80,
          margin: 5,
          acceptWidgets: true,
          dragIn: '.newWidget',
          dragInOptions: { revert: 'invalid', scroll: false, appendTo: '#layoutGrid', helper: 'clone' },
          removable: '#trash'
        }, '#layoutGrid')
        this.editLayoutDialog.layoutGrid.on('resize', function(event, element) {
          const node = element.gridstackNode
          const parser = new DOMParser()
          const content = parser.parseFromString(node.content, 'text/html')
          echarts.getInstanceByDom(document.getElementById(content.body.firstChild.id)).resize()
        });
      });
    },
    filterReports (val, update) {
      if (val === '') {
        update(() => {
          this.editLayoutDialog.reportOptionsCopy = this.editLayoutDialog.reportOptions
        })
        return
      }
      update(() => {
        fetchReports({
          payload: val
        }).then(res => {
          this.editLayoutDialog.reportOptions = res.data.map(item => {
            return {  
              label: item.name,
              value: item.id
            }
          }) 
          this.editLayoutDialog.reportOptionsCopy = this.editLayoutDialog.reportOptions
        })
      })
    },
    submitFrequencyForm () {
      paintReportByGet(this.reportFrequencyDialog.reportId).then(res => {
        this.reportFrequencyDialog.state = false
        this.editLayoutDialog.layoutGrid.addWidget({w: 4, h: 4, id: this.reportFrequencyDialog.reportId, frequency: this.reportFrequencyDialog.frequency, content: '<div class="bg-white" id="reportChart_' + this.reportFrequencyDialog.reportId + '" style="width: 100%; height: 100%;"></div>'});
        this.$nextTick(() => {
          const reportChart = echarts.init(document.getElementById('reportChart_' + this.reportFrequencyDialog.reportId));
          reportChart.setOption(res.data)
          window.addEventListener('resize', function() {
            reportChart.resize();
          })
        })
      })
    },
    submitForm () {
      const layoutReportList = this.editLayoutDialog.layoutGrid.save(false, false).map(item => {
        return {
          id: item.originId || null,
          reportId: item.id,
          frequency: item.frequency || 0,
          useScedule: item.frequency > 0,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h
        }
      })
      console.log(layoutReportList)
      this.layout.layoutReportList = layoutReportList
      saveLayout(this.layout).then(res => {
        this.searchLayouts()
        this.editLayoutDialog.state = false
        this.$q.notify({
          message: this.$t('response.success.save'),
          position: 'top',
          color: 'teal'
        })
      })
    },
    deleteLayout (props) {
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
        deleteLayout(props.key || this.layout.id).then(res => {
          this.searchLayouts()
          this.editLayoutDialog.state = false
          this.$q.notify({
            message: this.$t('response.success.delete'),
            position: 'top',
            color: 'teal'
          })
        })
      })
    },
    selectReport (id) {
      if (!id) {
        return
      }
      Object.assign(this.reportFrequencyDialog, this.$options.data.call(this).reportFrequencyDialog)
      this.reportFrequencyDialog.state = true
      this.reportFrequencyDialog.reportId = id
    }
  },
  mounted () {
    this.searchLayouts()
  }
}
</script>
