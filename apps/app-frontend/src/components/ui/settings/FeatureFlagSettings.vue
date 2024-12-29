<script setup lang="ts">
import { Toggle } from '@modrinth/ui'
import { useTheming } from '@/store/state'
import { ref, watch } from 'vue'
import { get, set } from '@/helpers/settings'

const themeStore = useTheming()

const settings = ref(await get())
const options = ref(['project_background', 'page_path'])

function getStoreValue(key: string) {
  return themeStore.featureFlags[key] ?? false
}

function setStoreValue(key: string, value: boolean) {
  themeStore.featureFlags[key] = value
  settings.value.feature_flags[key] = value
}

watch(
  settings,
  async () => {
    await set(settings.value)
  },
  { deep: true },
)

function getOptionName(option: string){
  switch (option){
    case 'project_background':
      return '资源背景（在模组等资源页面增加渐变背景）'
    case 'page_path':
      return '显示页面路径（左下角）'
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
      :model-value="getStoreValue(option)"
      :checked="getStoreValue(option)"
      @update:model-value="() => setStoreValue(option, !themeStore.featureFlags[option])"
    />
  </div>
</template>
