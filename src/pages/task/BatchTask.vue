<template>
  <div>
    <q-table ref="metadataTable"
             :data="table.data"
             :pagination.sync="table.pagination"
             :columns="table.columns"
             :loading="table.loading"
             row-key="id"
             :separator="table.separator"
             @request="request"
             :rows-per-page-options="[20, 50, 100]"
             :no-data-label="$t('table-empty')">
      <template v-slot:body-cell-operate="props">
        <q-td>
          <q-btn-group unelevated>
            <q-btn size="small" v-if="props.row.status != null && props.row.status !== 'PAUSED'" outline text-color="deep-orange" icon="pause" :label="$t('btn-pause')" @click="pause(props.row)"></q-btn>
            <q-btn size="small" v-if="props.row.status != null && props.row.status === 'PAUSED'" outline text-color="cyan-8" icon="restore" :label="$t('btn-resume')" @click="resume(props.row)"></q-btn>
            <q-btn size="small" v-if="props.row.status != null" outline text-color="negative" :icon="table.deleteIcon" :label="$t('btn-delete')" @click="remove(props.row)"></q-btn>
            <q-btn size="small" v-if="props.row.status != null" outline text-color="blue-grey-5" :icon="table.logIcon" @click="log(props.row)" :label="$t('btn-show-log')"></q-btn>
            <q-btn size="small" outline text-color="primary" icon="visibility" :label="$t('btn-preview')" @click="view(props.row)"></q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="viewDialog.state">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('dialog-title-preview') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <mx-graph-canvas :content="viewDialog.content"/>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="logDialog.state">
      <q-card style="max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('dialog-title-log') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section class="row items-center q-pb-none">
          <q-table ref="logTable"
                   :data="logDialog.logs"
                   :columns="logDialog.logColumns"
                   :loading="logDialog.loading"
                   row-key="channelId"
                   :separator="logDialog.separator"
                   :rows-per-page-options="[20, 50, 100]"
                   :no-data-label="$t('table-empty')">
            <template v-slot:body-cell-startDate="props">
              <q-td>
                {{ dateFormat(props.row.startDate) }}
              </q-td>
            </template>
            <template v-slot:body-cell-endDate="props">
              <q-td>
                {{ dateFormat(props.row.endDate) }}
              </q-td>
            </template>
            <template v-slot:body-cell-operate="props">
              <q-td>
                <q-btn-group>
                  <q-btn size="small" outline text-color="cyan-8" color="cyan-8" icon="visibility" :label="$t('btn-detail')" @click="detail(props.row)"></q-btn>
                </q-btn-group>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="detailDialog.state" transition-show="scale" transition-hide="scale">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('dialog-title-detail') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
          <pre>{{detailDialog.detail}}</pre>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import pako from 'pako'
import { online, pause, resume, remove, logs, log } from '../../service/TaskService'
import MxGraphCanvas from '../designer/Canvas'
import { date } from 'quasar'
import { mdiTextBoxOutline, mdiTrashCanOutline } from '@quasar/extras/mdi-v5'

