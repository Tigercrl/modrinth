<script setup lang="ts">
import {TeleportDropdownMenu, ThemeSelector, Toggle} from '@modrinth/ui'
import {useTheming} from '@/store/state'
import {get, set} from '@/helpers/settings'
import {ref, watch} from 'vue'
import {getOS} from '@/helpers/utils'

const themeStore = useTheming()

const os = ref(await getOS())
const settings = ref(await get())

watch(
  settings,
  async () => {
    await set(settings.value)
  },
  {deep: true},
)
</script>
<template>
  <h2 class="m-0 text-lg font-extrabold text-contrast">主题</h2>
  <p class="m-0 mt-1">为 Modrinth App 选择您喜欢的主题。</p>

  <ThemeSelector
    :update-color-theme="
      (theme) => {
        themeStore.setThemeState(theme)
        settings.theme = theme
      }
    "
    :current-theme="settings.theme"
    :theme-options="themeStore.themeOptions"
    system-theme-color="system"
  />

  <div class="mt-4 flex items-center justify-between">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast">高级渲染</h2>
      <p class="m-0 mt-1">
        启用高级渲染，例如模糊效果（没有硬件加速时可能导致性能问题）。
      </p>
    </div>

    <Toggle
      id="advanced-rendering"
      :model-value="themeStore.advancedRendering"
      :checked="themeStore.advancedRendering"
      @update:model-value="
        (e) => {
          themeStore.advancedRendering = e
          settings.advanced_rendering = themeStore.advancedRendering
        }
      "
    />
  </div>

  <div v-if="os !== 'MacOS'" class="mt-4 flex items-center justify-between gap-4">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast">原生窗口</h2>
      <p class="m-0 mt-1">使用系统窗口框。（需要重启应用生效）</p>
    </div>
    <Toggle
      id="native-decorations"
      :model-value="settings.native_decorations"
      :checked="settings.native_decorations"
      @update:model-value="
        (e) => {
          settings.native_decorations = e
        }
      "
    />
  </div>

  <div class="mt-4 flex items-center justify-between">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast">最小化启动器</h2>
      <p class="m-0 mt-1">当 Minecraft 启动时最小化启动器。</p>
    </div>
    <Toggle
      id="minimize-launcher"
      :model-value="settings.hide_on_process_start"
      :checked="settings.hide_on_process_start"
      @update:model-value="
        (e) => {
          settings.hide_on_process_start = e
        }
      "
    />
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
      :display-name="(option: string) => {
        switch (option) {
          case 'Home':
            return '主页'
          case 'Library':
            return '实例管理'
        }
        return option
      }"
      :options="['Home', 'Library']"
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
      :checked="settings.toggle_sidebar"
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
      <p class="m-0 mt-1">Modrinth App 隐藏了开发者模式的开关，但您可以通过此选项启用开发者模式。</p>
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
</template>
