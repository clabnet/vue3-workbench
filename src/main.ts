import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from '@/router'

import '@unocss/reset/normalize.css'
import './styles/main.css'
import 'uno.css'

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  {
    routes, base: import.meta.env.BASE_URL,

  },
  (ctx) => {
    const { isClient } = ctx
    isClient 

    // install all modules under `modules/`
    Object.values(import.meta.globEager('./modules/*.ts')).forEach(i => i.install?.(ctx))
  },
)
