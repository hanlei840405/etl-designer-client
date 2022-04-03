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
            v-model="resetForm.email"
            color="cyan-8"
            label="邮箱 *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          />
          <q-input
            filled
            v-model="resetForm.code"
            color="cyan-8"
            label="验证码 *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          />
          <q-input
            filled
            type="password"
            color="cyan-8"
            v-model="resetForm.password"
            label="新密码 *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          />
          <q-btn type="submit" unelevated size="lg" color="cyan-8" class="full-width text-white" label="重置密码" />
          <p class="text-right"><a href="#/login" class="text-grey-6">返回登录</a><a href="#/register" class="text-grey-6" style="margin-left: 10px;">注册账号</a></p>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { reset } from '../service/AuthService'
export default {
  name: 'Login',
  data () {
    return {
      resetForm: {
        email: null,
        code: null,
        password: null
      }
    }
  },
  methods: {
    onSubmit () {
      const vm = this
      reset(vm.resetForm).then(res => {
        this.$q.localStorage.set('token', res.data.token)
        this.$q.localStorage.set('authorities', res.data.authorities.join(','))
        vm.$router.push('/')
      }).catch(err => {
        if (err.status === 10004) {
          vm.$q.notify({
            position: 'top',
            message: '您的账号被禁用',
            color: 'negative'
          })
        } else if (err.status === 10005) {
          vm.$q.notify({
            position: 'top',
            message: '您的登录信息无效',
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
