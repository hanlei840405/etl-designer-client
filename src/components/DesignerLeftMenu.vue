<template>
  <div>
    <q-drawer
      v-model="state"
      show-if-above
      bordered
      class="text-white"
    >
      <div style="height: calc(100% - 60px);">
        <q-toolbar>
          <q-toolbar-title class="text-cyan-8 text-bold">
            <q-avatar>
              <img src="/logo.png">
            </q-avatar>
            新恩数造
          </q-toolbar-title>
        </q-toolbar>
        <q-separator class="bg-grey-4"/>
        <q-scroll-area style="height:100%;">
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
                    <q-tooltip>退出当前工程</q-tooltip>
                  </q-btn>
                </q-item-section>
              </template>
              <q-card>
                <q-card-section class="col q-pt-none">
                  <q-tree ref="shellTree" :nodes="project.shells" node-key="id"
                          selected-color="cyan-8"
                          :selected.sync="project.shellId" @update:selected="selectShell" no-nodes-label="暂无目录，请先创建目录">
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
        </q-scroll-area>
      </div>
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-fab
          padding="sm"
          v-model="fab"
          class="bg-cyan-8"
          glossy
          icon="keyboard_arrow_up"
          direction="up"
        >
          <q-fab-action square class="bg-cyan-8" @click="removeShell" label="删除" v-show="project.shellId"/>
          <q-fab-action square class="bg-cyan-8" @click="editShell" label="编辑" v-show="project.shellId"/>
          <q-fab-action square class="bg-cyan-8" @click="newShell" label="新增"/>
        </q-fab>
      </q-page-sticky>
      <q-dialog v-model="shellDialog.state">
        <q-card style="width: 100%">
          <q-form @submit="submitShell" class="q-gutter-md">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">编辑</div>
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
                label="选择工作区分支"
                :options="projects"
                emit-value
                map-options
                option-value="id"
                option-label="name"
                @input="selectProject"
                lazy-rules
                :rules="[ val => !!val || 'Please type something']"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-cyan-8">
                      无数据
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-tree :nodes="shellDialog.shells" node-key="id" selected-color="cyan-8" ref="shellDialogTree"
                      :selected.sync="shellDialog.shell.shell.id" default-expand-all
                      no-nodes-label="暂无目录，请先选择工作区分支"/>
              <q-select outlined color="cyan-8" label-color="cyan-8" v-model="shellDialog.shell.category" :options="shellDialog.categories" emit-value
                        map-options option-value="id" option-label="name" label="类型" lazy-rules
                        :rules="[ val => !!val || 'Please type something']"/>
              <q-input outlined color="cyan-8" text-color="cyan-8" label-color="cyan-8" v-model="shellDialog.shell.name" label="名称"
                       :rules="[val => !!val || 'Field is required']"/>
              <q-input outlined color="cyan-8" text-color="cyan-8" label-color="cyan-8" v-model="shellDialog.shell.description" label="描述"/>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn outline text-color="cyan-8" color="cyan-8" label="保存" icon="save" type="submit"/>
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
    </q-drawer>
    <q-page-container>
      <q-tabs
        v-model="selectedTabId"
        inline-label
        align="left"
        dense
      >
        <q-tab name="welcome" style="margin: 0px;">
          <q-icon name="grade" color="cyan-8" size="sm" class="q-mr-sm"/>
          <span>欢迎</span>
        </q-tab>
        <q-tab v-for="designer in designerTabs" style="margin: 0px;" :key="designer.id"
               :name="designer.id" @click="selectTab(designer.id)" v-model="shellTab">
          <q-icon :name="designer.icon" :color="designer.color" size="sm" class="q-mr-sm"/>
          <span>{{ designer.label }}</span>
          <q-btn style="left: 10px;" round size="xs" icon="history" flat @click.stop="requestPublishes"
                 v-show="selectedTabId === designer.id">
            <q-tooltip>
              历史
            </q-tooltip>
          </q-btn>
          <q-btn style="left: 10px;" round size="xs" :icon="archiveIcon" flat @click.stop="publish(designer.id)"
                 v-show="selectedTabId === designer.id">
            <q-tooltip>
              发布
            </q-tooltip>
          </q-btn>
          <q-btn style="left: 10px;" round size="xs" icon="close" flat @click.stop="closeTab(designer.id)">
            <q-tooltip>
              关闭
            </q-tooltip>
          </q-btn>
        </q-tab>
      </q-tabs>
      <q-separator/>
      <q-tab-panels v-model="selectedTabId" animated :keep-alive="true">
        <q-tab-panel name="welcome">
          <welcome/>
        </q-tab-panel>
        <q-tab-panel style="padding: 0px;" v-for="designer in designerTabs" :key="designer.id" :name="designer.id">
          <router-view :ref="'designerRouterView_' + designer.id" :key="designer.uid"/>
        </q-tab-panel>
      </q-tab-panels>
    </q-page-container>
    <q-dialog v-model="publishDialog.state">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">发布数据</div>
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
            no-data-label="无数据"
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
                      覆盖当前
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
</template>

<script>
import pako from 'pako'
import { mdiXml, mdiArrowUpBoldOutline } from '@quasar/extras/mdi-v5'
import { date, uid } from 'quasar'
import { quitProject, fetchAllProjects } from 'src/service/ProjectService'
import Welcome from 'src/pages/designer/Welcome'
import {
  publishShell,
  deleteShell,
  fetchAllShell,
  fetchPublishes,
  fetchShell,
  saveShell
} from 'src/service/ShellService'
export default {
  name: 'DesignerLeftMenu',
  components: {
    Welcome
  },
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
            name: '目录'
          },
          {
            id: '1',
            name: '任务'
          },
          {
            id: '2',
            name: '转换'
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
            label: '发布时间',
            field: 'createTime',
            align: 'left',
            headerStyle: 'width: 200px'
          },
          {
            name: 'description',
            label: '描述',
            field: 'description',
            align: 'left',
            headerStyle: 'width: 300px'
          },
          {
            name: 'operate',
            label: '操作',
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
    quitCurrentProject (id) {
      const vm = this
      vm.$q.dialog({
        title: 'Confirm',
        message: '确定退出该工作区吗?',
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
              message: '只允许同时打开10张脚本!',
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
            vm.$router.push('/designer/' + target)
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
          title: '删除',
          message: '确定删除',
          cancel: true,
          persistent: true
        }).onOk(() => {
          deleteShell(selected.id).then(res => {
            vm.closeTab(selected.id)
            vm.loadShell(null, { id: vm.project.id })
            this.$q.notify({
              message: '删除成功!',
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
          message: '存在下级节点，禁止删除',
          position: 'top',
          color: 'negative'
        })
      }
    },
    publish (tabId) {
      const vm = this
      vm.$q.dialog({
        title: '发布',
        message: '发布功能只会对<span class="text-red">已经存储</span>在<span class="text-red">服务器端</span>且能<span class="text-red">正常进行etl的脚本</span>执行发布操作<br/>发布完成后，该脚本及关联脚本可正是用于生产调度',
        html: true,
        prompt: {
          model: '描述',
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
            message: '发布成功!',
            position: 'top',
            color: 'green-10'
          })
        }).catch(err => {
          let msg
          if (err.status === 10011) {
            msg = '该版本所依赖的脚本有未发布的，请将脚本全部发布'
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
        this.$router.push('/designer/' + tabId)
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
        title: '覆盖',
        message: '覆盖当前脚本?',
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
