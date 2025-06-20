<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" hide-header :filter="table.filter" @request="searchCharts" 
    :no-data-label="$t('table.empty')" :rows-per-page-options="[18,36,60]" :pagination.sync="table.pagination">
      <template v-slot:top-right>
        <q-input dense v-model="table.filter">
          <template v-slot:append>
            <q-btn round flat dense icon="search"/>
          </template>
        </q-input>
        <q-btn outline color="primary" :label="$t('button.create')" @click="newChart"/>
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
              <q-btn outline dense color="primary" @click="loadChart(props)">{{ $t('button.modify') }}</q-btn>
              <q-btn outline dense color="negative" @click="deleteChart(props)">{{ $t('button.delete') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
    <q-dialog v-model="editChartDialog.state">
      <q-card style="width: 800px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.chart.default') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator />
        <q-form @submit="submitForm">
          <q-card-section class="row q-col-gutter-xs">
            <q-input class="col-12 col-md-4" outlined v-model="chart.code" :label="$t('form.chart.code')" hint="" :readonly="chart.id !== null" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.chart.code')]"/>
            <q-input class="col-12 col-md-4" outlined v-model="chart.name" :label="$t('form.chart.name')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.chart.name')]"/>
            <q-select class="col-12 col-md-4" outlined v-model="chart.category" emit-value map-options :options="categoryOptions" :label="$t('form.chart.category')" 
              clearable :rules="[ val => validate(val) || $t('validation.notEmpty') + $t('form.chart.category')]" hint="">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-input class="col-12" type="textarea" outlined v-model="chart.options" :label="$t('form.chart.options')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.chart.options')]"/>
          </q-card-section>
          <q-card-section>
            <q-table :data="chart.chartParamsList" :columns="chartParamsColumns" :rows-per-page-options="[0]" row-key="id" separator="cell" hide-bottom :title="$t('form.chart.parameters')">
              <template v-slot:top-right>
                <q-btn size="sm" outline color="primary" icon="add" @click="addChartParams"/>
              </template>
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="operate" :props="props">
                    <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteMetadata(props)"></q-btn>
                  </q-td>
                  <q-td key="field" :props="props">
                    {{ props.row.field }}
                    <q-popup-edit v-model="props.row.field" :auto-save="true">
                      <q-input autofocus outlined v-model="props.row.field"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="category" :props="props">
                    {{ props.row.category }}
                    <q-popup-edit v-model="props.row.category" :auto-save="true">
                      <q-select autofocus outlined v-model="props.row.category" emit-value map-options :options="fieldCategoryOptions"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="description" :props="props">
                    {{ props.row.description }}
                    <q-popup-edit v-model="props.row.description" :auto-save="true">
                      <q-input autofocus outlined v-model="props.row.description"/>
                    </q-popup-edit>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
          <q-card-section>
            <q-input class="col-12" type="textarea" outlined v-model="chart.data" :label="$t('form.chart.data')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.chart.data')]"/>
            <q-input class="col-12" type="textarea" rows="2" outlined v-model="chart.description" :label="$t('form.chart.description')"/>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn type="submit" :label="$t('button.save')" outline color="primary" icon="las la-save"/>
            <q-btn v-if="chart.options && chart.data" :label="$t('button.effect')" outline color="positive" icon="visibility" @click="preview"/>
            <q-btn v-if="chart.id" :label="$t('button.delete')" outline color="negative" icon="las la-trash" @click="deleteChart"/>
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
      </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import {
  deleteChart,
  paginationCharts,
  fetchChart,
  saveChart,
  previewChart
} from 'src/service/bi/ChartService'
import { fetchDictionaryItemList } from 'src/service/base/DictionaryService'
import * as echarts from 'echarts'

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
            name: 'code',
            label: this.$t('form.chart.code'),
            field: 'code',
            align: 'left'
          },
          {
            name: 'name',
            label: this.$t('form.chart.name'),
            field: 'name',
            align: 'left'
          },
          {
            name: 'category',
            label: this.$t('form.chart.category'),
            field: 'category',
            align: 'left'
          },
          {
            name: 'description',
            label: this.$t('form.chart.description'),
            field: 'description',
            align: 'left'
          }
        ]
      },
      editChartDialog: {
        state: false
      },
      chart: {
        id: null,
        code: null,
        name: null,
        category: null,
        options: null,
        data: null,
        description: null,
        status: null,
        chartParamsList: []
      },
      categoryOptions: [],
      chartParamsColumns: [
        { name: 'operate', label: '', align: 'center', field: 'operate', sortable: false },
        { name: 'field', label: this.$t('form.chart.columnField'), align: 'left', field: 'field' },
        { name: 'category', label: this.$t('form.chart.columnCategory'), align: 'left', field: 'category' },
        { name: 'description', label: this.$t('form.chart.columnDescription'), align: 'left', field: 'description' }
      ],
      fieldCategoryOptions: [
        { label: this.$t('form.chart.fieldCategory.string'), value: 'string' },
        { label: this.$t('form.chart.fieldCategory.number'), value: 'number' },
        { label: this.$t('form.chart.fieldCategory.date'), value: 'date' },
        { label: this.$t('form.chart.fieldCategory.array'), value: 'array' },
        { label: this.$t('form.chart.fieldCategory.object'), value: 'object' }
      ],
      previewChartDialog: {
        state: false
      },
      chartDemo: null,
    }
  },
  methods: {
    validate (val) {
      return val != null
    },
    searchCharts () {
      this.table.loading = true
      const query = {
        payload: this.table.filter,
        pageNo: this.table.pagination.page,
        pageSize: this.table.pagination.rowsPerPage
      }
      paginationCharts(query).then(res => {
        this.table.data = res.data.items
        this.table.pagination = Object.assign(this.table.pagination, {
          rowsNumber: res.data.total
        })
        this.table.loading = false
      })
    },
    loadChart (props) {
      fetchChart(props.key).then(res => {
        this.editChartDialog.state = true
        this.chart = Object.assign(this.chart, {
          id: res.data.id,
          code: res.data.code,
          name: res.data.name,
          category: res.data.category,
          options: res.data.options,
          data: res.data.data,
          description: res.data.description,
          status: res.data.status,
          chartParamsList: res.data.chartParamsList || []
        })
      })
    },
    newChart () {
      this.editChartDialog.state = true
      Object.assign(this.chart, this.$options.data.call(this).chart)
    },
    submitForm () {
      saveChart(this.chart).then(res => {
        this.searchCharts()
        this.editChartDialog.state = false
        this.$q.notify({
          message: this.$t('response.success.save'),
          position: 'top',
          color: 'teal'
        })
      })
    },
    deleteChart (props) {
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
        deleteChart(props.key || this.chart.id).then(res => {
          this.searchCharts()
          this.editChartDialog.state = false
          this.$q.notify({
            message: this.$t('response.success.delete'),
            position: 'top',
            color: 'teal'
          })
        })
      })
    },
    addChartParams () {
        this.chart.chartParamsList.push({
          columnName: null,
          columnCode: null,
          columnCategory: null,
          columnLength: null,
          columnDecimal: null,
          columnNotNull: null,
          columnForeignModelId: null
        })
    },
    deleteChartParams (props) {
      this.chart.chartParamsList.splice(props.rowIndex, 1)
    },
    preview () {
      previewChart(this.chart).then(res => {
        if (this.chartDemo) {
          this.chartDemo.dispose()
        }
        this.previewChartDialog.state = true
        this.$nextTick(() => {
          this.chartDemo = echarts.init(this.$refs.chartDemo)
          this.chartDemo.setOption(res.data)
        })
      })
    }
  },
  mounted () {
    this.searchCharts()
    fetchDictionaryItemList('REPORT-CHART-CATEGORY').then(res => {
      this.categoryOptions = []
      res.data.forEach(item => {
        this.categoryOptions.push({
          label: item.name,
          value: item.value,
          description: item.description
        })
      })
    })
  }
}
</script>
