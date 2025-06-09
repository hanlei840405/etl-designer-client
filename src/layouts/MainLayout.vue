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
                <q-avatar icon="las la-envelope" />
              </q-item-section>
              <q-item-section>
                {{ $t('mainLayout.notice') }}
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
  </q-layout>
</template>

<style lang="sass">
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
import { me, changePwd } from '../service/AuthService'

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
    }
  },
  methods: {
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
    }
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
            icon: 'las la-icons'
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
    this.addTabsAndRoute(null, id, this.$route.path, label)
  }
}
</script>
