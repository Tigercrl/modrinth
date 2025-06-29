<script setup lang="ts">
import { renderHighlightedString } from '@modrinth/utils'
import { onMounted, ref } from 'vue'
import { ButtonStyled, NewModal } from '@modrinth/ui'
import { getVersion } from '@tauri-apps/api/app'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
})

const modal = ref()

function ignore() {
  localStorage.setItem('ignoreUpdate', props.message.version)
  modal.value.hide()
}

function download() {
  window.open('https://github.com/Tigercrl/modrinth/releases/latest', '_blank')
}

onMounted(async () => {
  const version = await getVersion()

  if (
    localStorage.getItem('ignoreUpdate') != props.message.version &&
    props.message.version != version
  ) {
    modal.value.show()
  }
})
</script>

<template>
  <NewModal ref="modal">
    <template #title>
      <span class="font-extrabold text-contrast text-lg">汉化版更新 v{{ message.version }}</span>
    </template>
    <div class="flex flex-col gap-4">
      <div
        class="markdown-body w-[35rem] mb-4"
        v-html="renderHighlightedString(message.desc ?? '')"
      />
      <div class="flex gap-2">
        <ButtonStyled color="brand">
          <button @click="download">下载</button>
        </ButtonStyled>
        <ButtonStyled>
          <button @click="modal.hide()">关闭</button>
        </ButtonStyled>
        <ButtonStyled>
          <button @click="ignore">关闭并不再显示</button>
        </ButtonStyled>
      </div>
    </div>
  </NewModal>
</template>

<style scoped lang="scss"></style>
