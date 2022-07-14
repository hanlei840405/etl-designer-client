<template>
  <div class="fullscreen" style="background: linear-gradient(45deg, rgba(35, 136, 219, 0.90) 15%, rgba(99, 99, 99, 0.90) 100%); ">
    <div class="text-white text-center q-pa-md fixed fixed-center">
      <q-card square class="shadow-24" style="width: 85vw; max-width: 450px;">
        <q-card-section  class="bg-grey-4 text-cyan-8">
          <div class="text-h3 text-left">
            <q-avatar>
              <img src="/logo.png">
            </q-avatar>
            {{ $t('app') }}</div>
          <div class="text-subtitle1 text-right text-bold">BY NXIN</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="onSubmit" class="q-px-sm q-pt-xl q-pb-lg">
            <q-input
              filled
              v-model="loginForm.username"
              color="cyan-8"
              :label="$t('form-email')"
              lazy-rules
              :rules="[ val => val && val.length > 0 || 'Please type something']"
            />
            <q-input
              filled
              type="password"
              color="cyan-8"
              v-model="loginForm.password"
              :label="$t('form-password')"
              lazy-rules
              :rules="[ val => val && val.length > 0 || 'Please type something']"
            />
            <q-btn type="submit" unelevated size="lg" color="cyan-8" class="full-width text-white" :label="$t('btn-login')" />
            <div class=" text-right">
              <a href="#/forgot" class="text-grey-6">{{ $t('btn-forgot-password') }}</a><a href="#/register" class="text-grey-6" style="margin-left: 10px;">{{ $t('btn-register') }}</a>
              <q-btn-dropdown class="text-grey-6" auto-close stretch flat size="md" :label="$t('language')" no-caps>
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
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
    <a class="text-white text-center fixed fixed-bottom" href="https://beian.miit.gov.cn/" target="_blank">京ICP备20031222号-1</a>
  </div>
</template>

<script>
import { login } from '../service/AuthService'
export default {
  name: 'Login',
  data () {
    return {
      loginForm: {
        username: null,
        password: null
      }
    }
  },
  methods: {
    onSubmit () {
      const vm = this
      login(vm.loginForm).then(res => {
        this.$q.localStorage.set('token', res.data.token)
        this.$q.localStorage.set('authorities', res.data.authorities.join(','))
        vm.$router.push('/')
      }).catch(err => {
        if (err.status === 10004) {
          vm.$q.notify({
            position: 'top',
            message: vm.$t('response-error-10004'),
            color: 'negative'
          })
        } else if (err.status === 10005) {
          vm.$q.notify({
            position: 'top',
            message: vm.$t('response-error-10005'),
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
  },
  mounted () {
    this.$i18n.locale = this.$q.lang.getLocale()
  }
}
</script>
