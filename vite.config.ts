import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Pages from 'vite-plugin-pages'
import generateSitemap from 'vite-ssg-sitemap'
import Layouts from 'vite-plugin-vue-layouts'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import defineOptions from 'unplugin-vue-define-options/vite'
import VueI18n from '@intlify/vite-plugin-vue-i18n'
import Unocss from 'unocss/vite'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, '')}/`,
      '@/': `${path.resolve(__dirname, 'src')}/`
    },
  },
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
      reactivityTransform: true,
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('my-'),
        },
      },
    }),
    vueJsx(),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ['vue', 'md'],
      exclude: [
        '**/components/*.vue',
      ],
      onRoutesGenerated: (routes) => {
        return routes.filter((route) => {
          return !route?.meta?.onlyClient
        }).map((route) => {
          // console.log(route)
          if (['all', 'index'].includes(route.name))
            return route
          const getPath = route.name.split('-').join('/')
          return {
            ...route,
            path: `/${getPath}`,
            ...route.component
              ? {
                  meta: { ...route.meta, dir: route.component },
                }
              : {},
          }
        })
      },
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'vue-i18n',
        '@vueuse/head',
        '@vueuse/core',
        {
          'vue/macros': ['$$', '$ref', '$computed', '$shallowRef'],
        },
      ],
      dts: 'src/auto-imports.d.ts',
    }),

    // https://github.com/sxzz/unplugin-vue-define-options
    defineOptions(),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ['vue', 'md'],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/, /\.(j|t)sx$/],
      dts: 'src/components.d.ts',
      resolvers: [
        NaiveUiResolver(),
      ],
    }),

    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    Unocss(),

    // https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      include: [path.resolve(__dirname, 'locales/**')],
    }),

  ],

  // @ts-expect-error: Missing ssr key
  ssr: {
    noExternal: ['naive-ui', '@juggle/resize-observer', '@css-render/vue3-ssr'],
  },

  // https://github.com/antfu/vite-ssg
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    onFinished() { generateSitemap() },
  },

  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
      '@vueuse/head',
    ],
    exclude: [
      'vue-demi',
    ],
  },
})
