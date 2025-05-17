<script setup lang="ts">
import { Checkbox } from '@modrinth/ui'
import { computed, ref, watch } from 'vue'
import { handleError } from '@/store/notifications'
import { defineMessages, useVIntl } from '@vintl/vintl'
import { get } from '@/helpers/settings.ts'
import { edit } from '@/helpers/profile'
import type { InstanceSettingsTabProps, AppSettings, Hooks } from '../../../helpers/types'

const { formatMessage } = useVIntl()

const props = defineProps<InstanceSettingsTabProps>()

const globalSettings = (await get().catch(handleError)) as AppSettings

const overrideHooks = ref(
  !!props.instance.hooks.pre_launch ||
    !!props.instance.hooks.wrapper ||
    !!props.instance.hooks.post_exit,
)
const hooks = ref(props.instance.hooks ?? globalSettings.hooks)

const editProfileObject = computed(() => {
  const editProfile: {
    hooks?: Hooks
  } = {}

  if (overrideHooks.value) {
    editProfile.hooks = hooks.value
  }

  return editProfile
})

watch(
  [overrideHooks, hooks],
  async () => {
    await edit(props.instance.path, editProfileObject.value)
  },
  { deep: true },
)
const messages = defineMessages({
  hooks: {
    id: 'instance.settings.tabs.hooks.title',
    defaultMessage: '钩子',
  },
  hooksDescription: {
    id: 'instance.settings.tabs.hooks.description',
    defaultMessage:
      '钩子允许用户在启动游戏前后运行某些系统命令。此选项为高级设置，如果您不知道这是什么请不要修改！',
  },
  customHooks: {
    id: 'instance.settings.tabs.hooks.custom-hooks',
    defaultMessage: '自定义钩子',
  },
  preLaunch: {
    id: 'instance.settings.tabs.hooks.pre-launch',
    defaultMessage: '启动前',
  },
  preLaunchDescription: {
    id: 'instance.settings.tabs.hooks.pre-launch.description',
    defaultMessage: '在实例启动前运行',
  },
  preLaunchEnter: {
    id: 'instance.settings.tabs.hooks.pre-launch.enter',
    defaultMessage: '请输入命令...',
  },
  wrapper: {
    id: 'instance.settings.tabs.hooks.wrapper',
    defaultMessage: '包装命令',
  },
  wrapperDescription: {
    id: 'instance.settings.tabs.hooks.wrapper.description',
    defaultMessage: 'Minecraft 启动时的包装命令',
  },
  wrapperEnter: {
    id: 'instance.settings.tabs.hooks.wrapper.enter',
    defaultMessage: '请输入命令...',
  },
  postExit: {
    id: 'instance.settings.tabs.hooks.post-exit',
    defaultMessage: '停止后',
  },
  postExitDescription: {
    id: 'instance.settings.tabs.hooks.post-exit.description',
    defaultMessage: '在游戏停止后运行',
  },
  postExitEnter: {
    id: 'instance.settings.tabs.hooks.post-exit.enter',
    defaultMessage: '请输入命令...',
  },
})
</script>

<template>
  <div>
    <h2 class="m-0 mb-1 text-lg font-extrabold text-contrast">
      {{ formatMessage(messages.hooks) }}
    </h2>
    <p class="m-0">
      {{ formatMessage(messages.hooksDescription) }}
    </p>
    <Checkbox v-model="overrideHooks" :label="formatMessage(messages.customHooks)" class="mt-2" />

    <h2 class="mt-2 mb-1 text-lg font-extrabold text-contrast">
      {{ formatMessage(messages.preLaunch) }}
    </h2>
    <p class="m-0">
      {{ formatMessage(messages.preLaunchDescription) }}
    </p>
    <input
      id="pre-launch"
      v-model="hooks.pre_launch"
      autocomplete="off"
      :disabled="!overrideHooks"
      type="text"
      :placeholder="formatMessage(messages.preLaunchEnter)"
      class="w-full mt-2"
    />

    <h2 class="mt-4 mb-1 text-lg font-extrabold text-contrast">
      {{ formatMessage(messages.wrapper) }}
    </h2>
    <p class="m-0">
      {{ formatMessage(messages.wrapperDescription) }}
    </p>
    <input
      id="wrapper"
      v-model="hooks.wrapper"
      autocomplete="off"
      :disabled="!overrideHooks"
      type="text"
      :placeholder="formatMessage(messages.wrapperEnter)"
      class="w-full mt-2"
    />

    <h2 class="mt-4 mb-1 text-lg font-extrabold text-contrast">
      {{ formatMessage(messages.postExit) }}
    </h2>
    <p class="m-0">
      {{ formatMessage(messages.postExitDescription) }}
    </p>
    <input
      id="post-exit"
      v-model="hooks.post_exit"
      autocomplete="off"
      :disabled="!overrideHooks"
      type="text"
      :placeholder="formatMessage(messages.postExitEnter)"
      class="w-full mt-2"
    />
  </div>
</template>
