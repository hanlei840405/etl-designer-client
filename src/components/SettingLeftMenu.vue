<template>
  <div>
    <q-drawer
      v-model="state"
      show-if-above
      bordered
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
            <q-item
              active-class="tab-active"
              to="/"
              exact
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="home"/>
              </q-item-section>

              <q-item-section>
                首页
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/batch"
              exact
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="taskIcon"/>
              </q-item-section>

              <q-item-section>
                批处理任务
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/streaming"
              exact
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="rotate_right"/>
              </q-item-section>

              <q-item-section>
                流处理任务
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/process"
              exact
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="settings_power"/>
              </q-item-section>

              <q-item-section>
                进程管理
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/log"
              exact
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="logIcon"/>
              </q-item-section>

              <q-item-section>
                日志跟踪
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/metrics"
              exact
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="speed"/>
              </q-item-section>

              <q-item-section>
                集群性能
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/attachment"
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="downloadIcon"/>
              </q-item-section>

              <q-item-section>
                下载中心
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/project"
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="code"/>
              </q-item-section>

              <q-item-section>
                工作区管理
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/datasource"
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="datasourceIcon"/>
              </q-item-section>

              <q-item-section>
                数据源管理
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/publish"
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="publishIcon"/>
              </q-item-section>

              <q-item-section>
                发版管理
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/member"
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="memberIcon"/>
              </q-item-section>

              <q-item-section>
                成员管理
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/setting"
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon :name="settingIcon"/>
              </q-item-section>

              <q-item-section>
                用户管理
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </div>
    </q-drawer>
    <q-page-container>
      <router-view/>
    </q-page-container>
  </div>
</template>

<script>
import {
  mdiCalendarMonthOutline,
  mdiDownloadOutline,
  mdiTextBoxOutline,
  mdiCogOutline,
  mdiPowershell,
  mdiDatabase,
  mdiAccountGroup
} from '@quasar/extras/mdi-v5'
export default {
  name: 'SettingLeftMenu',
  data () {
    return {
      state: false,
      taskIcon: mdiCalendarMonthOutline,
      downloadIcon: mdiDownloadOutline,
      logIcon: mdiTextBoxOutline,
      settingIcon: mdiCogOutline,
      publishIcon: mdiPowershell,
      datasourceIcon: mdiDatabase,
      memberIcon: mdiAccountGroup
    }
  },
  methods: {
    openOrCloseLeftMenu () {
      this.state = !this.state
    }
  },
  mounted () {
    this.$router.push('/')
  }
}
</script>