export default {
  components: { MxGraphCanvas },
  data () {
    return {
      table: {
        selected: [],
        separator: 'cell',
        loading: false,
        data: [],
        pagination: {
          page: 1,
          rowsNumber: 0,
          rowsPerPage: 20
        },
        columns: [
          { name: 'project', label: this.$t('column-workspace'), field: 'project', align: 'left' },
          { name: 'description', label: this.$t('column-description'), field: 'description', align: 'left' },
          { name: 'name', label: this.$t('column-job'), field: 'name', align: 'left' },
          { name: 'cron', label: this.$t('column-cron'), field: 'cron', align: 'left' },
          { name: 'deployTime', label: this.$t('column-deploy-time'), field: 'deployTime', align: 'left' },
          { name: 'operate', label: this.$t('column-operate'), filed: 'operate', align: 'left', headerStyle: 'width: 23vw' }
        ],
        logIcon: mdiTextBoxOutline,
        deleteIcon: mdiTrashCanOutline
      },
      viewDialog: {
        state: false,
        content: null
      },
      logDialog: {
        state: false,
        separator: 'cell',
        loading: false,
        jobId: null,
        logs: [],
        logColumns: [
          { name: 'jobName', label: this.$t('column-job'), field: 'jobName', align: 'left' },
          { name: 'status', label: this.$t('column-status'), field: 'status', align: 'left' },
          { name: 'errors', label: this.$t('column-count-error'), field: 'errors', align: 'left' },
          { name: 'startDate', label: this.$t('column-begin-time'), field: 'startDate', align: 'left' },
          { name: 'endDate', label: this.$t('column-end-time'), field: 'endDate', align: 'left' },
          { name: 'operate', label: this.$t('column-operate'), filed: 'operate', align: 'left' }
        ]
      },
      detailDialog: {
        state: false,
        detail: null
      }
    }
  },
  methods: {
    request (pagination) {
      const vm = this
      vm.table.loading = true
      vm.table.pagination = pagination
      const query = {
        pageNo: pagination.page,
        pageSize: pagination.rowsPerPage,
        payload: '0'
      }
      vm.table.data = []
      online(query).then(res => {
        res.data.items.forEach(item => {
          vm.table.data.push({
            id: item.id,
            project: item.shell.project.name,
            name: item.shell.name,
            description: item.description,
            content: item.content,
            cron: item.status ? item.cron : vm.$('column-removed'),
            deployTime: vm.dateFormat(item.deployTime),
            status: item.status
          })
        })
        this.table.pagination.rowsNumber = res.data.total
        this.table.loading = false
      })
    },
    pause (row) {
      const vm = this
      this.$q.dialog({
        title: 'Confirm',
        message: vm.$t('confirm-title-pause-job'),
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
        pause(row.id).then(res => {
          vm.$q.notify({
            message: vm.$t('response-pause-success'),
            position: 'top',
            color: 'teal'
          })
          vm.request(vm.table.pagination)
        }).catch(err => {
          let msg
          if (err.status === 10002) {
            msg = vm.$t('response-error-10002')
          } else if (err.status === 10012) {
            msg = vm.$t('response-error-10012')
          } else {
            msg = vm.$t('response-error-system')
          }
          this.$q.notify({
            message: msg,
            position: 'top',
            color: 'negative'
          })
        })
      })
    },
    resume (row) {
      const vm = this
      this.$q.dialog({
        title: 'Confirm',
        message: vm.$t('confirm-title-resume-job'),
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
        resume(row.id).then(res => {
          vm.$q.notify({
            message: vm.$t('response-resume-success'),
            position: 'top',
            color: 'teal'
          })
          vm.request(vm.table.pagination)
        }).catch(err => {
          let msg
          if (err.status === 10002) {
            msg = vm.$t('response-error-10002')
          } else if (err.status === 10012) {
            msg = vm.$t('response-error-10012')
          } else {
            msg = vm.$t('response-error-system')
          }
          this.$q.notify({
            message: msg,
            position: 'top',
            color: 'negative'
          })
        })
      })
    },
    remove (row) {
      const vm = this
      this.$q.dialog({
        title: 'Confirm',
        message: this.$t('confirm-delete'),
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
        remove(row.id).then(res => {
          vm.$q.notify({
            message: vm.$t('response-delete-success'),
            position: 'top',
            color: 'teal'
          })
          vm.request(vm.table.pagination)
        }).catch(err => {
          let msg
          if (err.status === 10002) {
            msg = vm.$t('response-error-10002')
          } else if (err.status === 10014) {
            msg = vm.$t('response-error-10014')
          } else {
            msg = vm.$t('response-error-system')
          }
          this.$q.notify({
            message: msg,
            position: 'top',
            color: 'negative'
          })
        })
      })
    },
    log (row) {
      const vm = this
      vm.logDialog.loading = true
      vm.logDialog.state = true
      vm.logDialog.jobId = row.id
      logs(row.id, true).then(res => {
        vm.logDialog.logs = res.data
        vm.logDialog.loading = false
      }).catch(err => {
        let msg
        if (err.status === 10002) {
          msg = vm.$t('response-error-10002')
        } else {
          msg = vm.$t('response-error-system')
        }
        vm.$q.notify({
          message: msg,
          position: 'top',
          color: 'negative'
        })
      })
    },
    view (row) {
      const vm = this
      vm.viewDialog.state = true
      vm.viewDialog.content = this.unzip(row.content, { to: 'string' })
    },
    detail (row) {
      const vm = this
      vm.detailDialog.state = true
      log(vm.logDialog.jobId, row.channelId).then(res => {
        vm.detailDialog.detail = res.data.logField
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
    unzip (data) {
      const charData = atob(data).split('').map(function (x) {
        return x.charCodeAt(0)
      })
      const binData = new Uint8Array(charData)
      return pako.inflate(binData, { to: 'string' })
    },
    dateFormat (value) {
      if (value) {
        return date.formatDate(value, 'YYYY-MM-DD HH:mm:ss')
      }
      return null
    }
  },
  mounted () {
    const vm = this
    vm.request(vm.table.pagination)
  }
}
</script>
