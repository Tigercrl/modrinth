<script setup lang="ts">
import { get, set } from '@/helpers/settings'
import { ref, watch } from 'vue'
import { get_max_memory } from '@/helpers/jre'
import { handleError } from '@/store/notifications'
import { Slider, Toggle } from '@modrinth/ui'

const fetchSettings = await get()
fetchSettings.launchArgs = fetchSettings.extra_launch_args.join(' ')
fetchSettings.envVars = fetchSettings.custom_env_vars.map((x) => x.join('=')).join(' ')

const settings = ref(fetchSettings)

const maxMemory = ref(Math.floor((await get_max_memory().catch(handleError)) / 1024))

watch(
  settings,
  async () => {
    const setSettings = JSON.parse(JSON.stringify(settings.value))

    setSettings.extra_launch_args = setSettings.launchArgs.trim().split(/\s+/).filter(Boolean)
    setSettings.custom_env_vars = setSettings.envVars
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((x) => x.split('=').filter(Boolean))

    if (!setSettings.hooks.pre_launch) {
      setSettings.hooks.pre_launch = null
    }
    if (!setSettings.hooks.wrapper) {
      setSettings.hooks.wrapper = null
    }
    if (!setSettings.hooks.post_exit) {
      setSettings.hooks.post_exit = null
    }

    if (!setSettings.custom_dir) {
      setSettings.custom_dir = null
    }

    await set(setSettings)
  },
  { deep: true },
)
</script>

<template>
  <div>
    <h2 class="m-0 text-lg font-extrabold text-contrast">窗口大小</h2>

    <div class="flex items-center justify-between gap-4">
      <div>
        <h3 class="mt-2 m-0 text-base font-extrabold text-primary">全屏</h3>
        <p class="m-0 mt-1 mb-2 leading-tight text-secondary">
          让游戏全屏启动（通过更改 Minecraft 内的视频选项）。
        </p>
      </div>

      <Toggle
        id="fullscreen"
        :model-value="settings.force_fullscreen"
        :checked="settings.force_fullscreen"
        @update:model-value="
          (e) => {
            settings.force_fullscreen = e
          }
        "
      />
    </div>

    <div class="flex items-center justify-between gap-4">
      <div>
        <h3 class="mt-2 m-0 text-base font-extrabold text-primary">宽度</h3>
        <p class="m-0 mt-1 mb-2 leading-tight text-secondary">
          启动时游戏窗口的宽度。
        </p>
      </div>

      <input
        id="width"
        v-model="settings.game_resolution[0]"
        :disabled="settings.force_fullscreen"
        autocomplete="off"
        type="number"
        placeholder="请输入宽度..."
      />
    </div>

    <div class="flex items-center justify-between gap-4">
      <div>
        <h3 class="mt-2 m-0 text-base font-extrabold text-primary">高度</h3>
        <p class="m-0 mt-1 mb-2 leading-tight text-secondary">
          启动时游戏窗口的高度。
        </p>
      </div>

      <input
        id="height"
        v-model="settings.game_resolution[1]"
        :disabled="settings.force_fullscreen"
        autocomplete="off"
        type="number"
        class="input"
        placeholder="请输入高度..."
      />
    </div>

    <hr class="mt-4 bg-button-border border-none h-[1px]" />

    <h2 class="mt-4 m-0 text-lg font-extrabold text-contrast">内存分配</h2>
    <p class="m-0 mt-1 leading-tight">每个实例运行时分配给它的内存。</p>
    <Slider
      id="max-memory"
      v-model="settings.memory.maximum"
      :min="512"
      :max="maxMemory"
      :step="64"
      unit="MB"
    />

    <h2 class="mt-4 mb-2 text-lg font-extrabold text-contrast">Java 参数</h2>
    <input
      id="java-args"
      v-model="settings.launchArgs"
      autocomplete="off"
      type="text"
      placeholder="请输入 Java 参数..."
      class="w-full"
    />

    <h2 class="mt-4 mb-2 text-lg font-extrabold text-contrast">环境变量</h2>
    <input
      id="env-vars"
      v-model="settings.envVars"
      autocomplete="off"
      type="text"
      placeholder="请输入环境变量..."
      class="w-full"
    />

    <hr class="mt-4 bg-button-border border-none h-[1px]" />

    <h2 class="mt-4 m-0 text-lg font-extrabold text-contrast">钩子</h2>

    <h3 class="mt-2 m-0 text-base font-extrabold text-primary">启动前</h3>
    <p class="m-0 mt-1 mb-2 leading-tight text-secondary">在实例启动前运行</p>
    <input
      id="pre-launch"
      v-model="settings.hooks.pre_launch"
      autocomplete="off"
      type="text"
      placeholder="请输入命令..."
      class="w-full"
    />

    <h3 class="mt-2 m-0 text-base font-extrabold text-primary">包装命令</h3>
    <p class="m-0 mt-1 mb-2 leading-tight text-secondary">
      Minecraft 启动时的包装命令
    </p>
    <input
      id="wrapper"
      v-model="settings.hooks.wrapper"
      autocomplete="off"
      type="text"
      placeholder="请输入命令..."
      class="w-full"
    />

    <h3 class="mt-2 m-0 text-base font-extrabold text-primary">停止后</h3>
    <p class="m-0 mt-1 mb-2 leading-tight text-secondary">在游戏停止后运行</p>
    <input
      id="post-exit"
      v-model="settings.hooks.post_exit"
      autocomplete="off"
      type="text"
      placeholder="请输入命令..."
      class="w-full"
    />
  </div>
</template>
