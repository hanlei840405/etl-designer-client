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
export default {
  METADATA_CATEGORIES
}
