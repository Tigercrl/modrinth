<script setup lang="ts">
import { TeleportDropdownMenu, ThemeSelector, Toggle } from '@modrinth/ui'
import { useTheming } from '@/store/state'
import { get, set } from '@/helpers/settings.ts'
import { ref, watch } from 'vue'
import { getOS } from '@/helpers/utils'
import type { ColorTheme } from '@/store/theme.ts'

const themeStore = useTheming()

const os = ref(await getOS())
const settings = ref(await get())

watch(
  settings,
  async () => {
    await set(settings.value)
  },
  { deep: true },
)
</script>
<template>
  <h2 class="m-0 text-lg font-extrabold text-contrast">主题</h2>
  <p class="m-0 mt-1">为 Modrinth App 选择您喜欢的主题。</p>

  <ThemeSelector
    :update-color-theme="
      (theme: ColorTheme) => {
        themeStore.setThemeState(theme)
        settings.theme = theme
      }
    "
    :current-theme="settings.theme"
    :theme-options="themeStore.getThemeOptions()"
    system-theme-color="system"
  />

  <div class="mt-4 flex items-center justify-between">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast">高级渲染</h2>
      <p class="m-0 mt-1">启用高级渲染，例如模糊效果（没有硬件加速时可能导致性能问题）。</p>
    </div>

    <Toggle
      id="advanced-rendering"
      :model-value="themeStore.advancedRendering"
      @update:model-value="
        (e) => {
          themeStore.advancedRendering = e
          settings.advanced_rendering = themeStore.advancedRendering
        }
      "
    />
  </div>

  <div class="mt-4 flex items-center justify-between">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast">Hide nametag</h2>
      <p class="m-0 mt-1">Disables the nametag above your player on the skins page.</p>
    </div>
    <Toggle id="hide-nametag-skins-page" v-model="settings.hide_nametag_skins_page" />
  </div>

  <div v-if="os !== 'MacOS'" class="mt-4 flex items-center justify-between gap-4">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast">原生窗口</h2>
      <p class="m-0 mt-1">使用系统窗口框。（需要重启应用生效）</p>
    </div>
    <Toggle id="native-decorations" v-model="settings.native_decorations" />
  </div>

  <div class="mt-4 flex items-center justify-between">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast">最小化启动器</h2>
      <p class="m-0 mt-1">当 Minecraft 启动时最小化启动器。</p>
    </div>
    <Toggle id="minimize-launcher" v-model="settings.hide_on_process_start" />
  </div>

  <div class="mt-4 flex items-center justify-between">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast">默认登陆页</h2>
      <p class="m-0 mt-1">修改启动器打开时显示的页面。</p>
    </div>
    <TeleportDropdownMenu
      id="opening-page"
      v-model="settings.default_page"
      name="登录页下拉菜单"
      class="w-40"
      :display-name="
        (option: string) => {
          switch (option) {
            case 'Home':
              return '主页'
            case 'Library':
              return '实例管理'
          }
          return option
        }
      "
      :options="['Home', 'Library']"
    />
  </div>

  <div class="mt-4 flex items-center justify-between">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast">快速启动世界</h2>
      <p class="m-0 mt-1">在主页的“快速启动”栏目中显示最近游玩的世界。</p>
    </div>
    <Toggle
      :model-value="themeStore.getFeatureFlag('worlds_in_home')"
      @update:model-value="
        () => {
          const newValue = !themeStore.getFeatureFlag('worlds_in_home')
          themeStore.featureFlags['worlds_in_home'] = newValue
          settings.feature_flags['worlds_in_home'] = newValue
        }
      "
    />
  </div>

  <div class="mt-4 flex items-center justify-between">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast">侧边栏收缩开关</h2>
      <p class="m-0 mt-1">显示能隐藏右侧侧边栏的开关。</p>
    </div>
    <Toggle
      id="toggle-sidebar"
      :model-value="settings.toggle_sidebar"
      @update:model-value="
        (e) => {
          settings.toggle_sidebar = e
          themeStore.toggleSidebar = settings.toggle_sidebar
        }
      "
    />
  </div>

  <div class="mt-4 flex items-center justify-between">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast">开发者模式（开关由汉化版添加）</h2>
      <p class="m-0 mt-1">
        Modrinth App 隐藏了开发者模式的开关，但您可以通过此选项启用开发者模式。
      </p>
    </div>
    <Toggle
      id="toggle-sidebar"
      :model-value="themeStore.devMode"
      :checked="themeStore.devMode"
      @update:model-value="
        (e) => {
          themeStore.devMode = e
        }
      "
    />
  </div>

  <div class="mt-4 flex items-center justify-between">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast">致谢</h2>
      <p class="m-0 mt-1">Modrinth App 由 <a href="https://github.com/Tigercrl">Tigercrl</a> 汉化！</p>
      <p class="m-0">
        感谢 <a href="https://github.com/Arian8j2">Arian8j2</a> 编写并<a
          href="https://github.com/Arian8j2/modrinth-offline"
          >开源</a
        >的离线登录模块！
      </p>
    </div>
  </div>
</template>
