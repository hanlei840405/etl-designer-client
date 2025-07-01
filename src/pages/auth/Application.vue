<template>
  <div>
    <q-footer class="bg-grey-2 text-negative">
      <q-tabs v-model="tab" active-color="primary" align="left"
              narrow-indicator>
        <q-tab name="apply" :label="$t('form.application.tabApply')"/>
        <q-tab name="audit" :label="$t('form.application.tabAudit')"/>
      </q-tabs>
    </q-footer>
    <q-separator/>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="apply">
        <q-table :data="applyTable.data" :loading="applyTable.loading" :columns="applyTable.columns" row-key="id" @request="searchApplications"
               :no-data-label="$t('table.empty')" :rows-per-page-options="[10, 50, 100]" :pagination.sync="applyTable.pagination" selection="multiple">
          <template v-slot:top-right>
            <q-btn outline :label="$t('button.apply')" color="primary" @click="newApplication"/>
          </template>
            <template v-slot:body-cell-operate="props">
              <q-td style="padding: 1px;">
                <q-btn outline color="negative" @click="deleteApplication(props.row.id)">{{ $t('button.delete') }}</q-btn>
              </q-td>
            </template>
        </q-table>
      </q-tab-panel>
      <q-tab-panel name="audit">
        <q-table :data="auditTable.data" :loading="auditTable.loading" :columns="auditTable.columns" row-key="id" :filter="auditTable.filter" @request="searchUnAuditApplications"
               :no-data-label="$t('table.empty')" :rows-per-page-options="[10, 50, 100]" :pagination.sync="auditTable.pagination" selection="multiple" :selected.sync="auditTable.selected">
          <template v-slot:top-right>
            <q-input borderless debounce="300" v-model="auditTable.filter" placeholder="Search">
              <template v-slot:append>
                <q-icon name="las la-search" color="primary"/>
              </template>
            </q-input>
            <q-btn-group outline>
              <q-btn v-show="auditTable.selected.length > 0" outline :label="$t('button.audit')" color="primary" @click="auditApplications"/>
              <q-btn v-show="auditTable.selected.length > 0" outline :label="$t('button.reject')" color="orange" @click="rejectApplications"/>
            </q-btn-group>
          </template>
        </q-table>
      </q-tab-panel>
    </q-tab-panels>
    <q-dialog v-model="applicationDialog.state">
      <q-card style="width: 800px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('form.application.apply') }}</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
        <q-form @submit="submitForm">
          <q-table :data="applicationDialog.privilegeTable.data" :loading="applicationDialog.privilegeTable.loading" :columns="applicationDialog.privilegeTable.columns" row-key="id" :no-data-label="$t('table.empty')" hide-bottom :rows-per-page-options="[0]" selection="single" :selected.sync="applicationDialog.privilegeTable.selected">
            <template v-slot:top>
              <q-select style="width: 100%;" v-model="applicationDialog.resourceId" autofocus outlined clearable :options="applicationDialog.resourceOptionsCopy" use-input emit-value map-options @filter="filterResource" @input="selectedResource" @clear="deleteSelectedResource" :label="$t('form.application.resource')" :rules="[ val => validate(val) || $t('validation.notEmpty') + $t('form.application.resource')]" hint="">
              </q-select>
            </template>
          </q-table>
          <q-card-section class="q-col-gutter-xs">
            <q-input outlined v-model="applicationDialog.application.expireDate" :label="$t('form.application.expireDate')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.application.expireDate')]">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                    <q-date v-model="applicationDialog.application.expireDate" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input type="textarea" outlined v-model="applicationDialog.application.reason" :label="$t('form.application.reason')" hint="" :rules="[ val => val && val.length > 0 || $t('validation.notEmpty') + $t('form.application.reason')]"/>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn type="submit" :label="$t('button.apply')" outline color="primary" icon="las la-save"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

  <script>
  import { fetchApplyList, apply, fetchAuditList, audit, deleteApply } from 'src/service/auth/ApplicationService'
  import { fetchPrivilegesByResourceId } from 'src/service/auth/AuthService'
  import { fetchResources } from 'src/service/auth/PrivilegeService'
