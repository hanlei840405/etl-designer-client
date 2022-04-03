<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-grey-4 text-black">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="$refs['leftMenu'].openOrCloseLeftMenu()"
        />
        <q-tabs v-model="tab" shrink inline-label outside-arrows mobile-arrows>
          <q-tab name="setting" label="管理空间" :class="tab === 'setting' ? 'text-cyan-8' : ''" icon="widgets"/>
          <q-tab name="designer" label="设计空间" :class="tab === 'designer' ? 'text-cyan-8' : ''" icon="design_services"/>
          <q-tab name="analysis" label="报表分析" :class="tab === 'analysis' ? 'text-cyan-8' : ''" icon="design_services"/>
        </q-tabs>
        <q-space/>
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
    <setting-left-menu ref="leftMenu" v-if="tab === 'setting'"/>
    <designer-left-menu ref="leftMenu" v-if="tab === 'designer'"/>
    <analysis-left-menu ref="leftMenu" v-if="tab === 'analysis'"/>
  </q-layout>
</template>

<script>
import { me, changePwd } from '../service/AuthService'
import { mdiAlphabeticalVariant } from '@quasar/extras/mdi-v5'
import SettingLeftMenu from 'components/SettingLeftMenu'
import DesignerLeftMenu from '../components/DesignerLeftMenu'
import AnalysisLeftMenu from '../components/AnalysisLeftMenu'
export default {
  name: 'VerticalMainLayout',
  components: {
    SettingLeftMenu,
    DesignerLeftMenu,
    AnalysisLeftMenu
  },
  data () {
    return {
      tab: 'setting',
      passwordIcon: mdiAlphabeticalVariant,
      me: null
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
    if (this.$route.path.startsWith('/designer/')) {
      this.tab = 'designer'
    } else if (this.$route.path.startsWith('/project/')) {
      this.tab = 'project'
    }
  }
}
</script>
<style>
.tab-active {
  color: rgb(0, 137, 123);
}
</style>
