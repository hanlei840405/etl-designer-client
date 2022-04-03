<template>
  <div class="row">
    <q-list padding class="col-md-4">
      <q-expansion-item group="project" expand-separator @before-show="(ele) => loadShell(ele, link)" v-for="link in projects" :key="link.id">
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar size="24px" text-color="white" color="cyan-8">{{ link.name.substring(0,1) }}</q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-cyan-8">{{ link.name }}</q-item-label>
          </q-item-section>
        </template>
        <q-card>
          <q-card-section class="col q-pt-none">
            <q-tree ref="shellTree" :nodes="project.shells" node-key="id"
                    selected-color="cyan-8"
                    :selected.sync="selectedShellId" @update:selected="selectShell" no-nodes-label="暂无目录，请先创建目录">
              <template v-slot:default-header="prop">
                <div class="row items-center">
                  <q-icon :name="prop.node.icon" :color="prop.node.color" class="q-mr-sm"/>
                  {{ prop.node.label }}
                </div>
              </template>
            </q-tree>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
    <q-table ref="metadataTable"
             class="col-md-8"
             :data="logTable.data"
             :columns="logTable.columns"
             :loading="logTable.loading"
             row-key="id"
             :separator="logTable.separator"
             :rows-per-page-options="[20, 50, 100]"
             no-data-label="无数据">
      <template v-slot:top-right>
        <q-btn icon="event" round outlined text-color="cyan-8">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-date v-model="logTable.rangeDate" range @range-end="selectedDateRange" color="cyan-8">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" text-color="cyan-8" outline />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-btn>
      </template>
      <template v-slot:body-cell-operate="props">
        <q-td>
          <q-btn-group>
            <q-btn size="small" outline text-color="deep-orange" label="分解详情" @click="steps(props.row)"></q-btn>
            <q-btn size="small" outline text-color="cyan-8" label="日志详情" @click="logDetail(props.row)"></q-btn>
            <q-btn size="small" outline text-color="primary" label="步骤详情" @click="transDetail(props.row)"></q-btn>
          </q-btn-group>
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="jobDialog.state" transition-show="scale" transition-hide="scale">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">分解详情</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator/>
        <q-card-section class="row items-center q-pb-none">
          <q-table :data="jobDialog.steps" :columns="jobDialog.stepColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom/>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="stepDialog.state" transition-show="scale" transition-hide="scale">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">步骤详情</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator/>
        <q-card-section class="row items-center q-pb-none">
            <q-table :data="stepDialog.steps" :columns="stepDialog.stepLogColumns" :rows-per-page-options="[0]" row-key="index" hide-bottom style="width: 100%;"/>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="detailDialog.state" transition-show="scale" transition-hide="scale">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">日志详情</div>
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
import { fetchAllProjects } from 'src/service/ProjectService'
import { date } from 'quasar'
import { fetchAllShell } from 'src/service/ShellService'
import { historyLogs, historySteps, historyLogDetail, historyStep } from 'src/service/LogService'