import { date } from 'quasar'
  export default {
    name: 'Privilege',
    data () {
      return {
        tab: 'apply',
        applyTable: {
          loading: false,
          pagination: {
            page: 1,
            rowsPerPage: 10,
            rowsNumber: 10
          },
          data: [],
          columns: [
            {
              name: 'privilegeName',
              label: this.$t('table.application.privilegeName'),
              field: 'privilegeName',
              align: 'left'
            }, {
              name: 'privilegeCategory',
              label: this.$t('table.application.privilegeCategory'),
              field: 'privilegeCategory',
              align: 'left'
            }, {
              name: 'reason',
              label: this.$t('table.application.reason'),
              field: 'reason',
              align: 'left'
            }, {
              name: 'expireDate',
              label: this.$t('table.application.expireDate'),
              field: 'expireDate',
              align: 'left',
              format: (val) => this.dateFormat(val)
            }, {
              name: 'operate',
              label: this.$t('table.application.operate'),
              field: 'operate',
              align: 'left'
            }
          ]
        },
        auditTable: {
          filter: null,
          loading: false,
          pagination: {
            page: 1,
            rowsPerPage: 10,
            rowsNumber: 10
          },
          data: [],
          columns: [
            {
              name: 'privilegeName',
              label: this.$t('table.application.privilegeName'),
              field: 'privilegeName',
              align: 'left'
            }, {
              name: 'privilegeCategory',
              label: this.$t('table.application.privilegeCategory'),
              field: 'privilegeCategory',
              align: 'left'
            }, {
              name: 'reason',
              label: this.$t('table.application.reason'),
              field: 'reason',
              align: 'left'
            }, {
              name: 'expireDate',
              label: this.$t('table.application.expireDate'),
              field: 'expireDate',
              align: 'left',
              format: (val) => this.dateFormat(val)
            }
          ],
          selected: []
        },
        applicationDialog: {
          state: false,
          resourceId: null,
          resourceOptions: [],
          resourceOptionsCopy: [],
          application: {
            privilegeId: null,
            reason: null,
            expireDate: null
          },
          privilegeTable: {
            loading: false,
            data: [],
            columns: [
              {
                name: 'name',
                label: this.$t('table.application.privilegeName'),
                field: 'name',
                align: 'left'
              }, {
                name: 'category',
                label: this.$t('table.application.privilegeCategory'),
                field: 'category',
                align: 'left'
              }
            ]
          },
        }
      }
    },
    methods: {
      validate (val) {
        return val != null
      },
      searchApplications () {
        this.applyTable.loading = true
        const query = {
          searchAudit: false,
          pageNo: this.applyTable.pagination.page,
          pageSize: this.applyTable.pagination.rowsPerPage
        }
        fetchApplyList(query).then(res => {
          this.applyTable.data = res.data.items
          this.applyTable.pagination = Object.assign(this.applyTable.pagination, {
            rowsNumber: res.data.total
          })
          this.applyTable.loading = false
        })
      },
      searchUnAuditApplications () {
        this.auditTable.loading = true
        const query = {
          searchAudit: true,
          creator: this.auditTable.filter,
          pageNo: this.auditTable.pagination.page,
          pageSize: this.auditTable.pagination.rowsPerPage
        }
        fetchAuditList(query).then(res => {
          this.auditTable.data = res.data.items
          this.auditTable.pagination = Object.assign(this.auditTable.pagination, {
            rowsNumber: res.data.total
          })
          this.auditTable.loading = false
        })
      },
      dateFormat (value, format) {
        const text = date.formatDate(value, format || 'YYYY-MM-DD HH:mm:ss')
        return text
      },
      newApplication () {
        this.applicationDialog.state = true
        this.applicationDialog.resourceId = null
        this.applicationDialog.resourceOptions = []
        this.applicationDialog.resourceOptionsCopy = []
        this.applicationDialog.application.reason = null
        this.applicationDialog.application.expireDate = null
        this.applicationDialog.privilegeTable.data = []
        this.applicationDialog.privilegeTable.selected = []
      },
      deleteApplication (id) {
        this.$q.dialog({
          title: 'Confirm',
          message: this.$t('message.confirm.delete'),
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
          deleteApply(id).then(() => {
            this.searchApplications()
          })
        })
      },
      auditApplications () {
        this.$q.dialog({
          title: 'Confirm',
          message: this.$t('message.confirm.audit'),
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
          const form = {
            applyIdList: this.auditTable.selected.map(item => item.id),
            auditStatus: '1'
          }
          audit(form).then(() => {
            this.searchUnAuditApplications()
            this.$q.notify({
              message: this.$t('response.success.audit'),
              position: 'top',
              color: 'teal'
            })
          })
        })
      },
      rejectApplications () {
        this.$q.dialog({
          title: 'Confirm',
          message: this.$t('message.confirm.audit'),
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
          const form = {
            applyIdList: this.auditTable.selected.map(item => item.id),
            auditStatus: '9'
          }
          audit(form).then(() => {
            this.searchUnAuditApplications()
            this.$q.notify({
              message: this.$t('response.success.audit'),
              position: 'top',
              color: 'teal'
            })
          })
        })
      },
      filterResource (val, update) {
        if (val === '') {
          update(() => {
            this.applicationDialog.resourceOptionsCopy = this.applicationDialog.resourceOptions
          })
          return
        }
        update(() => {
          fetchResources({
            payload: val
          }).then(res => {
            this.applicationDialog.resourceOptions = res.data.map(item => {
              return {  
                label: item.name + ' (' + item.category + ')',
                value: item.id
              }
            }) 
            this.applicationDialog.resourceOptionsCopy = this.applicationDialog.resourceOptions
          })
        })
      },
      selectedResource (val) {
        if (val) {
          fetchPrivilegesByResourceId(val).then(res => {
            this.applicationDialog.privilegeTable.data = res.data
          })
        }
      },
      deleteSelectedResource () {
        this.applicationDialog.privilegeTable.data = []
      },
      submitForm () {
        if (!this.applicationDialog.privilegeTable.selected || this.applicationDialog.privilegeTable.selected.length === 0) {
          this.$q.notify({
            message: this.$t('validation.notEmpty') + this.$t('form.application.privilege'),
            position: 'top',
            color: 'negative'
          })
          return
        }
        const formData = Object.assign({}, {
          privilegeId: this.applicationDialog.privilegeTable.selected[0].id,
          reason: this.applicationDialog.application.reason,
          expireDate: new Date(this.applicationDialog.application.expireDate)
        })
        apply(formData).then(() => {
          this.searchApplications()
          this.applicationDialog.state = false
          this.$q.notify({
            message: this.$t('response.success.save'),
            position: 'top',
            color: 'teal'
          })
        })
      },
    },
    mounted () {
      this.searchApplications(this.applyTable)
      this.searchUnAuditApplications(this.auditTable)
    }
  }
  </script>
