<template>
  <div class="row">
    <div class="col-md-3 col-sm-4">
      <q-list padding>
        <q-expansion-item group="project" @before-show="(ele) => loadShell(ele, link)" v-for="link in projects"
                          :key="link.id">
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar size="24px" text-color="white" color="cyan-8">{{ link.name.substring(0, 1) }}</q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-cyan-8">{{ link.name }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn class="text-cyan-8 gt-xs" size="12px" flat dense round icon="logout"
                      @click="quitCurrentProject(link.id)">
                <q-tooltip>{{ $t('btn-quit') }}</q-tooltip>
              </q-btn>
            </q-item-section>
          </template>
          <q-card>
            <q-card-section class="col q-pt-none">
              <q-tree ref="shellTree" :nodes="project.shells" node-key="id"
                      selected-color="cyan-8"
                      :selected.sync="project.shellId" @update:selected="selectShell" :no-nodes-label="$t('table-empty')">
                <template v-slot:default-header="prop">
                  <div class="row items-center">
                    <q-icon :name="prop.node.icon" :color="prop.node.color" class="q-mr-sm"/>
                    <span>{{ prop.node.label }}</span>
                  </div>
                </template>
              </q-tree>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
      <q-page-sticky position="bottom-left" :offset="[18, 18]">
        <q-fab
          padding="sm"
          v-model="fab"
          class="bg-cyan-8"
          glossy
          icon="keyboard_arrow_up"
          direction="up"
        >
          <q-fab-action square class="bg-cyan-8" @click="removeShell" :label="$t('btn-delete')" v-show="project.shellId"/>
          <q-fab-action square class="bg-cyan-8" @click="editShell" :label="$t('btn-edit')" v-show="project.shellId"/>
          <q-fab-action square class="bg-cyan-8" @click="newShell" :label="$t('btn-new')"/>
        </q-fab>
      </q-page-sticky>
      <q-dialog v-model="shellDialog.state">
        <q-card style="width: 100%">
          <q-form @submit="submitShell" class="q-gutter-md">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">{{ $t('form-title-edit') }}</div>
              <q-space/>
              <q-btn icon="close" flat round dense v-close-popup/>
            </q-card-section>
            <q-card-section class="col q-pt-none">
              <q-select
                outlined
                color="cyan-8"
                label-color="cyan-8"
                clearable
                v-model="shellDialog.shell.project.id"
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                :label="$t('select-workspace')"
                :no-data-label="$t('table-empty')"
                :options="projects"
                emit-value
                map-options
                option-value="id"
                option-label="name"
                @input="selectProject"
                lazy-rules
                :rules="[ val => !!val || 'Please type something']"
              >
              </q-select>
              <q-tree :nodes="shellDialog.shells" node-key="id" selected-color="cyan-8" ref="shellDialogTree"
                      :selected.sync="shellDialog.shell.shell.id" default-expand-all
                       :no-nodes-label="$t('table-empty')"/>
              <q-select outlined color="cyan-8" label-color="cyan-8" v-model="shellDialog.shell.category" :options="shellDialog.categories" emit-value
                        map-options option-value="id" option-label="name"  :label="$t('form-category')" lazy-rules
                        :rules="[ val => !!val || 'Please type something']"/>
              <q-input outlined color="cyan-8" text-color="cyan-8" label-color="cyan-8" v-model="shellDialog.shell.name" :label="$t('form-name')"
                        :rules="[val => !!val || 'Field is required']"/>
              <q-input outlined color="cyan-8" text-color="cyan-8" label-color="cyan-8" v-model="shellDialog.shell.description" :label="$t('form-description')"/>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn outline text-color="cyan-8" color="cyan-8" :label="$t('btn-save')" icon="save" type="submit"/>
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
    </div>
    <div class="col-md-9 col-sm-8">
      <q-tabs
        v-model="selectedTabId"
        inline-label
        align="left"
        dense
      >
        <q-tab v-for="designer in designerTabs" style="margin: 0px;" :key="designer.id"
              :name="designer.id" @click="selectTab(designer.id)" v-model="shellTab">
          <q-icon :name="designer.icon" :color="designer.color" size="sm" class="q-mr-sm"/>
          <span>{{ designer.label }}</span>
          <q-btn style="left: 10px;" round size="xs" icon="history" flat @click.stop="requestPublishes"
                v-show="selectedTabId === designer.id">
            <q-tooltip>
              {{ $t('btn-history') }}
            </q-tooltip>
          </q-btn>
          <q-btn style="left: 10px;" round size="xs" :icon="archiveIcon" flat @click.stop="publish(designer.id)"
                v-show="selectedTabId === designer.id">
            <q-tooltip>
              {{ $t('btn-publish') }}
            </q-tooltip>
          </q-btn>
          <q-btn style="left: 10px;" round size="xs" icon="close" flat @click.stop="closeTab(designer.id)">
            <q-tooltip>
              {{ $t('btn-close') }}
            </q-tooltip>
          </q-btn>
        </q-tab>
      </q-tabs>
      <q-separator/>
      <q-tab-panels v-model="selectedTabId" animated :keep-alive="true">
        <q-tab-panel style="padding: 0px;" v-for="designer in designerTabs" :key="designer.id" :name="designer.id">
          <router-view :ref="'designerRouterView_' + designer.id" :key="designer.uid"/>
        </q-tab-panel>
      </q-tab-panels>
      <q-dialog v-model="publishDialog.state">
        <q-card>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ $t('form-title-history') }}</div>
            <q-space/>
            <q-btn icon="close" flat round dense v-close-popup/>
          </q-card-section>

          <q-card-section>
            <q-table
              color="cyan-8"
              flat
              dense
              bordered
              :data="publishDialog.publishes"
              :columns="publishDialog.columns"
              row-key="id"
              :loading="publishDialog.loading"
              separator="cell"
              :no-data-label="$t('table-empty')"
              @request="requestPublishes"
              :pagination.sync="publishDialog.pagination"
            >
              <template v-slot:body-cell-createTime="props">
                <q-td style="padding: 1px;">
                  {{ dateFormat(props.row.createTime) }}
                </q-td>
              </template>
              <template v-slot:body-cell-operate="props">
                <q-td style="padding: 1px;">
                  <q-btn-group>
                    <q-btn size="xs" color="negative" icon="undo" @click="recover(props.row)">
                      <q-tooltip>
                        {{ $t('btn-cover') }}
                      </q-tooltip>
                    </q-btn>
                  </q-btn-group>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script>
