<template>
  <q-layout view="hHh Lpr fFf">
    <q-header elevated class="bg-grey-4 text-black">
      <q-toolbar>
        <q-btn flat @click="collapseDrawer" round dense>
          <q-avatar>
            <img src="/logo.png">
          </q-avatar>
        </q-btn>
        <q-toolbar-title class="text-cyan-8 text-bold">
          新恩数造
        </q-toolbar-title>
        <q-tabs v-model="tab" shrink inline-label outside-arrows mobile-arrows>
          <q-route-tab name="home" :class="tab === 'home' ? 'text-cyan-8' : ''" label="首页" :icon="homeIcon" to="/"/>
          <q-route-tab name="task" :class="tab === 'task' ? 'text-cyan-8' : ''" label="任务调度" :icon="taskIcon" to="/task"/>
          <q-route-tab name="designer" :class="tab === 'designer' ? 'text-cyan-8' : ''" label="在线设计" icon="design_services" to="/designer"/>
          <q-route-tab name="project" :class="tab === 'project' ? 'text-cyan-8' : ''" label="项目管理" icon="code" to="/project"/>
          <q-route-tab name="attachment" :class="tab === 'attachment' ? 'text-cyan-8' : ''" label="下载中心" :icon="downloadIcon" to="/attachment"/>
          <q-route-tab name="log" :class="tab === 'log' ? 'text-cyan-8' : ''" label="日志跟踪" :icon="logIcon" to="/log"/>
          <q-route-tab name="metrics" :class="tab === 'metrics' ? 'text-cyan-8' : ''" label="集群性能" icon="speed" to="/metrics"/>
          <q-route-tab name="settings" :class="tab === 'settings' ? 'text-cyan-8' : ''" label="系统管理" :icon="settingIcon" to="/setting"/>
<!--          <q-route-tab name="analysis" icon="leaderboard" label="数据分析" to="/analysis"/>-->
        </q-tabs>
        <q-space />
        <q-btn-dropdown auto-close stretch flat size="md" icon="person_outline" :label="me" no-caps>
          <q-list>
            <q-item clickable @click="showDoc" v-ripple>
              <q-item-section avatar>
                <q-avatar text-color="cyan-8" icon="help_outline" />
              </q-item-section>
              <q-item-section>
                帮助文档
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-ripple>
              <q-item-section avatar>
                <q-avatar text-color="cyan-8" icon="mail_outline" />
              </q-item-section>
              <q-item-section>
                消息通知
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable @click="changePwd" v-ripple>
              <q-item-section avatar>
                <q-avatar text-color="cyan-8" :icon="passwordIcon" />
              </q-item-section>
              <q-item-section>
                修改密码
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable @click="contact" v-ripple>
              <q-item-section avatar>
                <q-avatar text-color="cyan-8" icon="phone" />
              </q-item-section>
              <q-item-section>联系作者</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable @click="logout" v-ripple>
              <q-item-section avatar>
                <q-avatar text-color="cyan-8" icon="logout" />
              </q-item-section>
              <q-item-section>退出</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view ref="mainRouter"/>
    </q-page-container>
  </q-layout>
</template>

<script>
import { me, changePwd } from '../service/AuthService'
import { mdiAlphabeticalVariant, mdiHomeOutline, mdiCalendarMonthOutline, mdiDownloadOutline, mdiTextBoxOutline, mdiCogOutline } from '@quasar/extras/mdi-v5'
export default {
  name: 'MainLayout',
  data () {
    return {
      tab: 'home',
      leftDrawerOpen: false,
      leftComponentName: null,
      passwordIcon: mdiAlphabeticalVariant,
      homeIcon: mdiHomeOutline,
      taskIcon: mdiCalendarMonthOutline,
      downloadIcon: mdiDownloadOutline,
      logIcon: mdiTextBoxOutline,
      settingIcon: mdiCogOutline,
      me: null
    }
  },
  methods: {
    collapseDrawer () {
      this.$refs.mainRouter.drawer = !this.$refs.mainRouter.drawer
    },
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
          username: vm.me,
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
    me().then(res => {
      this.me = res.data.username
    })
  }
}
</script>
