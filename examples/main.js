import Vue from 'vue'
import App from './App'
import Msg from 'main'

Vue.use(Msg)

new Vue({
  el: '#app',
  render: h => h(App)
})
