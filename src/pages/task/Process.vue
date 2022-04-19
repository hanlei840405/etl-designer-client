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
          <q-btn-group unelevated outlined>
            <q-btn size="small" outline text-color="negative" icon="settings_power" :label="$t('btn-pause')" @click="remove(props.row)"></q-btn>
            <q-btn size="small" outline text-color="cyan-8" icon="visibility" :label="$t('btn-preview')" @click="view(props.row)"></q-btn>
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
          { name: 'project', label: this.$t('column-workspace'), field: 'project', align: 'left' },
          { name: 'shell', label: this.$t('column-job'), field: 'shell', align: 'left' },
          { name: 'category', label: this.$t('column-type'), field: 'category', align: 'left' },
          { name: 'createTime', label: this.$t('column-create-time'), field: 'createTime', align: 'left' },
          { name: 'owner', label: this.$t('column-create-by'), field: 'owner', align: 'left' },
          { name: 'prod', label: this.$t('column-prod-env'), field: 'prod', align: 'left' },
          { name: 'operate', label: this.$t('column-operate'), filed: 'operate', align: 'left' }
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
            category: item.category === '1' ? vm.$t('column-job') : vm.$t('column-transformation'),
            prod: item.prod === '1' ? vm.$t('column-yes') : vm.$t('column-no'),
            owner: item.owner === 'designer' ? vm.$t('column-designer') : vm.$t('column-task'),
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
        shutdownRunningProcess(row.id).then(res => {
          vm.request(vm.table.pagination)
          vm.$q.notify({
            message: vm.$t('response-shutdown-success'),
            position: 'top',
            color: 'teal'
          })
        }).catch(err => {
          let msg
          if (err.status === 10001) {
            msg = vm.$t('dialog-message-not-found')
          } else if (err.status === 10002) {
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
