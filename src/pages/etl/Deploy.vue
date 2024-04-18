<template>
  <div>
    <q-footer class="bg-white">
      <q-tabs v-model="activeTab" dense outside-arrows mobile-arrows inline-label align="left" :breakpoint="0" active-bg-color="grey-3">
        <q-tab v-for="item in subTabs" :class="'text-' + color(item.category)" :key="item.id" :name="item.id" :label="item.name" :icon="icon(item.category)" @click="clickSubTab(item)">
          <q-btn v-if="item.id > -1" style="left: 15px;" round size="8px" icon="las la-times-circle" flat @click="(e) => closeSubTab(e, item.id)"></q-btn>
        </q-tab>
      </q-tabs>
    </q-footer>
    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel v-for="item in subTabs" :key="item.id" :name="item.id">
        <q-table
            flat
            bordered
            :data="publishes"
            :columns="columns"
            row-key="id"
            :loading="loading"
            separator="cell"
            :no-data-label="$t('table.empty')"
            @request="history"
            :pagination.sync="pagination"
          >
            <template v-slot:body-cell-createTime="props">
              <q-td style="padding: 1px;">
                {{ dateFormat(props.row.createTime) }}
              </q-td>
            </template>
            <template v-slot:body-cell-prod="props">
              <q-td style="padding: 1px;">
                {{ props.row.prod === '1' ? $t('form.shellPublish.deployed') : $t('form.shellPublish.unDeploy') }}
              </q-td>
            </template>
            <template v-slot:body-cell-operate="props">
              <q-td style="padding: 1px;">
                <q-btn-group outline>
                  <q-btn outline color="primary" @click="deploy(props.row)">{{ $t('button.deploy') }}</q-btn>
                  <q-btn outline color="primary" @click="viewReference(props.row.id)">{{ $t('button.reference') }}</q-btn>
                </q-btn-group>
              </q-td>
            </template>
          </q-table>
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
                  <q-card flat bordered v-for="shell in shells" :key="shell.id" style="width: 200px; height: 70px; cursor: pointer;" @click="openShell(shell)">
                    <q-item style="; cursor: pointer;" @click="openShell(shell)">
                      <q-item-section class="col-2" @click="openShell(shell)">
                        <q-icon size="sm" :name="icon(shell.category)" :color="color(shell.category)"/>
                      </q-item-section>
                      <q-item-section class="col-10" @click="openShell(shell)">
                        <q-item-label style="font-size: 16px;">{{ shell.name }}</q-item-label>
                        <q-item-label caption>{{ shell.description }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-card>
                </div>
              </q-card-section>
            </template>
          </q-splitter>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="viewReferenceState">
      <q-card style="width: 900px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.shellPublish.references') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
          <q-card-section class="q-col-gutter-xs">
            <q-table
              flat
              bordered
              :data="references"
              :columns="referenceColumns"
              row-key="id"
              hide-bottom
              :loading="loading"
              separator="cell"
            >
              <template #body-cell-name="props">
                <q-td :props="props" class="q-gutter-sm">
                  {{ props.row.shell.name }}
                </q-td>
              </template>
              <template #body-cell-category="props">
                <q-td :props="props" class="q-gutter-sm">
                  {{ props.row.shell.category === '1' ? $t('form.shellPublish.columnShellCategoryKjb') : $t('form.shellPublish.columnShellCategoryKtr') }}
                </q-td>
              </template>
            <template v-slot:body-cell-createTime="props">
              <q-td style="padding: 1px;">
                {{ dateFormat(props.row.createTime) }}
              </q-td>
            </template>
              <template #body-cell-operate="props">
                <q-td :props="props" class="q-gutter-sm">
                  <q-btn outline color="primary" @click="preview(props.row.id)">{{ $t('button.preview') }}</q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
          <q-card-section class="q-col-gutter-xs">
            <preview-canvas-com :content="referenceContent"/>
          </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="deployShellState">
      <q-card style="width: 400px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.shellPublish.deploy') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-form @submit="submitForm">
          <q-card-section class="q-col-gutter-xs">
            <q-select
              v-model="misfire"
              outlined
              :label="$t('form.shellPublish.misfireOption')"
              :options="misfireOptions"
              map-options
              emit-value
              use-input
              clearable
              hint=""
            >
            </q-select>
          </q-card-section>
          <q-card-section class="col q-pt-none">
            <q-input outlined color="cyan-8" v-model="cron" :label="$t('form.shellPublish.cron')" :rules="[val => !!val || 'Please type something', val => validate(val) || $t('form.shellPublish.cronRule')]" hint=""/>
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

import pako from 'pako'
import { date } from 'quasar'
import { fetchProjects } from 'src/service/base/ProjectService'
import { fetchShellsByProject, fetchShellsByParent, fetchShellPublishes, fetchShellPublishReferences, fetchShellPublishContent, deployShellPublish } from 'src/service/kettle/ShellService'
import PreviewCanvasCom from './PreviewCanvasCom.vue'
// var persitedArray = []
export default {
  components: { PreviewCanvasCom },
  name: 'Deploy',
  comments: {
    PreviewCanvasCom
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
      links: [],
      subTabs: [],
      activeTab: null,
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
          label: this.$t('form.shellPublish.columnCreateTime'),
          field: 'createTime',
          headerStyle: 'width: 10%',
          align: 'left'
        },
        {
          name: 'description',
          label: this.$t('form.shellPublish.columnDescription'),
          field: 'description',
          headerStyle: 'width: 70%',
          align: 'left'
        },
        {
          name: 'prod',
          label: this.$t('form.shellPublish.columnProd'),
          field: 'prod',
          headerStyle: 'width: 10%',
          align: 'left'
        },
        {
          name: 'operate',
          label: this.$t('form.shellPublish.columnOperate'),
          field: 'operate',
          headerStyle: 'width: 10%',
          align: 'left'
        }
      ],
      viewReferenceState: false,
      references: [],
      referenceColumns: [
        {
          name: 'name',
          label: this.$t('form.shellPublish.columnShellName'),
          headerStyle: 'width: 10%',
          align: 'left'
        },
        {
          name: 'category',
          label: this.$t('form.shellPublish.columnShellCategory'),
          headerStyle: 'width: 10%',
          align: 'left'
        },
        {
          name: 'createTime',
          label: this.$t('form.shellPublish.columnCreateTime'),
          field: 'createTime',
          headerStyle: 'width: 10%',
          align: 'left'
        },
        {
          name: 'description',
          label: this.$t('form.shellPublish.columnDescription'),
          field: 'description',
          headerStyle: 'width: 70%',
          align: 'left'
        },
        {
          name: 'operate',
          label: this.$t('form.shellPublish.columnOperate'),
          headerStyle: 'width: 10%',
          align: 'left'
        }
      ],
      referenceContent: null,
      deployShellState: false,
      cron: null,
      misfire: 2,
      misfireOptions: [
        { value: 2, label: this.$t('form.shellPublish.misfire2') },
        { value: -1, label: this.$t('form.shellPublish.misfire-1') },
        { value: 1, label: this.$t('form.shellPublish.misfire1') }
      ],
      selectShellPublishId: null,
      streaming: '0'
    }
  },
  methods: {
    validate (val) {
      const reg = new RegExp('^\\s*($|#|\\w+\\s*=|(\\?|\\*|(?:[0-5]?\\d)(?:(?:-|\\/|\\,)(?:[0-5]?\\d))?(?:,(?:[0-5]?\\d)(?:(?:-|\\/|\\,)(?:[0-5]?\\d))?)*)\\s+(\\?|\\*|(?:[0-5]?\\d)(?:(?:-|\\/|\\,)(?:[0-5]?\\d))?(?:,(?:[0-5]?\\d)(?:(?:-|\\/|\\,)(?:[0-5]?\\d))?)*)\\s+(\\?|\\*|(?:[01]?\\d|2[0-3])(?:(?:-|\\/|\\,)(?:[01]?\\d|2[0-3]))?(?:,(?:[01]?\\d|2[0-3])(?:(?:-|\\/|\\,)(?:[01]?\\d|2[0-3]))?)*)\\s+(\\?|\\*|(?:0?[1-9]|[12]\\d|3[01])(?:(?:-|\\/|\\,)(?:0?[1-9]|[12]\\d|3[01]))?(?:,(?:0?[1-9]|[12]\\d|3[01])(?:(?:-|\\/|\\,)(?:0?[1-9]|[12]\\d|3[01]))?)*)\\s+(\\?|\\*|(?:[1-9]|1[012])(?:(?:-|\\/|\\,)(?:[1-9]|1[012]))?(?:L|W)?(?:,(?:[1-9]|1[012])(?:(?:-|\\/|\\,)(?:[1-9]|1[012]))?(?:L|W)?)*|\\?|\\*|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:(?:-)(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?(?:,(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:(?:-)(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?)*)\\s+(\\?|\\*|(?:[0-6])(?:(?:-|\\/|\\,|#)(?:[0-6]))?(?:L)?(?:,(?:[0-6])(?:(?:-|\\/|\\,|#)(?:[0-6]))?(?:L)?)*|\\?|\\*|(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:(?:-)(?:MON|TUE|WED|THU|FRI|SAT|SUN))?(?:,(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:(?:-)(?:MON|TUE|WED|THU|FRI|SAT|SUN))?)*)(|\\s)+(\\?|\\*|(?:|\\d{4})(?:(?:-|\\/|\\,)(?:|\\d{4}))?(?:,(?:|\\d{4})(?:(?:-|\\/|\\,)(?:|\\d{4}))?)*))$')
      const result = reg.test(val)
      return result
    },
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
          res.data.forEach(item => {
            if (item.category !== '2') {
              this.shells.push(item)
            }
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
      } else {
        fetchShellsByParent(this.showShellDialog.projectId, id).then(res => {
          res.data.forEach(item => {
            if (item.category !== '2') {
              this.shells.push(item)
            }
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
      }
    },
    openShowShellDialog () {
      this.showShellDialog.state=true
      this.fetchProjects()
    },
    openProject () {
      this.showShellDialog.openShellId = null
      this.links = []
      if (this.showShellDialog.prevClickProjectId != this.showShellDialog.projectId) {
        this.showShellDialog.prevClickProjectId = this.showShellDialog.projectId
      }
      this.searchShells(0, this.showShellDialog.projectId)
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
    openShell (shell) {
      this.showShellDialog.openShellId = shell.id
      if (shell.category === '0') {
        this.links.push({id: shell.id, name: shell.name, mode: 1})
        this.searchShells(1, shell.id)
      } else {
        this.showShellDialog.state = false
        const index = this.subTabs.findIndex((item) =>item.id === shell.id)
        this.activeTab = shell.id
        if (index < 0) {
          this.subTabs.push(shell)
          this.history()
        }
      }
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
        this.history()
      }
    },
    history () {
      const query = {
        pageNo: this.pagination.page,
        pageSize: this.pagination.rowsPerPage,
        id: this.activeTab
      }
      fetchShellPublishes(query).then(res => {
        this.pagination.rowsNumber = res.data.total
        this.publishes = res.data.items
      }).catch(err => {
      if (err.status === 10002) {
        vm.$q.notify({
          message: vm.$t('response.error.10002'),
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
    dateFormat (value) {
      return date.formatDate(value, 'YYYY-MM-DD HH:mm:ss')
    },
    deploy (row) {
      this.selectShellPublishId = row.id
      this.streaming = row.streaming
      if (this.streaming === '0') {
        this.deployShellState = true
      } else {
        this.$q.dialog({
          title: 'Confirm',
          message: this.$t('message.confirm.deploy'),
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
          deployShellPublish({id: this.selectShellPublishId}).then(() => {
            this.history()
            this.$q.notify({
              message: this.$t('response.success.deploy'),
              position: 'top',
              color: 'teal'
            })
          this.deployShellState = false
          }).catch(err => {
            if (err.status === 10002) {
              this.$q.notify({
                message: this.$t('response.error.10002'),
                position: 'top',
                color: 'negative'
              })
            } else if (err.status === 10012) {
              this.$q.notify({
                message: this.$t('response.error.10012'),
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
      }
    },
    submitForm () {
      this.$q.dialog({
        title: 'Confirm',
        message: this.$t('message.confirm.deploy'),
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
        deployShellPublish({id: this.selectShellPublishId, cron: this.cron, misfire: this.misfire}).then(() => {
          this.history()
          this.$q.notify({
            message: this.$t('response.success.deploy'),
            position: 'top',
            color: 'teal'
          })
        this.deployShellState = false
        }).catch(err => {
          if (err.status === 10002) {
            this.$q.notify({
              message: this.$t('response.error.10002'),
              position: 'top',
              color: 'negative'
            })
          } else if (err.status === 10012) {
            this.$q.notify({
              message: this.$t('response.error.10012'),
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
    viewReference (id) {
      this.referenceContent = null
      fetchShellPublishContent(id).then(res => {
        if (res.data) {
          this.referenceContent = this.unzip(res.data)
        }
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
      fetchShellPublishReferences ({id: id}).then(res => {
        this.viewReferenceState = true
        this.references = res.data
      }).catch(err => {
        if (err.status === 10002) {
          vm.$q.notify({
            message: vm.$t('response.error.10002'),
            position: 'top',
            color: 'negative'
          })
        } else if (err.status === 10009) {
          vm.$q.notify({
            message: vm.$t('response.error.10009'),
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
    preview (id) {
      fetchShellPublishContent(id).then(res => {
        if (res.data) {
          this.referenceContent = this.unzip(res.data)
        }
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
  activated () {
  },
  mounted () {
    this.subTabs = [{ id: -1, name: this.$t('button.createOrOpen'), category: null}]
    this.fetchProjects()
  }
}
</script>
