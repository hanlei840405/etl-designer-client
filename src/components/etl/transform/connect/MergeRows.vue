<template>
  <div style="width: 100%;">
    <q-form class="row q-col-gutter-xs">
      <q-input class="col-12 col-md-6" outlined v-model="form.name" :label="$t('form.mergeRows.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
      <q-select class="col-12 col-md-6" clearable outlined v-model="form.oldDatasource" :options="previousSteps" emit-value map-options :label="$t('form.mergeRows.oldDatasource')" :hint="$t('etl.component.notice.MergeRowsMeta.default')"/>
      <q-select class="col-12 col-md-6" clearable outlined v-model="form.newDatasource" :options="previousSteps" emit-value map-options :label="$t('form.mergeRows.newDatasource')" :hint="$t('etl.component.notice.MergeRowsMeta.default')"/>
      <q-input class="col-12 col-md-6" outlined v-model="form.flagField" :label="$t('form.mergeRows.flagField')" :hint="$t('etl.component.notice.MergeRowsMeta.flagField')"/>
      <q-table class="col-12 col-md-6" :data="form.keys" :columns="keyColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.mergeRows.keyField')">
        <template v-slot:top-right>
          <q-btn-dropdown split outline color="primary" icon="add" @click="addKey">
            <q-list>
              <q-item clickable v-close-popup @click="appendKey">
                <q-item-section>
                  <q-item-label>{{ $t('button.append') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="addAllKey">
                <q-item-section>
                  <q-item-label>{{ $t('button.addAll') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="clearAndAddKey">
                <q-item-section>
                  <q-item-label>{{ $t('button.removeAndAdd') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="operate" :props="props">
              <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteKey(props)"></q-btn>
            </q-td>
            <q-td key="field" :props="props">
              {{ props.row.field }}
              <q-popup-edit v-model="props.row.field" :auto-save="true" >
                <q-select autofocus outlined v-model="props.row.field" :options="fields"/>
              </q-popup-edit>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <q-table class="col-12 col-md-6" :data="form.values" :columns="valueColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.mergeRows.valueField')">
        <template v-slot:top-right>
          <q-btn-dropdown split outline color="primary" icon="add" @click="addValue">
            <q-list>
              <q-item clickable v-close-popup @click="appendValue">
                <q-item-section>
                  <q-item-label>{{ $t('button.append') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="addAllValue">
                <q-item-section>
                  <q-item-label>{{ $t('button.addAll') }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="clearAndAddValue">
                <q-item-section>
                  <q-item-label>{{ $t('button.removeAndAdd') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="operate" :props="props">
              <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteValue(props)"></q-btn>
            </q-td>
            <q-td key="field" :props="props">
              {{ props.row.field }}
              <q-popup-edit v-model="props.row.field" :auto-save="true" >
                <q-select autofocus outlined v-model="props.row.field" :options="fields"/>
              </q-popup-edit>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-form>
  </div>
</template>

<script>


const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SetValueFieldMeta']
export default {
  name: 'MergeRowsMeta',
  data() {
    return {
      form: {
        name: null,
        oldDatasource: null,
        newDatasource: null,
        flagField: 'flagField',
        keys: [],
        values: [],
      },
      keyColumns: [
        {
          name: 'operate',
          label: this.$t('form.mergeRows.columnOperate'),
          filed: 'operate',
          align: 'left',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.mergeRows.field'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 150px;'
        }
      ],
      valueColumns: [
        {
          name: 'operate',
          label: this.$t('form.mergeRows.columnOperate'),
          filed: 'operate',
          align: 'left',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.mergeRows.field'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 150px;'
        }
      ],
      stepFields: {},
      fields: [],
      previousSteps: [],
    }
  },
  methods: {
    submitForm () {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: {
          sourceFields: [this.form.flagField]
        }
      })
    },
    deleteKey(props) {
      this.form.keys.splice(props.rowIndex, 1)
    },
    deleteValue(props) {
      this.form.values.splice(props.rowIndex, 1)
    },
    addKey() {
      this.form.keys.push({
        field: null,
      })
    },
    addValue() {
      this.form.values.push({
        field: null,
      })
    },
    appendKey() {
      const copyFields = [...this.fields]
      this.form.keys.forEach(item => {
        copyFields.splice(copyFields.findIndex(i => i === item.field), 1)
      })
      copyFields.forEach(field => {
        this.form.keys.push({
          field: field
        })
      })
    },
    appendValue() {
      const copyFields = [...this.fields]
      this.form.values.forEach(item => {
        copyFields.splice(copyFields.findIndex(i => i === item.field), 1)
      })
      copyFields.forEach(field => {
        this.form.values.push({
          field: field
        })
      })
    },
    addAllKey() {
      this.fields.forEach(field => {
        this.form.keys.push({
          field: field
        })
      })
    },
    addAllValue() {
      this.fields.forEach(field => {
        this.form.values.push({
          field: field
        })
      })
    },
    clearAndAddKey() {
      this.form.keys = []
      this.addAllKey()
    },
    clearAndAddValue() {
      this.form.values = []
      this.addAllValue()
    },
  },
  watch: {
    'form.oldDatasource' (val) {
      if (val) {
        this.fields = this.stepFields[this.form.oldDatasource]
      } else {
        this.fields = []
      }
    }
  },
  mounted() {
    const previousSteps = this.$store.getters['etl/getPreNodes']
    this.previousSteps = []
    const replaceFields = []
    const vm = this
    vm.previousSteps = []
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach((step, i) => {
        if (i === 0 && FORBIDDEN_NEXT_STEP_PARALLEL.indexOf(step.type) >= 0) {
          vm.forbiddenParallel = true
        }
        if (step.depth === 0) {
          const ext = JSON.parse(step.ext)
          if (ext.sourceFields && ext.sourceFields.length > 0) {
            vm.previousSteps.push({ value: step.value, label: step.title })
            vm.stepFields[step.value] = []
            ext.sourceFields.forEach(field => {
              vm.stepFields[step.value].push(field)
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
    let duplicated = false
    for (const step in vm.stepFields) {
      const temp = [...vm.stepFields[step]]
      replaceFields.forEach(field => {
        if (temp.indexOf(field) > -1) {
          temp.splice(temp.indexOf(field), 1)
        }
      })
      if (new Set(temp).size !== temp.length) {
        duplicated = true
        break
      }
    }
    if (duplicated) {
      vm.$q.dialog({
        dark: true,
        title: vm.$t('message.error.default'),
        message: this.$t('message.error.duplicateSourceField')
      }).onOk(() => {
        this.$emit('propertiesForm', {
          state: true,
          mxCellProperties: this.form,
          ext: {
            stepFields: []
          }
        })
      })
    }
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      if (vm.form.name !== mxCellValue.name) {
        vm.form = Object.assign(vm.form, mxCellValue)
      }
    }
  }
}
</script>
