<template>
  <div>
    <q-table grid :data="table.data" :loading="table.loading" :columns="table.columns" row-key="id" :filter="table.filter" @request="searchUsers"
             :no-data-label="$t('table.empty')" :rows-per-page-options="[18,36,60]" :pagination.sync="table.pagination">
      <template v-slot:top-left>
        <q-input borderless v-model="table.filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="las la-search" color="primary"/>
          </template>
        </q-input>
      </template>
      <template v-slot:top-right>
        <q-btn outline :label="$t('button.create')" color="primary" @click="newUser"/>
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
              <q-btn outline dense color="primary" @click="loadUser(props)">{{ $t('button.modify') }}</q-btn>
              <q-btn outline dense color="orange" @click="viewResource(props)">{{ $t('button.viewGrant') }}</q-btn>
              <q-btn outline dense color="negative" @click="deleteUser(props)">{{ $t('button.delete') }}</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </template>
    </q-table>
    <q-dialog v-model="editUserDialog.state">
      <q-card style="width: 400px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.user.default') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-form @submit="submitForm">
          <q-card-section class="q-col-gutter-xs">
            <q-input outlined v-model="user.name" :label="$t('form.user.name')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.project.name')]"/>
            <q-input outlined v-model="user.email" :label="$t('form.user.email')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.project.name')]"/>
            <q-radio v-model="user.gender" val="F" :label="$t('form.user.gender.F')" />
            <q-radio v-model="user.gender" val="M" :label="$t('form.user.gender.M')" />
            <q-input outlined v-model="user.mobile" :label="$t('form.user.mobile')" hint=""/>
            <q-input outlined v-model="user.wechat" :label="$t('form.user.wechat')" hint=""/>
            </q-card-section>
          <q-card-actions align="right">
            <q-btn type="submit" :label="$t('button.save')" outline color="primary" icon="las la-save"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="viewResourceDialog.state">
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.user.resource') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-card-section class="q-col-gutter-xs">
          <q-table
            :data="resources"
            :columns="resourceColumns"
            row-key="id"
            hide-bottom
          >
          <template #body-cell-action="props">
            <q-td :props="props" color="primary" class="q-gutter-sm">
              <a href="javascript:;" style="text-decoration: none; color: orange;" @click="deletePrivilege(props)">{{ $t('button.delete') }}</a>
            </q-td>
          </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="successDialogState.state" position="top">
      <q-card>
        <q-linear-progress :value="0.6" color="pink" />
        <q-card-section class="row items-center no-wrap">
          <div>
            <span class="text-weight-bold">{{ $t('response.success.save') }}</span>,<a href="#" @click="$router.push(successDialogState.targetUrl)" style="text-decoration: none; color: teal;">{{ $t('message.confirm.route', [$t('menu.auth.privilege')]) }}</a>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { fetchUsers, fetchUser, saveUser } from 'src/service/auth/UserService'
import { fetchResources } from 'src/service/auth/ResourceService'
import {deleteGrantUsers} from 'src/service/auth/PrivilegeService'
export default {
  name: 'User',
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
            name: 'mobile',
            label: this.$t('table.user.mobile'),
            field: 'mobile',
            align: 'left'
          },
          {
            name: 'wechat',
            label: this.$t('table.user.wechat'),
            field: 'wechat',
            align: 'left'
          }
        ]
      },
      editUserDialog: {
        state: false
      },
      user: {
        id: null,
        name: null,
        email: null,
        gender: null,
        mobile: null,
        wechat: null
      },
      viewResourceDialog: {
        state: false
      },
      resources: [],
      resourceColumns: [
        {
          name: 'code',
          label: this.$t('table.resource.code'),
          field: 'code',
          align: 'left'
        },
        {
          name: 'name',
          label: this.$t('table.resource.name'),
          field: 'name',
          align: 'left'
        },
        {
          name: 'category',
          label: this.$t('table.resource.category.default'),
          field: 'category',
          align: 'left',
          format: (val, row) => this.$t('table.resource.category.' + val)
        },
        {
          name: 'action',
          label: this.$t('table.privilege.action')
        }
      ],
      successDialogState: {
        state: false,
        targetUrl: null
      }
    }
  },
  methods: {
    searchUsers (e) {
        const vm = this
        vm.table.loading = true
        const query = {
          payload: vm.table.filter,
          pageNo: e.pagination.page,
          pageSize: e.pagination.rowsPerPage
        }
      fetchUsers(query).then(res => {
        vm.table.data = res.data.items
        vm.table.pagination = Object.assign(e.pagination, {
          rowsNumber: res.data.total
        })
        this.table.loading = false
      })
    },
    loadUser (props) {
      const vm = this
      fetchUser(props.key).then(res => {
        vm.editUserDialog.state = true
        vm.user = res.data
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
    newUser () {
      this.editUserDialog.state = true
      Object.assign(this.user, this.$options.data.call(this).user)
    },
    submitForm () {
      const vm = this
      saveUser(vm.user).then(res => {
        vm.searchUsers()
        vm.editUserDialog.state = false
        Object.assign(this.user, vm.$options.data.call(this).user)
        vm.successDialogState = {
          state: true,
          targetUrl: '/auth-privilege'
        }
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
    },
    deleteUser (props) {
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
        deleteUser(props.key).then(() => {
          vm.searchUsers()
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
    viewResource(prop) {
      const vm = this
      vm.user = Object.assign(vm.user, {
        id: prop.key
      })
      vm.viewResourceDialog.state = true
      vm.showResources(prop.key)
    },
    deletePrivilege (props) {
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
        deleteGrantUsers(props.row.category, props.row.level, props.row.code, vm.user.id).then(() => {
          vm.showResources(vm.user.id)
          vm.$q.notify({
            message: vm.$t('response.success.delete'),
            position: 'top',
            color: 'teal'
          })
        }).catch(err => {
          if (err.status === 10002) {
            vm.$q.notify({
              message: vm.$t('response.error.10003'),
              position: 'top',
              color: 'negative'
            })
          } else if (err.status === 10015) {
            vm.$q.notify({
              message: this.$t('response.error.10015'),
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
    showResources (userId) {
      const vm = this
      vm.resources = []
      fetchResources(userId).then(res => {
        vm.resources = res.data
      }).catch(err => {
        vm.$q.notify({
          message: err.data.error,
          position: 'top',
          color: 'negative'
        })
      })
    }
  },
  mounted () {
    this.searchUsers(this.table)
  }
}
</script>
