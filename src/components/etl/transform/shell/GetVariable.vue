<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-input outlined v-model="form.name" :label="$t('form.getVariable.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
      <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.getVariable.argument')">
        <template v-slot:top-right>
          <q-btn size="sm" outline color="primary" icon="add" @click="addParameter"/>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="operate" :props="props">
              <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteParameter(props)"></q-btn>
            </q-td>
            <q-td key="field" :props="props">
              {{ props.row.field }}
              <q-popup-edit v-model="props.row.field" :auto-save="true">
                <q-input autofocus outlined v-model="props.row.field"/>
              </q-popup-edit>
            </q-td>
            <q-td key="variable" :props="props">
              {{ props.row.variable }}
              <q-popup-edit v-model="props.row.variable" :auto-save="true">
                <q-input autofocus outlined v-model="props.row.variable"/>
              </q-popup-edit>
            </q-td>
            <q-td key="category" :props="props">
              {{ props.row.category }}
              <q-popup-edit v-model="props.row.category" :auto-save="true">
                <q-select autofocus outlined v-model="props.row.category" :options="categories"/>
              </q-popup-edit>
            </q-td>
            <q-td key="formatValue" :props="props">
              {{ props.row.formatValue }}
              <q-popup-edit v-model="props.row.formatValue" :auto-save="true">
                <q-input autofocus outlined v-model="props.row.formatValue"/>
              </q-popup-edit>
            </q-td>
            <q-td key="lengthValue" :props="props">
              {{ props.row.lengthValue }}
              <q-popup-edit v-model.number="props.row.lengthValue" :auto-save="true">
                <q-input autofocus outlined v-model.number="props.row.lengthValue"/>
              </q-popup-edit>
            </q-td>
            <q-td key="accuracy" :props="props">
              {{ props.row.accuracy }}
              <q-popup-edit v-model.number="props.row.accuracy" :auto-save="true">
                <q-input autofocus outlined v-model.number="props.row.accuracy"/>
              </q-popup-edit>
            </q-td>
            <q-td key="currency" :props="props">
              {{ props.row.currency }}
              <q-popup-edit v-model="props.row.currency" :auto-save="true">
                <q-input autofocus outlined v-model="props.row.currency"/>
              </q-popup-edit>
            </q-td>
            <q-td key="decimal" :props="props">
              {{ props.row.decimal }}
              <q-popup-edit v-model="props.row.decimal" :auto-save="true">
                <q-input autofocus outlined v-model="props.row.decimal"/>
              </q-popup-edit>
            </q-td>
            <q-td key="groupBy" :props="props">
              {{ props.row.groupBy }}
              <q-popup-edit v-model="props.row.groupBy" :auto-save="true">
                <q-input autofocus outlined v-model="props.row.groupBy"/>
              </q-popup-edit>
            </q-td>
            <q-td key="trimValue" :props="props">
              {{ props.row.trimValue }}
              <q-popup-edit v-model="props.row.trimValue" :auto-save="true">
                <q-select autofocus outlined v-model="props.row.trimValue" :options="trimValues"/>
              </q-popup-edit>
            </q-td>
          </q-tr>
        </template>
      </q-table>
  </q-form>
  </div>
</template>

<script>
export default {
  name: 'GetVariableMeta',
  data () {
    return {
      form: {
        name: null,
        parameters: [],
        distribute: true
      },
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('form.getVariable.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.getVariable.columnFfield'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'variable',
          label: this.$t('form.getVariable.columnVariable'),
          field: 'variable',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'category',
          label: this.$t('form.getVariable.columnType'),
          field: 'category',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'formatValue',
          label: this.$t('form.getVariable.columnFormat'),
          field: 'formatValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'lengthValue',
          label: this.$t('form.getVariable.columnLength'),
          field: 'lengthValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'accuracy',
          label: this.$t('form.getVariable.columnAccuracy'),
          field: 'accuracy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'currency',
          label: this.$t('form.getVariable.columnCurrencyFormat'),
          field: 'currency',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'decimal',
          label: this.$t('form.getVariable.columnDecimal'),
          field: 'decimal',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'groupBy',
          label: this.$t('form.getVariable.columnGroup'),
          field: 'groupBy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'trimValue',
          label: this.$t('form.getVariable.columnTrimBlank'),
          field: 'trimValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      trimValues: ['none', 'left', 'right', 'both']
    }
  },
  methods: {
    addParameter () {
      this.form.parameters.push({
        field: null,
        category: 'String',
        formatValue: null,
        lengthValue: -1,
        accuracy: -1,
        currency: null,
        decimal: null,
        groupBy: null,
        emptyValue: null
      })
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    submitForm (e) {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: {
          sourceFields: this.form.parameters.map(ele => ele.field)
        }
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
