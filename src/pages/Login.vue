<template>
  <div class="fullscreen" style="background: linear-gradient(45deg, rgba(35, 136, 219, 0.90) 15%, rgba(99, 99, 99, 0.90) 100%); ">
    <div class="text-white text-center q-pa-md fixed fixed-center">
      <q-card square class="shadow-24" style="width: 85vw; max-width: 450px;">
        <q-card-section class="bg-grey-4 text-cyan-8">
          <div class="text-h4 text-left">
            <q-avatar>
              <img src="/logo.png">
            </q-avatar>
            {{ $t('global.app') }}</div>
          <div class="text-subtitle1 text-right">{{ $t('global.author') }}</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="onSubmit" class="q-px-sm q-pt-xl q-pb-lg">
            <q-input
              filled
              v-model="loginForm.username"
              color="cyan-8"
              :label="$t('login.email')"
              lazy-rules
              :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('login.email')]"
            />
            <q-input
              filled
              type="password"
              v-model="loginForm.password"
              color="cyan-8"
              :label="$t('login.password')"
              lazy-rules
              :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('login.password')]"
            />
            <q-btn type="submit" unelevated size="lg" color="cyan-8" class="full-width text-white" :label="$t('login.submit')" />
            <div class="text-right">
              <a href="#/forgot" class="text-cyan-8">{{ $t('login.forget') }}</a><a href="#/register" class="text-cyan-8" style="margin-left: 10px;">{{ $t('login.register') }}</a>
              <q-btn-dropdown class="text-cyan-8" auto-close stretch flat size="md" :label="$t('global.language')" no-caps>
                <q-list class="text-cyan-8">
                  <q-item clickable @click="$i18n.locale = 'en-us'" v-ripple>
                    <q-item-section>
                    {{ $t('global.en') }}
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable @click="$i18n.locale = 'zh-cn'" v-ripple>
                    <q-item-section>
                    {{ $t('global.zh') }}
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { Cookies } from 'quasar'
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
        Cookies.set('token', res.data.token)
        Cookies.set('authorities', res.data.authorities)
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
