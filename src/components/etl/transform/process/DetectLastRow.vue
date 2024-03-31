<template>
  <div style="width: 100%;">
    <q-form class="row q-col-gutter-xs">
      <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.detectLastRow.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
      <q-input class="col-12 col-md-6" outlined v-model="form.endName" :label="$t('form.detectLastRow.endName')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
  </q-form>
  </div>
</template>

<script>

export default {
  name: 'DetectLastRowMeta',
  data () {
    return {
      form: {
        name: null,
        endName: null,
        distribute: true
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
