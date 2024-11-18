<template>
  <div style="width: 100%;">
    <q-form class="q-gutter-md">
      <q-tabs v-model="tab" align="left" narrow-indicator>
        <q-tab name="basic" :label="$t('form.selectValues.tabBasic')"/>
        <q-tab name="runningConfig" :label="$t('form.selectValues.tabRunningConfig')"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel class="row q-col-gutter-xs" name="basic">
          <q-input class="col-12" outlined v-model="form.name" :label="$t('form.selectValues.name')" :rules="[ val => val && val.length > 0 || 'Please type something']" hint=""/>
          <q-tabs class="col-12" v-model="mainTab" align="left" narrow-indicator>
            <q-tab name="select" :label="$t('form.selectValues.selectAlter')"/>
            <q-tab name="remove" :label="$t('form.selectValues.remove')"/>
            <q-tab name="metaData" :label="$t('form.selectValues.metaData')"/>
          </q-tabs>
          <q-tab-panels class="col-12" v-model="mainTab" animated>
            <q-tab-panel name="select">
              <q-table :data="form.selects" :columns="selectColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.selectValues.tableField')">
                <template v-slot:top-right>
                  <q-btn-dropdown split outline color="primary" icon="add" @click="addSelect">
                    <q-list>
                      <q-item clickable v-close-popup @click="appendDiffSelect">
                        <q-item-section>
                          <q-item-label>{{ $t('button.append') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="addAllSelect">
                        <q-item-section>
                          <q-item-label>{{ $t('button.addAll') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="clearAndAddSelect">
                        <q-item-section>
                          <q-item-label>{{ $t('button.removeAndAdd') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </template>
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="operate" :props="props">
                      <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteSelect(props)"></q-btn>
                    </q-td>
                    <q-td key="source" :props="props">
                      {{ props.row.source }}
                      <q-popup-edit v-model="props.row.source" :auto-save="true">
                        <q-select autofocus outlined v-model="props.row.source" :options="sourceFields" @new-value="createSourceField" use-input/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="target" :props="props">
                      {{ props.row.target }}
                      <q-popup-edit v-model="props.row.target" :auto-save="true">
                        <q-input autofocus v-model="props.row.target"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="lengthValue" :props="props">
                      {{ props.row.lengthValue }}
                      <q-popup-edit v-model.number="props.row.lengthValue" :auto-save="true">
                        <q-input autofocus v-model.number="props.row.lengthValue"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="accuracy" :props="props">
                      {{ props.row.accuracy }}
                      <q-popup-edit v-model.number="props.row.accuracy" :auto-save="true">
                        <q-input autofocus v-model.number="props.row.accuracy"/>
                      </q-popup-edit>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
              <q-checkbox v-model="form.sortByName" :label="$t('form.selectValues.orderIncludeUnspecifiedField')"/>
            </q-tab-panel>
            <q-tab-panel name="remove">
              <q-table :data="form.removes" :columns="removeColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.selectValues.tableField')">
                <template v-slot:top-right>
                  <q-btn-dropdown split outline color="primary" icon="add" @click="addRemove">
                    <q-list>
                      <q-item clickable v-close-popup @click="appendDiffRemove">
                        <q-item-section>
                          <q-item-label>{{ $t('button.append') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="addAllRemove">
                        <q-item-section>
                          <q-item-label>{{ $t('button.addAll') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="clearAndAddRemove">
                        <q-item-section>
                          <q-item-label>{{ $t('button.removeAndAdd') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </template>
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="operate" :props="props">
                      <q-btn size="xs" outline round color="negative" icon="remove" @click="deleteRemove(props)"></q-btn>
                    </q-td>
                    <q-td key="source" :props="props">
                      {{ props.row.source }}
                      <q-popup-edit v-model="props.row.source" :auto-save="true">
                        <q-select autofocus outlined v-model="props.row.source" :options="sourceFields"/>
                      </q-popup-edit>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-tab-panel>
            <q-tab-panel name="metaData">
              <q-table :data="form.metaData" :columns="metaDataColumns" :rows-per-page-options="[0]" row-key="name" separator="cell" hide-bottom :title="$t('form.selectValues.tableMetadata')">
                <template v-slot:top-right>
                  <q-btn-dropdown split outline color="primary" icon="add" @click="addMetaData">
                    <q-list>
                      <q-item clickable v-close-popup @click="appendDiffMetaData">
                        <q-item-section>
                          <q-item-label>{{ $t('button.append') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="addAllMetaData">
                        <q-item-section>
                          <q-item-label>{{ $t('button.addAll') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="clearAndAddMetaData">
                        <q-item-section>
                          <q-item-label>{{ $t('button.removeAndAdd') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </template>
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="operate" :props="props">
                      <q-btn size="xs" outline round color="negative" icon="remove"
                             @click="deleteMetaData(props)"></q-btn>
                    </q-td>
                    <q-td key="source" :props="props">
                      {{ props.row.source }}
                      <q-popup-edit v-model="props.row.source" :auto-save="true">
                        <q-select autofocus outlined v-model="props.row.source" :options="sourceFields"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="target" :props="props">
                      {{ props.row.target }}
                      <q-popup-edit v-model="props.row.target" :auto-save="true">
                        <q-input autofocus v-model="props.row.target"/>
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
                      <q-popup-edit v-model.number="props.row.lengthValue" :auto-save="true">
                        <q-input autofocus v-model.number="props.row.lengthValue"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="accuracy" :props="props">
                      {{ props.row.accuracy }}
                      <q-popup-edit v-model="props.row.accuracy" :auto-save="true">
                        <q-input autofocus v-model="props.row.accuracy"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="binary" :props="props">
                      {{ props.row.binary }}
                      <q-popup-edit v-model="props.row.binary" :auto-save="true">
                        <q-select autofocus outlined v-model="props.row.binary" :options="binaries"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="formatValue" :props="props">
                      {{ props.row.formatValue }}
                      <q-popup-edit v-model="props.row.formatValue" :auto-save="true">
                        <q-select autofocus outlined v-model="props.row.formatValue" :options="formats"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="dateFormatLenient" :props="props">
                      {{ props.row.dateFormatLenient }}
                      <q-popup-edit v-model="props.row.dateFormatLenient" :auto-save="true">
                        <q-select autofocus outlined v-model="props.row.dateFormatLenient" :options="yesOrNo"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="locale" :props="props">
                      {{ props.row.dateFormatLenient }}
                      <q-popup-edit v-model="props.row.dateFormatLenient" :auto-save="true">
                        <q-select autofocus outlined v-model="props.row.dateFormatLenient" clearable filled use-input
                                  @filter="filterLocale" :options="copyDateLocales"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="timezone" :props="props">
                      {{ props.row.dateFormatLenient }}
                      <q-popup-edit v-model="props.row.dateFormatLenient" :auto-save="true">
                        <q-select autofocus outlined v-model="props.row.dateFormatLenient" clearable filled use-input
                                  @filter="filterTimezone" :options="copyTimezones"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="lenientNumberConversion" :props="props">
                      {{ props.row.lenientNumberConversion }}
                      <q-popup-edit v-model="props.row.lenientNumberConversion" :auto-save="true">
                        <q-select autofocus outlined v-model="props.row.dateFormatLenient" :options="yesOrNo"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="encoding" :props="props">
                      {{ props.row.encoding }}
                      <q-popup-edit v-model="props.row.encoding" :auto-save="true">
                        <q-select autofocus outlined v-model="props.row.encoding" clearable filled use-input
                                  @filter="filterEncoding" :options="copyEncodings"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="decimal" :props="props">
                      {{ props.row.decimal }}
                      <q-popup-edit v-model="props.row.decimal" :auto-save="true">
                        <q-input autofocus v-model="props.row.accuracy"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="groupBy" :props="props">
                      {{ props.row.groupBy }}
                      <q-popup-edit v-model="props.row.groupBy" :auto-save="true">
                        <q-input autofocus v-model="props.row.groupBy"/>
                      </q-popup-edit>
                    </q-td>
                    <q-td key="currency" :props="props">
                      {{ props.row.currency }}
                      <q-popup-edit v-model="props.row.currency" :auto-save="true">
                        <q-input autofocus v-model="props.row.currency"/>
                      </q-popup-edit>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-tab-panel>
          </q-tab-panels>
        </q-tab-panel>
        <q-tab-panel name="runningConfig">
          <q-input outlined v-model.number="form.parallel" :label="$t('form.selectValues.threads')" type="number" min="1" :disable="forbiddenParallel"/>
        </q-tab-panel>
      </q-tab-panels>
  </q-form>
  </div>
</template>

<script>
const FORBIDDEN_NEXT_STEP_PARALLEL = ['SwitchCaseMeta']
const IGNORE_REPEAT_WARNING_META = ['SortRowsMeta', 'SetValueFieldMeta']
export default {
  name: 'SelectValuesMeta',
  data () {
    return {
      tab: 'basic',
      mainTab: 'select',
      form: {
        name: null,
        selects: [],
        removes: [],
        metaData: [],
        sortByName: false,
        parallel: 1
      },
      sourceFields: [],
      selectColumns: [
        {
          name: 'operate',
          label: this.$t('form.selectValues.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'source',
          label: this.$t('form.selectValues.columnSourceField'),
          field: 'source',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'target',
          label: this.$t('form.selectValues.columnRename'),
          field: 'target',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'lengthValue',
          label: this.$t('form.selectValues.columnLength'),
          field: 'lengthValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'accuracy',
          label: this.$t('form.selectValues.columnAccuracy'),
          field: 'accuracy',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      removeColumns: [
        {
          name: 'operate',
          label: this.$t('form.selectValues.columnOperate'),
          field: 'operate',
          align: 'left',
          headerStyle: 'width: 20px'
        },
        {
          name: 'source',
          label: this.$t('form.selectValues.columnSourceField'),
          field: 'source',
          align: 'left'
        }
      ],
      metaDataColumns: [
        {
          name: 'operate',
          label: this.$t('form.selectValues.columnOperate'),
          field: 'operate',
          align: 'right',
          headerStyle: 'width: 20px'
        },
        {
          name: 'source',
          label: this.$t('form.selectValues.columnSourceField'),
          field: 'source',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'target',
          label: this.$t('form.selectValues.columnRename'),
          field: 'target',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'category',
          label: this.$t('form.selectValues.columnType'),
          field: 'category',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'lengthValue',
          label: this.$t('form.selectValues.columnLength'),
          field: 'lengthValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'accuracy',
          label: this.$t('form.selectValues.columnAccuracy'),
          field: 'accuracy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'binary',
          label: 'Binary to Normal',
          field: 'binary',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'formatValue',
          label: this.$t('form.selectValues.columnFormat'),
          field: 'formatValue',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'dateFormatLenient',
          label: 'Date Format Lenient',
          field: 'dateFormatLenient',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'locale',
          label: this.$t('form.selectValues.locale'),
          field: 'locale',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'timezone',
          label: this.$t('form.selectValues.timezone'),
          field: 'timezone',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'lenientNumberConversion',
          label: 'Lenient Number Conversion',
          field: 'lenientNumberConversion',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'encoding',
          label: this.$t('form.selectValues.columnEncoding'),
          field: 'encoding',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'decimal',
          label: this.$t('form.selectValues.columnDecimalSystem'),
          field: 'decimal',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'groupBy',
          label: this.$t('form.selectValues.columnGroup'),
          field: 'groupBy',
          align: 'left',
          headerStyle: 'width: 100px;'
        },
        {
          name: 'currency',
          label: this.$t('form.selectValues.columnCurrency'),
          field: 'currency',
          align: 'left',
          headerStyle: 'width: 100px;'
        }
      ],
      yesOrNo: ['Y', 'N'],
      binaries: ['normal', 'binary-string', 'indexed'],
      categories: ['BigNumber', 'Binary', 'Boolean', 'Date', 'Integer', 'Internet Address', 'Number', 'String', 'Timestamp'],
      formats: ['yyyy/MM/dd HH:mm:ss.SSS', 'yyyy/MM/dd HH:mm:ss.SSS XXX', 'yyyy/MM/dd HH:mm:ss', 'yyyy/MM/dd HH:mm:ss XXX', 'yyyyMMddHHmmss', 'yyyy/MM/dd', 'yyyy-MM-dd', 'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm:ss XXX',
        'yyyyMMdd', 'MM/dd/yyyy', 'MM/dd/yyyy HH:mm:ss', 'MM-dd-yyyy', 'MM-dd-yyyy HH:mm:ss', 'MM/dd/yy', 'MM-dd-yy', 'dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX', 'yyyy-MM-dd HH:mm:ss.SSS', '#,##0.###', '0.00',
        '0000000000000', '#.#', '#', '###,###,###.#', '#######.###', '#####.###%'],
      dateLocales: ['ar_AE', 'ar_JO', 'ar_SY', 'hr_HR', 'fr_BE', 'es_PA', 'mt_MT', 'es_VE', 'bg', 'zh_TW', 'it', 'ko', 'uk', 'lv', 'da_DK', 'es_PR', 'vi_VN', 'en_US',
        'sr_ME', 'sv_SE', 'es_BO', 'en_SG', 'ar_BH', 'pt', 'ar_SA', 'sk', 'ar_YE', 'hi_IN', 'ga', 'en_MT', 'fi_FI', 'et', 'sv', 'cs', 'sr_BA_#Latn', 'el', 'uk_UA', 'hu',
        'fr_CH', 'in', 'es_AR', 'ar_EG', 'ja_JP_JP_#u-ca-japanese', 'es_SV', 'pt_BR', 'be', 'is_IS', 'cs_CZ', 'es', 'pl_PL', 'tr', 'ca_ES', 'sr_CS', 'ms_MY', 'hr', 'lt',
        'es_ES', 'es_CO', 'bg_BG', 'sq', 'fr', 'ja', 'sr_BA', 'is', 'es_PY', 'de', 'es_EC', 'es_US', 'ar_SD', 'en', 'ro_RO', 'en_PH', 'ca', 'ar_TN', 'sr_ME_#Latn', 'es_GT',
        'sl', 'ko_KR', 'el_CY', 'es_MX', 'ru_RU', 'es_HN', 'zh_HK', 'no_NO_NY', 'hu_HU', 'th_TH', 'ar_IQ', 'es_CL', 'fi', 'ar_MA', 'ga_IE', 'mk', 'tr_TR', 'et_EE', 'ar_QA',
        'sr__#Latn', 'pt_PT', 'fr_LU', 'ar_OM', 'th', 'sq_AL', 'es_DO', 'es_CU', 'ar', 'ru', 'en_NZ', 'sr_RS', 'de_CH', 'es_UY', 'ms', 'el_GR', 'iw_IL', 'en_ZA',
        'th_TH_TH_#u-nu-thai', 'hi', 'fr_FR', 'de_AT', 'nl', 'no_NO', 'en_AU', 'vi', 'nl_NL', 'fr_CA', 'lv_LV', 'de_LU', 'es_CR', 'ar_KW', 'sr', 'ar_LY', 'mt', 'it_CH', 'da',
        'de_DE', 'ar_DZ', 'sk_SK', 'lt_LT', 'it_IT', 'en_IE', 'zh_SG', 'ro', 'en_CA', 'nl_BE', 'no', 'pl', 'zh_CN', 'ja_JP', 'de_GR', 'sr_RS_#Latn', 'iw', 'en_IN', 'ar_LB',
        'es_NI', 'zh', 'mk_MK', 'be_BY', 'sl_SI', 'es_PE', 'in_ID', 'en_GB'],
      copyDateLocales: [],
      timezones: ['Africa/Abidjan', 'Africa/Accra', 'Africa/Addis_Ababa', 'Africa/Algiers', 'Africa/Asmara', 'Africa/Asmera', 'Africa/Bamako', 'Africa/Bangui', 'Africa/Banjul', 'Africa/Bissau', 'Africa/Blantyre', 'Africa/Brazzaville',
        'Africa/Bujumbura', 'Africa/Cairo', 'Africa/Casablanca', 'Africa/Ceuta', 'Africa/Conakry', 'Africa/Dakar', 'Africa/Dar_es_Salaam', 'Africa/Djibouti', 'Africa/Douala', 'Africa/El_Aaiun', 'Africa/Freetown', 'Africa/Gaborone',
        'Africa/Harare', 'Africa/Johannesburg', 'Africa/Juba', 'Africa/Kampala', 'Africa/Khartoum', 'Africa/Kigali', 'Africa/Kinshasa', 'Africa/Lagos', 'Africa/Libreville', 'Africa/Lome', 'Africa/Luanda', 'Africa/Lubumbashi', 'Africa/Lusaka',
        'Africa/Malabo', 'Africa/Maputo', 'Africa/Maseru', 'Africa/Mbabane', 'Africa/Mogadishu', 'Africa/Monrovia', 'Africa/Nairobi', 'Africa/Ndjamena', 'Africa/Niamey', 'Africa/Nouakchott', 'Africa/Ouagadougou', 'Africa/Porto-Novo',
        'Africa/Sao_Tome', 'Africa/Timbuktu', 'Africa/Tripoli', 'Africa/Tunis', 'Africa/Windhoek', 'America/Adak', 'America/Anchorage', 'America/Anguilla', 'America/Antigua', 'America/Araguaina', 'America/Argentina/Buenos_Aires', 'America/Argentina/Catamarca',
        'America/Argentina/ComodRivadavia', 'America/Argentina/Cordoba', 'America/Argentina/Jujuy', 'America/Argentina/La_Rioja', 'America/Argentina/Mendoza', 'America/Argentina/Rio_Gallegos', 'America/Argentina/Salta', 'America/Argentina/San_Juan',
        'America/Argentina/San_Luis', 'America/Argentina/Tucuman', 'America/Argentina/Ushuaia', 'America/Aruba', 'America/Asuncion', 'America/Atikokan', 'America/Atka', 'America/Bahia', 'America/Bahia_Banderas', 'America/Barbados', 'America/Belem', 'America/Belize',
        'America/Blanc-Sablon', 'America/Boa_Vista', 'America/Bogota', 'America/Boise', 'America/Buenos_Aires', 'America/Cambridge_Bay', 'America/Campo_Grande', 'America/Cancun', 'America/Caracas', 'America/Catamarca', 'America/Cayenne', 'America/Cayman', 'America/Chicago',
        'America/Chihuahua', 'America/Coral_Harbour', 'America/Cordoba', 'America/Costa_Rica', 'America/Creston', 'America/Cuiaba', 'America/Curacao', 'America/Danmarkshavn', 'America/Dawson', 'America/Dawson_Creek', 'America/Denver', 'America/Detroit', 'America/Dominica',
        'America/Edmonton', 'America/Eirunepe', 'America/El_Salvador', 'America/Ensenada', 'America/Fort_Nelson', 'America/Fort_Wayne', 'America/Fortaleza', 'America/Glace_Bay', 'America/Godthab', 'America/Goose_Bay', 'America/Grand_Turk', 'America/Grenada', 'America/Guadeloupe',
        'America/Guatemala', 'America/Guayaquil', 'America/Guyana', 'America/Halifax', 'America/Havana', 'America/Hermosillo', 'America/Indiana/Indianapolis', 'America/Indiana/Knox', 'America/Indiana/Marengo', 'America/Indiana/Petersburg', 'America/Indiana/Tell_City', 'America/Indiana/Vevay',
        'America/Indiana/Vincennes', 'America/Indiana/Winamac', 'America/Indianapolis', 'America/Inuvik', 'America/Iqaluit', 'America/Jamaica', 'America/Jujuy', 'America/Juneau', 'America/Kentucky/Louisville', 'America/Kentucky/Monticello', 'America/Knox_IN', 'America/Kralendijk',
        'America/La_Paz', 'America/Lima', 'America/Los_Angeles', 'America/Louisville', 'America/Lower_Princes', 'America/Maceio', 'America/Managua', 'America/Manaus', 'America/Marigot', 'America/Martinique', 'America/Matamoros', 'America/Mazatlan', 'America/Mendoza', 'America/Menominee',
        'America/Merida', 'America/Metlakatla', 'America/Mexico_City', 'America/Miquelon', 'America/Moncton', 'America/Monterrey', 'America/Montevideo', 'America/Montreal', 'America/Montserrat', 'America/Nassau', 'America/New_York', 'America/Nipigon', 'America/Nome', 'America/Noronha',
        'America/North_Dakota/Beulah', 'America/North_Dakota/Center', 'America/North_Dakota/New_Salem', 'America/Ojinaga', 'America/Panama', 'America/Pangnirtung', 'America/Paramaribo', 'America/Phoenix', 'America/Port-au-Prince', 'America/Port_of_Spain', 'America/Porto_Acre', 'America/Porto_Velho',
        'America/Puerto_Rico', 'America/Punta_Arenas', 'America/Rainy_River', 'America/Rankin_Inlet', 'America/Recife', 'America/Regina', 'America/Resolute', 'America/Rio_Branco', 'America/Rosario', 'America/Santa_Isabel', 'America/Santarem', 'America/Santiago', 'America/Santo_Domingo', 'America/Sao_Paulo',
        'America/Scoresbysund', 'America/Shiprock', 'America/Sitka', 'America/St_Barthelemy', 'America/St_Johns', 'America/St_Kitts', 'America/St_Lucia', 'America/St_Thomas', 'America/St_Vincent', 'America/Swift_Current', 'America/Tegucigalpa', 'America/Thule', 'America/Thunder_Bay', 'America/Tijuana',
        'America/Toronto', 'America/Tortola', 'America/Vancouver', 'America/Virgin', 'America/Whitehorse', 'America/Winnipeg', 'America/Yakutat', 'America/Yellowknife', 'Antarctica/Casey', 'Antarctica/Davis', 'Antarctica/DumontDUrville', 'Antarctica/Macquarie', 'Antarctica/Mawson', 'Antarctica/McMurdo',
        'Antarctica/Palmer', 'Antarctica/Rothera', 'Antarctica/South_Pole', 'Antarctica/Syowa', 'Antarctica/Troll', 'Antarctica/Vostok', 'Arctic/Longyearbyen', 'Asia/Aden', 'Asia/Almaty', 'Asia/Amman', 'Asia/Anadyr', 'Asia/Aqtau', 'Asia/Aqtobe', 'Asia/Ashgabat', 'Asia/Ashkhabad', 'Asia/Atyrau',
        'Asia/Baghdad', 'Asia/Bahrain', 'Asia/Baku', 'Asia/Bangkok', 'Asia/Barnaul', 'Asia/Beirut', 'Asia/Bishkek', 'Asia/Brunei', 'Asia/Calcutta', 'Asia/Chita', 'Asia/Choibalsan', 'Asia/Chongqing', 'Asia/Chungking', 'Asia/Colombo', 'Asia/Dacca', 'Asia/Damascus', 'Asia/Dhaka', 'Asia/Dili', 'Asia/Dubai',
        'Asia/Dushanbe', 'Asia/Famagusta', 'Asia/Gaza', 'Asia/Harbin', 'Asia/Hebron', 'Asia/Ho_Chi_Minh', 'Asia/Hong_Kong', 'Asia/Hovd', 'Asia/Irkutsk', 'Asia/Istanbul', 'Asia/Jakarta', 'Asia/Jayapura', 'Asia/Jerusalem', 'Asia/Kabul', 'Asia/Kamchatka', 'Asia/Karachi', 'Asia/Kashgar', 'Asia/Kathmandu',
        'Asia/Katmandu', 'Asia/Khandyga', 'Asia/Kolkata', 'Asia/Krasnoyarsk', 'Asia/Kuala_Lumpur', 'Asia/Kuching', 'Asia/Kuwait', 'Asia/Macao', 'Asia/Macau', 'Asia/Magadan', 'Asia/Makassar', 'Asia/Manila', 'Asia/Muscat', 'Asia/Nicosia', 'Asia/Novokuznetsk', 'Asia/Novosibirsk', 'Asia/Omsk', 'Asia/Oral',
        'Asia/Phnom_Penh', 'Asia/Pontianak', 'Asia/Pyongyang', 'Asia/Qatar', 'Asia/Qostanay', 'Asia/Qyzylorda', 'Asia/Rangoon', 'Asia/Riyadh', 'Asia/Saigon', 'Asia/Sakhalin', 'Asia/Samarkand', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Srednekolymsk', 'Asia/Taipei', 'Asia/Tashkent', 'Asia/Tbilisi',
        'Asia/Tehran', 'Asia/Tel_Aviv', 'Asia/Thimbu', 'Asia/Thimphu', 'Asia/Tokyo', 'Asia/Tomsk', 'Asia/Ujung_Pandang', 'Asia/Ulaanbaatar', 'Asia/Ulan_Bator', 'Asia/Urumqi', 'Asia/Ust-Nera', 'Asia/Vientiane', 'Asia/Vladivostok', 'Asia/Yakutsk', 'Asia/Yangon', 'Asia/Yekaterinburg', 'Asia/Yerevan', 'Atlantic/Azores',
        'Atlantic/Bermuda', 'Atlantic/Canary', 'Atlantic/Cape_Verde', 'Atlantic/Faeroe', 'Atlantic/Faroe', 'Atlantic/Jan_Mayen', 'Atlantic/Madeira', 'Atlantic/Reykjavik', 'Atlantic/South_Georgia', 'Atlantic/St_Helena', 'Atlantic/Stanley', 'Australia/ACT', 'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Broken_Hill',
        'Australia/Canberra', 'Australia/Currie', 'Australia/Darwin', 'Australia/Eucla', 'Australia/Hobart', 'Australia/LHI', 'Australia/Lindeman', 'Australia/Lord_Howe', 'Australia/Melbourne', 'Australia/NSW', 'Australia/North', 'Australia/Perth', 'Australia/Queensland', 'Australia/South', 'Australia/Sydney', 'Australia/Tasmania',
        'Australia/Victoria', 'Australia/West', 'Australia/Yancowinna', 'Brazil/Acre', 'Brazil/DeNoronha', 'Brazil/East', 'Brazil/West', 'CET', 'CST6CDT', 'Canada/Atlantic', 'Canada/Central', 'Canada/Eastern', 'Canada/Mountain', 'Canada/Newfoundland', 'Canada/Pacific', 'Canada/Saskatchewan', 'Canada/Yukon', 'Chile/Continental',
        'Chile/EasterIsland', 'Cuba', 'EET', 'EST5EDT', 'Egypt', 'Eire', 'Etc/GMT', 'Etc/GMT+0', 'Etc/GMT+1', 'Etc/GMT+10', 'Etc/GMT+11', 'Etc/GMT+12', 'Etc/GMT+2', 'Etc/GMT+3', 'Etc/GMT+4', 'Etc/GMT+5', 'Etc/GMT+6', 'Etc/GMT+7', 'Etc/GMT+8', 'Etc/GMT+9', 'Etc/GMT-0', 'Etc/GMT-1', 'Etc/GMT-10', 'Etc/GMT-11', 'Etc/GMT-12', 'Etc/GMT-13',
        'Etc/GMT-14', 'Etc/GMT-2', 'Etc/GMT-3', 'Etc/GMT-4', 'Etc/GMT-5', 'Etc/GMT-6', 'Etc/GMT-7', 'Etc/GMT-8', 'Etc/GMT-9', 'Etc/GMT0', 'Etc/Greenwich', 'Etc/UCT', 'Etc/UTC', 'Etc/Universal', 'Etc/Zulu', 'Europe/Amsterdam', 'Europe/Andorra', 'Europe/Astrakhan', 'Europe/Athens', 'Europe/Belfast', 'Europe/Belgrade', 'Europe/Berlin',
        'Europe/Bratislava', 'Europe/Brussels', 'Europe/Bucharest', 'Europe/Budapest', 'Europe/Busingen', 'Europe/Chisinau', 'Europe/Copenhagen', 'Europe/Dublin', 'Europe/Gibraltar', 'Europe/Guernsey', 'Europe/Helsinki', 'Europe/Isle_of_Man', 'Europe/Istanbul', 'Europe/Jersey', 'Europe/Kaliningrad', 'Europe/Kiev', 'Europe/Kirov',
        'Europe/Lisbon', 'Europe/Ljubljana', 'Europe/London', 'Europe/Luxembourg', 'Europe/Madrid', 'Europe/Malta', 'Europe/Mariehamn', 'Europe/Minsk', 'Europe/Monaco', 'Europe/Moscow', 'Europe/Nicosia', 'Europe/Oslo', 'Europe/Paris', 'Europe/Podgorica', 'Europe/Prague', 'Europe/Riga', 'Europe/Rome', 'Europe/Samara', 'Europe/San_Marino',
        'Europe/Sarajevo', 'Europe/Saratov', 'Europe/Simferopol', 'Europe/Skopje', 'Europe/Sofia', 'Europe/Stockholm', 'Europe/Tallinn', 'Europe/Tirane', 'Europe/Tiraspol', 'Europe/Ulyanovsk', 'Europe/Uzhgorod', 'Europe/Vaduz', 'Europe/Vatican', 'Europe/Vienna', 'Europe/Vilnius', 'Europe/Volgograd', 'Europe/Warsaw', 'Europe/Zagreb',
        'Europe/Zaporozhye', 'Europe/Zurich', 'GB', 'GB-Eire', 'GMT', 'GMT0', 'Greenwich', 'Hongkong', 'Iceland', 'Indian/Antananarivo', 'Indian/Chagos', 'Indian/Christmas', 'Indian/Cocos', 'Indian/Comoro', 'Indian/Kerguelen', 'Indian/Mahe', 'Indian/Maldives', 'Indian/Mauritius', 'Indian/Mayotte', 'Indian/Reunion', 'Iran', 'Israel',
        'Jamaica', 'Japan', 'Kwajalein', 'Libya', 'MET', 'MST7MDT', 'Mexico/BajaNorte', 'Mexico/BajaSur', 'Mexico/General', 'NZ', 'NZ-CHAT', 'Navajo', 'PRC', 'PST8PDT', 'Pacific/Apia', 'Pacific/Auckland', 'Pacific/Bougainville', 'Pacific/Chatham', 'Pacific/Chuuk', 'Pacific/Easter', 'Pacific/Efate', 'Pacific/Enderbury', 'Pacific/Fakaofo',
        'Pacific/Fiji', 'Pacific/Funafuti', 'Pacific/Galapagos', 'Pacific/Gambier', 'Pacific/Guadalcanal', 'Pacific/Guam', 'Pacific/Honolulu', 'Pacific/Johnston', 'Pacific/Kiritimati', 'Pacific/Kosrae', 'Pacific/Kwajalein', 'Pacific/Majuro', 'Pacific/Marquesas', 'Pacific/Midway', 'Pacific/Nauru', 'Pacific/Niue', 'Pacific/Norfolk', 'Pacific/Noumea',
        'Pacific/Pago_Pago', 'Pacific/Palau', 'Pacific/Pitcairn', 'Pacific/Pohnpei', 'Pacific/Ponape', 'Pacific/Port_Moresby', 'Pacific/Rarotonga', 'Pacific/Saipan', 'Pacific/Samoa', 'Pacific/Tahiti', 'Pacific/Tarawa', 'Pacific/Tongatapu', 'Pacific/Truk', 'Pacific/Wake', 'Pacific/Wallis', 'Pacific/Yap', 'Poland', 'Portugal', 'ROK', 'Singapore',
        'SystemV/AST4', 'SystemV/AST4ADT', 'SystemV/CST6', 'SystemV/CST6CDT', 'SystemV/EST5', 'SystemV/EST5EDT', 'SystemV/HST10', 'SystemV/MST7', 'SystemV/MST7MDT', 'SystemV/PST8', 'SystemV/PST8PDT', 'SystemV/YST9', 'SystemV/YST9YDT', 'Turkey', 'UCT', 'US/Alaska', 'US/Aleutian', 'US/Arizona', 'US/Central', 'US/East-Indiana', 'US/Eastern', 'US/Hawaii',
        'US/Indiana-Starke', 'US/Michigan', 'US/Mountain', 'US/Pacific', 'US/Pacific-New', 'US/Samoa', 'UTC', 'Universal', 'W-SU', 'WET', 'Zulu', 'EST', 'HST', 'MST', 'ACT', 'AET', 'AGT', 'ART', 'AST', 'BET', 'BST', 'CAT', 'CNT', 'CST', 'CTT', 'EAT', 'ECT', 'IET', 'IST', 'JST', 'MIT', 'NET', 'NST', 'PLT', 'PNT', 'PRT', 'PST', 'SST', 'VST'],
      copyTimezones: [],
      encodings: ['Big5', 'Big5-HKSCS', 'CESU-8', 'EUC-JP', 'EUC-KR', 'GB18030', 'GB2312', 'GBK', 'IBM-Thai', 'IBM00858', 'IBM01140', 'IBM01141', 'IBM01142', 'IBM01143', 'IBM01144', 'IBM01145', 'IBM01146', 'IBM01147', 'IBM01148', 'IBM01149', 'IBM037', 'IBM1026', 'IBM1047', 'IBM273', 'IBM277', 'IBM278', 'IBM280', 'IBM284', 'IBM285', 'IBM290',
        'IBM297', 'IBM420', 'IBM424', 'IBM437', 'IBM500', 'IBM775', 'IBM850', 'IBM852', 'IBM855', 'IBM857', 'IBM860', 'IBM861', 'IBM862', 'IBM863', 'IBM864', 'IBM865', 'IBM866', 'IBM868', 'IBM869', 'IBM870', 'IBM871', 'IBM918', 'ISO-2022-CN', 'ISO-2022-JP', 'ISO-2022-JP-2', 'ISO-2022-KR', 'ISO-8859-1', 'ISO-8859-13', 'ISO-8859-15', 'ISO-8859-2',
        'ISO-8859-3', 'ISO-8859-4', 'ISO-8859-5', 'ISO-8859-6', 'ISO-8859-7', 'ISO-8859-8', 'ISO-8859-9', 'JIS_X0201', 'JIS_X0212-1990', 'KOI8-R', 'KOI8-U', 'Shift_JIS', 'TIS-620', 'US-ASCII', 'UTF-16', 'UTF-16BE', 'UTF-16LE', 'UTF-32', 'UTF-32BE', 'UTF-32LE', 'UTF-8', 'windows-1250', 'windows-1251', 'windows-1252', 'windows-1253', 'windows-1254',
        'windows-1255', 'windows-1256', 'windows-1257', 'windows-1258', 'windows-31j', 'x-Big5-HKSCS-2001', 'x-Big5-Solaris', 'x-COMPOUND_TEXT', 'x-euc-jp-linux', 'x-EUC-TW', 'x-eucJP-Open', 'x-IBM1006', 'x-IBM1025', 'x-IBM1046', 'x-IBM1097', 'x-IBM1098', 'x-IBM1112', 'x-IBM1122', 'x-IBM1123', 'x-IBM1124', 'x-IBM1166', 'x-IBM1364', 'x-IBM1381',
        'x-IBM1383', 'x-IBM300', 'x-IBM33722', 'x-IBM737', 'x-IBM833', 'x-IBM834', 'x-IBM856', 'x-IBM874', 'x-IBM875', 'x-IBM921', 'x-IBM922', 'x-IBM930', 'x-IBM933', 'x-IBM935', 'x-IBM937', 'x-IBM939', 'x-IBM942', 'x-IBM942C', 'x-IBM943', 'x-IBM943C', 'x-IBM948', 'x-IBM949', 'x-IBM949C', 'x-IBM950', 'x-IBM964', 'x-IBM970', 'x-ISCII91',
        'x-ISO-2022-CN-CNS', 'x-ISO-2022-CN-GB', 'x-iso-8859-11', 'x-JIS0208', 'x-JISAutoDetect', 'x-Johab', 'x-MacArabic', 'x-MacCentralEurope', 'x-MacCroatian', 'x-MacCyrillic', 'x-MacDingbat', 'x-MacGreek', 'x-MacHebrew', 'x-MacIceland', 'x-MacRoman', 'x-MacRomania', 'x-MacSymbol', 'x-MacThai', 'x-MacTurkish', 'x-MacUkraine', 'x-MS932_0213',
        'x-MS950-HKSCS', 'x-MS950-HKSCS-XP', 'x-mswin-936', 'x-PCK', 'x-SJIS_0213', 'x-UTF-16LE-BOM', 'X-UTF-32BE-BOM', 'X-UTF-32LE-BOM', 'x-windows-50220', 'x-windows-50221', 'x-windows-874', 'x-windows-949', 'x-windows-950', 'x-windows-iso2022jp'],
      copyEncodings: [],
      forbiddenParallel: false
    }
  },
  methods: {
    addSelect () {
      this.form.selects.push({
        source: null,
        target: null,
        lengthValue: -1,
        accuracy: -1
      })
    },
    appendDiffSelect () {
      const vm = this
      const items = vm.form.selects.filter(select => vm.sourceFields.indexOf(select.source) >= 0)
      const array = vm.sourceFields
      items.forEach(item => {
        array.splice(array.findIndex(i => i === item.source), 1)
      })
      array.forEach(field => {
        this.form.selects.push({
          source: field,
          target: null,
          lengthValue: -1,
          accuracy: -1
        })
      })
    },
    addAllSelect () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.selects.push({
          source: field,
          target: null,
          lengthValue: -1,
          accuracy: -1
        })
      })
    },
    clearAndAddSelect () {
      this.form.selects = []
      this.addAllSelect()
    },
    deleteSelect (props) {
      this.form.selects.splice(props.rowIndex, 1)
    },
    addRemove () {
      this.form.removes.push({
        source: null
      })
    },
    appendDiffRemove () {
      const vm = this
      const items = vm.form.removes.filter(remove => vm.sourceFields.indexOf(remove.source) >= 0)
      const array = vm.sourceFields
      items.forEach(item => {
        array.splice(array.findIndex(i => i === item.source), 1)
      })
      array.forEach(field => {
        this.form.removes.push({
          source: field
        })
      })
    },
    addAllRemove () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.removes.push({
          source: field
        })
      })
    },
    clearAndAddRemove () {
      this.form.removes = []
      this.addAllRemove()
    },
    deleteRemove (props) {
      this.form.removes.splice(props.rowIndex, 1)
    },
    addMetaData () {
      this.form.metaData.push({
        source: null,
        target: null,
        category: 'String',
        lengthValue: -1,
        accuracy: -1,
        binary: null,
        formatValue: null,
        dateFormatLenient: null,
        locale: null,
        timezone: null,
        lenientNumberConversion: null,
        encoding: null,
        decimal: null,
        groupBy: null,
        currency: null
      })
    },
    appendDiffMetaData () {
      const vm = this
      const items = vm.form.metaData.filter(md => vm.sourceFields.indexOf(md.source) >= 0)
      const array = vm.sourceFields
      items.forEach(item => {
        array.splice(array.findIndex(i => i === item.source), 1)
      })
      array.forEach(field => {
        this.form.metaData.push({
          source: field,
          target: null,
          category: 'String',
          lengthValue: -1,
          accuracy: -1,
          binary: null,
          formatValue: null,
          dateFormatLenient: null,
          locale: null,
          timezone: null,
          lenientNumberConversion: null,
          encoding: null,
          decimal: null,
          groupBy: null,
          currency: null
        })
      })
    },
    addAllMetaData () {
      const vm = this
      vm.sourceFields.forEach(field => {
        vm.form.metaData.push({
          source: field,
          target: null,
          category: 'String',
          lengthValue: -1,
          accuracy: -1,
          binary: null,
          formatValue: null,
          dateFormatLenient: null,
          locale: null,
          timezone: null,
          lenientNumberConversion: null,
          encoding: null,
          decimal: null,
          groupBy: null,
          currency: null
        })
      })
    },
    clearAndAddMetaData () {
      this.form.metaData = []
      this.addAllMetaData()
    },
    deleteMetaData (props) {
      this.form.metaData.splice(props.rowIndex, 1)
    },
    filterLocale (val, update) {
      if (val === '') {
        update(() => {
          this.copyDateLocales = this.dateLocales
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.copyDateLocales = this.dateLocales.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    },
    filterTimezone (val, update) {
      if (val === '') {
        update(() => {
          this.copyTimezones = this.timezones
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.copyTimezones = this.timezones.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    },
    filterEncoding (val, update) {
      if (val === '') {
        update(() => {
          this.copyEncodings = this.encodings
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.copyEncodings = this.encodings.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    },
    createSourceField (val, done) {
      if (val.length > 0) {
        if (!this.sourceFields.includes(val)) {
          this.sourceFields.push(val)
        }
        done(val, 'toggle')
      }
    },
    submitForm () {
      const vm = this
      const array = []
      const notEmptyArray = []
      vm.form.selects.forEach(item => {
        if (vm.sourceFields.indexOf(item.source) >= 0) {
          vm.sourceFields.splice(vm.sourceFields.indexOf(item.source), 1)
        }
        if (array.indexOf(item.source) < 0) {
          array.push(item.target || item.source)
        }
      })
      const replaceFields = vm.sourceFields
      vm.form.removes.forEach(item => replaceFields.push(item.target || item.source))
      vm.form.metaData.forEach(item => replaceFields.push(item.target || item.source))
      // const array = [...Array.from(new Set(this.form.selects.map(ele => ele.target))), ...Array.from(new Set(this.form.metaData.map(ele => ele.target)))]
      this.$emit('propertiesForm', {
        state: true,
        mxCellProperties: this.form,
        ext: {
          sourceFields: array,
          replaceFields: [...replaceFields, ...array]
        }
      })
    }
  },
  mounted () {
    const vm = this
    const previousSteps = vm.$store.getters['etl/getPreNodes']
    vm.sourceFields = []
    const replaceFields = []
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach((step, i) => {
        if (i === 0 && FORBIDDEN_NEXT_STEP_PARALLEL.indexOf(step.type) >= 0) {
          vm.forbiddenParallel = true
        }
        if (step.ext !== undefined && step.ext !== 'undefined' && IGNORE_REPEAT_WARNING_META.indexOf(step.type) < 0) {
          const ext = JSON.parse(step.ext)
          if (ext.sourceFields) {
            ext.sourceFields.forEach(field => {
              vm.sourceFields.push(field)
            })
          }
          if (ext.replaceFields) {
            ext.replaceFields.forEach(field => {
              replaceFields.push(field)
            })
          }
        }
      })
    }
    replaceFields.forEach(field => {
      vm.sourceFields.splice(vm.sourceFields.indexOf(field), 1)
    })
    if (new Set(vm.sourceFields).size !== vm.sourceFields.length) {
      vm.$q.dialog({
        dark: true,
        title: vm.$t('message.error.default'),
        message: this.$t('message.error.duplicateSourceField')
      }).onOk(() => {
        this.$emit('propertiesForm', {
          state: true,
          mxCellProperties: this.form,
          ext: {
            sourceFields: []
          }
        })
      })
    }
    const mxCellValue = vm.$store.getters['etl/getMxCellForm']
    if (mxCellValue) {
      vm.form = Object.assign(vm.form, mxCellValue)
    }
  }
}
</script>