export default {
  name: 'LogLayout',
  data () {
    return {
      drawer: false,
      miniState: false,
      projects: [],
      project: {
        id: null,
        shells: []
      },
      selectedShellId: null,
      logTable: {
        loading: false,
        data: [],
        separator: 'cell',
        rangeDate: {
          from: {
            year: null,
            month: null,
            dat: null
          },
          to: {
            year: null,
            month: null,
            dat: null
          }
        },
        columns: [
          { name: 'name', label: '任务名称', field: 'name', align: 'left' },
          { name: 'startDate', label: '开始时间', field: 'startDate', align: 'left' },
          { name: 'endDate', label: '结束时间', field: 'endDate', align: 'left' },
          { name: 'logDate', label: '记录时间', field: 'logDate', align: 'left' },
          { name: 'status', label: '状态', field: 'status', align: 'left' },
          { name: 'errors', label: '错误数', field: 'errors', align: 'left' },
          { name: 'operate', label: '操作', filed: 'operate', align: 'left' }
        ]
      },
      jobDialog: {
        state: false,
        loading: false,
        separator: 'cell',
        steps: [],
        stepColumns: [
          { name: 'logDate', label: '记录时间', field: 'logDate', align: 'left' },
          { name: 'stepName', label: '步骤名称', field: 'stepName', align: 'left' }
        ]
      },
      stepDialog: {
        state: false,
        loading: false,
        separator: 'cell',
        steps: [],
        stepLogColumns: [
          {
            name: 'name',
            label: '名称',
            field: 'name'
          },
          {
            name: 'logDate',
            label: '记录时间',
            field: 'logDate'
          },
          {
            name: 'stepCopy',
            label: '副本数',
            field: 'stepCopy',
            align: 'left'
          },
          {
            name: 'read',
            label: '读进数',
            field: 'read',
            align: 'left'
          },
          {
            name: 'written',
            label: '写入数',
            field: 'written',
            align: 'left'
          },
          {
            name: 'updated',
            label: '更新数',
            field: 'updated',
            align: 'left'
          },
          {
            name: 'input',
            label: '输入数',
            field: 'input',
            align: 'left'
          },
          {
            name: 'output',
            label: '输出数',
            field: 'output',
            align: 'left'
          },
          {
            name: 'rejected',
            label: '拒绝数',
            field: 'rejected',
            align: 'left'
          },
          {
            name: 'errors',
            label: '错误数',
            field: 'errors',
            align: 'left'
          }
        ]
      },
      detailDialog: {
        state: false,
        detail: null
      }
    }
  },
  methods: {
    drawerClick (e) {
      if (this.miniState) {
        this.miniState = false
        e.stopPropagation()
      }
    },
    fetchAllProjects () {
      const vm = this
      vm.projects = []
      fetchAllProjects({}).then(res => {
        res.data.forEach(item => {
          if (item.status === '1') {
            vm.projects.push({
              id: item.id,
              name: item.name,
              reference: item.name,
              icon: 'location_on'
            })
          }
        })
      })
    },
    loadShell (ele, link) {
      const vm = this
      vm.project.id = link.id
      vm.project.shells = []
      fetchAllShell(link.id).then(res => {
        const array = []
        res.data.forEach(ele => {
          if (ele.category === '0') {
            ele.icon = 'folder_open'
            ele.color = 'cyan-8'
            array.push(ele)
          } else if (ele.category === '1') {
            ele.icon = 'fullscreen'
            ele.color = 'orange'
            array.push(ele)
          }
        })
        vm.project.shells = vm.buildTree(array, 0)
      })
    },
    buildTree (nodes, parentId) {
      const vm = this
      return nodes
        .filter((node) => node.parentId === parentId)
        .reduce(
          (tree, node) => [
            ...tree,
            {
              ...node,
              children: vm.buildTree(nodes, node.id)
            }
          ],
          []
        )
    },
    selectShell (target) {
      this.selectedShellId = target
    },
    selectedDateRange (value) {
      const vm = this
      const begin = new Date()
      const end = new Date()
      begin.setFullYear(value.from.year, value.from.month - 1, value.from.day)
      end.setFullYear(value.to.year, value.to.month - 1, value.to.day)
      vm.fetchLogs(begin, end)
    },
    fetchLogs (begin, end) {
      const vm = this
      if (!vm.selectedShellId) {
        vm.$q.notify({
          message: '请在左侧工作区中选择具体任务!',
          position: 'top',
          color: 'negative'
        })
      } else {
        vm.logTable.loading = true
        const query = {
          id: vm.selectedShellId,
          begin: begin,
          end: end
        }
        vm.logTable.data = []
        historyLogs(query).then(res => {
          res.data.forEach(item => {
            vm.logTable.data.push({
              name: item.jobName,
              channelId: item.channelId,
              startDate: vm.dateFormat(item.startDate),
              endDate: vm.dateFormat(item.endDate),
              logDate: vm.dateFormat(item.logDate),
              status: item.status,
              errors: item.errors,
              jobId: item.idJob
            })
          })
          this.logTable.loading = false
        }).catch(err => {
          this.logTable.loading = false
          if (err.status === 10002) {
            vm.$q.notify({
              message: '未授权的工作区!',
              position: 'top',
              color: 'negative'
            })
          } else if (err.status === 10001) {
            vm.$q.notify({
              message: '没有可用日志!',
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
      }
    },
    steps (row) {
      const vm = this
      this.jobDialog.loading = true
      historySteps(vm.selectedShellId, row.jobId).then(res => {
        this.jobDialog.state = true
        this.jobDialog.steps = []
        res.data.forEach(item => {
          this.jobDialog.steps.push({
            logDate: vm.dateFormat(item.logDate),
            stepName: item.stepName
          })
        })
        this.jobDialog.loading = false
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
    logDetail (row) {
      const vm = this
      historyLogDetail(vm.selectedShellId, row.channelId).then(res => {
        vm.detailDialog.state = true
        if (res.data.length > 0) {
          vm.detailDialog.detail = vm.unzip(res.data[0].logField)
        }
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
    transDetail (row) {
      const vm = this
      this.stepDialog.loading = true
      historyStep(vm.selectedShellId, row.channelId).then(res => {
        this.stepDialog.state = true
        vm.stepDialog.steps = []
        res.data.forEach(item => {
          vm.stepDialog.steps.push({
            name: item.name,
            logDate: vm.dateFormat(item.name),
            stepCopy: item.stepCopy,
            read: item.read,
            written: item.written,
            updated: item.updated,
            input: item.input,
            output: item.output,
            rejected: item.rejected,
            errors: item.errors
          })
        })
        this.stepDialog.loading = false
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
      return date.formatDate(value, 'YYYY-MM-DD HH:mm:ss')
    }
  },
  mounted () {
    this.fetchAllProjects()
  }
}
</script>
