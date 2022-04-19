<template>
  <div class="fullscreen text-white text-center q-pa-md flex flex-center" style="background: linear-gradient(45deg, rgba(35, 136, 219, 0.90) 15%, rgba(99, 99, 99, 0.90) 100%); ">
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
            v-model="forgotForm.name"
            color="cyan-8"
            :label="$t('form-name')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          />
          <q-input
            filled
            v-model="forgotForm.email"
            color="cyan-8"
            :label="$t('form-email')"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please type something']"
          />
          <q-btn type="submit" unelevated size="lg" color="cyan-8" class="full-width text-white" :label="$t('btn-get-back-password')"/>
          <p class="text-right"><a href="#/login" class="text-grey-6">{{ $t('btn-back') }}</a><a href="#/register" class="text-grey-6" style="margin-left: 10px;">{{ $t('btn-register') }}</a></p>
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
          title: vm.$t('response-operate-success'),
          message: vm.$t('message-verification-code')
        })
        vm.$router.push('/reset')
      }).catch(err => {
        if (err.status === 10011) {
          vm.$q.notify({
            message: vm.$t('dialog-message-not-found'),
            position: 'top',
            color: 'negative'
          })
        } else if (err.status === 10001) {
          vm.$q.notify({
            message: vm.$t('dialog-message-not-found'),
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
