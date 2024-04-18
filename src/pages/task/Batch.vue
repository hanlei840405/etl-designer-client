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
      :filter="table.filter"
    >
      <template v-slot:top-left>
        <q-input borderless v-model="table.filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="las la-search" color="primary"/>
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-operate="props">
        <q-td style="padding: 1px;">
          <q-btn-group outline>
            <q-btn v-if="props.row.state === 'NORMAL'" outline color="primary" @click="pause(props.row.id)">{{ $t('button.pause') }}</q-btn>
            <q-btn v-if="props.row.state === 'PAUSED'" outline color="primary" @click="resume(props.row.id)">{{ $t('button.resume') }}</q-btn>
            <q-btn v-if="props.row.state === 'PAUSED'" outline color="primary" @click="stop(props.row.id)">{{ $t('button.stop') }}</q-btn>
            <q-btn outline color="primary" @click="modify(props.row)">{{ $t('button.modify') }}</q-btn>
            <q-btn outline color="primary" @click="viewReference(props.row.id)">{{ $t('button.reference') }}</q-btn>
            <q-btn outline color="primary" @click="viewHistory(props.row.id)">{{ $t('button.history') }}</q-btn>
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
    <q-dialog v-model="viewHistoryState">
      <q-card style="width: 900px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.task.history') }}</div>
          <q-btn icon="event" round color="primary">
            <q-popup-proxy @before-show="openDatePicker" transition-show="scale" transition-hide="scale">
              <q-date v-model="historyCmp.proxyDate" range mask="YYYY-MM-DD">
                <div class="row items-center justify-end q-gutter-sm">
                  <q-btn label="Cancel" color="primary" flat v-close-popup />
                  <q-btn label="OK" color="primary" flat v-close-popup @click="pageHistory(historyCmp)"/>
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
          {{ historyCmp.proxyDate.from }} - {{ historyCmp.proxyDate.from }}
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
          <q-card-section class="q-col-gutter-xs">
            <q-table
              flat
              bordered
              :data="historyCmp.histories"
              :columns="historyCmp.columns"
              row-key="id"
              separator="cell"
              :loading="historyCmp.loading"
              :no-data-label="$t('table.empty')"
              @request="pageHistory"
              :rows-per-page-options="[10, 20 ,50]"
              :pagination.sync="historyCmp.pagination"
            >
              <template v-slot:body-cell-operate="props">
                <q-td style="padding: 1px;">
                  <q-btn-group outline>
                    <q-btn outline color="primary" @click="viewHistoryLog(props.row.id)">{{ $t('button.historyLog') }}</q-btn>
                    <q-btn outline color="primary" @click="shutdown(props.row.id)">{{ $t('button.shutdown') }}</q-btn>
                  </q-btn-group>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
          <q-card-section class="q-col-gutter-xs">
            <q-input type="text" v-model="historyCmp.logText" autogrow readonly></q-input>
          </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="editTaskState">
      <q-card style="width: 400px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.task.modify') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-form @submit="submitForm">
          <q-card-section class="q-col-gutter-xs">
            <q-select
              v-model="task.misfire"
              outlined
              :label="$t('form.task.misfireOption')"
              :options="misfireOptions"
              map-options
              emit-value
              use-input
              clearable
              hint=""
            >
            </q-select>
          </q-card-section>
          <q-card-section class="col q-pt-none">
            <q-input outlined color="cyan-8" v-model="task.cron" :label="$t('form.task.cron')" :rules="[val => !!val || 'Please type something', val => validate(val) || $t('form.task.cronRule')]" hint=""/>
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

