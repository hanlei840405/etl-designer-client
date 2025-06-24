<template>
    <div>
      <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" :filter="table.filter" @request="searchPrivileges"
               :no-data-label="$t('table.empty')" :rows-per-page-options="[18,36,60]" :pagination.sync="table.pagination" selection="multiple" :selected.sync="table.selected">
        <template v-slot:top-left>
          <q-input borderless debounce="300" v-model="table.filter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="las la-search" color="primary"/>
            </template>
          </q-input>
        </template>
        <template v-slot:top-right>
          <q-btn v-if="table.selected.length > 0" outline :label="$t('button.grant')" color="negative" @click="(e) => openGrantDialog(e, false)"/>
        </template>
        <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-4 col-md-2 grid-style-transition">
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
              <q-checkbox dense v-model="props.selected" />
              <q-btn outline dense color="primary" @click="openGrantDialog(props, true)">{{ $t('button.grant') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </template>
      </q-table>
      <q-dialog v-model="addUserDialog.state">
        <q-card style="width: 500px; max-width: 80vw;">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ $t('form.project.member') }}</div>
            <q-space/>
            <q-btn icon="close" flat round dense v-close-popup/>
          </q-card-section>
          <q-card-section class="q-col-gutter-xs">
            <q-select
              filled
              clearable
              v-model="addUserDialog.user"
              hide-selected
              use-input
              fill-input
              :label="$t('form.project.select.member')"
              :options="addUserDialog.memberOption"
              option-label="name"
              @filter="filterUser"
              @input="addUser"
            >
            </q-select>
            <q-table
              :data="users"
              :columns="userColumns"
              row-key="id"
              hide-bottom
            >
              <template #body-cell-action="props">
                <q-td :props="props" class="q-gutter-sm">
                  <a href="javascript:;" style="text-decoration: none; color: orange;" @click="deleteUser(props)">{{ $t('button.delete') }}</a>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
          <q-card-actions align="right">
          <q-btn :label="$t('button.grant')" outline color="primary" icon="las la-save" @click="grant"/>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </template>

  <script>
  import { fetchPrivileges, grant, fetchGrantUsers, deletePrivilege } from 'src/service/auth/PrivilegeService'
  import {fetchUsers} from 'src/service/auth/UserService'
  export default {
    name: 'Privilege',
    data () {
      return {
        table: {
          filter: null,
          loading: false,
          pagination: {
            page: 1,
            rowsPerPage: 18,
            rowsNumber: 10
          },
          data: [],
          columns: [
            {
              name: 'name',
              label: this.$t('table.privilege.name'),
              field: 'name',
              align: 'left'
            }, {
              name: 'category',
              label: this.$t('table.privilege.category'),
              field: 'category',
              align: 'left'
            }, {
              name: 'description',
              label: this.$t('table.privilege.description'),
              field: 'description',
              align: 'left'
            }
          ],
          selected: []
        },
        privile: {
          id: null,
          name: null,
          category: null
        },
        addUserDialog: {
          state: false,
          user: null,
          memberOption: []
        },
      users: [],
      userColumns: [
        {
          name: 'name',
          label: this.$t('table.user.name'),
          field: 'name',
          align: 'left'
        },
        {
          name: 'email',
          label: this.$t('table.user.email'),
          field: 'email',
          align: 'left'
        },
        {
          name: 'action',
          label: this.$t('table.privilege.action')
        }
      ]
      }
    },
    methods: {
      searchPrivileges (e) {
        this.table.loading = true
        const query = {
          payload: this.table.filter,
          pageNo: e.pagination.page,
          pageSize: e.pagination.rowsPerPage
        }
        fetchPrivileges(query).then(res => {
          this.table.data = res.data.items
          this.table.pagination = Object.assign(e.pagination, {
            rowsNumber: res.data.total
          })
          this.table.loading = false
        })
      },
      filterUser (val, update) {
        update(() => {
          const needle = val.toLowerCase()
          const vm = this
          fetchUsers({
            payload: needle,
            pageNo: 1,
            pageSize: 1000
          }).then((res) => {
              vm.addUserDialog.memberOption = res.data.items
          })
        })
      },
      openGrantDialog (props, load) {
        if (load) {
          console.log('查询已经分配授权的用户')
          this.users = []
          this.table.selected = []
          this.table.selected.push(props.row)
          this.showGrantUsers(props.key)
        }
        this.addUserDialog.state=true
      },
      addUser (value) {
        if (value && this.users.map(item => item.id).indexOf(value.id) < 0) {
          this.users.push(Object.assign(value, {
            temp: true
          }))
        }
      },
      grant () {
        const vm = this
        const userPrivileges = []
        vm.table.selected.forEach(privilege => {
          vm.users.forEach(user => {
            userPrivileges.push({
              userId: user.id,
              privilegeId: privilege.id
            })
          })
        })
        grant(userPrivileges).then(res => {
          this.users=[]
          vm.addUserDialog.state = false
          vm.$q.notify({
            message: this.$t('response.success.grant'),
            position: 'top',
            color: 'teal'
          })
        })
      },
      deleteUser (props) {
        const vm = this
        if (props.row.temp) {
          vm.users.splice(props.rowIndex, 1)
        } else {
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
            deletePrivilege(vm.table.selected[0].id, props.key).then(() => {
              vm.showGrantUsers(vm.table.selected[0].id)
              vm.$q.notify({
                message: vm.$t('response.success.delete'),
                position: 'top',
                color: 'teal'
              })
            })
          })
        }
      },
      showGrantUsers (privilegeId) {
        const vm = this
        fetchGrantUsers(privilegeId).then((res) => {
          vm.users = res.data
        })
      }
    },
    mounted () {
      this.searchPrivileges(this.table)
    }
  }
  </script>
