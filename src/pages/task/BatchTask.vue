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
             no-data-label="无数据">
      <template v-slot:body-cell-operate="props">
        <q-td>
          <q-btn-group unelevated>
            <q-btn size="small" v-if="props.row.status != null && props.row.status !== 'PAUSED'" outline text-color="deep-orange" icon="pause" label="暂停" @click="pause(props.row)"></q-btn>
            <q-btn size="small" v-if="props.row.status != null && props.row.status === 'PAUSED'" outline text-color="cyan-8" icon="restore" label="恢复" @click="resume(props.row)"></q-btn>
            <q-btn size="small" v-if="props.row.status != null" outline text-color="negative" :icon="table.deleteIcon" label="删除" @click="remove(props.row)"></q-btn>
            <q-btn size="small" v-if="props.row.status != null" outline text-color="blue-grey-5" :icon="table.logIcon" @click="log(props.row)" label="日志"></q-btn>
            <q-btn size="small" outline text-color="primary" icon="visibility" label="预览" @click="view(props.row)"></q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="viewDialog.state">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">预览</div>
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
          <div class="text-h6">日志</div>
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
                   no-data-label="无数据">
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
                  <q-btn size="small" outline text-color="cyan-8" color="cyan-8" icon="visibility" label="详情" @click="detail(props.row)"></q-btn>
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
          <div class="text-h6">详情</div>
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
          { name: 'project', label: '所属工作区', field: 'project', align: 'left' },
          { name: 'description', label: '描述', field: 'description', align: 'left' },
          { name: 'name', label: '业务', field: 'name', align: 'left' },
          { name: 'cron', label: '调度', field: 'cron', align: 'left' },
          { name: 'deployTime', label: '部署时间', field: 'deployTime', align: 'left' },
          { name: 'operate', label: '操作', filed: 'operate', align: 'left', headerStyle: 'width: 23vw' }
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
          { name: 'jobName', label: '任务名称', field: 'jobName', align: 'left' },
          { name: 'status', label: '状态', field: 'status', align: 'left' },
          { name: 'errors', label: '错误数', field: 'errors', align: 'left' },
          { name: 'startDate', label: '开始时间', field: 'startDate', align: 'left' },
          { name: 'endDate', label: '结束时间', field: 'endDate', align: 'left' },
          { name: 'operate', label: '操作', filed: 'operate', align: 'left' }
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
            cron: item.status ? item.cron : '已摘除',
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
        message: '确定暂停任务?',
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
            message: '暂停成功!',
            position: 'top',
            color: 'teal'
          })
          vm.request(vm.table.pagination)
        }).catch(err => {
          let msg
          if (err.status === 10002) {
            msg = '未授权，禁止操作'
          } else if (err.status === 10012) {
            msg = '任务添加调度异常，请联系管理员'
          } else {
            msg = '系统异常，请联系管理员'
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
        message: '确定重启任务?',
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
            message: '恢复成功!',
            position: 'top',
            color: 'teal'
          })
          vm.request(vm.table.pagination)
        }).catch(err => {
          let msg
          if (err.status === 10002) {
            msg = '未授权，禁止操作'
          } else if (err.status === 10012) {
            msg = '任务添加调度异常，请联系管理员'
          } else {
            msg = '系统异常，请联系管理员'
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
        message: '确定删除任务?',
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
            message: '删除成功!',
            position: 'top',
            color: 'teal'
          })
          vm.request(vm.table.pagination)
        }).catch(err => {
          let msg
          if (err.status === 10002) {
            msg = '未授权，禁止操作'
          } else if (err.status === 10014) {
            msg = '任务删除调度异常，请联系管理员'
          } else {
            msg = '系统异常，请联系管理员'
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
          msg = '未授权，禁止操作'
        } else {
          msg = '系统异常，请联系管理员'
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
            message: '未授权的工作区!',
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