import pako from 'pako'
import { mdiXml, mdiArrowUpBoldOutline } from '@quasar/extras/mdi-v5'
import { date, uid } from 'quasar'
import { quitProject, fetchAllProjects } from 'src/service/ProjectService'
import {
  publishShell,
  deleteShell,
  fetchAllShell,
  fetchPublishes,
  fetchShell,
  saveShell
} from 'src/service/ShellService'
export default {
  name: 'DesignerLayout',
  data () {
    return {
      state: false,
      sourceCodeIcon: mdiXml,
      archiveIcon: mdiArrowUpBoldOutline,
      drawer: false,
      miniState: false,
      fab: false,
      projects: [],
      project: {
        id: null,
        shells: [],
        shellId: null
      },
      shellDialog: {
        state: false,
        shells: [],
        shell: {
          project: {
            id: null
          },
          shell: {
            id: null
          },
          name: null,
          description: null,
          category: null
        },
        categories: [
          {
            id: '0',
            name: this.$t('form-directory')
          },
          {
            id: '1',
            name: this.$t('form-job')
          },
          {
            id: '2',
            name: this.$t('form-transform')
          }
        ]
      },
      publishDialog: {
        state: false,
        xml: null,
        loading: false,
        publishes: [],
        pagination: {
          page: 1,
          rowsNumber: 0,
          rowsPerPage: 10
        },
        columns: [
          {
            name: 'createTime',
            label: this.$t('form-create-time'),
            field: 'createTime',
            align: 'left',
            headerStyle: 'width: 200px'
          },
          {
            name: 'description',
            label: this.$t('column-description'),
            field: 'description',
            align: 'left',
            headerStyle: 'width: 300px'
          },
          {
            name: 'operate',
            label: this.$t('column-operate'),
            field: 'operate',
            align: 'right',
            headerStyle: 'width: 20px'
          }
        ]
      },
      previewDialog: {
        state: false,
        xml: null
      },
      selectedTabId: 'welcome',
      designerTabs: [],
      toolbar: {},
      shell: {
        id: null,
        name: null,
        category: null,
        content: null,
        shellId: null,
        branchId: null
      },
      shellTab: null
    }
  },
  methods: {
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
    quitCurrentProject (id) {
      const vm = this
      vm.$q.dialog({
        title: 'Confirm',
        message: this.$t('confirm-quit'),
        cancel: {
          textColor: 'orange',
          outline: true,
          color: ''
        },
        ok: {
          textColor: 'cyan-8',
          outline: true,
          color: ''
        },
        persistent: true
      }).onOk(() => {
        quitProject(id).then(res => {
          vm.fetchAllProjects()
        })
      })
    },
    loadShell (ele, link) {
      const vm = this
      vm.project.id = link.id
      vm.project.shells = []
      vm.project.shellId = null
      fetchAllShell(link.id).then(res => {
        res.data.forEach(ele => {
          if (ele.category === '0') {
            ele.icon = 'folder_open'
            ele.color = 'cyan-8'
          } else if (ele.category === '1') {
            ele.icon = 'fullscreen'
            ele.color = 'orange'
          } else if (ele.category === '2') {
            ele.icon = 'fullscreen_exit'
            ele.color = 'green'
          }
        })
        vm.project.shells = vm.buildTree(res.data, 0)
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
      if (target) {
        const vm = this
        const selected = vm.$refs.shellTree[0].getNodeByKey(target)
        if (selected.category !== '0') {
          if (vm.designerTabs.length > 10) {
            vm.$q.notify({
              message: vm.$t('warning-limit-10'),
              position: 'top',
              color: 'negative'
            })
          } else {
            const tab = {
              id: target,
              name: selected.target,
              label: selected.label,
              icon: selected.icon,
              color: selected.color,
              previous: null,
              next: null,
              uid: uid()
            }
            vm.selectedTabId = selected.id
            for (let i = 0; i < vm.designerTabs.length; i++) {
              if (vm.designerTabs[i].id === selected.id) {
                return
              }
            }
            if (vm.designerTabs.length > 0) {
              tab.previous = vm.designerTabs[vm.designerTabs.length - 1]
              vm.designerTabs[vm.designerTabs.length - 1].next = tab
            }
            this.$q.loading.show()
            vm.designerTabs.push(tab)
            vm.$router.push('/etl-designer/' + target)
          }
        }
      }
    },
    closeTab (tabId) {
      for (let i = 0; i < this.designerTabs.length; i++) {
        if (this.designerTabs[i].id === tabId) {
          if (this.designerTabs[i].next) {
            this.project.shellId = this.designerTabs[i].next.id
            this.selectedTabId = this.designerTabs[i].next.id
          } else if (this.designerTabs[i].previous) {
            this.project.shellId = this.designerTabs[i].previous.id
            this.selectedTabId = this.designerTabs[i].previous.id
          } else {
            this.project.shellId = null
            this.selectedTabId = null
          }
          if (i > 0) {
            this.designerTabs[i - 1].next = this.designerTabs[i].next
          }
          if (i < this.designerTabs.length - 1) {
            this.designerTabs[i + 1].previous = this.designerTabs[i].previous
          }
          this.designerTabs.splice(i, 1)
          const key = 'designerRouterView_' + tabId
          delete this.$refs[key][0]
        }
      }
      if (this.designerTabs.length === 0) {
        this.selectedTabId = 'welcome'
      }
    },
    editShell () {
      const vm = this
      fetchShell(vm.project.shellId).then(res => {
        vm.shellDialog.shell = Object.assign(vm.shellDialog.shell, {
          id: res.data.id,
          project: {
            id: res.data.project.id
          },
          shell: {
            id: res.data.shell ? res.data.shell.id : null
          },
          name: res.data.name,
          description: res.data.description,
          category: res.data.category
        })
        vm.selectProject(res.data.project.id, () => {
          vm.$nextTick(() => {
            vm.$refs.shellDialogTree.expandAll()
          })
        })
        this.shellDialog.state = true
      })
    },
    removeShell () {
      const vm = this
      const selected = vm.$refs.shellTree[0].getNodeByKey(vm.project.shellId)
      if (selected.children.length === 0) {
        this.$q.dialog({
          title: this.$t('confirm-title-delete'),
          message: this.$t('confirm-delete'),
          cancel: true,
          persistent: true
        }).onOk(() => {
          deleteShell(selected.id).then(res => {
            vm.closeTab(selected.id)
            vm.loadShell(null, { id: vm.project.id })
            this.$q.notify({
              message: this.$t('response-delete-success'),
              position: 'top',
              color: 'green-10'
            })
          }).catch(error => {
            this.$q.notify({
              message: error.data.error,
              position: 'top',
              color: 'negative'
            })
          })
        })
      } else {
        this.$q.notify({
          message: this.$t('warning-has-children'),
          position: 'top',
          color: 'negative'
        })
      }
    },
    publish (tabId) {
      const vm = this
      vm.$q.dialog({
        title: this.$t('confirm-title-publish'),
        message: this.$t('confirm-message-publish'),
        html: true,
        prompt: {
          model: '',
          isValid: val => val.length > 5,
          type: 'text'
        },
        cancel: true,
        persistent: true
      }).onOk((data) => {
        publishShell({
          id: tabId,
          payload: data
        }).then(res => {
          vm.$q.notify({
            message: this.$t('response-publish-success'),
            position: 'top',
            color: 'green-10'
          })
        }).catch(err => {
          let msg
          if (err.status === 10011) {
            msg = this.$t('response-error-10011')
          } else {
            msg = err.data.message
          }
          vm.$q.notify({
            message: msg,
            position: 'top',
            color: 'negative'
          })
        })
      })
    },
    selectTab (tabId) {
      if (this.selectedTabId !== tabId) {
        this.project.shellId = tabId
        this.$router.push('/etl-designer/' + tabId)
      }
    },
    newShell () {
      this.shellDialog = Object.assign(this.shellDialog, {
        state: true,
        shells: [],
        shell: {
          project: {
            id: null
          },
          shell: {
            id: null
          },
          name: null,
          description: null,
          category: null
        }
      })
    },
    selectProject (val, callback) {
      const vm = this
      vm.shellDialog.shells = []
      fetchAllShell(val).then(res => {
        const array = []
        res.data.forEach(ele => {
          if (ele.category === '0') {
            ele.icon = 'folder_open'
            ele.color = 'cyan-8'
            array.push(ele)
          }
        })
        vm.shellDialog.shells = vm.buildTree(array, 0)
        if (callback) {
          callback()
        }
      })
    },
    submitShell () {
      const vm = this
      if (vm.shellDialog.shell.id) {
        vm.closeTab(vm.shellDialog.shell.id)
      }
      saveShell(this.shellDialog.shell).then(res => {
        vm.shellDialog.state = false
        vm.loadShell(null, { id: vm.shellDialog.shell.project.id || vm.project.id })
      })
    },
    recover (row) {
      const vm = this
      vm.$q.dialog({
        title: this.$t('confirm-title-cover'),
        message: this.$t('confirm-cover'),
        cancel: true,
        persistent: true
      }).onOk(() => {
        const key = 'designerRouterView_' + row.shell.id
        this.$refs[key][0].load(row.content)
      })
    },
    unzip (data) {
      const charData = atob(data).split('').map(function (x) {
        return x.charCodeAt(0)
      })
      const binData = new Uint8Array(charData)
      return pako.inflate(binData, { to: 'string' })
    },
    requestPublishes () {
      const vm = this
      const query = {
        pageNo: vm.publishDialog.pagination.page,
        pageSize: vm.publishDialog.pagination.rowsPerPage,
        id: vm.selectedTabId
      }
      fetchPublishes(query).then(res => {
        vm.publishDialog.state = true
        vm.publishDialog.pagination.rowsNumber = res.data.total
        vm.publishDialog.publishes = res.data.items
      })
    },
    dateFormat (value) {
      return date.formatDate(value, 'YYYY-MM-DD HH:mm:ss')
    },
    openOrCloseLeftMenu () {
      this.state = !this.state
    }
  },
  mounted () {
    this.fetchAllProjects()
  }
}
</script>
