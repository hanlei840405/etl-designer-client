<template>
  <div style="width: 100%;">
    <q-form class="row q-col-gutter-xs">
      <q-input class="col-12" outlined v-model="form.name" :label="$t('form.filterRows.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>

      <q-select class="col-12 col-md-6" outlined v-model="form.sendTrueTo" clearable :options="nextSteps" map-options emit-value :label="$t('form.filterRows.stepTrue')" hint=""/>
      <q-select class="col-12 col-md-6" outlined v-model="form.sendFalseTo" clearable :options="nextSteps" map-options emit-value :label="$t('form.filterRows.stepFalse')" hint=""/>
      <q-tree :nodes="form.conditions" node-key="id" :selected.sync="selected" default-expand-all>
        <template v-slot:header-root="prop">
          <div class="row items-center">
            <div>
              {{ prop.node.label }}
              <q-btn-group outline>
                <q-btn dense outline :label="$t('button.append')" color="primary" @click="appendCondition(prop)"/>
              </q-btn-group>
            </div>
          </div>
        </template>
        <template v-slot:header-node="prop">
          <div class="row items-center">
            <div>
              {{ prop.node.label }}
              <q-btn-group outline>
                <q-btn dense outline :label="$t('button.append')" color="primary" @click="appendCondition(prop)"/>
                <q-btn dense outline :label="$t('button.modify')" color="dark" @click="modifyCondition(prop)"/>
                <q-btn dense outline :label="$t('button.delete')" color="negative" @click="deleteCondition(prop)"/>
              </q-btn-group>
            </div>
          </div>
        </template>
        <template v-slot:default-body="prop">
          <span v-if="prop.node.config" class="text-weight-light text-black">{{ $t('form.filterRows.function') }}: {{ prop.node.config.function }},<span v-if="prop.node.config.rightValuename" class="text-weight-light text-black">{{ $t('form.filterRows.columnName') }}: {{ prop.node.config.rightValuename }},</span><span v-if="prop.node.config.value" class="text-weight-light text-black">{{ $t('form.filterRows.value') }}: {{ prop.node.config.value }},</span>{{ $t('form.filterRows.category') }}: {{ prop.node.config.category }},{{ $t('form.filterRows.negate') }}: {{ prop.node.config.negate }}</span>
        </template>
      </q-tree>
      <q-dialog v-model="conditionDialog.state">
      <q-card style="width: 35vw; max-width: 50vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.filterRows.conditionDialogTitle') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section class="row q-col-gutter-xs">
          <q-select class="col-12 col-md-4" autofocus outlined v-model="conditionDialog.condition.leftValuename" :label="$t('form.filterRows.columnName')" :options="sourceFields" hint=""/>
          <q-select class="col-12 col-md-4" autofocus outlined v-model="conditionDialog.condition.function" :label="$t('form.filterRows.function')" :options="functions" hint=""/>
          <q-select class="col-12 col-md-4" autofocus outlined v-model="conditionDialog.condition.rightValuename" :label="$t('form.filterRows.columnName')" clearable :options="sourceFields" hint=""/>
          <q-input class="col-12 col-md-4" outlined v-model="conditionDialog.condition.value" :label="$t('form.filterRows.value')" hint=""/>
          <q-select class="col-12 col-md-4" autofocus outlined v-model="conditionDialog.condition.category" :label="$t('form.filterRows.category')" :options="categories" hint=""/>
          <q-select class="col-12 col-md-4" autofocus outlined v-model="conditionDialog.condition.negate" :label="$t('form.filterRows.negate')" :options="negates" hint=""/>
          <q-select class="col-12 col-md-4" autofocus outlined v-model="conditionDialog.condition.format" :label="$t('form.filterRows.format')" :options="formats[conditionDialog.condition.category]" hint=""/>
          <q-input class="col-12 col-md-4" outlined type="number" v-model.number="conditionDialog.condition.lengthValue" :label="$t('form.filterRows.length')" hint=""/>
          <q-input class="col-12 col-md-4" outlined type="number" v-model.number="conditionDialog.condition.accuracy" :label="$t('form.filterRows.accuracy')" hint=""/>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn type="button" :label="$t('button.save')" outline color="primary" icon="las la-save" @click="saveCondition"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    </q-form>
  </div>
</template>

<script>

