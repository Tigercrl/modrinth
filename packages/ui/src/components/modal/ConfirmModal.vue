<template>
  <NewModal ref="modal" :noblur="noblur" :danger="danger" :on-hide="onHide">
    <template #title>
      <slot name="title">
        <span class="font-extrabold text-contrast text-lg">{{ title }}</span>
      </slot>
    </template>
    <div class="flex flex-col gap-4">
      <div
        v-if="description"
        class="markdown-body max-w-[35rem]"
        v-html="renderString(description)"
      />
      <slot />
      <label v-if="hasToType" for="confirmation">
        <span>
          要确认继续，请在下方输入
          <span class="italic font-bold">{{ confirmationText }}</span>：
        </span>
      </label>
      <input
        v-if="hasToType"
        id="confirmation"
        v-model="confirmation_typed"
        type="text"
        placeholder="请输入..."
        class="max-w-[20rem]"
      />
      <div class="flex gap-2">
        <ButtonStyled :color="danger ? 'red' : 'brand'">
          <button :disabled="action_disabled" @click="proceed">
            <component :is="proceedIcon" />
            {{ proceedLabel }}
          </button>
        </ButtonStyled>
        <ButtonStyled>
          <button @click="modal.hide()">
            <XIcon />
            取消
          </button>
        </ButtonStyled>
      </div>
    </div>
  </NewModal>
</template>

<script setup>
import { renderString } from '@modrinth/utils'
import { ref } from 'vue'
import { TrashIcon, XIcon } from '@modrinth/assets'
import NewModal from './NewModal.vue'
import ButtonStyled from '../base/ButtonStyled.vue'

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
    default: undefined,
    required: false,
  },
  proceedIcon: {
    type: Object,
    default: TrashIcon,
  },
  proceedLabel: {
    type: String,
    default: '继续',
  },
  noblur: {
    type: Boolean,
    default: false,
  },
  danger: {
    type: Boolean,
    default: true,
  },
  onHide: {
    type: Function,
    default() {
      return () => {}
    },
  },
})

const emit = defineEmits(['proceed'])
const modal = ref(null)

const confirmation_typed = ref('')

const action_disabled = computed(
  () =>
    props.hasToType &&
    confirmation_typed.value.toLowerCase() !== props.confirmationText.toLowerCase(),
)

function proceed() {
  modal.value.hide()
  confirmation_typed.value = ''
  emit('proceed')
}

function show() {
  modal.value.show()
}

defineExpose({ show })
</script>
