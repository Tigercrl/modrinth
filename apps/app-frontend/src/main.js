import { createApp } from 'vue'
import router from '@/routes'
import App from '@/App.vue'
import { createPinia } from 'pinia'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import {createPlugin} from '@vintl/vintl/plugin'
import dayjs from "dayjs";
import "dayjs/locale/zh-cn.js"

const VIntlPlugin = createPlugin({
  controllerOpts: {
    defaultLocale: 'en-US',
    locale: 'en-US',
    locales: [
      {
        tag: 'en-US',
        meta: {
          displayName: 'American English',
        },
      },
    ],
  },
  globalMixin: true,
  injectInto: [],
})

dayjs.locale('zh-cn')

const pinia = createPinia()

let app = createApp(App)

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
