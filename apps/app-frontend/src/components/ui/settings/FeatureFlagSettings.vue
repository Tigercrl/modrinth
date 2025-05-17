<script setup lang="ts">
import {Toggle} from '@modrinth/ui'
import {useTheming} from '@/store/state'
import {ref, watch} from 'vue'
import {get as getSettings, set as setSettings} from '@/helpers/settings.ts'
import {DEFAULT_FEATURE_FLAGS, type FeatureFlag} from '@/store/theme.ts'

const themeStore = useTheming()

const settings = ref(await getSettings())
const options = ref<FeatureFlag[]>(Object.keys(DEFAULT_FEATURE_FLAGS))

function setFeatureFlag(key: string, value: boolean) {
  themeStore.featureFlags[key] = value
  settings.value.feature_flags[key] = value
}

watch(
  settings,
  async () => {
    await setSettings(settings.value)
  },
  {deep: true},
)

function getOptionName(option: string) {
  switch (option.toLowerCase()) {
    case 'project_background':
      return '资源背景（在模组等资源页面增加渐变背景）'
    case 'page_path':
      return '显示页面路径（左下角）'
    case 'worlds_in_home':
      return '主界面快速启动'
    case 'worlds_tab':
      return '侧边栏世界'
  }
  return option
}
</script>
<template>
  <div v-for="option in options" :key="option" class="mt-4 flex items-center justify-between">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast capitalize">
        {{ getOptionName(option) }}
      </h2>
    </div>

    <Toggle
      id="advanced-rendering"
      :model-value="themeStore.getFeatureFlag(option)"
      @update:model-value="() => setFeatureFlag(option, !themeStore.getFeatureFlag(option))"
    />
  </div>
</template>
