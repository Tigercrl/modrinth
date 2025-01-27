<template>
  <NewModal ref="modal" header="创建收藏夹">
    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-2">
        <label for="name">
          <span class="text-lg font-semibold text-contrast">
            名称
            <span class="text-brand-red">*</span>
          </span>
        </label>
        <input
          id="name"
          v-model="name"
          type="text"
          maxlength="64"
          :placeholder="`Enter collection name...`"
          autocomplete="off"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="additional-information" class="flex flex-col gap-1">
          <span class="text-lg font-semibold text-contrast">
            简介
            <span class="text-brand-red">*</span>
          </span>
          <span>介绍一下此收藏夹。</span>
        </label>
        <div class="textarea-wrapper">
          <textarea id="additional-information" v-model="description" maxlength="256" />
        </div>
      </div>
      <p class="m-0 max-w-[30rem]">
        您将创建一个{{ projectIds.length > 0 ? `包含 ${projectIds.length} 个` : "不包含任何" }}资源的公共收藏夹
      </p>
      <div class="flex gap-2">
        <ButtonStyled color="brand">
          <button @click="create">
            <PlusIcon aria-hidden="true" />
            创建收藏夹
          </button>
        </ButtonStyled>
        <ButtonStyled>
          <button @click="modal.hide()">
            <XIcon aria-hidden="true" />
            取消
          </button>
        </ButtonStyled>
      </div>
    </div>
  </NewModal>
</template>
<script setup>
import { XIcon, PlusIcon } from "@modrinth/assets";
import { NewModal, ButtonStyled } from "@modrinth/ui";

const router = useNativeRouter();

const name = ref("");
const description = ref("");

const modal = ref();

const props = defineProps({
  projectIds: {
    type: Array,
    default() {
      return [];
    },
  },
});

async function create() {
  startLoading();
  try {
    const result = await useBaseFetch("collection", {
      method: "POST",
      body: {
        name: name.value.trim(),
        description: description.value.trim(),
        projects: props.projectIds,
      },
      apiVersion: 3,
    });

    await initUserCollections();

    modal.value.hide();
    await router.push(`/collection/${result.id}`);
  } catch (err) {
    addNotification({
      group: "main",
      title: "发生错误",
      text: err?.data?.description || err?.message || err,
      type: "error",
    });
  }
  stopLoading();
}
function show(event) {
  name.value = "";
  description.value = "";
  modal.value.show(event);
}

defineExpose({
  show,
});
</script>

<style scoped lang="scss">
.modal-creation {
  input {
    width: 20rem;
    max-width: 100%;
  }

  .text-input-wrapper {
    width: 100%;
  }

  textarea {
    min-height: 5rem;
  }

  .input-group {
    margin-top: var(--gap-md);
  }
}
</style>