import pako from 'pako'
import { date } from 'quasar'
import { fetchShellPublishReferences, fetchShellPublishContent, deployShellPublish } from 'src/service/kettle/ShellService'
import { fetchBatchTasks, fetchHistory, fetchHistoryLog, modifyBatchTask, pauseBatchTask, resumeBatchTask, shutdownRunningInstance, stopTask } from 'src/service/task/TaskService'
import PreviewCanvasCom from 'src/pages/etl/PreviewCanvasCom.vue'
// var persitedArray = []
export default {
  components: { PreviewCanvasCom },
  name: 'Batch',
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
        filter: null,
        columns: [
          {
            name: 'name',
            label: this.$t('form.task.columnName'),
            field: 'name',
            align: 'left'
          },
          {
            name: 'description',
            label: this.$t('form.task.columnDescription'),
            field: 'description',
            align: 'left'
          },
          {
            name: 'cron',
            label: this.$t('form.task.columnCron'),
            field: 'cron',
            align: 'left'
          },
          {
            name: 'state',
            label: this.$t('form.task.columnState'),
            field: 'state',
            align: 'left'
          },
          {
            name: 'misfire',
            label: this.$t('form.task.columnMisfire'),
            field: 'misfire',
            align: 'left',
            format: (val) => this.$t('form.shellPublish.misfire' + val)
          },
          {
            name: 'startTime',
            label: this.$t('form.task.columnStartTime'),
            field: 'startTime',
            align: 'left',
            format: (val) => this.dateFormat(val)
          },
          {
            name: 'nextFireTime',
            label: this.$t('form.task.columnNextFireTime'),
            field: 'nextFireTime',
            align: 'left',
            format: (val) => this.dateFormat(val)
          },
          {
            name: 'previousFireTime',
            label: this.$t('form.task.columnPreviousFireTime'),
            field: 'previousFireTime',
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
      viewHistoryState: false,
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
      historyCmp: {
        loading: false,
        histories: [],
        columns: [
          {
            name: 'beginTime',
            label: this.$t('form.task.columnBeginTime'),
            field: 'beginTime',
            headerStyle: 'width: 10%',
            align: 'left',
            format: (val) => this.dateFormat(val)
          },
          {
            name: 'endTime',
            label: this.$t('form.task.columnEndTime'),
            field: 'endTime',
            headerStyle: 'width: 10%',
            align: 'left',
            format: (val) => this.dateFormat(val)
          },
          {
            name: 'status',
            label: this.$t('form.task.columnStatus'),
            field: 'status',
            headerStyle: 'width: 10%',
            align: 'left',
            format: (val) => this.stateFormat(val)
          },
          {
            name: 'operate',
            label: this.$t('form.task.columnOperate'),
            headerStyle: 'width: 10%',
            align: 'left'
          }
        ],
        pagination: {
          page: 1,
          rowsNumber: 0,
          rowsPerPage: 20
        },
        proxyDate: {from: null, to: null},
        logText: null
      },
      referenceContent: null,
      editTaskState: false,
      task: {
        id: null,
        cron: null,
        misfire: 2
      },
      misfireOptions: [
        { value: 2, label: this.$t('form.shellPublish.misfire2') },
        { value: -1, label: this.$t('form.shellPublish.misfire-1') },
        { value: 1, label: this.$t('form.shellPublish.misfire1') }
      ],
      selectShellPublishId: null,
      streaming: '0'
    }
  },
  methods: {
    validate (val) {
      const reg = new RegExp('^\\s*($|#|\\w+\\s*=|(\\?|\\*|(?:[0-5]?\\d)(?:(?:-|\\/|\\,)(?:[0-5]?\\d))?(?:,(?:[0-5]?\\d)(?:(?:-|\\/|\\,)(?:[0-5]?\\d))?)*)\\s+(\\?|\\*|(?:[0-5]?\\d)(?:(?:-|\\/|\\,)(?:[0-5]?\\d))?(?:,(?:[0-5]?\\d)(?:(?:-|\\/|\\,)(?:[0-5]?\\d))?)*)\\s+(\\?|\\*|(?:[01]?\\d|2[0-3])(?:(?:-|\\/|\\,)(?:[01]?\\d|2[0-3]))?(?:,(?:[01]?\\d|2[0-3])(?:(?:-|\\/|\\,)(?:[01]?\\d|2[0-3]))?)*)\\s+(\\?|\\*|(?:0?[1-9]|[12]\\d|3[01])(?:(?:-|\\/|\\,)(?:0?[1-9]|[12]\\d|3[01]))?(?:,(?:0?[1-9]|[12]\\d|3[01])(?:(?:-|\\/|\\,)(?:0?[1-9]|[12]\\d|3[01]))?)*)\\s+(\\?|\\*|(?:[1-9]|1[012])(?:(?:-|\\/|\\,)(?:[1-9]|1[012]))?(?:L|W)?(?:,(?:[1-9]|1[012])(?:(?:-|\\/|\\,)(?:[1-9]|1[012]))?(?:L|W)?)*|\\?|\\*|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:(?:-)(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?(?:,(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:(?:-)(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?)*)\\s+(\\?|\\*|(?:[0-6])(?:(?:-|\\/|\\,|#)(?:[0-6]))?(?:L)?(?:,(?:[0-6])(?:(?:-|\\/|\\,|#)(?:[0-6]))?(?:L)?)*|\\?|\\*|(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:(?:-)(?:MON|TUE|WED|THU|FRI|SAT|SUN))?(?:,(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:(?:-)(?:MON|TUE|WED|THU|FRI|SAT|SUN))?)*)(|\\s)+(\\?|\\*|(?:|\\d{4})(?:(?:-|\\/|\\,)(?:|\\d{4}))?(?:,(?:|\\d{4})(?:(?:-|\\/|\\,)(?:|\\d{4}))?)*))$')
      const result = reg.test(val)
      return result
    },
    goProject () {
      this.$emit('addRouteTab', {to: '/basic-project', url: '/basic-project'})
      this.$router.push({path: '/basic-project'})
    },
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
        pageSize: e.pagination.rowsPerPage,
        payload: e.filter
      }
      fetchBatchTasks(query).then(res => {
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
    stateFormat (value) {
      if (value === '1') {
        return this.$t('form.task.success')
      }
      return this.$t('form.task.failure')
    },
    deploy (row) {
      this.selectShellPublishId = row.id
      this.streaming = row.streaming
      this.deployShellState = true
    },
    submitForm () {
      this.$q.dialog({
        title: 'Confirm',
        message: this.$t('message.confirm.modify'),
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
        modifyBatchTask(this.task).then(() => {
          this.runningBatchTasks(this.table)
          Object.assign(this.task, this.$options.data.call(this).task)
          this.$q.notify({
            message: this.$t('response.success.save'),
            position: 'top',
            color: 'teal'
          })
        this.editTaskState = false
        }).catch(err => {
          if (err.status === 10001) {
            this.$q.notify({
              message: this.$t('response.error.10001'),
              position: 'top',
              color: 'negative'
            })
          } else if (err.status === 10002) {
            this.$q.notify({
              message: this.$t('response.error.10002'),
              position: 'top',
              color: 'negative'
            })
          } else if (err.status === 10012) {
            this.$q.notify({
              message: this.$t('response.error.10012'),
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
    viewHistory (id) {
      this.historyCmp.logText = null
      this.viewHistoryState = true
      this.historyCmp.shellPublishId = id
      this.pageHistory(this.historyCmp)
    },
    pageHistory (e) {
      const query = {
        pageNo: e.pagination.page,
        pageSize: e.pagination.rowsPerPage,
        beginTime: this.historyCmp.proxyDate.from,
        endTime: this.historyCmp.proxyDate.to,
        shellPublishId: this.historyCmp.shellPublishId
      }
      fetchHistory(query).then(res => {
        this.historyCmp.pagination = Object.assign(e.pagination, {
          rowsNumber: res.data.total
        })
        this.historyCmp.histories = res.data.items
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
    viewHistoryLog (id) {
      fetchHistoryLog(id).then(res => {
        this.historyCmp.logText = res.data
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
    shutdown (id) {
      shutdownRunningInstance({id: id}).then(res => {
        this.pageHistory(this.historyCmp)
        this.$q.notify({
          message: this.$t('response.success.shutdown'),
          position: 'top',
          color: 'teal'
        })
      }).catch(err => {
        if (err.status === 10001) {
          this.$q.notify({
            message: this.$t('response.error.10001'),
            position: 'top',
            color: 'negative'
          })
        } else if (err.status === 10002) {
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
    pause (id) {
      pauseBatchTask({id: id}).then(res => {
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
    resume (id) {
      resumeBatchTask({id: id}).then(res => {
        this.runningBatchTasks(this.table)
        this.$q.notify({
          message: this.$t('response.success.resume'),
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
    stop (id) {
      stopTask({id: id}).then(res => {
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
    modify (row) {
      Object.assign(this.task, this.$options.data.call(this).task)
      this.editTaskState = true
      this.task.id = row.id
      this.task.cron = row.cron
      this.task.misfire = row.misfire
    },
    openDatePicker() {
    }
  },
  activated () {
  },
  mounted () {
    this.runningBatchTasks(this.table)
  }
}
</script>
