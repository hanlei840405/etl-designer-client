<template>
  <div>
    <q-footer class="bg-white">
      <q-tabs v-model="activeTab" dense outside-arrows mobile-arrows inline-label align="left" :breakpoint="0" active-bg-color="grey-3">
        <q-tab v-for="item in subTabs" :class="'text-' + color(item.category)" :key="item.id" :name="item.id" :label="item.name" :icon="icon(item.category)" @click="clickSubTab(item)">
          <q-btn v-if="item.id > -1" style="left: 15px;" round size="8px" icon="las la-times-circle" flat @click="(e) => closeSubTab(e, item.id)"></q-btn>
        </q-tab>
      </q-tabs>
    </q-footer>
    <q-tab-panels v-model="activeTab" animated keep-alive>
      <q-tab-panel v-for="item in subTabs" :key="item.id" :name="item.id">
        <canvas-com v-if="item.id > -1" :shell="item"></canvas-com>
      </q-tab-panel>
    </q-tab-panels>
    <q-dialog v-model="showShellDialog.state">
      <q-card style="width: 900px; max-width: 90vw;height: 550px; max-height: 90vh;">
        <q-card-section class="row items-center q-pb-none" v-if="projects.length === 0">
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section v-if="projects.length === 0">
          <div class="q-pa-md text-center">
            <a href="javascript:;" class="q-pa-md text-primary" @click="goProject" style="text-decoration: none;">{{ $t('message.noProject') }}</a>
            <a href="javascript:;" class="text-primary" @click="fetchProjects" style="text-decoration: none;">{{ $t('button.refresh') }}</a>
          </div>
        </q-card-section>
        <q-card-section v-if="projects.length > 0">
          <q-splitter v-model="showShellDialog.projectSplitter" style="height: 500px;">
            <template v-slot:before>
              <q-tabs v-model="showShellDialog.projectId" vertical active-class="bg-blue-7 text-white" class="text-primary" @click="openProject">
                <q-tab v-for="project in projects" :key="project.id" :label="project.name" :name="project.id"/>
              </q-tabs>
            </template>
            <template v-slot:after>
              <q-card-section class="row items-center q-pb-none">
              <q-breadcrumbs>
                <q-breadcrumbs-el :label="link.name" v-for="(link, index) in links" :key="link.id" :style="index === links.length - 1 ? '' : 'cursor: pointer;'" @click="showShellsByBreadcrumb(index)"/>
              </q-breadcrumbs>
              <q-space/>
              <q-btn icon="close" flat round dense v-close-popup/>
              </q-card-section>
              <q-card-section>
                <div class="q-pa-md row items-start q-gutter-md">
                  <q-card flat bordered v-for="shell in shells" :key="shell.id" :class="selected.indexOf(shell.id) >= 0 ? 'bg-grey-5' : ''" style="width: 200px; height: 97px;">
                    <q-item style="; cursor: pointer;" @click="openShell(shell)">
                      <q-item-section class="col-2" @click="openShell(shell)">
                        <q-icon size="sm" :name="icon(shell.category)" :color="color(shell.category)"/>
                      </q-item-section>
                      <q-item-section class="col-10" @click="openShell(shell)">
                        <q-item-label>{{ shell.name }}</q-item-label>
                        <q-item-label caption>{{ shell.description }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section class="col-4">
                      <q-checkbox dense v-model="selected" :val="shell.id"/>
                      </q-item-section>
                      <q-item-section class="col-8" side>
                        <q-btn-dropdown dense outline color="primary" :label="$t('button.operate')">
                          <q-list>
                            <q-item clickable v-close-popup @click="loadShell(shell.id)">
                              <q-item-section>
                                <q-item-label>{{ $t('button.modify') }}</q-item-label>
                              </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup @click="deleteShell(shell)">
                              <q-item-section>
                                <q-item-label>{{ $t('button.delete') }}</q-item-label>
                              </q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup @click="moveShell(shell)">
                              <q-item-section>
                                <q-item-label>{{ $t('button.move') }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>
                      </q-item-section>
                    </q-item>
                  </q-card>
                  <q-card flat bordered style="width: 200px;cursor: pointer;">
                    <div class="column full-width">
                      <q-btn flat bordered padding="lg" icon="las la-plus" style="height:95px" @click="newShell('0', true)"/>
                    </div>
                  </q-card>
                  <q-card flat bordered v-if="showPasteBtn" style="width: 200px;cursor: pointer;">
                    <div class="column full-width">
                      <q-btn flat bordered padding="lg" icon="las la-paste" style="height:95px" @click="pasteShell"/>
                    </div>
                  </q-card>
                </div>
              </q-card-section>
            </template>
          </q-splitter>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="confirmAddState">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.shell.confirmAddCategory') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section class="q-gutter-md row">
          <q-btn outline color="primary" @click="newShell('0', false)">{{ $t('button.directory') }}</q-btn>
          <q-btn outline color="primary" @click="newShell('2', false)">{{ $t('button.ktr') }}</q-btn>
          <q-btn outline color="primary" @click="newShell('1', false)">{{ $t('button.kjb') }}</q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="editShellState">
      <q-card style="width: 400px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.shell.default') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-form @submit="submitForm">
          <q-card-section class="q-col-gutter-xs">
            <q-input outlined v-model="shell.name" :label="$t('form.shell.name')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.project.name')]"/>
            <q-input outlined type="textarea" v-model="shell.description" :label="$t('form.shell.description')" hint=""/>
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

import { fetchProjects } from 'src/service/base/ProjectService'
import { fetchShellsByProject, fetchShellsByParent, saveShell, fetchShell, deleteShell, move } from 'src/service/kettle/ShellService'
import CanvasCom from './CanvasCom.vue'
// var persitedArray = []
export default {
  components: { CanvasCom },
  name: 'Design',
  comments: {
    CanvasCom
  },
  data () {
    return {
      projects: [],
      showShellDialog: {
        state: true,
        projectSplitter: 15,
        openShellId: null,
        projectId: null,
        prevClickProjectId: null
      },
      shells: [],
      selected: [],
      links: [],
      editShellState: false,
      confirmAddState: false,
      shell: {
        id: null,
        name: null,
        description: null,
        projectId: null,
        parentId: null,
        category: '0',
        content: null,
        executable: false,
        xml: null,
        streaming: '0'
      },
      subTabs: [],
      moveShells: [],
      showPasteBtn: false,
      activeTab: null
    }
  },
  methods: {
    goProject () {
      this.$emit('addRouteTab', {to: '/basic-project', url: '/basic-project'})
      this.$router.push({path: '/basic-project'})
    },
    fetchProjects () {
      fetchProjects({}).then(res => {
        this.projects = res.data
        if (this.projects.length > 0) {
          this.showShellDialog.projectId = this.projects[0].id
          this.openProject() // 默认打开第一个
        }
      })
    },
    searchShells (mode, id) {
      this.shells = []
      if (mode === 0) {
        fetchShellsByProject(id).then(res => {
          this.shells = res.data
          var existed = false
          out: for (var i = 0; i < this.shells.length; i++) {
            for (var j = 0; j < this.moveShells.length; j++) {
              if (this.shells[i].id === this.moveShells[j])
                existed = true
                break out
              }
          }
          this.showPasteBtn = this.moveShells.length > 0 && !existed
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
          this.showPasteBtn = false
        })
      } else {
        fetchShellsByParent(this.showShellDialog.projectId, id).then(res => {
          this.shells = res.data
          var existed = false
          out: for (var i = 0; i < this.shells.length; i++) {
            for (var j = 0; j < this.moveShells.length; j++) {
              if (this.shells[i].id === this.moveShells[j])
                existed = true
                break out
              }
          }
          this.showPasteBtn = this.moveShells.length > 0 && !existed
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
      }
    },
    openShowShellDialog () {
      this.showShellDialog.state=true
      this.fetchProjects()
    },
    openProject () {
      this.showShellDialog.openShellId = null
      this.links = []
      this.selected = []
      if (this.showShellDialog.prevClickProjectId != this.showShellDialog.projectId) {
        this.moveShells = []
        this.showShellDialog.prevClickProjectId = this.showShellDialog.projectId
      }
      this.searchShells(0, this.showShellDialog.projectId)
    },
    newShell (category, open) {
      if (this.showShellDialog.openShellId && open) {
        this.confirmAddState = true
      } else {
        this.confirmAddState = false
        this.editShellState = true
        Object.assign(this.shell, this.$options.data.call(this).shell)
        this.shell.category = category
      }
    },
    submitForm () {
      this.shell.projectId = this.showShellDialog.projectId
      if (this.showShellDialog.openShellId) {
      this.shell.parentId = this.showShellDialog.openShellId
      }
      const form = this.shell
      saveShell(form).then(res => {
        if (this.shell.parentId) {
          this.searchShells(1, this.shell.parentId)
        } else {
          this.searchShells(0, this.shell.projectId)
        }
        this.editShellState = false
        Object.assign(this.shell, this.$options.data.call(this).shell)
      }).catch(err => {
        if (err.status === 10002) {
          this.$q.notify({
            message: this.$t('response.error.10002'),
            position: 'top',
            color: 'negative'
          })
        } else if (err.status === 10006) {
          this.$q.notify({
            message: this.$t('response.error.10006', [form.name]),
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
    loadShell (id) {
      fetchShell(id).then(res => {
        this.editShellState = true
        this.shell = res.data
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
    deleteShell (shell) {
      this.$q.dialog({
        title: 'Confirm',
        message: this.$t('message.confirm.delete'),
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
        deleteShell(shell.id).then(res => {
          if (shell.parentId) {
            this.searchShells(1, shell.parentId)
          } else {
            this.searchShells(0, shell.projectId)
          }
          this.$q.notify({
            message: this.$t('response.success.delete'),
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
      })
    },
    openShell (shell) {
      this.showShellDialog.openShellId = shell.id
      this.selected = []
      if (shell.category === '0') {
        this.links.push({id: shell.id, name: shell.name, mode: 1})
        this.searchShells(1, shell.id)
      } else {
        this.showShellDialog.state = false
        const index = this.subTabs.findIndex((item) =>item.id === shell.id)
        this.activeTab = shell.id
        if (index < 0) {
          this.subTabs.push(shell)
        }
      }
    },
    showShellsByBreadcrumb (index) {
      if (index < this.links.length - 1) {
        this.links.splice(index + 1)
        const target = this.links[index]
        this.searchShells(target.mode, target.id)
        if (target.mode === 0) {
          this.showShellDialog.openShellId = null
        }
      }
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
    moveShell (shell) {
      if (this.selected.length > 0) {
        this.moveShells = this.selected.slice()
      } else {
        this.moveShells = [shell.id]
      }
    },
    pasteShell () {
      const array = []
      this.moveShells.forEach(item => {
        array.push({id: item})
      })
      const pathVar = this.showShellDialog.openShellId || 0
      move(this.showShellDialog.openShellId || 0, array).then(res => {
        this.$q.notify({
          message: this.$t('response.success.copy'),
          position: 'top',
          color: 'teal'
        })
        this.moveShells = []
        this.searchShells(this.showShellDialog.openShellId || 0, this.showShellDialog.openShellId || this.showShellDialog.projectId)
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
    closeSubTab (e, id) {
      var index = this.subTabs.findIndex((item) =>item.id === id)
      if (index >= 0) {
        this.subTabs.splice(index, 1)
      }
      if (this.subTabs.length === 1) {
        this.clickSubTab({id: -1})
      }
      e.preventDefault()
    },
    clickSubTab (item) {
      if (item.id === -1) {
        this.showShellDialog.state=true
        this.fetchProjects()
      } else {
        this.activeTab = item.id
      }
    }
  },
  activated () {
  },
  mounted () {
    this.subTabs = [{ id: -1, name: this.$t('button.createOrOpen'), category: null}]
    this.fetchProjects()
  }
}
</script>
