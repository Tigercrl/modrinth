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
      {{ formatMessage(messages.typeLabel, { type: type }) }}
    </template>
  </span>
</template>
<script setup lang="ts">
import { GlobeIcon, ClientIcon, ServerIcon, InfoIcon } from '@modrinth/assets'
import { useVIntl, defineMessages } from '@vintl/vintl'

const messages = defineMessages({
  clientLabel: {
    id: 'omorphia.component.environment-indicator.label.client',
    defaultMessage: '客户端',
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
    defaultMessage: '服务器',
  },
  typeLabel: {
    id: 'omorphia.component.environment-indicator.label.type',
    defaultMessage: '一个{type}',
  },
  unsupportedLabel: {
    id: 'omorphia.component.environment-indicator.label.unsupported',
    defaultMessage: '双端均不支持',
  },
})
const { formatMessage } = useVIntl()

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
