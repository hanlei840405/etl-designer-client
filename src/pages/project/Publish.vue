<template>
  <div class="row">
    <div class="col-md-3 col-sm-4">
      <q-list padding>
        <q-expansion-item group="project" @before-show="(ele) => loadShell(ele, link)" v-for="link in projects" :key="link.id">
          <template v-slot:header>
            <q-item-section avatar>
              <q-avatar size="24px" text-color="white" color="cyan-8">{{ link.name.substring(0,1) }}</q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-cyan-8">{{ link.name }}</q-item-label>
            </q-item-section>
          </template>
          <q-card>
            <q-card-section class="col q-pt-none">
              <q-tree ref="shellTree" :nodes="project.shells" node-key="id"
                      selected-color="cyan-8"
                      :selected.sync="project.shellId" @update:selected="selectShell" :no-nodes-label="$t('table-empty')">
                <template v-slot:default-header="prop">
                  <div class="row items-center">
                    <q-icon :name="prop.node.icon" :color="prop.node.color" class="q-mr-sm"/>
                    {{ prop.node.label }}
                  </div>
                </template>
              </q-tree>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </div>
    <div class="col-md-8">
      <q-table
        color="cyan-8"
        :data="publishes"
        :columns="columns"
        row-key="id"
        :loading="loading"
        separator="cell"
        :no-data-label="$t('table-empty')"
        @request="requestPublishes"
        :pagination.sync="pagination"
      >
        <template v-slot:body-cell-prod="props">
          <q-td>
            {{ props.row.prod === '1' ? $t('column-yes') : $t('column-no') }}
          </q-td>
        </template>
        <template v-slot:body-cell-createTime="props">
          <q-td>
            {{ dateFormat(props.row.createTime) }}
          </q-td>
        </template>
        <template v-slot:body-cell-operate="props">
          <q-td>
            <q-btn size="small" outline text-color="cyan-8" :icon="taskIcon" @click="deploy(props.row)" :label="$t('btn-deploy')"/>
          </q-td>
        </template>
      </q-table>
      <q-dialog v-model="deployDialog.state">
        <q-card>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ $t('dialog-title-reference-file') }}</div>
            <q-space/>
            <q-btn icon="close" flat round dense v-close-popup/>
          </q-card-section>

          <q-card-section>
            <q-table
              color="cyan-8"
              :data="deployDialog.references"
              :columns="deployDialog.referenceColumns"
              row-key="id"
              separator="cell"
              :no-data-label="$t('table-empty')"
              hide-bottom
              :rows-per-page-options="[0]"
            >
              <template v-slot:body-cell-createTime="props">
                <q-td style="padding: 1px;">
                  {{ dateFormat(props.row.createTime) }}
                </q-td>
              </template>
              <template v-slot:body-cell-operate="props">
                <q-td>
                  <q-btn-group>
                    <q-btn size="small" outline color="cyan-8" icon="visibility" :label="$t('btn-preview')" @click="view(props.row)"></q-btn>
                  </q-btn-group>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
          <q-card-section>
          <div class="text-h6">{{ $t('dialog-title-preview') }}</div>
            <mx-graph-canvas :content="deployDialog.content"/>
          </q-card-section>
          <q-card-section v-if="'0' === deployDialog.streaming">
            <q-select
              v-model="deployDialog.form.misfire"
              outlined
              :label="$t('form-quartz-misfire-option')"
              :options="deployDialog.misfireOptions"
              map-options
              emit-value
              use-input
              clearable
              color="cyan-8"
              label-color="cyan-8"
            >
            </q-select>
          </q-card-section>
          <q-card-section class="col q-pt-none" v-if="'0' === deployDialog.streaming">
            <q-input outlined color="cyan-8" v-model="deployDialog.form.cron" :label="$t('form-quartz-cron')" :rules="[val => !!val || 'Field is required', val => validate(val) || 'cron is invalid']"/>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn outline color="cyan-8" :label="$t('btn-deploy')" :icon="saveIcon" @click="done"/>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script>
import pako from 'pako'
import { fetchAllProjects } from 'src/service/ProjectService'
import {
  fetchAllShell,
  fetchPublishes,
  deploy,
  fetchReferencePublishes
} from 'src/service/ShellService'
import { date } from 'quasar'
import MxGraphCanvas from '../designer/Canvas'
import { mdiCalendarMonthOutline, mdiContentSaveOutline } from '@quasar/extras/mdi-v5'

