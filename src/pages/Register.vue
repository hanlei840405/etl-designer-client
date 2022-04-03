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
        <q-form @submit="onSubmit">
          <q-input
            filled
            v-model="registerForm.company"
            color="cyan-8"
            label="组织 *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          />
          <q-input
            filled
            v-model="registerForm.name"
            color="cyan-8"
            label="姓名 *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          />
          <q-input
            filled
            v-model="registerForm.email"
            color="cyan-8"
            label="邮箱 *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          />
          <q-input
            filled
            type="password"
            color="cyan-8"
            v-model="registerForm.password"
            label="密码 *"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          />
          <q-btn type="submit" unelevated size="lg" color="cyan-8" class="full-width text-white" label="注册" />
          <p class="text-right"><a href="#/login" class="text-grey-6">已有账号</a></p>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { register } from '../service/AuthService'
export default {
  name: 'Register',
  data () {
    return {
      registerForm: {
        company: null,
        name: null,
        email: null,
        password: null
      }
    }
  },
  methods: {
    onSubmit () {
      const vm = this
      register(vm.registerForm).then(res => {
        this.$q.localStorage.set('token', res.data.token)
        this.$q.localStorage.set('authorities', res.data.authorities.join(','))
        vm.$router.push('/')
      }).catch(err => {
        if (err.status === 10006) {
          vm.$q.notify({
            message: '邮箱已被占用!',
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
