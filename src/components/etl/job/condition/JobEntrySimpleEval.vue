<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
        <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" :label="$t('form-name')" lazy-rules :rules="[ val => val && val.length > 0 || 'Please type something']"/>
        <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.mode" :options="modes" :label="$t('form-evaluate')" emit-value map-options></q-select>
        <br/>
        <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.fieldName" :label="$t('form-field-name')" v-show="form.mode === 'field'"/>
        <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.variableName" :label="$t('form-variable-name')" v-show="form.mode === 'variable'"/>
        <br/>
        <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.category" :options="categories"  :label="$t('form-category')"></q-select>
        <br/>
        <q-select outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.condition" :options="conditions" emit-value map-options :label="$t('form-success-on-variable')"></q-select>
        <br/>
        <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.value" :label="$t('form-success-value')" v-show="form.condition !== 'between' && form.category !== 'Boolean'"/>
        <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.min" :label="$t('form-min-value')" v-show="form.condition === 'between'"/>
        <br/>
        <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.max" :label="$t('form-max-value')" v-show="form.condition === 'between'"/>
        <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.success" :label="$t('form-success-on-variable')" v-show="form.mode === 'variable'"/>
        <q-checkbox text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.parallel" :label="$t('form-parallel')"/>
    </q-form>
  </div>
</template>

<script>

export default {
  name: 'JobEntrySimpleEval',
  data () {
    return {
      form: {
        name: null,
        mode: 'variable',
        fieldName: null,
        variableName: null,
        category: null,
        success: false,
        condition: null,
        value: null,
        min: null,
        max: null,
        parallel: false
      },
      modes: [
        { value: 'variable', label: this.$t('form-evaluate-variable') },
        { value: 'field', label: this.$t('form-evaluate-previous') }
      ],
      categories: ['String', 'Number', 'Date time', 'Boolean'],
      conditions: []
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
  watch: {
    'form.category' (newValue) {
      if (newValue === 'String') {
        this.conditions = [
          { value: 'equal', label: this.$t('form-success-condition-equal') },
          { value: 'different', label: this.$t('form-success-condition-different') },
          { value: 'contains', label: this.$t('form-success-condition-contains') },
          { value: 'notcontains', label: this.$t('form-success-condition-notcontains') },
          { value: 'startswith', label: this.$t('form-success-condition-startswith') },
          { value: 'notstatwith', label: this.$t('form-success-condition-notstatwith') },
          { value: 'endswith', label: this.$t('form-success-condition-endswith') },
          { value: 'notendwith', label: this.$t('form-success-condition-notendwith') },
          { value: 'regexp', label: this.$t('form-success-condition-regexp') },
          { value: 'inlist', label: this.$t('form-success-condition-inlist') },
          { value: 'notinlist', label: this.$t('form-success-condition-notinlist') }
        ]
      } else if (newValue === 'Number' || newValue === 'Date time') {
        this.conditions = [
          { value: 'equal', label: this.$t('form-success-condition-equal') },
          { value: 'different', label: this.$t('form-success-condition-different') },
          { value: 'smaller', label: this.$t('form-success-condition-smaller') },
          { value: 'smallequal', label: this.$t('form-success-condition-smallequal') },
          { value: 'greater', label: this.$t('form-success-condition-greater') },
          { value: 'greaterequal', label: this.$t('form-success-condition-greaterequal') },
          { value: 'between', label: this.$t('form-success-condition-between') },
          { value: 'inlist', label: this.$t('form-success-condition-inlist') },
          { value: 'notinlist', label: this.$t('form-success-condition-notinlist') }
        ]
      } else {
        this.conditions = [
          { value: 'true', label: this.$t('form-success-condition-true') },
          { value: 'false', label: this.$t('form-success-condition-false') }
        ]
      }
      this.form.condition = null
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
