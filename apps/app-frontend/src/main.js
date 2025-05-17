import { createApp } from 'vue'
import router from '@/routes'
import App from '@/App.vue'
import { createPinia } from 'pinia'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import { createPlugin } from '@vintl/vintl/plugin'
import { VueScanPlugin } from '@taijased/vue-render-tracker'
import dayjs from "dayjs";

const VIntlPlugin = createPlugin({
  controllerOpts: {
    defaultLocale: 'zh-CN',
    locale: 'zh-CN',
    locales: [
      {
        tag: 'zh-CN',
        meta: {
          displayName: '简体中文',
        },
      },
    ],
  },
  globalMixin: true,
  injectInto: [],
})

dayjs.locale('zh-cn')

const vueScan = new VueScanPlugin({
  enabled: false, // Enable or disable the tracker
  showOverlay: true, // Show overlay to visualize renders
  log: false, // Log render events to the console
  playSound: false, // Play sound on each render
})

const pinia = createPinia()

let app = createApp(App)

app.use(vueScan)
app.use(router)
app.use(pinia)
app.use(FloatingVue, {
  themes: {
    'ribbit-popout': {
      $extend: 'dropdown',
      placement: 'bottom-end',
      instantMove: true,
      distance: 8,
    },
  },
})
app.use(VIntlPlugin)

app.mount('#app')
