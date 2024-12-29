<script setup lang="ts">
import { ref, watch } from 'vue'
import { get, set } from '@/helpers/settings'
import { Toggle } from '@modrinth/ui'
import { optInAnalytics, optOutAnalytics } from '@/helpers/analytics'

const settings = ref(await get())

watch(
  settings,
  async () => {
    if (settings.value.telemetry) {
      optInAnalytics()
    } else {
      optOutAnalytics()
    }

    await set(settings.value)
  },
  { deep: true },
)
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast">个性化广告（汉化版完全禁用了广告，此选项无效！！）</h2>
      <p class="m-0 text-sm">
        Modrinth 的广告提供商（Aditude）会根据您的偏好显示广告。通过禁用此选项，您的广告将不再显示基于您的兴趣显示。
      </p>
    </div>
    <Toggle
      id="personalized-ads"
      :model-value="settings.personalized_ads"
      :checked="false"
      disabled
      @update:model-value="
        (e) => {
          settings.personalized_ads = false
        }
      "
    />
  </div>

  <div class="mt-4 flex items-center justify-between gap-4">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast">遥测（汉化版完全禁用了遥测，此选项无效！！）</h2>
      <p class="m-0 text-sm">
        Modrinth 收集匿名分析和使用数据以改善用户体验并定制您的体验。通过禁用此选项，您的数据将不再被收集。
      </p>
    </div>
    <Toggle
      id="opt-out-analytics"
      :model-value="settings.telemetry"
      :checked="false"
      disabled
      @update:model-value="
        (e) => {
          settings.telemetry = e
        }
      "
    />
  </div>

  <div class="mt-4 flex items-center justify-between gap-4">
    <div>
      <h2 class="m-0 text-lg font-extrabold text-contrast">Discord RPC</h2>
      <p class="m-0 text-sm">
        管理 Discord Rich Presence 集成。禁用此功能将导致“Modrinth”不再显示为您在 Discord 个人信息中正在游玩的游戏或使用的应用程序。
      </p>
      <p class="m-0 mt-2 text-sm">
        注意：这不会阻止任何特定于实例的 Discord Rich Presence 集成，例如模组的集成。（需要重启应用程序才能生效）
      </p>
    </div>
    <Toggle
      id="disable-discord-rpc"
      v-model="settings.discord_rpc"
      :checked="settings.discord_rpc"
    />
  </div>
</template>
