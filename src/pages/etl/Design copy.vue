<template>
  <div>
    <q-page-sticky expand position="top-right" :offset="[18, 36]">
      <q-btn :label="$t('button.openProject')" color="primary" outline @click="openShowShellDialog"/>
    </q-page-sticky>
    <q-footer class="text-dark bg-white">
      <q-tabs dense outside-arrows mobile-arrows inline-label align="left" :breakpoint="0" active-color="primary" active-bg-color="grey-3">
        <q-route-tab v-for="item in subTabs" :class="item.textClass" :key="item.id" :name="item.id" :label="item.label" :icon="item.icon" :to="item.url" @click="clickSubTab(item)">
          <q-btn v-if="subTabs.length > 1" style="left: 15px;" round size="8px" icon="las la-times-circle" flat @click="(e) => closeSubTab(e, item.id)"></q-btn>
        </q-route-tab>
      </q-tabs>
    </q-footer>
    <keep-alive>
      <router-view :key="$route.fullPath"/>
    </keep-alive>
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
                  <q-card v-for="shell in shells" :key="shell.id" :class="selected.indexOf(shell.id) >= 0 ? 'bg-grey-5' : ''" style="width: 180px;">
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
                          </q-list>
                        </q-btn-dropdown>
                      </q-item-section>
                    </q-item>
                  </q-card>
                  <q-card style="width: 180px;cursor: pointer;">
                    <div class="column full-width">
                      <q-btn padding="lg" icon="las la-plus" style="height:95px" @click="newShell('0', true)"/>
                    </div>
                  </q-card>
                  <q-card v-if="selected.length > 0" style="width: 180px;cursor: pointer;">
                    <div class="column full-width">
                      <q-btn padding="lg" icon="las la-cut" style="height:95px" @click="cutShell"/>
                    </div>
                  </q-card>
                  <q-card v-if="showCopyBtn" style="width: 180px;cursor: pointer;">
                    <div class="column full-width">
                      <q-btn padding="lg" icon="las la-copy" style="height:95px" @click="copyShell"/>
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
// var persitedArray = []
export default {
  name: 'Design',
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
      copies: [],
      showCopyBtn: false
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
            for (var j = 0; j < this.copies.length; j++) {
              if (this.shells[i].id === this.copies[j])
                existed = true
                break out
              }
          }
          this.showCopyBtn = this.copies.length > 0 && !existed
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
          this.showCopyBtn = false
        })
      } else {
        fetchShellsByParent(this.showShellDialog.projectId, id).then(res => {
          this.shells = res.data
          var existed = false
          out: for (var i = 0; i < this.shells.length; i++) {
            for (var j = 0; j < this.copies.length; j++) {
              if (this.shells[i].id === this.copies[j])
                existed = true
                break out
              }
          }
          this.showCopyBtn = this.copies.length > 0 && !existed
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
        this.copies = []
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
      saveShell(this.shell).then(res => {
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
        var icon = ''
        var textClass = ''
        if (shell.category === '1') {
          icon = 'fullscreen'
          textClass = 'text-orange-7'
        } else if (shell.category === '2') {
          icon = 'fullscreen_exit'
          textClass = 'text-green-7'
        }
        this.addSubTabsAndRoute(shell.id, '/etl-design/' + shell.category + '/' + shell.id, shell.name, icon, textClass)
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
        return 'fullscreen'
      }
        return 'fullscreen_exit'
    },
    color (category) {
      if (category === '0') {
        return 'yellow-7'
      } else if (category === '1') {
        return 'orange-7'
      }
      return 'green-7'
    },
    cutShell () {
      this.copies = this.selected.slice()
    },
    copyShell () {
      const array = []
      this.copies.forEach(item => {
        array.push({id: item})
      })
      move(this.showShellDialog.openShellId, array).then(res => {
        this.$q.notify({
          message: this.$t('response.success.copy'),
          position: 'top',
          color: 'teal'
        })
        this.copies = []
        this.searchShells(1, this.showShellDialog.openShellId)
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
    addSubTabsAndRoute (id, url, label, icon, textClass) {
      const index = this.subTabs.findIndex((item) =>item.id === id)
      if (index < 0) {
        this.subTabs.push({id: id, url: url, label: label, icon: icon, textClass: textClass})
        // persitedArray = this.subTabs
        this.$emit('refreshUrl', {id: 'etl-design', url: url})
      }
      this.$router.replace({path: url})
    },
    closeSubTab (e, id) {
      var index = this.subTabs.findIndex((item) =>item.id === id)
      if (index >= 0) {
        this.subTabs.splice(index, 1)
      }
      if (this.subTabs.length > index) {
        this.$router.replace({path: this.subTabs[index].url})
      } else {
        this.$router.replace({path: this.subTabs[index - 1].url})
      }
      e.preventDefault()
    },
    clickSubTab (item) {
      this.$emit('refreshUrl', {id: 'etl-design', url: item.url})
    }
  },
  activated () {
    if (this.$route.path === '/etl-design') {
      this.subTabs = []
    }
  },
  mounted () {
    if (this.$route.path.startsWith('/etl-design/')) {
      this.showShellDialog.state = false
      const id = this.$route.path.replace('/etl-design', '').replace('/1/', '').replace('/2/', '')
      if (id) {
        fetchShell(id).then(res => {
        var icon = ''
        var textClass = ''
        if (res.data.category === '1') {
          icon = 'fullscreen'
          textClass = 'text-orange-7'
        } else if (res.data.category === '2') {
          icon = 'fullscreen_exit'
          textClass = 'text-green-7'
        }
          this.addSubTabsAndRoute(res.data.id, this.$route.path, res.data.name, icon, textClass)
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
    } else {
      this.fetchProjects()
    }
  }
}
</script>
