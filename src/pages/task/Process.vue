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
            <q-btn size="small" outline text-color="cyan-8" icon="visibility" label="预览" @click="view(props.row)"></q-btn>
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
          <mx-graph-canvas :content="viewDialog.content"/>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import pako from 'pako'
import { fetchRunningProcess, shutdownRunningProcess } from '../../service/RunningProcessService'
import MxGraphCanvas from '../designer/Canvas'
import { date } from 'quasar'

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
          { name: 'project', label: '工作区', field: 'project', align: 'left' },
          { name: 'shell', label: '业务', field: 'shell', align: 'left' },
          { name: 'category', label: '类型', field: 'category', align: 'left' },
          { name: 'createTime', label: '启动时间', field: 'createTime', align: 'left' },
          { name: 'owner', label: '来源', field: 'owner', align: 'left' },
          { name: 'prod', label: '生产环境', field: 'prod', align: 'left' },
          { name: 'operate', label: '操作', filed: 'operate', align: 'left' }
        ]
      },
      viewDialog: {
        state: false,
        content: null
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
        pageSize: pagination.rowsPerPage
      }
      vm.table.data = []
      fetchRunningProcess(query).then(res => {
        res.data.items.forEach(item => {
          vm.table.data.push({
            id: item.id,
            project: item.prod === '1' ? item.shellPublish.shell.project.name : item.shell.project.name,
            shell: item.prod === '1' ? item.shellPublish.shell.name : item.shell.name,
            category: item.category === '1' ? '任务' : '转换',
            prod: item.prod === '1' ? '是' : '否',
            owner: item.owner === 'designer' ? '设计器' : '定时任务',
            content: item.prod === '1' ? item.shellPublish.content : item.shell.content,
            createTime: vm.dateFormat(item.createTime)
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
        message: '确定删除进程?',
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
        shutdownRunningProcess(row.id).then(res => {
          vm.request(vm.table.pagination)
          vm.$q.notify({
            message: '中断成功!',
            position: 'top',
            color: 'teal'
          })
        }).catch(err => {
          let msg
          if (err.status === 10001) {
            msg = '任务添加调度异常，请联系管理员'
          } else if (err.status === 10002) {
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
    unzip (data) {
      const charData = atob(data).split('').map(function (x) {
        return x.charCodeAt(0)
      })
      const binData = new Uint8Array(charData)
      return pako.inflate(binData, { to: 'string' })
    },
    dateFormat (value) {
      return date.formatDate(value, 'YYYY-MM-DD HH:mm:ss')
    }
  },
  mounted () {
    const vm = this
    vm.request(vm.table.pagination)
  }
}
</script>
