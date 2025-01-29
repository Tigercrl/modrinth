<template>
  <span v-if="typeOnly" class="environment">
    <InfoIcon aria-hidden="true" />
    {{ formatMessage(messages.typeLabel, { type: type }) }}
  </span>
  <span
    v-else-if="
      !['resourcepack', 'shader'].includes(type) &&
      !(type === 'plugin' && search) &&
      !categories.includes('datapack')
    "
    class="environment"
  >
    <template v-if="clientSide === 'optional' && serverSide === 'optional'">
      <GlobeIcon aria-hidden="true" />
      {{ formatMessage(messages.clientOrServerLabel) }}
    </template>
    <template v-else-if="clientSide === 'required' && serverSide === 'required'">
      <GlobeIcon aria-hidden="true" />
      {{ formatMessage(messages.clientAndServerLabel) }}
    </template>
    <template
      v-else-if="
        (clientSide === 'optional' || clientSide === 'required') &&
        (serverSide === 'optional' || serverSide === 'unsupported')
      "
    >
      <ClientIcon aria-hidden="true" />
      {{ formatMessage(messages.clientLabel) }}
    </template>
    <template
      v-else-if="
        (serverSide === 'optional' || serverSide === 'required') &&
        (clientSide === 'optional' || clientSide === 'unsupported')
      "
    >
      <ServerIcon aria-hidden="true" />
      {{ formatMessage(messages.serverLabel) }}
    </template>
    <template v-else-if="serverSide === 'unsupported' && clientSide === 'unsupported'">
      <GlobeIcon aria-hidden="true" />
      {{ formatMessage(messages.unsupportedLabel) }}
    </template>
    <template v-else-if="alwaysShow">
      <InfoIcon aria-hidden="true" />
      {{ formatProjectType(type) }}
    </template>
  </span>
</template>
<script setup lang="ts">
import { GlobeIcon, ClientIcon, ServerIcon, InfoIcon } from '@modrinth/assets'
import { useVIntl, defineMessages } from '@vintl/vintl'
import {capitalizeString} from "@modrinth/utils";

const messages = defineMessages({
  clientLabel: {
    id: 'omorphia.component.environment-indicator.label.client',
    defaultMessage: '仅客户端',
  },
  clientAndServerLabel: {
    id: 'omorphia.component.environment-indicator.label.client-and-server',
    defaultMessage: '双端均需安装',
  },
  clientOrServerLabel: {
    id: 'omorphia.component.environment-indicator.label.client-or-server',
    defaultMessage: '双端任一安装',
  },
  serverLabel: {
    id: 'omorphia.component.environment-indicator.label.server',
    defaultMessage: '仅服务器',
  },
  unsupportedLabel: {
    id: 'omorphia.component.environment-indicator.label.unsupported',
    defaultMessage: '双端均不支持',
  },
})
const { formatMessage } = useVIntl()

const formatProjectType = (name) => {
  switch (name) {
    case 'resourcepack':
      return '资源包'
    case 'datapack':
      return '数据包'
    case 'shader':
      return '光影'
    case 'mod':
      return '模组'
    case 'modpack':
      return '整合包'
    case 'plugin':
      return '插件'
  }

  return name ? name.charAt(0).toUpperCase() + name.slice(1) : name
}

withDefaults(
  defineProps<{
    type: string
    serverSide?: string
    clientSide?: string
    typeOnly?: boolean
    alwaysShow?: boolean
    search?: boolean
    categories?: string[]
  }>(),
  {
    type: 'mod',
    serverSide: '',
    clientSide: '',
    typeOnly: false,
    alwaysShow: false,
    search: false,
    categories: () => [],
  },
)
</script>
<style lang="scss" scoped>
.environment {
  display: flex;
  color: var(--color-text) !important;
  font-weight: bold;
  font-size: 1rem;
  align-items: center;
  svg {
    margin-right: 0.2rem;
  }
}
</style>
