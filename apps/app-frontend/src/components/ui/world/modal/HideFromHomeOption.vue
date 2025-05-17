<script setup lang="ts">
import { defineMessage, useVIntl } from '@vintl/vintl'
import { computed } from 'vue'
import { Checkbox } from '@modrinth/ui'

const { formatMessage } = useVIntl()
const value = defineModel<boolean>({ required: true })

const labelMessage = defineMessage({
  id: 'instance.edit-world.hide-from-home',
  defaultMessage: `在主页的“快速启动”栏目中隐藏`,
})

const label = computed(() => formatMessage(labelMessage))
</script>
<template>
  <Checkbox v-model="value" :label="label" />
</template>
