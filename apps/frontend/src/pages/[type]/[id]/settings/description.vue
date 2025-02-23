<template>
  <div>
    <div class="universal-card">
      <div class="markdown-disclaimer">
        <h2>描述</h2>
        <span class="label__description">
          您可以在此编写您资源的详细描述。
          <span class="label__subdescription">
            描述必须清晰、如实地描述资源的功能。有关全部要求，请参见
            <nuxt-link class="text-link" target="_blank" to="/legal/rules">内容规则</nuxt-link>
            第 2.1 节。
          </span>
        </span>
      </div>
      <MarkdownEditor
        v-model="description"
        :disabled="
          !currentMember ||
          (currentMember.permissions & TeamMemberPermission.EDIT_BODY) !==
            TeamMemberPermission.EDIT_BODY
        "
        :on-image-upload="onUploadHandler"
      />
      <div class="input-group markdown-disclaimer">
        <button
          :disabled="!hasChanges"
          class="iconified-button brand-button"
          type="button"
          @click="saveChanges()"
        >
          <SaveIcon/>
          保存改动
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SaveIcon } from "@modrinth/assets";
import { MarkdownEditor } from "@modrinth/ui";
import { type Project, type TeamMember, TeamMemberPermission } from "@modrinth/utils";
import { computed, ref } from "vue";
import { useImageUpload } from "~/composables/image-upload.ts";

const props = defineProps<{
  project: Project;
  allMembers: TeamMember[];
  currentMember: TeamMember | undefined;
  patchProject: (payload: object, quiet?: boolean) => object;
}>();

const description = ref(props.project.body);

const patchRequestPayload = computed(() => {
  const payload: {
    body?: string;
  } = {};

  if (description.value !== props.project.body) {
    payload.body = description.value;
  }

  return payload;
});

const hasChanges = computed(() => {
  return Object.keys(patchRequestPayload.value).length > 0;
});

function saveChanges() {
  props.patchProject(patchRequestPayload.value);
}

async function onUploadHandler(file: File) {
  const response = await useImageUpload(file, {
    context: "project",
    projectID: props.project.id,
  });

  return response.url;
}
</script>

<style scoped>
.markdown-disclaimer {
  margin-block: 1rem;
}
</style>
