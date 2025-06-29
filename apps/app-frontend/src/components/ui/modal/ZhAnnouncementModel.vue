<script setup lang="ts">
import { renderHighlightedString } from '@modrinth/utils'
import { onMounted, ref } from 'vue'
import { ButtonStyled, NewModal } from '@modrinth/ui'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
})

const modal = ref()

function ignore() {
  localStorage.setItem('lastAnnouncement', props.message.id)
  modal.value.hide()
}

onMounted(() => {
  if (
    (localStorage.getItem('lastAnnouncement') != props.message.id || !props.message.canIgnore) &&
    props.message.content != ''
  ) {
    modal.value.show()
  }
})
</script>

<template>
  <NewModal ref="modal">
    <template #title>
      <span class="font-extrabold text-contrast text-lg">汉化版公告</span>
    </template>
    <div class="flex flex-col gap-4">
      <div class="markdown-body w-[35rem] mb-4" v-html="renderHighlightedString(message.content)" />
      <div class="flex gap-2">
        <ButtonStyled>
          <button @click="modal.hide()">关闭</button>
        </ButtonStyled>
        <ButtonStyled>
          <button v-if="message.canIgnore" @click="ignore">关闭并不再显示</button>
        </ButtonStyled>
      </div>
    </div>
  </NewModal>
</template>

<style scoped lang="scss"></style>
