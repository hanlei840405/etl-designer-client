<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
        <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" :label="$t('form-name')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
        <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.script" type="textarea" rows="20" label="JavaScript" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"></q-input>
        <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.parallel" :label="$t('form-parallel')"/>
    </q-form>
  </div>
</template>

<script>

export default {
  name: 'JobEntryEval',
  data () {
    return {
      form: {
        name: null,
        script: null,
        parallel: false
      }
    }
  },
  methods: {
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form
      })
    }
  },
  mounted () {
    const vm = this
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
  }
}
</script>
