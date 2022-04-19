<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-cyan-8 text-black">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="drawer = !drawer"
        />
        <q-space/>
        <q-avatar>
          <img src="/logo.png">
        </q-avatar>
        <q-btn-dropdown auto-close stretch flat size="md" :label="$t('language')" no-caps>
          <q-list>
            <q-item clickable @click="$i18n.locale = 'en-us'" v-ripple>
              <q-item-section>
              {{ $t('en') }}
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable @click="$i18n.locale = 'zh-cn'" v-ripple>
              <q-item-section>
              {{ $t('zh') }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn-dropdown auto-close stretch flat size="md" :label="$t('app')" no-caps>
          <q-list>
            <q-item clickable @click="showDoc" v-ripple>
              <q-item-section avatar>
                <q-avatar text-color="cyan-8" icon="help_outline" />
              </q-item-section>
              <q-item-section>
                {{ $t('document') }}
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-avatar text-color="cyan-8" icon="mail_outline" />
              </q-item-section>
              <q-item-section>
                {{ $t('notice') }}
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable @click="changePwd" v-ripple>
              <q-item-section avatar>
                <q-avatar text-color="cyan-8" :icon="passwordIcon" />
              </q-item-section>
              <q-item-section>
                {{ $t('modify-password') }}
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable @click="contact" v-ripple>
              <q-item-section avatar>
                <q-avatar text-color="cyan-8" icon="phone" />
              </q-item-section>
              <q-item-section>
                {{ $t('contact') }}
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable @click="logout" v-ripple>
              <q-item-section avatar>
                <q-avatar text-color="cyan-8" icon="logout" />
              </q-item-section>
              <q-item-section>
                {{ $t('logout') }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>
    <q-drawer
        v-model="drawer"
        show-if-above
        :breakpoint="400"
      >
      <q-scroll-area style="height: calc(100% - 150px); margin-top: 150px; border-right: 1px solid #ddd">
        <q-list bordered class="rounded-borders">
          <q-item
            active-class="tab-active"
            to="/"
            exact
            class="navigation-item text-right"
            clickable
            v-ripple
          >
            <q-item-section avatar>
              <q-icon name="home"/>
            </q-item-section>

            <q-item-section>
              {{ $t('home') }}
            </q-item-section>
          </q-item>
          <q-separator />
          <q-expansion-item :label="$t('basic-data-management')" :default-opened="$route.path.startsWith('/basic-')" group="menu">
            <q-item
              active-class="tab-active"
              to="/basic-project"
              class="navigation-item text-right"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="code"/>
              </q-item-section>

              <q-item-section>
                {{ $t('workspace') }}
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/basic-datasource"
              class="navigation-item text-right"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="datasourceIcon"/>
              </q-item-section>

              <q-item-section>
                {{ $t('datasource') }}
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/basic-attachment"
              class="navigation-item text-right"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="downloadIcon"/>
              </q-item-section>

              <q-item-section>
                {{ $t('download') }}
              </q-item-section>
            </q-item>
          </q-expansion-item>
          <q-separator />
          <q-expansion-item :label="$t('etl-management')" group="menu" :default-opened="$route.path.startsWith('/etl-')">
            <q-item
              active-class="tab-active"
              to="/etl-designer"
              class="navigation-item text-right"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="design_services"/>
              </q-item-section>

              <q-item-section>
                {{ $t('online-design') }}
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/etl-publish"
              class="navigation-item text-right"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="publishIcon"/>
              </q-item-section>

              <q-item-section>
              {{ $t('etl-publish') }}
              </q-item-section>
            </q-item>
          </q-expansion-item>
          <q-separator />
          <q-expansion-item :label="$t('task-management')" group="menu" :default-opened="$route.path.startsWith('/task-')">
            <q-item
              active-class="tab-active"
              to="/task-batch"
              exact
              class="navigation-item text-right"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="taskIcon"/>
              </q-item-section>

              <q-item-section>
              {{ $t('batch-task') }}
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/task-streaming"
              exact
              class="navigation-item text-right"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="rotate_right"/>
              </q-item-section>

              <q-item-section>
              {{ $t('streaming-task') }}
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/task-process"
              exact
              class="navigation-item text-right"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="settings_power"/>
              </q-item-section>

              <q-item-section>
              {{ $t('task-process') }}
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/task-log"
              exact
              class="navigation-item text-right"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="logIcon"/>
              </q-item-section>

              <q-item-section>
              {{ $t('log-server') }}
              </q-item-section>
            </q-item>
          </q-expansion-item>
          <q-separator />
          <q-expansion-item :label="$t('bi-management')" group="menu" :default-opened="$route.path.startsWith('/analysis-')">
            <q-item
              active-class="tab-active"
              to="/analysis-model"
              class="navigation-item text-right"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="table_view"/>
              </q-item-section>

              <q-item-section>
              {{ $t('model-design') }}
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/analysis-report"
              class="navigation-item text-right"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="show_chart"/>
              </q-item-section>

              <q-item-section>
              {{ $t('report-setting') }}
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/analysis-layout"
              class="navigation-item text-right"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="layoutIcon"/>
              </q-item-section>

              <q-item-section>
              {{ $t('layout-setting') }}
              </q-item-section>
            </q-item>
          </q-expansion-item>
          <q-separator />
          <q-expansion-item :label="$t('system-setting')" group="menu" :default-opened="$route.path.startsWith('/system-')">
            <q-item
              active-class="tab-active"
              to="/workspace-member"
              class="navigation-item text-right"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="memberIcon"/>
              </q-item-section>

              <q-item-section>
              {{ $t('workspace-member') }}
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/user-setting"
              class="navigation-item text-right"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="settingIcon"/>
              </q-item-section>

              <q-item-section>
              {{ $t('user-setting') }}
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/system-metrics"
              exact
              class="navigation-item text-right"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="speed"/>
              </q-item-section>

              <q-item-section>
              {{ $t('system-metrics') }}
              </q-item-section>
            </q-item>
          </q-expansion-item>
          <q-separator />
          <q-expansion-item :label="$t('dashboard')">
            <q-item
              active-class="tab-active"
              :to="'/screen/' + layout.id"
              class="navigation-item text-right"
              clickable
              v-ripple
               v-for="layout in layouts" :key="layout.id"
            >
              <q-item-section avatar>
                <q-icon name="dashboard"/>
              </q-item-section>

              <q-item-section>
                {{layout.name}}
              </q-item-section>
            </q-item>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>

      <q-img class="absolute-top" src="images/bg_profile.png" style="height: 150px">
        <div class="absolute-bottom bg-transparent">
          <q-avatar size="56px" class="q-mb-sm">
            <img src="images/boy-avatar.png">
          </q-avatar>
          <div class="text-weight-bold">{{me.name}}</div>
          <div>{{me.tenant}} - {{me.username}}</div>
        </div>
      </q-img>
    </q-drawer>
    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
import { me, changePwd } from '../service/AuthService'
import {
  mdiAlphabeticalVariant,
  mdiCalendarMonthOutline,
  mdiDownloadOutline,
  mdiTextBoxOutline,
  mdiCogOutline,
  mdiPowershell,
  mdiDatabase,
  mdiAccountGroup,
  mdiMonitorScreenshot
} from '@quasar/extras/mdi-v5'
import { show } from 'src/service/LayoutService'
export default {
  name: 'MainLayout',
  data () {
    return {
      drawer: false,
      passwordIcon: mdiAlphabeticalVariant,
      taskIcon: mdiCalendarMonthOutline,
      downloadIcon: mdiDownloadOutline,
      logIcon: mdiTextBoxOutline,
      settingIcon: mdiCogOutline,
      publishIcon: mdiPowershell,
      datasourceIcon: mdiDatabase,
      memberIcon: mdiAccountGroup,
      layoutIcon: mdiMonitorScreenshot,
      me: {
        name: '',
        tenant: '',
        username: ''
      },
      layouts: []
    }
  },
  methods: {
    changePwd () {
      const vm = this
      vm.$q.dialog({
        title: 'Prompt',
        message: '请出入新密码',
        prompt: {
          type: 'text'
        },
        cancel: true,
        persistent: true
      }).onOk(data => {
        changePwd({
          username: vm.me.username,
          password: data
        }).then(res => {
          vm.$q.notify({
            position: 'top',
            message: '设置成功.',
            color: 'positive'
          })
        })
      })
    },
    contact () {
      this.$q.dialog({
        title: '联络方式',
        message: '<p>邮箱地址：<a href="mailto:jesse.18@163.com">联系我们</a></p><p>微信：<img src="/images/contact.jpeg" width="150px" height="150px"/></p>',
        html: true
      })
    },
    logout () {
      this.$q.localStorage.remove('token')
      this.$router.push('/login')
    },
    showDoc () {
      this.$router.push('/document')
      this.tab = ''
    }
  },
  mounted () {
    console.log(this.$i18n)
    me().then(res => {
      this.me = Object.assign({
        name: '',
        tenant: '',
        username: ''
      }, res.data)
    })
    show({}).then(res => {
      this.layouts = res.data
    })
  }
}
</script>
<style>
.tab-active {
  color: rgb(0, 137, 123);
}
</style>
