<template>
  <div style="width: 100%;">
    <q-form class="row q-col-gutter-xs">
        <q-input class="col-12" outlined v-model="form.name" :label="$t('form.jobEntryEval.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
        <q-input class="col-12" outlined v-model="form.script" type="textarea" rows="20" label="JavaScript" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""></q-input>
        <q-checkbox class="col-12" v-model="form.parallel" :label="$t('form.jobEntryEval.parallel')"/>
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
