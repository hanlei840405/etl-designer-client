<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-input outlined v-model="form.name" :label="$t('form.detectEmptyStream.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
  </q-form>
  </div>
</template>

<script>

export default {
  name: 'DetectEmptyStreamMeta',
  data () {
    return {
      form: {
        name: null,
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
