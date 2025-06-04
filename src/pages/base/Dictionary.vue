<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" hide-header :filter="table.filter" @request="searchDictionaries" 
    :no-data-label="$t('table.empty')" :rows-per-page-options="[18,36,60]" :pagination.sync="table.pagination">
      <template v-slot:top-right>
        <q-input round flat dense v-model="table.filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="las la-search" color="primary"/>
          </template>
        </q-input>
        <q-btn outline :label="$t('button.create')" color="primary" @click="newDictionary"/>
      </template>
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-md-2 grid-style-transition">
          <q-card>
            <q-separator color="primary" size="2px"/>
            <q-card-section>
              <q-list dense>
                <q-item v-for="col in props.cols" :key="col.name">
                  <q-item-section>
                    <q-item-label caption lines="1" class="text-primary">{{ col.label }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label caption lines="1">{{ col.value }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            <q-separator color="primary" size="2px"/>
            <q-card-actions align="right" class="q-gutter-sm">
              <q-btn outline dense color="primary" @click="loadDictionary(props)">{{ $t('button.modify') }}</q-btn>
              <q-btn outline dense color="negative" @click="deleteDictionary(props)">{{ $t('button.delete') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
    <q-dialog v-model="editDictionaryDialog.state">
      <q-card style="width: 800px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.dictionary.default') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-form @submit="submitForm">
          <q-card-section class="row q-col-gutter-xs">
            <q-input class="col-12 col-md-6" outlined v-model="dictionary.code" :label="$t('form.dictionary.code')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.dictionary.name')]"/>
            <q-input class="col-12 col-md-6" outlined v-model="dictionary.name" :label="$t('form.dictionary.name')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.dictionary.name')]"/>
            <q-input class="col-12" outlined type="textarea" v-model="dictionary.description" :label="$t('form.dictionary.description')" hint=""/>
          </q-card-section>
          <q-card-section>
            <q-table :data="dictionary.dictionaryItemList" :columns="dictionaryItemColumns" :rows-per-page-options="[0]" row-key="id" separator="cell" hide-bottom :title="$t('form.dictionary.tableField')">
              <template v-slot:top-right>
              <q-btn-dropdown split outline color="primary" icon="add" @click="addDictionaryItem">
                <q-list>
                  <q-item clickable v-close-popup @click="add10DictionaryItem">
                    <q-item-section>
                      <q-item-label>{{ $t('button.append10') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              </template>
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="operate" :props="props">
                    <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteDictionaryItem(props)"></q-btn>
                  </q-td>
                  <q-td key="name" :props="props">
                    {{ props.row.name }}
                    <q-popup-edit v-model="props.row.name" :auto-save="true">
                      <q-input autofocus outlined v-model="props.row.name"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="value" :props="props">
                    {{ props.row.value }}
                    <q-popup-edit v-model="props.row.value" :auto-save="true">
                      <q-input autofocus outlined v-model="props.row.value"/>
                    </q-popup-edit>
                  </q-td>
                  <q-td key="description" :props="props">
                    {{ props.row.description }}
                    <q-popup-edit v-model="props.row.description" :auto-save="true">
                      <q-input autofocus outlined v-model="props.row.description"/>
                    </q-popup-edit>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn type="submit" :label="$t('button.save')" outline color="primary" icon="las la-save"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import {fetchDictionaries, fetchDictionary, saveDictionary, deleteDictionary
} from 'src/service/base/DictionaryService'
export default {
  name: 'Dictionary',
  data () {
    return {
      table: {
        filter: null,
        loading: false,
        data: [],
        pagination: {
          page: 1,
          rowsPerPage: 18,
          rowsNumber: 10
        },
        columns: [
          {
            name: 'code',
            label: this.$t('table.dictionary.code'),
            field: 'code',
            align: 'left'
          },
          {
            name: 'name',
            label: this.$t('table.dictionary.name'),
            field: 'name',
            align: 'left'
          },
          {
            name: 'description',
            label: this.$t('table.dictionary.description'),
            field: 'description',
            align: 'left'
          }
        ],
      },
      editDictionaryDialog: {
        state: false
      },
      dictionary: {
        id: null,
        code: null,
        name: null,
        description: null,
        dictionaryItemList: []
      },
      dictionaryItemColumns: [
        {
          name: 'operate',
          label: this.$t('form.dictionary.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'name',
          label: this.$t('form.dictionary.columnName'),
          field: 'name',
          align: 'left'
        },
        {
          name: 'value',
          label: this.$t('form.dictionary.columnValue'),
          field: 'value',
          align: 'left'
        },
        {
          name: 'description',
          label: this.$t('form.dictionary.columnDescription'),
          field: 'description',
          align: 'left'
        },
      ],
    }
  },
  methods: {
    searchDictionaries () {
      this.table.loading = true
      const query = {
        payload: this.table.filter,
        pageNo: this.table.pagination.page,
        pageSize: this.table.pagination.rowsPerPage
      }
      fetchDictionaries(query).then(res => {
        this.table.data = res.data.items
        this.table.pagination = Object.assign(this.table.pagination, {
          rowsNumber: res.data.total
        })
        this.table.loading = false
      })
    },
    loadDictionary (props) {
      const vm = this
      fetchDictionary(props.key).then(res => {
        vm.editDictionaryDialog.state = true
        vm.dictionary = res.data
      }).catch(err => {
        if (err.status === 10002) {
          vm.$q.notify({
            message: this.$t('response.error.10002'),
            position: 'top',
            color: 'negative'
          })
        } else {
          vm.$q.notify({
            message: err.data.error,
            position: 'top',
            color: 'negative'
          })
        }
      })
    },
    newDictionary () {
      this.editDictionaryDialog.state = true
      Object.assign(this.dictionary, this.$options.data.call(this).dictionary)
    },
    submitForm () {
      const vm = this
      saveDictionary(vm.dictionary).then(res => {
        vm.searchDictionaries()
        vm.editDictionaryDialog.state = false
        Object.assign(this.dictionary, vm.$options.data.call(this).dictionary)
        this.$q.notify({
          message: this.$t('response.success.save'),
          position: 'top',
          color: 'teal'
        })
      }).catch(err => {
        if (err.status === 10002) {
          vm.$q.notify({
            message: vm.$t('response.error.10002'),
            position: 'top',
            color: 'negative'
          })
        } else {
          vm.$q.notify({
            message: err.data.error,
            position: 'top',
            color: 'negative'
          })
        }
      })
    },
    deleteDictionary (props) {
      const vm = this
      vm.$q.dialog({
        title: vm.$t('message.confirm.default'),
        message: vm.$t('message.confirm.delete'),
        cancel: {
          textColor: 'primary',
          outline: true
        },
        ok: {
          textColor: 'negative',
          outline: true
        },
        persistent: true
      }).onOk(() => {
        deleteDictionary(props.key).then(() => {
          vm.searchDictionaries()
          vm.$q.notify({
            message: this.$t('response.success.delete'),
            position: 'top',
            color: 'teal'
          })
        }).catch(err => {
          if (err.status === 10003) {
            vm.$q.notify({
              message: vm.$t('response.error.10003'),
              position: 'top',
              color: 'negative'
            })
          } else {
            vm.$q.notify({
              message: err.data.error,
              position: 'top',
              color: 'negative'
            })
          }
        })
      })
    },
    addDictionaryItem () {
      this.dictionary.dictionaryItemList.push({
          name: null,
          value: null,
          description: null,
      })
    },
    add10DictionaryItem () {
      for (let i = 0; i < 10; i++) {
        this.dictionary.dictionaryItemList.push({
          name: null,
          value: null,
          description: null,
        })
      }
    },
    deleteDictionaryItem (props) {
      this.dictionary.dictionaryItemList.splice(props.rowIndex, 1)
    },
  },
  mounted () {
    this.searchDictionaries()
  }
}
</script>
