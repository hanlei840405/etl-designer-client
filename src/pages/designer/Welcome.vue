<template>
  <div style="height: calc(100% - 60px);">
    <q-splitter
      v-model="splitterModel"
    >
      <template v-slot:before>
        <q-list padding>
          <q-item v-for="item in items" v-bind:key="item.id" :to="item.id" active-class="tab-active" exact clickable v-ripple>
            <q-item-section>
              {{item.name}}
            </q-item-section>
            <q-item-section avatar>
              <q-avatar rounded size="sm">
                <img :src="item.img">
              </q-avatar>
            </q-item-section>
          </q-item>
        </q-list>
      </template>
      <template v-slot:after>
        <router-view style="margin: 10px"/>
      </template>
    </q-splitter>
  </div>
</template>

<script>

export default {
  name: 'Welcome',
  data () {
    return {
      splitterModel: 20,
      items: [{
        img: '/images/etl/TIP.svg',
        name: '新建【表输入】',
        id: '/doc/TableInputMeta'
      }, {
        img: '/images/etl/GNR.svg',
        name: '新建【自定义常量数据】',
        id: '/doc/DataGridMeta'
      }, {
        img: '/images/etl/GEN.svg',
        name: '新建【生成记录】',
        id: '/doc/RowGeneratorMeta'
      }, {
        img: '/images/etl/RVA.svg',
        name: '新建【生成随机数】',
        id: '/doc/RandomValueMeta'
      }, {
        img: '/images/etl/Delete.svg',
        name: '新建【删除】',
        id: '/doc/DeleteMeta'
      }, {
        img: '/images/etl/INU.svg',
        name: '新建【插入/更新】',
        id: '/doc/InsertUpdateMeta'
      }, {
        img: '/images/etl/UPD.svg',
        name: '新建【更新】',
        id: '/doc/UpdateMeta'
      }, {
        img: '/images/etl/TOP.svg',
        name: '新建【表输出】',
        id: '/doc/TableOutputMeta'
      }, {
        img: '/images/etl/JSO.svg',
        name: '新建【JSON输出】',
        id: '/doc/JsonOutputMeta'
      }, {
        img: '/images/etl/XWS.svg',
        name: '新建【EXCEL输出】',
        id: '/doc/ExcelWriterStepMeta'
      }, {
        img: '/images/etl/ESB.svg',
        name: '新建【elastic search输出】',
        id: '/doc/ElasticSearchBulkMeta'
      }, {
        img: '/images/etl/MongoDB.svg',
        name: '新建【mongoDB输出】',
        id: '/doc/MongoDbOutputMeta'
      }, {
        img: '/images/etl/VMAP.svg',
        name: '新建【值映射】',
        id: '/doc/ValueMapperMeta'
      }, {
        img: '/images/etl/SFtR.svg',
        name: '新建【列拆分为多行】',
        id: '/doc/SplitFieldToRowsMeta'
      }, {
        img: '/images/etl/UNP.svg',
        name: '新建【列转行】',
        id: '/doc/DenormaliserMeta'
      }, {
        img: '/images/etl/SRC.svg',
        name: '新建【剪切字符串】',
        id: '/doc/StringCutMeta'
      }, {
        img: '/images/etl/UNQ.svg',
        name: '新建【去除重复记录】',
        id: '/doc/UniqueRowsMeta'
      }, {
        img: '/images/etl/URH.svg',
        name: '新建【唯一行(哈希值)】',
        id: '/doc/UniqueRowsByHashSetMeta'
      }, {
        img: '/images/etl/CST.svg',
        name: '新建【增加常量】',
        id: '/doc/ConstantMeta'
      }, {
        img: '/images/etl/SEL.svg',
        name: '新建【字段选择】',
        id: '/doc/SelectValuesMeta'
      }, {
        img: '/images/etl/RST.svg',
        name: '新建【字符串替换】',
        id: '/doc/ReplaceStringMeta'
      }, {
        img: '/images/etl/SPL.svg',
        name: '新建【拆分字段】',
        id: '/doc/FieldSplitterMeta'
      }, {
        img: '/images/etl/FLA.svg',
        name: '新建【行扁平化】',
        id: '/doc/FlattenerMeta'
      }, {
        img: '/images/etl/NRM.svg',
        name: '新建【行转列】',
        id: '/doc/NormaliserMeta'
      }, {
        img: '/images/etl/ConcatFields.svg',
        name: '新建【合并字段】',
        id: '/doc/ConcatFieldsMeta'
      }, {
        img: '/images/etl/janino.svg',
        name: '新建【Java代码】',
        id: '/doc/UserDefinedJavaClassMeta'
      }, {
        img: '/images/etl/SCR_mod.svg',
        name: '新建【JavaScript代码】',
        id: '/doc/JavaScriptMeta'
      }, {
        img: '/images/etl/SQL.svg',
        name: '新建【执行SQL脚本】',
        id: '/doc/ExecSQLMeta'
      }, {
        img: '/images/etl/SVA.svg',
        name: '新建【设置变量】',
        id: '/doc/SetVariableMeta'
      }, {
        img: '/images/etl/GVA.svg',
        name: '新建【获取变量】',
        id: '/doc/GetVariableMeta'
      }, {
        img: '/images/etl/TCH.svg',
        name: '新建【复制记录到结果】',
        id: '/doc/RowsToResultMeta'
      }, {
        img: '/images/etl/DLU.svg',
        name: '新建【数据库查询】',
        id: '/doc/DatabaseLookupMeta'
      }, {
        img: '/images/etl/DBJ.svg',
        name: '新建【数据库连接】',
        id: '/doc/DatabaseJoinMeta'
      }, {
        img: '/images/etl/REST.svg',
        name: '新建【Rest请求】',
        id: '/doc/RestMeta'
      }, {
        img: '/images/etl/SWC.svg',
        name: '新建【Switch / case】',
        id: '/doc/SwitchCaseMeta'
      }, {
        img: '/images/etl/DUM.svg',
        name: '新建【空操作】',
        id: '/doc/DummyTransMeta'
      }, {
        img: '/images/etl/MAIL.svg',
        name: '新建【邮件】',
        id: '/doc/MailMeta'
      }, {
        img: '/images/etl/EMS.svg',
        name: '新建【检测空流】',
        id: '/doc/DetectEmptyStreamMeta'
      }, {
        img: '/images/etl/DLR.svg',
        name: '新建【识别流的最后一行】',
        id: '/doc/DetectLastRowMeta'
      }, {
        img: '/images/etl/WTL.svg',
        name: '新建【写日志】',
        id: '/doc/WriteToLogMeta'
      }, {
        img: '/images/etl/get-records-from-stream.svg',
        name: '新建【读取流】',
        id: '/doc/RecordsFromStreamMeta'
      }, {
        img: '/images/etl/KafkaProducerOutput.svg',
        name: '新建【Kafka推送】',
        id: '/doc/KafkaProducerOutputMeta'
      }, {
        img: '/images/etl/KafkaConsumerInput.svg',
        name: '新建【Kafka消费】',
        id: '/doc/KafkaConsumerInputMeta'
      }, {
        img: '/images/etl/STR.svg',
        name: '新建【开始】',
        id: '/doc/JobEntrySpecial'
      }, {
        img: '/images/etl/TRN.svg',
        name: '新建【转换】',
        id: '/doc/JobEntryTrans'
      }, {
        img: '/images/etl/SUC.svg',
        name: '新建【成功】',
        id: '/doc/JobEntrySuccess'
      }, {
        img: '/images/etl/DUM.svg',
        name: '新建【空操作】',
        id: '/doc/JobEntryDummy'
      }, {
        img: '/images/etl/SVA.svg',
        name: '新建【设置变量】',
        id: '/doc/JobEntrySetVariables'
      }, {
        img: '/images/etl/JOB.svg',
        name: '新建【作业】',
        id: '/doc/JobEntryJob'
      }, {
        img: '/images/etl/SCR_mod.svg',
        name: '新建【JavaScript代码】',
        id: '/doc/JobEntryEval'
      }, {
        img: '/images/etl/SEV.svg',
        name: '新建【检查字段值】',
        id: '/doc/JobEntrySimpleEval'
      }]
    }
  },
  mounted () {
    this.$router.push('/doc/TableInputMeta')
  }
}
</script>
