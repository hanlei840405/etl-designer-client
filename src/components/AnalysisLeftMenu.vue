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
              to="/model"
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="code"/>
              </q-item-section>

              <q-item-section>
                模型设计
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/report"
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="show_chart"/>
              </q-item-section>

              <q-item-section>
                统计设置
              </q-item-section>
            </q-item>
            <q-item
              active-class="tab-active"
              to="/layout"
              class="q-ma-sm navigation-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="dashboard_customize"/>
              </q-item-section>

              <q-item-section>
                布局设置
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
  name: 'AnalysisLeftMenu',
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
