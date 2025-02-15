<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" hide-header :no-data-label="$t('table.empty')" :rows-per-page-options="[0]" hide-bottom>
      <template v-slot:top-left>
        <q-select
          v-model="project"
          outlined
          :label="$t('form.project.select.default')"
          :options="table.projectsCopy"
          option-value="id"
          option-label="name"
          use-input
          clearable
          @input="selectedProject"
          @filter="filterProject"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
              <q-item-section>
                <q-item-label>{{ scope.opt.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </template>
      <template v-slot:top-right>
        <q-btn v-if="project" outline color="primary" :label="$t('button.create')" @click="newFtp"/>
      </template>
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-3 grid-style-transition">
          <q-card>
            <q-separator color="primary" size="2px"/>
            <q-card-section>
              <q-list dense>
                <q-item v-for="col in props.cols" :key="col.name">
                  <q-item-section class="col-4">
                    <q-item-label caption lines="1" class="text-primary">{{ col.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section class="col-8">
                    <q-item-label caption lines="1">
                      {{ col.value }}
                      <q-tooltip>
                        {{ col.value }}
                      </q-tooltip>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            <q-separator color="primary" size="2px"/>
            <q-card-actions align="right">
              <q-btn outline dense color="primary" @click="loadFtp(props)">{{ $t('button.modify') }}</q-btn>
              <q-btn outline dense color="negative" @click="deleteFtp(props)">{{ $t('button.delete') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
    <div class="q-pa-md text-center" v-if="projects.length === 0">
      <a href="javascript:;" class="q-pa-md text-primary" @click="goProject" style="text-decoration: none;">{{ $t('message.noProject') }}</a>
      <a href="javascript:;" class="text-primary" @click="fetchProjects" style="text-decoration: none;">{{ $t('button.refresh') }}</a>
    </div>
    <q-dialog v-model="editFtpDialog.state">
      <q-card style="width: 800px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.ftp.default') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form>
          <q-tabs v-model="editFtpDialog.tabOption" align="left">
            <q-tab name="basic" :label="$t('form.ftp.tab.basic')" />
            <q-tab name="proxy" :label="$t('form.ftp.tab.proxy')" />
          </q-tabs>
          <q-tab-panels v-model="editFtpDialog.tabOption" animated swipeable vertical transition-prev="jump-up" transition-next="jump-up">
            <q-tab-panel class="row q-col-gutter-xs" name="basic">
            <q-input class="col-12 col-md-6" outlined v-model="ftp.name" :label="$t('form.ftp.name')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.ftp.name')]"/>
            <q-select class="col-12 col-md-6" outlined v-model="ftp.category" :options="editFtpDialog.categories" :label="$t('form.ftp.category')" hint=""/>
            <q-input class="col-12 col-md-6" outlined v-model="ftp.host" :label="$t('form.ftp.host')" hint=""/>
            <q-input class="col-12 col-md-6" outlined type="number" v-model.number="ftp.port" :label="$t('form.ftp.port')" hint=""/>
            <q-input class="col-12 col-md-6" outlined v-model="ftp.username" :label="$t('form.ftp.username')" hint=""/>
            <q-input class="col-12 col-md-6" outlined v-model="ftp.password" :label="$t('form.ftp.password')" hint=""/>
            <q-checkbox class="col-12 col-md-12" outlined v-if="ftp.category === 'SFTP'" v-model="ftp.usePrivateKey" :label="$t('form.ftp.usePrivateKey')"/>
            <q-input class="col-12 col-md-12" type="textarea" outlined v-if="ftp.category === 'SFTP'" v-model="ftp.privateKey" :label="$t('form.ftp.privateKey')" hint=""/>
            <q-input class="col-12 col-md-12" outlined v-if="ftp.category === 'SFTP'" v-model="ftp.privateKeyPassword" :label="$t('form.ftp.privateKeyPassword')" hint=""/>
            </q-tab-panel>
            <q-tab-panel class="row q-col-gutter-xs" name="proxy">
              <q-select class="col-12 col-md-6" outlined v-model="ftp.proxyCategory" :options="editFtpDialog.proxyCategories" :label="$t('form.ftp.proxyCategory')" hint=""/>
              <q-input class="col-12 col-md-6" outlined v-model="ftp.proxyHost" :label="$t('form.ftp.proxyHost')" hint=""/>
              <q-input class="col-12 col-md-6" outlined type="number" v-model.number="ftp.proxyPort" :label="$t('form.ftp.proxyPort')" hint=""/>
              <q-input class="col-12 col-md-6" outlined v-model="ftp.proxyUsername" :label="$t('form.ftp.proxyUsername')" hint=""/>
              <q-input class="col-12 col-md-6" outlined v-model="ftp.proxyPassword" :label="$t('form.ftp.proxyPassword')" hint=""/>
            </q-tab-panel>
          </q-tab-panels>
          </q-form>
        </q-card-section>
        <q-separator />
          <q-card-actions align="right">
            <q-btn :label="$t('button.test')" outline color="orange" icon="las la-spider" @click="testftp"/>
            <q-btn :label="$t('button.save')" outline color="primary" icon="las la-save" @click="saveFtp"/>
            <q-btn v-if="ftp.id" :label="$t('button.delete')" outline color="negative" icon="las la-trash" @click="deleteFtp"/>
          </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { fetchProjects } from 'src/service/base/ProjectService'
import { fetchFtp, fetchFtpList, saveFtp, deleteFtp, testFtp } from 'src/service/base/FtpService'

export default {
  data () {
    return {
      table: {
        loading: false,
        projectsCopy: [],
        data: [],
        columns: [
          {
            name: 'name',
            label: this.$t('table.ftp.name'),
            field: 'name',
            align: 'left'
          },
          {
            name: 'category',
            label: this.$t('table.ftp.category'),
            field: 'category',
            align: 'left'
          },
          {
            name: 'host',
            label: this.$t('table.ftp.host'),
            field: 'host',
            align: 'left'
          },
          {
            name: 'port',
            label: this.$t('table.ftp.port'),
            field: 'port',
            align: 'left'
          }
        ]
      },
      editFtpDialog: {
        state: false,
        tabOption: 'basic',
        categories: ['FTP', 'SFTP'],
        proxyCategories: ['HTTP', 'SOCKS5']
      },
      projects: [],
      project: null,
      ftp: {
        id: null,
        name: null,
        category: null,
        host: null,
        port: null,
        username: null,
        password: null,
        usePrivateKey: false,
        privateKey: null,
        privateKeyPassword: null,
        proxyCategory: null,
        proxyHost: null,
        proxyPort: null,
        proxyUsername: null,
        proxyPassword: null,
      }
    }
  },
  methods: {
    goProject () {
      this.$emit('addRouteTab', {to: '/basic-project', url: '/basic-project'})
      this.$router.push({path: '/basic-project'})
    },
    filterProject (val, update) {
      if (val === '') {
        update(() => {
          this.table.projectsCopy = this.projects
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.table.projectsCopy = this.projects.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    selectedProject (val) {
      if (val) {
        fetchFtpList({
          projectId: val.id
        }).then(res => {
          this.table.data = res.data
        })
      } else {
        this.table.data = []
      }
    },
    searchftpList () {
      fetchFtpList({
        projectId: this.project.id
      }).then(res => {
        this.editFtpDialog.state = false
        this.table.data = res.data
      })
    },
    loadFtp (props) {
      fetchFtp(props.key).then(res => {
        this.editFtpDialog.state = true
        this.editFtpDialog.tabOption = 'basic'
        this.ftp = Object.assign(this.ftp, {
          id: res.data.id,
          name: res.data.name,
          category: res.data.category,
          host: res.data.host,
          port: res.data.port,
          username: res.data.username,
          password: res.data.password,
          privateKey: res.data.privateKey,
          privateKeyPassword: res.data.privateKeyPassword,
          proxyCategory: res.data.proxyCategory,
          proxyHost: res.data.proxyHost,
          proxyPort: res.data.proxyPort,
          proxyUsername: res.data.proxyUsername,
          proxyPassword: res.data.proxyPassword,
        })
      })
    },
    newFtp () {
      Object.assign(this.ftp, this.$options.data.call(this).ftp)
      this.editFtpDialog.state = true
    },
    saveFtp () {
      const submitForm = Object.assign({}, this.ftp, {
        projectId: this.project.id
      })
      saveFtp(submitForm).then(res => {
        this.$q.notify({
          message: this.$t('response.success.save'),
          position: 'top',
          color: 'teal'
        })
        this.searchftpList()
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
    testftp () {
      this.$q.loading.show()
      testFtp({
        projectId: this.project.id,
        category: this.ftp.category,
        host: this.ftp.host,
        port: this.ftp.port,
        username: this.ftp.username,
        password: this.ftp.password,
        usePrivateKey: this.ftp.usePrivateKey,
        privateKey: this.ftp.privateKey,
        privateKeyPassword: this.ftp.privateKeyPassword,
        proxyCategory: this.ftp.proxyCategory,
        proxyHost: this.ftp.proxyHost,
        proxyPort: this.ftp.proxyPort,
        proxyUsername: this.ftp.proxyUsername,
        proxyPassword: this.ftp.proxyPassword
      }).then(res => {
        this.$q.loading.hide()
        if (res.data) {
          this.$q.notify({
            message: this.$t('response.success.test'),
            position: 'top',
            color: 'teal'
          })
        } else {
          this.$q.notify({
            message: this.$t('response.error.test'),
            position: 'top',
            color: 'negative'
          })
        }
      }).catch(err => {
        this.$q.notify({
          message: err.data.error,
          position: 'top',
          color: 'negative'
        })
        this.$q.loading.hide()
      })
    },
    deleteFtp (props) {
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
        deleteFtp(props.key || this.ftp.id).then(() => {
          this.searchftpList()
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
    fetchProjects () {
      fetchProjects({}).then(res => {
        this.projects = res.data
      })
    }
  },
  mounted () {
    this.fetchProjects()
    if (this.$route.query.projectId) {
      this.selectedProject({id: this.$route.query.projectId})
    }
  }
}
</script>
