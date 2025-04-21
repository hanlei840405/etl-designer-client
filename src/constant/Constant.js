import {i18n} from 'src/boot/i18n'

const METADATA_CATEGORIES = {
  mysql: ['int', 'bigint', 'varchar', 'date', 'datetime', 'time', 'decimal', 'float', 'double'],
  oracle: ['varchar2', 'number', 'integer', 'long', 'float', 'date', 'timestamp'],
  columnLength: {
    int: true,
    bigint: false,
    varchar: false,
    date: true,
    datetime: true,
    time: true,
    decimal: false,
    float: false,
    double: false,
    varchar2: false,
    number: false,
    integer: false,
    long: false,
    timestamp: true
  },
  columnDecimal: {
    int: true,
    bigint: true,
    varchar: true,
    date: true,
    datetime: true,
    time: true,
    decimal: false,
    float: true,
    double: true,
    number: false
  }
}
const ETL_TOOLBAR = {
  transform: {
    stepInput: [{
      img: '/images/etl/TIP.svg',
      name: i18n.t('etl.transform.stepInput.TableInputMeta'),
      type: 'TableInputMeta'
    }, {
      img: '/images/etl/GNR.svg',
      name: i18n.t('etl.transform.stepInput.DataGridMeta'),
      type: 'DataGridMeta'
    }, {
      img: '/images/etl/GEN.svg',
      name: i18n.t('etl.transform.stepInput.RowGeneratorMeta'),
      type: 'RowGeneratorMeta'
    }, {
      img: '/images/etl/JSI.svg',
      name: i18n.t('etl.transform.stepInput.JsonInputMeta'),
      type: 'JsonInputMeta'
    }, {
      img: '/images/etl/TFI.svg',
      name: i18n.t('etl.transform.stepInput.CsvInputMeta'),
      type: 'CsvInputMeta'
    }, {
      img: '/images/etl/TFI.svg',
      name: i18n.t('etl.transform.stepInput.ParGzipCsvInputMeta'),
      type: 'ParGzipCsvInputMeta'
    }, {
      img: '/images/etl/XLI.svg',
      name: i18n.t('etl.transform.stepInput.ExcelInputMeta'),
      type: 'ExcelInputMeta'
    }],
    stepOutput: [{
      img: '/images/etl/Delete.svg',
      name: i18n.t('etl.transform.stepOutput.DeleteMeta'),
      type: 'DeleteMeta'
    }, {
      img: '/images/etl/INU.svg',
      name: i18n.t('etl.transform.stepOutput.InsertUpdateMeta'),
      type: 'InsertUpdateMeta'
    }, {
      img: '/images/etl/UPD.svg',
      name: i18n.t('etl.transform.stepOutput.UpdateMeta'),
      type: 'UpdateMeta'
    }, {
      img: '/images/etl/TOP.svg',
      name: i18n.t('etl.transform.stepOutput.TableOutputMeta'),
      type: 'TableOutputMeta'
    }, {
      img: '/images/etl/JSO.svg',
      name: i18n.t('etl.transform.stepOutput.JsonOutputMeta'),
      type: 'JsonOutputMeta'
    }, {
      img: '/images/etl/ESB.svg',
      name: i18n.t('etl.transform.stepOutput.ElasticSearchBulkMeta'),
      type: 'ElasticSearchBulkMeta'
    }, {
      img: '/images/etl/XWS.svg',
      name: i18n.t('etl.transform.stepOutput.ExcelWriterMata'),
      type: 'ExcelWriterStepMeta'
    }, {
      img: '/images/etl/TFO.svg',
      name: i18n.t('etl.transform.stepOutput.TextFileOutputMeta'),
      type: 'TextFileOutputMeta'
    }, {
      img: '/images/etl/SAM.svg',
      name: i18n.t('etl.transform.stepOutput.SynchronizeAfterMergeMeta'),
      type: 'SynchronizeAfterMergeMeta'
    }],
    streaming: [{
      img: '/images/etl/get-records-from-stream.svg',
      name: i18n.t('etl.transform.streaming.RecordsFromStreamMeta'),
      type: 'RecordsFromStreamMeta'
    }, {
      img: '/images/etl/KafkaProducerOutput.svg',
      name: i18n.t('etl.transform.streaming.KafkaProducerOutputMeta'),
      type: 'KafkaProducerOutputMeta'
    }, {
      img: '/images/etl/KafkaConsumerInput.svg',
      name: i18n.t('etl.transform.streaming.KafkaConsumerInputMeta'),
      type: 'KafkaConsumerInputMeta'
    }],
    stepConvert: [{
      img: '/images/etl/VMAP.svg',
      name: i18n.t('etl.transform.stepConvert.ValueMapperMeta'),
      type: 'ValueMapperMeta'
    }, {
      img: '/images/etl/SFtR.svg',
      name: i18n.t('etl.transform.stepConvert.SplitFieldToRowsMeta'),
      type: 'SplitFieldToRowsMeta'
    }, {
      img: '/images/etl/UNP.svg',
      name: i18n.t('etl.transform.stepConvert.DenormaliserMeta'),
      type: 'DenormaliserMeta'
    }, {
      img: '/images/etl/SRC.svg',
      name: i18n.t('etl.transform.stepConvert.StringCutMeta'),
      type: 'StringCutMeta'
    }, {
      img: '/images/etl/UNQ.svg',
      name: i18n.t('etl.transform.stepConvert.UniqueRowsMeta'),
      type: 'UniqueRowsMeta'
    }, {
      img: '/images/etl/URH.svg',
      name: i18n.t('etl.transform.stepConvert.UniqueRowsByHashSetMeta'),
      type: 'UniqueRowsByHashSetMeta'
    }, {
      img: '/images/etl/CST.svg',
      name: i18n.t('etl.transform.stepConvert.ConstantMeta'),
      type: 'ConstantMeta'
    }, {
      img: '/images/etl/SEL.svg',
      name: i18n.t('etl.transform.stepConvert.SelectValuesMeta'),
      type: 'SelectValuesMeta'
    }, {
      img: '/images/etl/RST.svg',
      name: i18n.t('etl.transform.stepConvert.ReplaceStringMeta'),
      type: 'ReplaceStringMeta'
    }, {
      img: '/images/etl/SPL.svg',
      name: i18n.t('etl.transform.stepConvert.FieldSplitterMeta'),
      type: 'FieldSplitterMeta'
    }, {
      img: '/images/etl/FLA.svg',
      name: i18n.t('etl.transform.stepConvert.FlattenerMeta'),
      type: 'FlattenerMeta'
    }, {
      img: '/images/etl/NRM.svg',
      name: i18n.t('etl.transform.stepConvert.NormaliserMeta'),
      type: 'NormaliserMeta'
    }, {
      img: '/images/etl/SRT.svg',
      name: i18n.t('etl.transform.stepConvert.SortRowsMeta'),
      type: 'SortRowsMeta'
    }, {
      img: '/images/etl/SVF.svg',
      name: i18n.t('etl.transform.stepConvert.SetValueFieldMeta'),
      type: 'SetValueFieldMeta'
    }, {
      img: '/images/etl/ConcatFields.svg',
      name: i18n.t('etl.transform.stepConvert.ConcatFieldsMeta'),
      type: 'ConcatFieldsMeta'
    }],
    stepProcess: [{
      img: '/images/etl/SWC.svg',
      name: i18n.t('etl.transform.stepProcess.SwitchCaseMeta'),
      type: 'SwitchCaseMeta'
    }, {
      img: '/images/etl/DUM.svg',
      name: i18n.t('etl.transform.stepProcess.DummyTransMeta'),
      type: 'DummyTransMeta'
    }, {
      img: '/images/etl/MAIL.svg',
      name: i18n.t('etl.transform.stepProcess.MailMeta'),
      type: 'MailMeta'
    }, {
      img: '/images/etl/EMS.svg',
      name: i18n.t('etl.transform.stepProcess.DetectEmptyStreamMeta'),
      type: 'DetectEmptyStreamMeta'
    }, {
      img: '/images/etl/DLR.svg',
      name: i18n.t('etl.transform.stepProcess.DetectLastRowMeta'),
      type: 'DetectLastRowMeta'
    }, {
      img: '/images/etl/WTL.svg',
      name: i18n.t('etl.transform.stepProcess.WriteToLogMeta'),
      type: 'WriteToLogMeta'
    }, {
      img: '/images/etl/FLT.svg',
      name: i18n.t('etl.transform.stepProcess.FilterRowsMeta'),
      type: 'FilterRowsMeta'
    }],
    stepScript: [{
      img: '/images/etl/janino.svg',
      name: i18n.t('etl.transform.stepScript.UserDefinedJavaClassMeta'),
      type: 'UserDefinedJavaClassMeta'
    }, {
      img: '/images/etl/SCR_mod.svg',
      name: i18n.t('etl.transform.stepScript.JavaScriptMeta'),
      type: 'JavaScriptMeta'
    }, {
      img: '/images/etl/SQL.svg',
      name: i18n.t('etl.transform.stepScript.ExecSQLMeta'),
      type: 'ExecSQLMeta'
    }, {
      img: '/images/etl/SVA.svg',
      name: i18n.t('etl.transform.stepScript.SetVariableMeta'),
      type: 'SetVariableMeta'
    }, {
      img: '/images/etl/GVA.svg',
      name: i18n.t('etl.transform.stepScript.GetVariableMeta'),
      type: 'GetVariableMeta'
    }],
    stepLookup: [{
      img: '/images/etl/DLU.svg',
      name: i18n.t('etl.transform.stepLookup.DatabaseLookupMeta'),
      type: 'DatabaseLookupMeta'
    }, {
      img: '/images/etl/DBJ.svg',
      name: i18n.t('etl.transform.stepLookup.DatabaseJoinMeta'),
      type: 'DatabaseJoinMeta'
    }, {
      img: '/images/etl/REST.svg',
      name: i18n.t('etl.transform.stepLookup.RestMeta'),
      type: 'RestMeta'
    }],
    stepConnect: [{
      img: '/images/etl/MJOIN.svg',
      name: i18n.t('etl.transform.stepConnect.MergeJoinMeta'),
      type: 'MergeJoinMeta'
    }, {
      img: '/images/etl/MJOINS.svg',
      name: i18n.t('etl.transform.stepConnect.MultiMergeJoinMeta'),
      type: 'MultiMergeJoinMeta'
    }, {
      img: '/images/etl/MRG.svg',
      name: i18n.t('etl.transform.stepConnect.MergeRowsMeta'),
      type: 'MergeRowsMeta'
    }
    ],
    stepWarehouse: [
      {
        img: '/images/etl/DIM.svg',
        name: i18n.t('etl.transform.stepWarehouse.DimensionLookupMeta'),
        type: 'DimensionLookupMeta'
      },
      {
        img: '/images/etl/CMB.svg',
        name: i18n.t('etl.transform.stepWarehouse.CombinationLookupMeta'),
        type: 'CombinationLookupMeta'
      }
    ]
  },
  job: {
    entryCommon: [{
      img: '/images/etl/STR.svg',
      name: i18n.t('etl.job.entryCommon.JobEntrySpecial'),
      type: 'JobEntrySpecial'
    }, {
      img: '/images/etl/TRN.svg',
      name: i18n.t('etl.job.entryCommon.JobEntryTrans'),
      type: 'JobEntryTrans'
    }, {
      img: '/images/etl/SUC.svg',
      name: i18n.t('etl.job.entryCommon.JobEntrySuccess'),
      type: 'JobEntrySuccess'
    }, {
      img: '/images/etl/DUM.svg',
      name: i18n.t('etl.job.entryCommon.JobEntryDummy'),
      type: 'JobEntryDummy'
    }, {
      img: '/images/etl/SVA.svg',
      name: i18n.t('etl.job.entryCommon.JobEntrySetVariables'),
      type: 'JobEntrySetVariables'
    }, {
      img: '/images/etl/JOB.svg',
      name: i18n.t('etl.job.entryCommon.JobEntryJob'),
      type: 'JobEntryJob'
    }],
    entryScript: [
      {
        img: '/images/etl/SCR_mod.svg',
        name: i18n.t('etl.job.entryScript.JobEntryEval'),
        type: 'JobEntryEval'
      }
    ],
    conditionShell: [
      {
        img: '/images/etl/SEV.svg',
        name: i18n.t('etl.job.conditionShell.JobEntrySimpleEval'),
        type: 'JobEntrySimpleEval'
      }
    ],
    fileTransfer: [
      {
        img: '/images/etl/PFTP.svg',
        name: i18n.t('etl.job.fileTransfer.JobEntryFTPPUT'),
        type: 'JobEntryFTPPUT'
      },
      {
        img: '/images/etl/GFTP.svg',
        name: i18n.t('etl.job.fileTransfer.JobEntryFTP'),
        type: 'JobEntryFTP'
      },
      {
        img: '/images/etl/PSFTP.svg',
        name: i18n.t('etl.job.fileTransfer.JobEntrySFTPPUT'),
        type: 'JobEntrySFTPPUT'
      },
      {
        img: '/images/etl/GSFTP.svg',
        name: i18n.t('etl.job.fileTransfer.JobEntrySFTP'),
        type: 'JobEntrySFTP'
      },
      {
        img: '/images/etl/MAIL.svg',
        name: i18n.t('etl.job.fileTransfer.JobEntryMail'),
        type: 'JobEntryMail'
      }
    ]
  }
}
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'SetValueFieldMeta']
export default {
  METADATA_CATEGORIES,
  ETL_TOOLBAR,
  FORBIDDEN_NEXT_STEP_PARALLEL,
  IGNORE_REPEAT_WARNING_META
}