export default {
  components: { MxGraphCanvas },
  data () {
    return {
      taskIcon: mdiCalendarMonthOutline,
      saveIcon: mdiContentSaveOutline,
      projects: [],
      project: {
        id: null,
        shells: [],
        shellId: null
      },
      loading: false,
      publishes: [],
      pagination: {
        page: 1,
        rowsNumber: 0,
        rowsPerPage: 10
      },
      columns: [
        {
          name: 'prod',
          label: this.$t('column-deployed'),
          field: 'prod',
          align: 'left',
          headerStyle: 'width: 200px'
        },
        {
          name: 'createTime',
          label: this.$t('column-deploy-time'),
          field: 'createTime',
          align: 'left',
          headerStyle: 'width: 200px'
        },
        {
          name: 'description',
          label: this.$t('column-description'),
          field: 'description',
          align: 'left',
          headerStyle: 'width: 300px'
        },
        {
          name: 'operate',
          label: this.$t('column-operate'),
          field: 'operate',
          align: 'left',
          headerStyle: 'width: 6vw'
        }
      ],
      shellId: null,
      deployDialog: {
        form: {
          id: null,
          cron: null,
          misfire: 2
        },
        state: false,
        streaming: '0',
        references: [],
        referenceColumns: [
          {
            name: 'name',
            label: this.$t('column-reference-file'),
            field: 'name',
            align: 'left',
            headerStyle: 'width: 200px'
          },
          {
            name: 'category',
            label: this.$t('column-type'),
            field: 'category',
            align: 'left'
          },
          {
            name: 'createTime',
            label: this.$t('column-deploy-time'),
            field: 'createTime',
            align: 'left'
          },
          {
            name: 'description',
            label: this.$t('column-description'),
            field: 'description',
            align: 'left'
          },
          {
            name: 'operate',
            label: this.$t('column-operate'),
            filed: 'operate',
            align: 'left',
            headerStyle: 'width: 15vw'
          }
        ],
        content: null,
        misfireOptions: [
          { value: 2, label: this.$t('form-quartz-misfire2') },
          { value: -1, label: this.$t('form-quartz-misfire-1') },
          { value: 1, label: this.$t('form-quartz-misfire1') }
        ]
      }
    }
  },
  methods: {
    validate (val) {
      const reg = new RegExp('^\\s*($|#|\\w+\\s*=|(\\?|\\*|(?:[0-5]?\\d)(?:(?:-|\\/|\\,)(?:[0-5]?\\d))?(?:,(?:[0-5]?\\d)(?:(?:-|\\/|\\,)(?:[0-5]?\\d))?)*)\\s+(\\?|\\*|(?:[0-5]?\\d)(?:(?:-|\\/|\\,)(?:[0-5]?\\d))?(?:,(?:[0-5]?\\d)(?:(?:-|\\/|\\,)(?:[0-5]?\\d))?)*)\\s+(\\?|\\*|(?:[01]?\\d|2[0-3])(?:(?:-|\\/|\\,)(?:[01]?\\d|2[0-3]))?(?:,(?:[01]?\\d|2[0-3])(?:(?:-|\\/|\\,)(?:[01]?\\d|2[0-3]))?)*)\\s+(\\?|\\*|(?:0?[1-9]|[12]\\d|3[01])(?:(?:-|\\/|\\,)(?:0?[1-9]|[12]\\d|3[01]))?(?:,(?:0?[1-9]|[12]\\d|3[01])(?:(?:-|\\/|\\,)(?:0?[1-9]|[12]\\d|3[01]))?)*)\\s+(\\?|\\*|(?:[1-9]|1[012])(?:(?:-|\\/|\\,)(?:[1-9]|1[012]))?(?:L|W)?(?:,(?:[1-9]|1[012])(?:(?:-|\\/|\\,)(?:[1-9]|1[012]))?(?:L|W)?)*|\\?|\\*|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:(?:-)(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?(?:,(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:(?:-)(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?)*)\\s+(\\?|\\*|(?:[0-6])(?:(?:-|\\/|\\,|#)(?:[0-6]))?(?:L)?(?:,(?:[0-6])(?:(?:-|\\/|\\,|#)(?:[0-6]))?(?:L)?)*|\\?|\\*|(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:(?:-)(?:MON|TUE|WED|THU|FRI|SAT|SUN))?(?:,(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:(?:-)(?:MON|TUE|WED|THU|FRI|SAT|SUN))?)*)(|\\s)+(\\?|\\*|(?:|\\d{4})(?:(?:-|\\/|\\,)(?:|\\d{4}))?(?:,(?:|\\d{4})(?:(?:-|\\/|\\,)(?:|\\d{4}))?)*))$')
      const result = reg.test(val)
      return result
    },
    fetchAllProjects () {
      const vm = this
      vm.projects = []
      fetchAllProjects({}).then(res => {
        res.data.forEach(item => {
          if (item.status === '1') {
            vm.projects.push({
              id: item.id,
              name: item.name,
              reference: item.name,
              icon: 'location_on'
            })
          }
        })
      })
    },
    loadShell (ele, link) {
      const vm = this
      vm.project.id = link.id
      vm.project.shells = []
      vm.project.shellId = null
      fetchAllShell(link.id).then(res => {
        const array = []
        res.data.forEach(ele => {
          if (ele.category === '0') {
            ele.icon = 'folder_open'
            ele.color = 'cyan-8'
            array.push(ele)
          } else if (ele.category === '1') {
            ele.icon = 'fullscreen'
            ele.color = 'orange'
            array.push(ele)
          }
        })
        vm.project.shells = vm.buildTree(array, 0)
      })
    },
    buildTree (nodes, parentId) {
      const vm = this
      return nodes
        .filter((node) => node.parentId === parentId)
        .reduce(
          (tree, node) => [
            ...tree,
            {
              ...node,
              children: vm.buildTree(nodes, node.id)
            }
          ],
          []
        )
    },
    requestPublishes () {
      const vm = this
      const query = {
        pageNo: vm.pagination.page,
        pageSize: vm.pagination.rowsPerPage,
        id: vm.shellId
      }
      fetchPublishes(query).then(res => {
        vm.pagination.rowsNumber = res.data.total
        vm.publishes = res.data.items
      })
    },
    selectShell (target) {
      if (target) {
        this.shellId = target
        this.requestPublishes()
      }
    },
    unzip (data) {
      const charData = atob(data).split('').map(function (x) {
        return x.charCodeAt(0)
      })
      const binData = new Uint8Array(charData)
      return pako.inflate(binData, { to: 'string' })
    },
    deploy (row) {
      const vm = this
      vm.deployDialog.form.id = row.id
      vm.deployDialog.streaming = row.streaming
      vm.deployDialog.state = true
      fetchReferencePublishes({
        id: row.id
      }).then(res => {
        vm.deployDialog.references = []
        res.data.forEach(item => {
          vm.deployDialog.references.push({
            id: item.id,
            name: item.shell.name,
            category: item.shell.category === '1' ? vm.$t('form-job') : vm.$t('form-transformation'),
            createTime: item.createTime,
            description: item.description,
            content: item.content
          })
        })
      })
    },
    view (row) {
      const vm = this
      vm.deployDialog.content = this.unzip(row.content, { to: 'string' })
    },
    done () {
      const vm = this
      vm.$q.loading.show()
      const payload = {
        misfire: vm.deployDialog.form.misfire,
        cron: vm.deployDialog.form.cron
      }
      deploy({
        id: vm.deployDialog.form.id,
        payload: JSON.stringify(payload)
      }).then(res => {
        vm.deployDialog.state = false
        vm.requestPublishes()
        vm.$q.loading.hide()
        vm.$q.notify({
          message: vm.$t('response-deploy-success'),
          position: 'top',
          color: 'teal'
        })
      }).catch(err => {
        vm.$q.loading.hide()
        let msg
        if (err.status === 10010) {
          msg = vm.$t('response-error-10010')
        } else if (err.status === 10009) {
          msg = vm.$t('response-error-10009')
        } else if (err.status === 10012) {
          msg = vm.$t('response-error-10012')
        } else {
          msg = vm.$t('response-error-system')
        }
        this.$q.notify({
          message: msg,
          position: 'top',
          color: 'negative'
        })
      })
    },
    dateFormat (value) {
      return date.formatDate(value, 'YYYY-MM-DD HH:mm:ss')
    }
  },
  mounted () {
    this.fetchAllProjects()
  }
}
</script>
