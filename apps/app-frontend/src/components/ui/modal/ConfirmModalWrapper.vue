<script setup lang="ts">
import { ref } from 'vue'
import { ConfirmModal } from '@modrinth/ui'
import { show_ads_window, hide_ads_window } from '@/helpers/ads.js'
import { useTheming } from '@/store/theme.js'

const themeStore = useTheming()

const props = defineProps({
  confirmationText: {
    type: String,
    default: '',
  },
  hasToType: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '无标题',
    required: true,
  },
  description: {
    type: String,
    default: '无内容',
    required: true,
  },
  proceedIcon: {
    type: Object,
    default: undefined,
  },
  proceedLabel: {
    type: String,
    default: '继续',
  },
  danger: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['proceed'])
const modal = ref(null)

defineExpose({
  show: () => {
    modal.value.show()
  },
  hide: () => {
    modal.value.hide()
  },
})


function proceed() {
  emit('proceed')
}
</script>

<template>
  <ConfirmModal
    ref="modal"
    :confirmation-text="confirmationText"
    :has-to-type="hasToType"
    :title="title"
    :description="description"
    :proceed-icon="proceedIcon"
    :proceed-label="proceedLabel"
    :noblur="!themeStore.advancedRendering"
    :danger="danger"
    @proceed="proceed"
  />
</template>
