<script setup>
import { Button, Slider } from '@modrinth/ui'
import { ref, watch } from 'vue'
import { get, set } from '@/helpers/settings.js'
import { purge_cache_types } from '@/helpers/cache.js'
import { handleError } from '@/store/notifications.js'
import { BoxIcon, FolderSearchIcon, TrashIcon } from '@modrinth/assets'
import ConfirmModalWrapper from '@/components/ui/modal/ConfirmModalWrapper.vue'
import { open } from '@tauri-apps/plugin-dialog'

const settings = ref(await get())

watch(
  settings,
  async () => {
    const setSettings = JSON.parse(JSON.stringify(settings.value))

    if (!setSettings.custom_dir) {
      setSettings.custom_dir = null
    }

    await set(setSettings)
  },
  { deep: true },
)

async function purgeCache() {
  await purge_cache_types([
    'project',
    'version',
    'user',
    'team',
    'organization',
    'loader_manifest',
    'minecraft_manifest',
    'categories',
    'report_types',
    'loaders',
    'game_versions',
    'donation_platforms',
    'file_update',
    'search_results',
  ]).catch(handleError)
}

async function findLauncherDir() {
  const newDir = await open({
    multiple: false,
    directory: true,
    title: 'Select a new app directory',
  })

  if (newDir) {
    settings.value.custom_dir = newDir
  }
}
</script>

<template>
  <h2 class="m-0 text-lg font-extrabold text-contrast">数据目录</h2>
  <p class="m-0 mt-1 mb-2 leading-tight text-secondary">
    Modrinth App 存储所有文件的目录。（需要重启应用程序才能生效）
  </p>

  <div class="m-1 my-2">
    <div class="iconified-input w-full">
      <BoxIcon />
      <input id="appDir" v-model="settings.custom_dir" type="text" class="input" />
      <Button class="r-btn" @click="findLauncherDir">
        <FolderSearchIcon />
      </Button>
    </div>
  </div>

  <div>
    <ConfirmModalWrapper
      ref="purgeCacheConfirmModal"
      title="您确定要清除缓存吗？"
      description="如果您继续，所有缓存将被清除。这可能会使应用程序暂时变卡顿。"
      :has-to-type="false"
      proceed-label="Purge cache"
      :show-ad-on-close="false"
      @proceed="purgeCache"
    />

    <h2 class="m-0 text-lg font-extrabold text-contrast">缓存</h2>
    <p class="m-0 mt-1 mb-2 leading-tight text-secondary">
      Modrinth App 使用缓存以加快加载速度。这可以清除所有缓存以强制应用程序重新加载数据。这可能会使应用程序暂时变卡顿。
    </p>
  </div>
  <button id="purge-cache" class="btn min-w-max" @click="$refs.purgeCacheConfirmModal.show()">
    <TrashIcon />
    清除缓存
  </button>

  <h2 class="m-0 text-lg font-extrabold text-contrast mt-4">最大并发下载</h2>
  <p class="m-0 mt-1 mb-2 leading-tight text-secondary">
    Modrinth App 可以同时下载文件的最大数量。如果您的网络连接较差，请将此值设置为较低的值。（需要重启应用程序才能生效）
  </p>
  <Slider
    id="max-downloads"
    v-model="settings.max_concurrent_downloads"
    :min="1"
    :max="10"
    :step="1"
  />

  <h2 class="mt-4 m-0 text-lg font-extrabold text-contrast">最大并发写入</h2>
  <p class="m-0 mt-1 mb-2 leading-tight text-secondary">
    Modrinth App 可以同时将文件写入磁盘的最大数量。如果经常出现 I/O 错误，请将此值设置为较低的值。（需要重启应用程序才能生效）
  </p>
  <Slider id="max-writes" v-model="settings.max_concurrent_writes" :min="1" :max="50" :step="1" />
</template>
