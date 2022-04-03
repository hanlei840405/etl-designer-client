<template>
  <div class="fullscreen text-white text-center q-pa-md flex flex-center" style="background: linear-gradient(45deg, rgba(35, 136, 219, 0.90) 15%, rgba(99, 99, 99, 0.90) 100%); ">
    <q-card square class="shadow-24" style="width: 85vw; max-width: 450px;">
      <q-card-section  class="bg-grey-4 text-cyan-8">
        <div class="text-h3 text-left">
          <q-avatar>
            <img src="/logo.png">
          </q-avatar>
          新恩数造</div>
        <div class="text-subtitle1 text-right text-bold">BY NXIN</div>
      </q-card-section>
      <q-card-section>
        <q-form @submit="onSubmit" class="q-px-sm q-pt-xl q-pb-lg">
          <q-input
            filled
            v-model="forgotForm.name"
            color="cyan-8"
            label="姓名 *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          />
          <q-input
            filled
            v-model="forgotForm.email"
            color="cyan-8"
            label="注册邮箱 *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          />
          <q-btn type="submit" unelevated size="lg" color="cyan-8" class="full-width text-white" label="找回密码"/>
          <p class="text-right"><a href="#/login" class="text-grey-6">返回登录</a><a href="#/register" class="text-grey-6" style="margin-left: 10px;">注册账号</a></p>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { forgot } from '../service/AuthService'
export default {
  name: 'Login',
  data () {
    return {
      forgotForm: {
        name: null,
        email: null
      }
    }
  },
  methods: {
    onSubmit () {
      const vm = this
      forgot(vm.forgotForm).then(() => {
        vm.$q.dialog({
          title: '找回成功',
          message: '请前往注册邮箱查看验证码'
        })
        vm.$router.push('/reset')
      }).catch(err => {
        if (err.status === 10011) {
          vm.$q.notify({
            message: '用户名与密码不匹配!',
            position: 'top',
            color: 'negative'
          })
        } else if (err.status === 10001) {
          vm.$q.notify({
            message: '用户名不存在!',
            position: 'top',
            color: 'negative'
          })
        } else {
          vm.$q.notify({
            position: 'top',
            message: err.data.error,
            color: 'negative'
          })
        }
      })
    }
  }
}
</script>
