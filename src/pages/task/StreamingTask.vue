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
          <q-btn-group unelevated outlined>
            <q-btn size="small" outline text-color="negative" icon="settings_power" label="中断" @click="remove(props.row)"></q-btn>
            <q-btn size="small" outline text-color="blue-grey-5" :icon="table.logIcon" @click="log(props.row)" label="日志"></q-btn>
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
import { online, remove, logs } from '../../service/TaskService'
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
        payload: '1'
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
            deployTime: vm.dateFormat(item.deployTime),
            status: item.status
          })
        })
        this.table.pagination.rowsNumber = res.data.total
        this.table.loading = false
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
    view (row) {
      const vm = this
      vm.viewDialog.state = true
      vm.viewDialog.content = this.unzip(row.content, { to: 'string' })
    },
    log (row) {
      const vm = this
      vm.detailDialog.state = true
      logs(row.id, false).then(res => {
        vm.detailDialog.detail = res.data
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
