<template>
  <q-page>
    <q-tabs v-model="tab" class="text-grey" active-color="cyan-8" indicator-color="cyan-8" align="left"
            narrow-indicator>
      <q-tab v-for="(t, i) in tabs" :key="i" :name="t" :label="t" class="text-black"/>
    </q-tabs>
    <div class="row">
      <apexchart class="col-md-4" type="line" :options="maxMemoryChartOptions" :series="maxMemorySeries"></apexchart>
      <apexchart class="col-md-4" type="line" :options="committedMemoryOptions" :series="committedMemorySeries"></apexchart>
      <apexchart class="col-md-4" type="line" :options="usedMemoryOptions" :series="usedMemorySeries"></apexchart>
      <apexchart class="col-md-4" type="line" :options="threadOptions" :series="threadSeries"></apexchart>
      <apexchart class="col-md-4" type="line" :options="systemCpuOptions" :series="systemCpuSeries"></apexchart>
      <apexchart class="col-md-4" type="line" :options="processCpuOptions" :series="processCpuSeries"></apexchart>
      <apexchart class="col-md-4" type="line" :options="systemLoadOptions" :series="systemLoadSeries"></apexchart>
      <apexchart class="col-md-4" type="line" :options="processFileOpenOptions" :series="processFileOpenSeries"></apexchart>
    </div>
  </q-page>
</template>

