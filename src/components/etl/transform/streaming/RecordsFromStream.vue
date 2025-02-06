<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-input outlined v-model="form.name" :label="$t('form.recordsFromStream.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
      <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.recordsFromStream.tableField')">
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
            <q-td key="category" :props="props">
              {{ props.row.category }}
              <q-popup-edit v-model="props.row.category" :auto-save="true">
                <q-select autofocus outlined v-model="props.row.category" :options="categories"/>
              </q-popup-edit>
            </q-td>
            <q-td key="lengthValue" :props="props">
              {{ props.row.lengthValue }}
              <q-popup-edit type="number" v-model.number="props.row.lengthValue" :auto-save="true">
                <q-input autofocus outlined type="number" v-model.number="props.row.lengthValue"/>
              </q-popup-edit>
            </q-td>
            <q-td key="accuracy" :props="props">
              {{ props.row.accuracy }}
              <q-popup-edit type="number" v-model.number="props.row.accuracy" :auto-save="true">
                <q-input autofocus outlined type="number" v-model.number="props.row.accuracy"/>
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
  name: 'RecordsFromStreamMeta',
  data () {
    return {
      form: {
        name: null,
        limit: 1,
        parameters: [],
        distribute: true
      },
      parameterColumns: [
        {
          name: 'operate',
          label: this.$t('form.recordsFromStream.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: this.$t('form.recordsFromStream.columnName'),
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'category',
          label: this.$t('form.recordsFromStream.columnType'),
          field: 'category',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'lengthValue',
          label: this.$t('form.recordsFromStream.columnLength'),
          field: 'lengthValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'accuracy',
          label: this.$t('form.recordsFromStream.columnAccuracy'),
          field: 'accuracy',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp']
    }
  },
  methods: {
    addParameter () {
      this.form.parameters.push({
        field: null,
        category: 'String',
        lengthValue: -1,
        accuracy: -1
      })
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    submitForm () {
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: { sourceFields: this.form.parameters.map(ele => ele.field) }
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
