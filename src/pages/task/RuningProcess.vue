<template>
  <div>
    <q-table
      flat
      bordered
      :data="table.publishes"
      :columns="table.columns"
      row-key="id"
      :loading="table.loading"
      separator="cell"
      :no-data-label="$t('table.empty')"
      @request="runningBatchTasks"
      :rows-per-page-options="[10, 20 ,50]"
      :pagination.sync="table.pagination"
    >
      <template v-slot:body-cell-operate="props">
        <q-td style="padding: 1px;">
          <q-btn-group outline>
            <q-btn outline color="primary" @click="stop(props.row.id)">{{ $t('button.stop') }}</q-btn>
            <q-btn outline color="primary" @click="viewReference(props.row.id)">{{ $t('button.reference') }}</q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="viewReferenceState">
      <q-card style="width: 900px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.task.references') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
          <q-card-section class="q-col-gutter-xs">
            <q-table
              flat
              bordered
              :data="references"
              :columns="referenceColumns"
              row-key="id"
              hide-bottom
              separator="cell"
            >
              <template #body-cell-name="props">
                <q-td :props="props" class="q-gutter-sm">
                  {{ props.row.shell.name }}
                </q-td>
              </template>
              <template #body-cell-category="props">
                <q-td :props="props" class="q-gutter-sm">
                  {{ props.row.shell.category === '1' ? $t('form.shellPublish.columnShellCategoryKjb') : $t('form.shellPublish.columnShellCategoryKtr') }}
                </q-td>
              </template>
            <template v-slot:body-cell-createTime="props">
              <q-td style="padding: 1px;">
                {{ dateFormat(props.row.createTime) }}
              </q-td>
            </template>
              <template #body-cell-operate="props">
                <q-td :props="props" class="q-gutter-sm">
                  <q-btn outline color="primary" @click="preview(props.row.id)">{{ $t('button.preview') }}</q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
          <q-card-section class="q-col-gutter-xs">
            <preview-canvas-com :content="referenceContent"/>
          </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>

import pako from 'pako'
import { date } from 'quasar'
import { fetchShellPublishReferences, fetchShellPublishContent } from 'src/service/kettle/ShellService'
import { fetchRuningProcess, shutdownRunningInstance } from 'src/service/task/TaskService'
import PreviewCanvasCom from 'src/pages/etl/PreviewCanvasCom.vue'
// var persitedArray = []
export default {
  components: { PreviewCanvasCom },
  name: 'RuningProcess',
  comments: {
    PreviewCanvasCom
  },
  data () {
    return {
      table: {
        loading: false,
        publishes: [],
        pagination: {
          page: 1,
          rowsNumber: 0,
          rowsPerPage: 20
        },
        columns: [
          {
            name: 'instanceName',
            label: this.$t('form.task.columnName'),
            field: 'instanceName',
            align: 'left'
          },
          {
            name: 'createTime',
            label: this.$t('form.task.columnStartTime'),
            field: 'createTime',
            align: 'left',
            format: (val) => this.dateFormat(val)
          },
          {
            name: 'operate',
            label: this.$t('form.task.columnOperate'),
            field: 'operate',
            headerStyle: 'width: 10%',
            align: 'left'
          }
        ]
      },
      viewReferenceState: false,
      references: [],
      referenceColumns: [
        {
          name: 'name',
          label: this.$t('form.shellPublish.columnShellName'),
          headerStyle: 'width: 10%',
          align: 'left'
        },
        {
          name: 'category',
          label: this.$t('form.shellPublish.columnShellCategory'),
          headerStyle: 'width: 10%',
          align: 'left'
        },
        {
          name: 'createTime',
          label: this.$t('form.shellPublish.columnCreateTime'),
          field: 'createTime',
          headerStyle: 'width: 10%',
          align: 'left'
        },
        {
          name: 'description',
          label: this.$t('form.shellPublish.columnDescription'),
          field: 'description',
          headerStyle: 'width: 70%',
          align: 'left'
        },
        {
          name: 'operate',
          label: this.$t('form.shellPublish.columnOperate'),
          headerStyle: 'width: 10%',
          align: 'left'
        }
      ],
      referenceContent: null,
    }
  },
  methods: {
    icon (category) {
      if (category === '0') {
        return 'folder'
      } else if (category === '1') {
        return 'las la-arrows-alt'
      } else if (category === '2') {
        return 'las la-compress-arrows-alt'
      }
      return 'las la-plus'
    },
    color (category) {
      if (category === '0') {
        return 'yellow-7'
      } else if (category === '1') {
        return 'orange-7'
      } else if (category === '2') {
        return 'green-7'
      }
      return 'primary'
    },
    runningBatchTasks (e) {
      const query = {
        pageNo: e.pagination.page,
        pageSize: e.pagination.rowsPerPage
      }
      fetchRuningProcess(query).then(res => {
        this.table.pagination = Object.assign(e.pagination, {
          rowsNumber: res.data.total
        })
        this.table.publishes = res.data.items
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
    dateFormat (value, format) {
      return date.formatDate(value, format || 'YYYY-MM-DD HH:mm:ss')
    },
    viewReference (id) {
      this.referenceContent = null
      fetchShellPublishContent(id).then(res => {
        if (res.data) {
          this.referenceContent = this.unzip(res.data)
        }
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
      fetchShellPublishReferences ({id: id}).then(res => {
        this.viewReferenceState = true
        this.references = res.data
      }).catch(err => {
        if (err.status === 10002) {
          vm.$q.notify({
            message: vm.$t('response.error.10002'),
            position: 'top',
            color: 'negative'
          })
        } else if (err.status === 10009) {
          vm.$q.notify({
            message: vm.$t('response.error.10009'),
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
    unzip (data) {
      const charData = atob(data).split('').map(function (x) {
        return x.charCodeAt(0)
      })
      const binData = new Uint8Array(charData)
      return pako.inflate(binData, { to: 'string' })
    },
    preview (id) {
      fetchShellPublishContent(id).then(res => {
        if (res.data) {
          this.referenceContent = this.unzip(res.data)
        }
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
    stop (id) {
      shutdownRunningInstance({id: id}).then(res => {
        this.runningBatchTasks(this.table)
        this.$q.notify({
          message: this.$t('response.success.pause'),
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
  },
  activated () {
  },
  mounted () {
    this.runningBatchTasks(this.table)
  }
}
</script>
