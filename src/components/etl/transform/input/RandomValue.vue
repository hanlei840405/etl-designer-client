<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-input outlined text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="form.name" label="步骤名称" lazy-rules
               :rules="[ val => val && val.length > 0 || 'Please type something']"/>
      <q-table :data="form.parameters" :columns="parameterColumns" :rows-per-page-options="[0]" row-key="name"
               separator="cell" hide-bottom title="字段">
        <template v-slot:top-right>
          <q-btn size="sm" outline text-color="cyan-8" icon="add" @click="addParameter"/>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="operate" :props="props">
              <q-btn size="xs" outline round color="negative" icon="remove"
                     @click="deleteParameter(props)"></q-btn>
            </q-td>
            <q-td key="field" :props="props">
              {{ props.row.field }}
              <q-popup-edit v-model="props.row.field" :auto-save=true>
                <q-input autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" v-model="props.row.field"/>
              </q-popup-edit>
            </q-td>
            <q-td key="category" :props="props">
              {{ getLabel(props.row.category) }}
              <q-popup-edit v-model="props.row.category" :auto-save=true>
                <q-select autofocus text-color="cyan-8" color="cyan-8" label-color="cyan-8" outlined v-model.number="props.row.category" emit-value map-options :options="categories"/>
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
  name: 'RandomValueMeta',
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
          label: '操作',
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'field',
          label: '字段',
          field: 'field',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'category',
          label: '类型',
          field: 'category',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      categories: [
        { value: 1, label: '随机数字' },
        { value: 2, label: '随机整数' },
        { value: 3, label: '随机字符串' },
        { value: 4, label: 'UUID' },
        { value: 5, label: 'UUID4' },
        { value: 6, label: 'MD5' },
        { value: 7, label: 'SHA1' }
      ],
      categoryMapping: {
        1: '随机数字',
        2: '随机整数',
        3: '随机字符串',
        4: 'UUID',
        5: 'UUID4',
        6: 'MD5',
        7: 'SHA1'
      }
    }
  },
  methods: {
    addParameter () {
      this.form.parameters.push({
        field: null,
        category: 2
      })
    },
    deleteParameter (props) {
      this.form.parameters.splice(props.rowIndex, 1)
    },
    getLabel (val) {
      return this.categoryMapping[val]
    },
    submitForm () {
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
