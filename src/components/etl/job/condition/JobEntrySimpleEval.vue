<template>
  <div style="width: 100%;">
    <q-form class="row q-col-gutter-xs">
        <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.jobEntrySimpleEval.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
        <q-select class="col-12 col-md-6" outlined v-model="form.mode" :options="modes" :label="$t('form.jobEntrySimpleEval.evaluate')" emit-value map-options hint=""></q-select>
        <q-input class="col-12 col-md-6" outlined v-model="form.fieldName" :label="$t('form.jobEntrySimpleEval.fieldName')" v-show="form.mode === 'field'" hint=""/>
        <q-input class="col-12 col-md-6" outlined v-model="form.variableName" :label="$t('form.jobEntrySimpleEval.variableName')" v-show="form.mode === 'variable'" hint=""/>
        <q-select class="col-12 col-md-6" outlined v-model="form.category" :options="categories"  :label="$t('form.jobEntrySimpleEval.category')" hint=""></q-select>
        <q-select class="col-12 col-md-6" outlined v-model="form.condition" :options="conditions" emit-value map-options :label="$t('form.jobEntrySimpleEval.successCondition')" hint=""></q-select>
        <q-input class="col-12 col-md-6" outlined v-model="form.value" :label="$t('form.jobEntrySimpleEval.successValue')" v-show="form.condition !== 'between' && form.category !== 'Boolean'" hint=""/>
        <q-input class="col-12 col-md-6" outlined v-model="form.min" :label="$t('form.jobEntrySimpleEval.minValue')" v-show="form.condition === 'between'" hint=""/>
        <q-input class="col-12 col-md-6" outlined v-model="form.max" :label="$t('form.jobEntrySimpleEval.maxValue')" v-show="form.condition === 'between'" hint=""/>
        <q-checkbox class="col-12 col-md-3" v-model="form.success" :label="$t('form.jobEntrySimpleEval.successOnVariable')" v-show="form.mode === 'variable'"/>
        <q-checkbox class="col-12 col-md-3" v-model="form.parallel" :label="$t('form.jobEntrySimpleEval.parallel')"/>
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
        { value: 'variable', label: this.$t('form.jobEntrySimpleEval.evaluateVariable') },
        { value: 'field', label: this.$t('form.jobEntrySimpleEval.evaluatePrevious') }
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
          { value: 'equal', label: this.$t('form.jobEntrySimpleEval.successConditionEqual') },
          { value: 'different', label: this.$t('form.jobEntrySimpleEval.successConditionDifferent') },
          { value: 'contains', label: this.$t('form.jobEntrySimpleEval.successConditionContains') },
          { value: 'notcontains', label: this.$t('form.jobEntrySimpleEval.successConditionNotcontains') },
          { value: 'startswith', label: this.$t('form.jobEntrySimpleEval.successConditionStartswith') },
          { value: 'notstatwith', label: this.$t('form.jobEntrySimpleEval.successConditionNotstatwith') },
          { value: 'endswith', label: this.$t('form.jobEntrySimpleEval.successConditionEndswith') },
          { value: 'notendwith', label: this.$t('form.jobEntrySimpleEval.successConditionNotendwith') },
          { value: 'regexp', label: this.$t('form.jobEntrySimpleEval.successConditionRegexp') },
          { value: 'inlist', label: this.$t('form.jobEntrySimpleEval.successConditionInlist') },
          { value: 'notinlist', label: this.$t('form.jobEntrySimpleEval.successConditionNotinlist') }
        ]
      } else if (newValue === 'Number' || newValue === 'Date time') {
        this.conditions = [
          { value: 'equal', label: this.$t('form.jobEntrySimpleEval.successConditionEqual') },
          { value: 'different', label: this.$t('form.jobEntrySimpleEval.successConditionDifferent') },
          { value: 'smaller', label: this.$t('form.jobEntrySimpleEval.successConditionSmaller') },
          { value: 'smallequal', label: this.$t('form.jobEntrySimpleEval.successConditionSmallequal') },
          { value: 'greater', label: this.$t('form.jobEntrySimpleEval.successConditionGreater') },
          { value: 'greaterequal', label: this.$t('form.jobEntrySimpleEval.successConditionGreaterequal') },
          { value: 'between', label: this.$t('form.jobEntrySimpleEval.successConditionBetween') },
          { value: 'inlist', label: this.$t('form.jobEntrySimpleEval.successConditionInlist') },
          { value: 'notinlist', label: this.$t('form.jobEntrySimpleEval.successConditionNotinlist') }
        ]
      } else {
        this.conditions = [
          { value: 'true', label: this.$t('form.jobEntrySimpleEval.successConditionTrue') },
          { value: 'false', label: this.$t('form.jobEntrySimpleEval.successConditionFalse') }
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