const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'SetValueFieldMeta']
export default {
  name: 'FilterRowsMeta',
  data() {
    return {
      form: {
        initFlag: true,
        fieldMappingData: [],
        sendTrueTo: null,
        sendFalseTo: null,
        conditions: [
          {
            id: 0,
            label: this.$t('form.filterRows.conditionColumn'),
            header: 'root',
            expandable: true,
            children: []
          }
        ]
      },
      selected: null,
      selectNode: {},
      conditionDialog: {
        state: false,
        action: 'add',
        condition: {
          negate: 'N',
          leftValuename: null,
          function: null,
          rightValuename: null,
          value: null,
          category: 'String',
          lengthValue: -1,
          accuracy: -1,
          format: null
        }
      },
      sourceFields: [],
      nextSteps: [],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      negates: ['Y', 'N'],
      operators: ['AND','OR','OR NOT','AND NOT','XOR'],
      functions: ['=', '<>', '<', '<=', '>', '>=', 'REGEXP', 'IS NULL', 'IS NOT NULL', 'IN LIST', 'CONTAINS', 'STARTS WITH', 'ENDS WITH', 'LIKE', 'TRUE'],
      formats: {
        'Date': ['yyyy/MM/dd HH:mm:ss.SSS', 'yyyy/MM/dd HH:mm:ss.SSS XXX', 'yyyy/MM/dd HH:mm:ss', 'yyyy/MM/dd HH:mm:ss XXX', 'yyyyMMddHHmmss', 'yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm:ss XXX',
                'yyyyMMdd', 'MM/dd/yyyy', 'MM/dd/yyyy HH:mm:ss', 'MM-dd-yyyy', 'MM-dd-yyyy HH:mm:ss', 'MM/dd/yy', 'MM-dd-yy', 'dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX', 'yyyy-MM-dd HH:mm:ss.SSS'],
        'Integer': ['#,##0.###', '0.00', '0000000000000', '#.#', '#', '###,###,###.#', '#######.###', '#####.###%'],
        'Number': ['#,##0.###', '0.00', '0000000000000', '#.#', '#', '###,###,###.#', '#######.###', '#####.###%'],
        'BigNumber': [],
        'Binary': [],
        'Boolean': [],
        'Internet Address': [],
        'String': [],
        'Timestamp': []
      }
    }
  },
  methods: {
    submitForm() {
      //条件重组
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
      })
    },
    appendCondition (prop) {
      this.selectNode = prop
      Object.assign(this.conditionDialog, this.$options.data.call(this).conditionDialog)
      this.conditionDialog.state = true
    },
    modifyCondition (prop) {
      this.selectNode = prop
      this.conditionDialog.action = 'modify'
      this.conditionDialog.condition = prop.node.config
      this.conditionDialog.state = true
    },
    deleteCondition (prop) {
      this.deleteChild(this.form.conditions[0].children, prop.node.id)
    },
    deleteChild(children, key) {
      children.forEach(node => {
        if (node.id === key) {
          children.splice(children.findIndex((item) =>item.id === node.id), 1)
        } else {
          this.deleteChild(node.children, key)
        }
      })
    },
    saveCondition () {
      if (this.conditionDialog.action === 'add') {
        this.selectNode.node.children.push({
          id: Date.now(),
          label: this.conditionDialog.condition.leftValuename,
          header: 'node',
          expandable: true,
          children: [],
          config: this.conditionDialog.condition
        })
      } else {
        this.selectNode.node = Object.assign(this.selectNode.node, {
          label: this.conditionDialog.condition.leftValuename,
          config: this.conditionDialog.condition
        })
      }
      this.conditionDialog.state = false
      this.selectNode.tree.expandAll()
    }
  },
  mounted() {
    const vm = this
    const previousSteps = vm.$store.getters['etl/getPreNodes']
    vm.sourceFields = []
    const replaceFields = []
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach((step, i) => {
        if (i === 0 && FORBIDDEN_NEXT_STEP_PARALLEL.indexOf(step.type) >= 0) {
          vm.forbiddenParallel = true
        }
        if (step.ext !== undefined && step.ext !== 'undefined' && IGNORE_REPEAT_WARNING_META.indexOf(step.type) < 0) {
          const ext = JSON.parse(step.ext)
          if (ext.sourceFields) {
            ext.sourceFields.forEach(field => {
              vm.sourceFields.push(field)
            })
          }
          if (ext.replaceFields) {
            ext.replaceFields.forEach(field => {
              replaceFields.push(field)
            })
          }
        }
      })
    }
    replaceFields.forEach(field => {
      vm.sourceFields.splice(vm.sourceFields.indexOf(field), 1)
    })
    if (new Set(vm.sourceFields).size !== vm.sourceFields.length) {
      vm.$q.dialog({
        dark: true,
        title: vm.$t('message.error.default'),
        message: this.$t('message.error.duplicateSourceField')
      }).onOk(() => {
        this.$emit('propertiesForm', {
          state: true,
          mxCellProperties: this.form,
          ext: {
            sourceFields: []
          }
        })
      })
    }
    const nextSteps = vm.$store.getters['etl/getNextNodes']
    vm.nextSteps = []
    if (nextSteps && nextSteps.length > 0) {
      nextSteps.forEach(step => {
        vm.nextSteps.push({ value: step.value, label: step.title })
      })
    }
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
  }
}
</script>
