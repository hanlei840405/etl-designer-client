<template>
  <div class="row">
    <div class="col-md-3">
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
                      :selected.sync="selectedShellId" @update:selected="selectShell" :no-nodes-label="$t('table-empty')">
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
    </div>
    <div class="col-md-9">
      <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
              narrow-indicator>
        <q-tab name="design" :label="$t('tab-development')" class="text-black"/>
        <q-tab name="prod" :label="$t('tab-production')" class="text-black"/>
      </q-tabs>
      <q-table
        color="cyan-8"
        :data="filenames"
        :columns="filenameColumns"
        :loading="loading"
        row-key="name"
        :separator="separator"
        :rows-per-page-options="[0]"
        hide-bottom
        :no-data-label="$t('table-empty')">
        <template v-slot:body-cell-operate="props">
          <q-td>
            <q-btn-group>
              <q-btn size="small" outline color="cyan-8" icon="download" :label="$t('btn-download')" @click="download(props.row.name)"></q-btn>
              <q-btn size="small" outline color="negative" :icon="deleteIcon" :label="$t('btn-delete')" @click="deleteAttachment(props.row.name)"></q-btn>
            </q-btn-group>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
import { fetchAllProjects } from 'src/service/ProjectService'
import { date } from 'quasar'
import { fetchAllShell } from 'src/service/ShellService'
import { preview, download, remove } from 'src/service/AttachmentService'
import { mdiTrashCanOutline } from '@quasar/extras/mdi-v5'

export default {
  name: 'LogLayout',
  data () {
    return {
      deleteIcon: mdiTrashCanOutline,
      drawer: false,
      miniState: false,
      projects: [],
      project: {
        id: null,
        shells: []
      },
      selectedShellId: null,
      tab: 'design',
      loading: false,
      separator: 'cell',
      filenames: [],
      filenameColumns: [
        { name: 'name', label: this.$t('column-name'), field: 'name', align: 'left' },
        { name: 'lastModified', label: this.$t('column-last-updated'), field: 'lastModified', align: 'left' },
        { name: 'operate', label: this.$t('column-operate'), filed: 'operate', align: 'left' }
      ]
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
          } else if (ele.category === '1') {
            ele.icon = 'fullscreen'
            ele.color = 'orange'
          } else {
            ele.icon = 'fullscreen_exit'
            ele.color = 'green'
          }
          array.push(ele)
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
    showFilenames () {
      const vm = this
      if (vm.selectedShellId && vm.tab) {
        preview({
          payload: vm.tab,
          id: vm.selectedShellId
        }).then(res => {
          vm.filenames = []
          res.data.forEach(item => {
            vm.filenames.push({
              name: item.name,
              lastModified: vm.dateFormat(item.lastModified)
            })
          })
        }).catch(err => {
          let msg
          if (err.status === 10002) {
            msg = this.$t('response-error-10002')
          } else {
            msg = this.$t('response-error-system')
          }
          this.$q.notify({
            message: msg,
            position: 'top',
            color: 'negative'
          })
        })
      }
    },
    download (filename) {
      download(this.selectedShellId, this.tab, filename, { responseType: 'blob' }).then(res => {
        const blob = new Blob([res.data])
        const downloadElement = document.createElement('a')
        const href = window.URL.createObjectURL(blob)
        downloadElement.href = href
        downloadElement.download = filename
        document.body.appendChild(downloadElement)
        downloadElement.click()
        document.body.removeChild(downloadElement)
        window.URL.revokeObjectURL(href)
      }).catch(err => {
        this.$q.notify({
          message: err.data.error,
          position: 'top',
          color: 'negative'
        })
      })
    },
    deleteAttachment (filename) {
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
        const form = {
          id: vm.selectedShellId,
          payload: JSON.stringify({
            env: vm.tab,
            filename: filename
          })
        }
        remove(form).then(res => {
          vm.showFilenames()
        }).catch(err => {
          this.$q.notify({
            message: err.data.error,
            position: 'top',
            color: 'negative'
          })
        })
      })
    },
    dateFormat (value) {
      return date.formatDate(value, 'YYYY-MM-DD HH:mm:ss')
    }
  },
  watch: {
    tab: {
      immediate: true,
      handler (val) {
        this.showFilenames()
      }
    },
    selectedShellId: {
      immediate: true,
      handler (val) {
        this.showFilenames()
      }
    }
  },
  mounted () {
    this.fetchAllProjects()
  }
}
</script>
