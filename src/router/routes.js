
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/Index.vue'),
        meta: {
          authorities: ['HOME', 'ROOT']
        }
      },
      {
        path: '/basic-project',
        component: () => import('pages/project/Project.vue'),
        meta: {
          authorities: ['PROJECT', 'ROOT']
        }
      },
      {
        path: '/basic-datasource',
        component: () => import('pages/project/Datasource.vue'),
        meta: {
          authorities: ['DATASOURCE', 'ROOT']
        }
      },
      {
        path: '/basic-attachment',
        meta: {
          authorities: ['ATTACHMENT', 'ROOT']
        },
        component: () => import('pages/attachment/Attachment.vue')
      },
      {
        path: '/task-batch',
        component: () => import('pages/task/BatchTask.vue'),
        meta: {
          authorities: ['BATCH', 'ROOT']
        }
      },
      {
        path: '/task-streaming',
        component: () => import('pages/task/StreamingTask.vue'),
        meta: {
          authorities: ['STREAMING', 'ROOT']
        }
      },
      {
        path: '/task-process',
        component: () => import('pages/task/Process.vue'),
        meta: {
          authorities: ['PROCESS', 'ROOT']
        }
      },
      {
        path: '/task-log',
        meta: {
          authorities: ['LOG', 'ROOT']
        },
        component: () => import('pages/log/Log.vue')
      },
      {
        path: '/etl-publish',
        component: () => import('pages/project/Publish.vue'),
        meta: {
          authorities: ['PUBLISH', 'ROOT']
        }
      },
      {
        path: '/etl-designer',
        meta: {
          authorities: ['DESIGNER', 'ROOT']
        },
        component: () => import('pages/designer/DesignerLayout.vue'),
        children: [
          {
            path: '/etl-designer/:id',
            meta: {
              authorities: ['DESIGNER', 'ROOT']
            },
            component: () => import('pages/designer/Designer.vue')
          }
        ]
      },
      {
        path: '/system-metrics',
        meta: {
          authorities: ['METRICS', 'ROOT']
        },
        component: () => import('pages/metrics/Metrics.vue')
      },
      {
        path: '/system-member',
        component: () => import('pages/project/Member.vue'),
        meta: {
          authorities: ['MEMBER', 'ROOT']
        }
      },
      {
        path: '/system-setting',
        meta: {
          authorities: ['SETTING', 'ROOT']
        },
        component: () => import('pages/setting/Setting.vue')
      },
      {
        path: '/analysis-model',
        meta: {
          authorities: ['MODEL', 'ROOT']
        },
        component: () => import('pages/analysis/Model.vue')
      },
      {
        path: '/analysis-report',
        meta: {
          authorities: ['REPORT', 'ROOT']
        },
        component: () => import('src/pages/analysis/Report.vue')
      },
      {
        path: '/analysis-layout',
        meta: {
          authorities: ['LAYOUT', 'ROOT']
        },
        component: () => import('src/pages/analysis/Layout.vue')
      },
      {
        path: '/document',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/Document.vue')
      },
      {
        path: 'doc/TableInputMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/TableInputMeta.vue')
      },
      {
        path: 'doc/DataGridMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/DataGridMeta.vue')
      },
      {
        path: 'doc/RowGeneratorMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/RowGeneratorMeta.vue')
      },
      {
        path: 'doc/RandomValueMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/RandomValueMeta.vue')
      },
      {
        path: 'doc/DeleteMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/DeleteMeta.vue')
      },
      {
        path: 'doc/InsertUpdateMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/InsertUpdateMeta.vue')
      },
      {
        path: 'doc/UpdateMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/UpdateMeta.vue')
      },
      {
        path: 'doc/TableOutputMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/TableOutputMeta.vue')
      },
      {
        path: 'doc/JsonOutputMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/JsonOutputMeta.vue')
      },
      {
        path: 'doc/ExcelWriterStepMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/ExcelWriterStepMeta.vue')
      },
      {
        path: 'doc/ElasticSearchBulkMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/ElasticSearchBulkMeta.vue')
      },
      {
        path: 'doc/MongoDbOutputMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/MongoDbOutputMeta.vue')
      },
      {
        path: 'doc/ValueMapperMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/ValueMapperMeta.vue')
      },
      {
        path: 'doc/SplitFieldToRowsMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/SplitFieldToRowsMeta.vue')
      },
      {
        path: 'doc/DenormaliserMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/DenormaliserMeta.vue')
      },
      {
        path: 'doc/StringCutMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/StringCutMeta.vue')
      },
      {
        path: 'doc/UniqueRowsMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/UniqueRowsMeta.vue')
      },
      {
        path: 'doc/UniqueRowsByHashSetMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/UniqueRowsByHashSetMeta.vue')
      },
      {
        path: 'doc/ConstantMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/ConstantMeta.vue')
      },
      {
        path: 'doc/SelectValuesMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/SelectValuesMeta.vue')
      },
      {
        path: 'doc/ReplaceStringMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/ReplaceStringMeta.vue')
      },
      {
        path: 'doc/FieldSplitterMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/FieldSplitterMeta.vue')
      },
      {
        path: 'doc/FlattenerMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/FlattenerMeta.vue')
      },
      {
        path: 'doc/NormaliserMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/NormaliserMeta.vue')
      },
      {
        path: 'doc/ConcatFieldsMeta',
        meta: {
          authorities: ['DOCUMENT', 'ROOT']
        },
        component: () => import('pages/document/ConcatFieldsMeta.vue')
      },
      {
        path: '/refresh',
        component: () => import('pages/Refresh.vue')
      }
    ]
  },
  {
    path: '/screen/:id',
    component: () => import('pages/analysis/Screen.vue')
  },
  {
    path: '/register',
    component: () => import('pages/Register.vue')
  },
  {
    path: '/forgot',
    component: () => import('pages/Forgot.vue')
  },
  {
    path: '/reset',
    component: () => import('pages/Reset.vue')
  },
  {
    path: '/login',
    component: () => import('pages/Login.vue')
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