<script>
import VueApexCharts from 'vue-apexcharts'
import Stomp from 'stompjs'
import SockJS from 'sockjs-client'
export default {
  components: {
    apexchart: VueApexCharts
  },
  data () {
    return {
      tab: null,
      tabs: [],
      metrics: {},
      maxMemorySeries: [],
      maxMemoryChartOptions: {},
      committedMemorySeries: [],
      committedMemoryOptions: {},
      usedMemorySeries: [],
      usedMemoryOptions: {},
      threadSeries: [],
      threadOptions: {},
      systemCpuSeries: [],
      systemCpuOptions: {},
      processCpuSeries: [],
      processCpuOptions: {},
      systemLoadSeries: [],
      systemLoadOptions: {},
      processFileOpenSeries: [],
      processFileOpenOptions: {},
      socket: null,
      stompClient: null,
      timer: null
    }
  },
  methods: {
    connectSocketServer () {
      const vm = this
      const fn = () => {
        if (!vm.stompClient || !vm.stompClient.connected) {
          if (vm.timer) {
            vm.$q.notify({
              message: '与后台监控服务失去连接，尝试重连!',
              position: 'top',
              color: 'negative'
            })
          }
          vm.socket = new SockJS(process.env.API + '/socket')
          vm.stompClient = Stomp.over(vm.socket)
          vm.stompClient.connect({}, () => {
            vm.stompClient.subscribe('metrics', (response) => {
              if (vm.$q.loading.isActive) {
                vm.$q.loading.hide()
              }
              const body = JSON.parse(response.body)
              const hostname = body.hostname
              if (vm.tabs.indexOf(hostname) < 0) {
                vm.tabs.push(hostname)
              }
              if (!vm.tab && vm.tabs[0] === hostname) {
                vm.tab = hostname
              }
              if (!vm.metrics.hostname) {
                vm.metrics.hostname = {}
              }
              if (!vm.metrics.hostname.maxMemoryMetric) {
                vm.metrics.hostname.maxMemoryMetric = []
              }
              if (!vm.metrics.hostname.time) {
                vm.metrics.hostname.time = []
              }
              vm.metrics.hostname.time.push(body.time)
              if (vm.metrics.hostname.time.length > 12) {
                vm.metrics.hostname.time.shift()
              }
              vm.metrics.hostname.maxMemoryMetric.push(body.measure.maxMemoryMetric)
              if (vm.metrics.hostname.maxMemoryMetric.length > 12) {
                vm.metrics.hostname.maxMemoryMetric.shift()
              }
              if (!vm.metrics.hostname.committedMemoryMetric) {
                vm.metrics.hostname.committedMemoryMetric = []
              }
              vm.metrics.hostname.committedMemoryMetric.push(body.measure.committedMemoryMetric)
              if (vm.metrics.hostname.committedMemoryMetric.length > 12) {
                vm.metrics.hostname.committedMemoryMetric.shift()
              }
              if (!vm.metrics.hostname.usedMemoryMetric) {
                vm.metrics.hostname.usedMemoryMetric = []
              }
              vm.metrics.hostname.usedMemoryMetric.push(body.measure.usedMemoryMetric)
              if (vm.metrics.hostname.usedMemoryMetric.length > 12) {
                vm.metrics.hostname.usedMemoryMetric.shift()
              }
              if (!vm.metrics.hostname.threadMetric) {
                vm.metrics.hostname.threadMetric = []
              }
              vm.metrics.hostname.threadMetric.push(body.measure.threadMetric)
              if (vm.metrics.hostname.threadMetric.length > 12) {
                vm.metrics.hostname.threadMetric.shift()
              }
              if (!vm.metrics.hostname.systemCpuMetric) {
                vm.metrics.hostname.systemCpuMetric = []
              }
              vm.metrics.hostname.systemCpuMetric.push(body.measure.systemCpuMetric)
              if (vm.metrics.hostname.systemCpuMetric.length > 12) {
                vm.metrics.hostname.systemCpuMetric.shift()
              }
              if (!vm.metrics.hostname.processCpuMetric) {
                vm.metrics.hostname.processCpuMetric = []
              }
              vm.metrics.hostname.processCpuMetric.push(body.measure.processCpuMetric)
              if (vm.metrics.hostname.processCpuMetric.length > 12) {
                vm.metrics.hostname.processCpuMetric.shift()
              }
              if (!vm.metrics.hostname.systemLoadMetric) {
                vm.metrics.hostname.systemLoadMetric = []
              }
              vm.metrics.hostname.systemLoadMetric.push(body.measure.systemLoadMetric)
              if (vm.metrics.hostname.systemLoadMetric.length > 12) {
                vm.metrics.hostname.systemLoadMetric.shift()
              }
              if (!vm.metrics.hostname.processFileOpenMetric) {
                vm.metrics.hostname.processFileOpenMetric = []
              }
              vm.metrics.hostname.processFileOpenMetric.push(body.measure.processFileOpenMetric)
              if (vm.metrics.hostname.processFileOpenMetric.length > 12) {
                vm.metrics.hostname.processFileOpenMetric.shift()
              }
              if (vm.tab === hostname) {
                vm.maxMemorySeries = [{
                  data: vm.metrics.hostname.maxMemoryMetric
                }]
                vm.maxMemoryChartOptions = {
                  chart: {
                    type: 'line',
                    zoom: {
                      enabled: false
                    },
                    toolbar: {
                      show: false
                    }
                  },
                  dataLabels: {
                    enabled: false
                  },
                  stroke: {
                    curve: 'straight',
                    width: 2
                  },
                  markers: {
                    size: 1
                  },
                  colors: ['#00897C'],
                  title: {
                    text: 'JVM最大内存(GB)',
                    align: 'center'
                  },
                  grid: {
                    row: {
                      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                      opacity: 0.5
                    }
                  },
                  xaxis: {
                    categories: vm.metrics.hostname.time
                  }
                }
                vm.committedMemorySeries = [{
                  data: vm.metrics.hostname.committedMemoryMetric
                }]
                vm.committedMemoryOptions = {
                  chart: {
                    type: 'line',
                    zoom: {
                      enabled: false
                    },
                    toolbar: {
                      show: false
                    }
                  },
                  dataLabels: {
                    enabled: false
                  },
                  stroke: {
                    curve: 'straight',
                    width: 2
                  },
                  markers: {
                    size: 1
                  },
                  colors: ['#00897C'],
                  title: {
                    text: 'JVM可用内存(GB)',
                    align: 'center'
                  },
                  grid: {
                    row: {
                      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                      opacity: 0.5
                    }
                  },
                  xaxis: {
                    categories: vm.metrics.hostname.time
                  }
                }
                vm.usedMemorySeries = [{
                  data: vm.metrics.hostname.usedMemoryMetric
                }]
                vm.usedMemoryOptions = {
                  chart: {
                    type: 'line',
                    zoom: {
                      enabled: false
                    },
                    toolbar: {
                      show: false
                    }
                  },
                  dataLabels: {
                    enabled: false
                  },
                  stroke: {
                    curve: 'straight',
                    width: 2
                  },
                  markers: {
                    size: 1
                  },
                  colors: ['#00897C'],
                  title: {
                    text: 'JVM已用内存(GB)',
                    align: 'center'
                  },
                  grid: {
                    row: {
                      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                      opacity: 0.5
                    }
                  },
                  xaxis: {
                    categories: vm.metrics.hostname.time
                  }
                }
                vm.threadSeries = [{
                  data: vm.metrics.hostname.threadMetric
                }]
                vm.threadOptions = {
                  chart: {
                    type: 'line',
                    zoom: {
                      enabled: false
                    },
                    toolbar: {
                      show: false
                    }
                  },
                  dataLabels: {
                    enabled: false
                  },
                  stroke: {
                    curve: 'straight',
                    width: 2
                  },
                  markers: {
                    size: 1
                  },
                  colors: ['#00897C'],
                  title: {
                    text: 'JVM当前活跃线程数',
                    align: 'center'
                  },
                  grid: {
                    row: {
                      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                      opacity: 0.5
                    }
                  },
                  xaxis: {
                    categories: vm.metrics.hostname.time
                  }
                }
                vm.systemCpuSeries = [{
                  data: vm.metrics.hostname.systemCpuMetric
                }]
                vm.systemCpuOptions = {
                  chart: {
                    type: 'line',
                    zoom: {
                      enabled: false
                    },
                    toolbar: {
                      show: false
                    }
                  },
                  stroke: {
                    curve: 'straight',
                    width: 2
                  },
                  markers: {
                    size: 1
                  },
                  colors: ['#00897C'],
                  title: {
                    text: '系统CPU使用率(%)',
                    align: 'center'
                  },
                  grid: {
                    row: {
                      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                      opacity: 0.5
                    }
                  },
                  xaxis: {
                    categories: vm.metrics.hostname.time
                  }
                }
                vm.processCpuSeries = [{
                  data: vm.metrics.hostname.processCpuMetric
                }]
                vm.processCpuOptions = {
                  chart: {
                    type: 'line',
                    zoom: {
                      enabled: false
                    },
                    toolbar: {
                      show: false
                    }
                  },
                  dataLabels: {
                    enabled: false
                  },
                  stroke: {
                    curve: 'straight',
                    width: 2
                  },
                  markers: {
                    size: 1
                  },
                  colors: ['#00897C'],
                  title: {
                    text: '当前进程CPU使用率(%)',
                    align: 'center'
                  },
                  grid: {
                    row: {
                      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                      opacity: 0.5
                    }
                  },
                  xaxis: {
                    categories: vm.metrics.hostname.time
                  }
                }
                vm.systemLoadSeries = [{
                  data: vm.metrics.hostname.systemLoadMetric
                }]
                vm.systemLoadOptions = {
                  chart: {
                    type: 'line',
                    zoom: {
                      enabled: false
                    },
                    toolbar: {
                      show: false
                    }
                  },
                  dataLabels: {
                    enabled: false
                  },
                  stroke: {
                    curve: 'straight',
                    width: 2
                  },
                  markers: {
                    size: 1
                  },
                  colors: ['#00897C'],
                  title: {
                    text: '系统CPU平均负载(%)',
                    align: 'center'
                  },
                  grid: {
                    row: {
                      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                      opacity: 0.5
                    }
                  },
                  xaxis: {
                    categories: vm.metrics.hostname.time
                  }
                }
                vm.processFileOpenSeries = [{
                  data: vm.metrics.hostname.processFileOpenMetric
                }]
                vm.processFileOpenOptions = {
                  chart: {
                    type: 'line',
                    zoom: {
                      enabled: false
                    },
                    toolbar: {
                      show: false
                    }
                  },
                  dataLabels: {
                    enabled: false
                  },
                  stroke: {
                    curve: 'straight',
                    width: 2
                  },
                  markers: {
                    size: 1
                  },
                  colors: ['#00897C'],
                  title: {
                    text: '打开句柄数',
                    align: 'center'
                  },
                  grid: {
                    row: {
                      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                      opacity: 0.5
                    }
                  },
                  xaxis: {
                    categories: vm.metrics.hostname.time
                  }
                }
              }
            })
          }, () => {
            setTimeout(() => fn(), 5000)
          })
        }
      }
      fn()
      vm.timer = setInterval(() => fn(), 5000)
    }
  },
  mounted () {
    this.$q.loading.show()
    this.connectSocketServer()
  },
  destroyed () {
    const vm = this
    if (vm.timer && vm.stompClient.connected) {
      clearInterval(vm.timer)
      if (vm.stompClient.connected) {
        vm.stompClient.disconnect(() => {
          console.log('disconnect success')
        })
      }
    }
  }
}
</script>
