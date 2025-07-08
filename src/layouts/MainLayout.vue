<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="las la-bars"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          <div v-if="!leftDrawerOpen">{{ $t('global.author') }}</div>
        </q-toolbar-title>

        <div>
          <q-chip clickable @click="$i18n.locale = 'en-us'" color="primary" text-color="white">{{ $t('global.en') }}</q-chip>
          <q-chip clickable @click="$i18n.locale = 'zh-cn'" color="primary" text-color="white">{{ $t('global.zh') }}</q-chip>
        </div>
        <div>
          <q-btn flat aria-label="Notifications" @click="showNoticeDialog">
            <q-icon name="las la-bell" size="20px">
              <q-badge v-show="($q.sessionStorage.getItem('notice') && Object.keys($q.sessionStorage.getItem('notice')).length > 0) || showNoticeBadge" rounded floating color="red"/>
            </q-icon>
          </q-btn>
          <q-btn-dropdown auto-close stretch flat size="md" :label="me.name" no-caps>
          <q-list dense  separator>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-avatar icon="las la-book" />
              </q-item-section>
              <q-item-section>
                {{ $t('mainLayout.document') }}
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-avatar icon="las la-key" />
              </q-item-section>
              <q-item-section>
                {{ $t('mainLayout.modifyPassword') }}
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-avatar icon="las la-headphones-alt" />
              </q-item-section>
              <q-item-section>
                {{ $t('mainLayout.contact') }}
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple @click="$q.cookies.remove('token');$q.cookies.remove('authorities');$router.push('/login');">
              <q-item-section avatar>
                <q-avatar icon="las la-sign-out-alt" />
              </q-item-section>
              <q-item-section>
                {{ $t('mainLayout.logout') }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="250"
    >
      <q-list separator>
        <q-item-label class="text-bold" header>
        @{{ $t('global.author') }}
        </q-item-label>
        <q-item
          to="/"
          v-ripple
          class="menu-link"
          active-class="menu-link-active"
            @click="(e) => addTabsAndRoute(e, 'home', '/', $t('menu.home'))"
        >
          <q-item-section avatar class="flex-center">
            <q-icon name="las la-home" size="18px"/>
          </q-item-section>
          <q-item-section>
            {{ $t('menu.home') }}
          </q-item-section>
        </q-item>
        <q-expansion-item group="menu" v-for="menu in menus" :key="menu.id" :default-opened="$route.path.startsWith(menu.prefix)" :content-inset-level="0.4">
          <template v-slot:header="{ expanded }">
            <q-item-section avatar :class="expanded ? 'menu-expansion-item-header text-info text-weight' : 'menu-expansion-item-header'">
              <q-avatar :icon="menu.icon"/>
            </q-item-section>
            <q-item-section :class="expanded ? 'menu-expansion-item-header text-info text-weight' : 'menu-expansion-item-header'">
              {{ menu.category }}
            </q-item-section>
          </template>
          <q-item
            class="menu-link"
            active-class="menu-link-active"
            v-for="child in menu.children"
            :key="child.id"
            :to="child.to"
            @click="(e) => addTabsAndRoute(e, child.id, child.to, child.name)"
            v-ripple
          >
            <q-item-section avatar>
              <q-icon :name="child.icon" size="18px"/>
            </q-item-section>

            <q-item-section>
            {{ child.name }}
            </q-item-section>
          </q-item>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-tabs dense outside-arrows mobile-arrows inline-label align="left" :breakpoint="0" active-color="primary" active-bg-color="grey-3">
        <q-route-tab v-for="item in tabs" :key="item.id" :name="item.id" :label="item.label" :to="item.url">
          <q-btn v-if="tabs.length > 1" style="left: 15px;" round size="8px" icon="las la-times-circle" flat @click="(e) => closeTab(e, item.id)"></q-btn>
        </q-route-tab>
      </q-tabs>
      <keep-alive>
        <router-view @addRouteTab="onAddRouteTab" :key="$route.path"/>
      </keep-alive>
      <!-- <router-view/> -->
    </q-page-container>
    
    <q-dialog v-model="noticeDialog.state">
      <q-card style="width: 550px; max-width: 40vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('home.notice') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section>
          <q-tabs v-model="noticeDialog.tab" active-color="primary" align="left" narrow-indicator>
            <q-tab name="audit" :label="$t('home.tabAudit')"/>
            <q-tab name="taskCompleted" :label="$t('home.tabTaskCompleted')"/>
            <q-tab name="taskFailure" :label="$t('home.tabTaskFailure')"/>
          </q-tabs>
            <q-tab-panels v-model="noticeDialog.tab" animated>
              <q-tab-panel name="audit">
                <q-table class="home-notice-virtscroll-table" :data="noticeDialog.applyTable.data.slice().reverse()" :loading="noticeDialog.applyTable.loading" :columns="noticeDialog.applyTable.columns" row-key="id"
                  :no-data-label="$t('table.empty')" :rows-per-page-options="[0]" virtual-scroll :virtual-scroll-sticky-size-start="5">
                  <template v-slot:body="props">
                    <q-tr :props="props" :key="props.row.key">
                      <q-td><a href="#" @click="removeSessionStorage(props.row.key)">{{ props.row.creator }}</a></q-td>
                      <q-td>{{ dateFormat(props.row.createTime) }}</q-td>
                    </q-tr>
                  </template>
                </q-table>
              </q-tab-panel>
              <q-tab-panel name="taskCompleted">
                <q-table class="home-notice-virtscroll-table" :data="noticeDialog.taskComplatedTable.data.slice().reverse()" :loading="noticeDialog.taskComplatedTable.loading" :columns="noticeDialog.taskComplatedTable.columns" row-key="taskHistoryId"
                  :no-data-label="$t('table.empty')" :rows-per-page-options="[0]" virtual-scroll :virtual-scroll-sticky-size-start="5">
                </q-table>
                <q-btn class="q-mt-md" color="primary" :label="$t('button.clearRead')" @click="removeTaskComplateSessionStorage"/>
              </q-tab-panel>
              <q-tab-panel name="taskFailure">
                <q-table class="home-notice-virtscroll-table" :data="noticeDialog.taskFailureTable.data.slice().reverse()" :loading="noticeDialog.taskFailureTable.loading" :columns="noticeDialog.taskFailureTable.columns" row-key="taskHistoryId"
                  :no-data-label="$t('table.empty')" :rows-per-page-options="[0]" virtual-scroll :virtual-scroll-sticky-size-start="5">
                </q-table>
                <q-btn class="q-mt-md" color="primary" :label="$t('button.clearRead')" @click="removeTaskFailureSessionStorage"/>
              </q-tab-panel>
            </q-tab-panels>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<style lang="sass">
.home-notice-virtscroll-table
  /* height or max-height is important */
  height: 410px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
  thead tr:first-child th
    top: 0

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
.menu-link
  border-radius: 0 10px 10px 0
  font-size: 13px
.menu-link-active
  color: $primary
  background: #e6f8ff
  border-radius: 0 10px 10px 0
  font-size: 13px
.menu-expansion-item-header
  font-size: 13px
</style>
<script>
import { me, changePwd } from 'src/service/auth/AuthService'
import Vue from 'vue'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import { date } from 'quasar'

export default {
  name: 'MainLayout',
  data () {
    return {
      leftDrawerOpen: false,
      menus: [],
      me: {
        name: '',
        tenant: '',
        username: ''
      },
      tabs: [],
      timer: null,
      showNoticeBadge: false,
      noticeDialog: {
        state: false,
        tab: 'audit',
        applyTable: {
          loading: false,
          data: [],
          columns: [
            { name: 'creator', label: this.$t('home.table.application.creator'), align: 'left', field: 'creator' },
            { name: 'createTime', label: this.$t('home.table.application.createTime'), align: 'left', field: 'createTime' }
          ]
        },
        taskComplatedTable: {
          loading: false,
          data: [],
          columns: [
            { name: 'name', label: this.$t('home.table.complete.name'), align: 'left', field: 'name' },
            { name: 'fireTime', label: this.$t('home.table.complete.fireTime'), align: 'left', field: 'fireTime' }
          ]
        },
        taskFailureTable: {
          loading: false,
          data: [],
          columns: [
            { name: 'name', label: this.$t('home.table.failure.name'), align: 'left', field: 'name' },
            { name: 'fireTime', label: this.$t('home.table.failure.fireTime'), align: 'left', field: 'fireTime' }
          ]
        }
      }
    }
  },
  methods: {
    addTabs (id, url, label) {
      const index = this.tabs.findIndex((item) =>item.id === id)
      if (index < 0) {
        this.tabs.push({id: id, url: url, label: label})
      }
    },
    addTabsAndRoute (evt, id, url, label) {
      const index = this.tabs.findIndex((item) =>item.id === id)
      if (index < 0) {
        this.tabs.push({id: id, url: url, label: label})
      } else {
        if (evt) {
          evt.preventDefault()
          this.$router.push({path: this.tabs[index].url})
        }
      }
    },
    closeTab (e, id) {
      var index = this.tabs.findIndex((item) =>item.id === id)
      if (index >= 0) {
        this.tabs.splice(index, 1)
      }
      if (this.tabs.length > index) {
        this.$router.push({path: this.tabs[index].url})
      } else {
        this.$router.push({path: this.tabs[index - 1].url})
      }
      e.preventDefault()
    },
    onAddRouteTab (config) {
      let id = ''
      let label = ''
      this.menus.forEach(menu => {
        menu.children.forEach(child => {
          if (child.to === config.to) {
            id = child.id
            label = child.name
          }
        })
      })
      this.addTabsAndRoute(null, id, config.url, label)
    },
    connectSocketServer () {
      const fn = () => {
        if (!this.$stompClient) {
          Vue.prototype.$stompClient = Stomp.over(new SockJS(process.env.API + '/socket'))
        }
        if (!this.$stompClient.connected) {
          if (this.timer) {
            this.$q.notify({
              message: this.$t('message.reconnectServer'),
              position: 'top',
              color: 'negative'
            })
          }
          const _this = this
          this.$stompClient.connect({}, () => {
            _this.$q.notify({
              message: _this.$t('message.connectedMessageServer'),
              position: 'top',
              color: 'teal'
            })
            _this.$stompClient.subscribe('/user/' + _this.me.username + '/message', (response) => {
              const body = JSON.parse(response.body)
              const type = response.headers['type']
              const noticeStorage = _this.$q.sessionStorage.getItem('notice') || {}
              const typeNoticeStorage = noticeStorage[type] || []
              typeNoticeStorage.push(body)
              noticeStorage[type] = typeNoticeStorage
              _this.$q.sessionStorage.set('notice', noticeStorage)
              _this.showNoticeBadge = true
            })
          })
        }
      }
      fn()
      this.timer = setInterval(() => fn(), 5000)
    },
    showNoticeDialog () {
      this.noticeDialog.state = true
      const noticeMap = this.$q.sessionStorage.getItem('notice') || {}
      this.noticeDialog.applyTable.data = noticeMap['application_apply'] || []
      this.noticeDialog.taskComplatedTable.data = noticeMap['task_completed'] || []
      this.noticeDialog.taskFailureTable.data = noticeMap['task_failure'] || []
    },
    removeSessionStorage (id) {
      const noticeMap = this.$q.sessionStorage.getItem('notice') || {}
      const applyData = noticeMap['application_apply']
      if (applyData) {
        const index = applyData.findIndex(item => item.key === id)
        if (index >= 0) {
          applyData.splice(index, 1)
          noticeMap['application_apply'] = applyData
          this.noticeDialog.applyTable.data = applyData
          if (applyData.length === 0) {
            delete noticeMap['application_apply']
            this.showNoticeBadge = false
          }
          this.$q.sessionStorage.set('notice', noticeMap)
          this.noticeDialog.state = false
          this.addTabs('auth-application', '/auth-application',  this.$t('menu.auth.application'))
          this.$router.push({path: '/auth-application'})
        }
      }
    },
    removeTaskComplateSessionStorage () {
      const noticeMap = this.$q.sessionStorage.getItem('notice') || {}
      delete noticeMap['task_completed']
      this.$q.sessionStorage.set('notice', noticeMap)
      this.noticeDialog.taskComplatedTable.data = []
      if (Object.keys(this.$q.sessionStorage.getItem('notice')).length === 0) {
        this.showNoticeBadge = false
      }
    },
    removeTaskFailureSessionStorage () {
      const noticeMap = this.$q.sessionStorage.getItem('notice') || {}
      delete noticeMap['task_failure']
      this.$q.sessionStorage.set('notice', noticeMap)
      this.noticeDialog.taskFailureTable.data = []
      if (Object.keys(this.$q.sessionStorage.getItem('notice')).length === 0) {
        this.showNoticeBadge = false
      }
    },
    dateFormat (value, format) {
      const text = date.formatDate(value, format || 'YYYY-MM-DD HH:mm:ss')
      return text
    },
  },
  mounted () {
    this.$i18n.locale = this.$q.lang.getLocale()
    this.menus = [
      {
        id: 'basic',
        category: this.$t('menu.basic.default'),
        prefix: '/basic-',
        icon: 'las la-server',
        children: [
          {
            id: 'basic-project',
            name: this.$t('menu.basic.project'),
            to: '/basic-project',
            icon: 'las la-project-diagram'
          },
          {
            id: 'basic-datasource',
            name: this.$t('menu.basic.datasource'),
            to: '/basic-datasource',
            icon: 'las la-database'
          },
          {
            id: 'basic-ftp',
            name: this.$t('menu.basic.ftp'),
            to: '/basic-ftp',
            icon: 'las la-folder'
          },
          {
            id: 'basic-dictionary',
            name: this.$t('menu.basic.dictionary'),
            to: '/basic-dictionary',
            icon: 'las la-folder'
          }
        ]
      },
      {
        id: 'auth',
        category: this.$t('menu.auth.default'),
        prefix: '/auth-',
        icon: 'lab la-centos',
        children: [
          {
            id: 'auth-application',
            name: this.$t('menu.auth.application'),
            to: '/auth-application',
            icon: 'las la-key'
          },
          {
            id: 'auth-privilege',
            name: this.$t('menu.auth.privilege'),
            to: '/auth-privilege',
            icon: 'las la-key'
          },
          {
            id: 'auth-user',
            name: this.$t('menu.auth.user'),
            to: '/auth-user',
            icon: 'las la-user'
          }
        ]
      },
      {
        id: 'etl',
        category: this.$t('menu.etl.default'),
        prefix: '/etl-',
        icon: 'las la-cogs',
        children: [
          {
            id: 'etl-design',
            name: this.$t('menu.etl.design'),
            to: '/etl-design',
            icon: 'las la-pencil-ruler'
          },
          {
            id: 'etl-deploy',
            name: this.$t('menu.etl.deploy'),
            to: '/etl-deploy',
            icon: 'lab la-telegram'
          }
        ]
      },
      {
        id: 'task',
        category: this.$t('menu.task.default'),
        prefix: '/task-',
        icon: 'las la-tasks',
        children: [
          {
            id: 'task-batch',
            name: this.$t('menu.task.batch'),
            to: '/task-batch',
            icon: 'las la-tasks'
          },
          {
            id: 'task-streaming',
            name: this.$t('menu.task.streaming'),
            to: '/task-streaming',
            icon: 'las la-stream'
          },
          {
            id: 'running-process',
            name: this.$t('menu.task.instance'),
            to: '/running-process',
            icon: 'las la-recycle'
          }
        ]
      },
      {
        id: 'bi',
        category: this.$t('menu.bi.default'),
        prefix: '/bi-',
        icon: 'las la-lightbulb',
        children: [
          {
            id: 'bi-chart',
            name: this.$t('menu.bi.chart'),
            to: '/bi-chart',
            icon: 'las la-chart-pie'
          },
          {
            id: 'bi-model',
            name: this.$t('menu.bi.model'),
            to: '/bi-model',
            icon: 'lab la-buffer'
          },
          {
            id: 'bi-report',
            name: this.$t('menu.bi.report'),
            to: '/bi-report',
            icon: 'las la-chart-bar'
          },
          {
            id: 'bi-layout',
            name: this.$t('menu.bi.layout'),
            to: '/bi-layout',
            icon: 'las la-palette'
          }
        ]
      }
    ]
    me().then(res => {
      this.me = Object.assign({
        name: '',
        tenant: '',
        username: ''
      }, res.data)
      // 监听后台推送的消息通知
      this.connectSocketServer()
    })
    let id = ''
    let label = ''
    const array = [...this.menus, ...[{children: [{id: 'home', to: '/', name: this.$t('menu.home')}]}]]
    array.forEach(menu => {
      menu.children.forEach(child => {
        if (this.$route.path === child.to || this.$route.path.startsWith(child.to + '/')) {
          id = child.id
          label = child.name
        }
      })
    })
    if (id !== 'home') {
      this.addTabs('home', '/',  this.$t('menu.home'))
    }
    this.addTabsAndRoute(null, id, this.$route.path, label)
  }
}
</script>
