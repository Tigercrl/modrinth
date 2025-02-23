<template>
  <div>
    <section class="universal-card">
      <h2 class="label__title size-card-header">许可证</h2>
      <p class="label__description">
        为您的{{ formatProjectType(project.project_type).toLowerCase() }}选择一个合适的许可证是非常重要的。您可以从列表中选择或提供自定义许可证。您也可以为您选择的许可证提供自定义 URL，否则将显示许可证内容。有关更多信息，请参阅我们的
        <a
          href="https://blog.modrinth.com/licensing-guide/"
          target="_blank"
          rel="noopener"
          class="text-link"
        >
          许可证选择指南
        </a>。
      </p>

      <div class="adjacent-input">
        <label for="license-multiselect">
          <span class="label__title">选择一个许可证</span>
          <span class="label__description">
            允许和禁止用户使用您的资源做什么。
          </span>
        </label>

        <div class="w-1/2">
          <DropdownSelect
            v-model="license"
            name="许可证选择"
            :options="builtinLicenses"
            :display-name="(chosen: BuiltinLicense) => chosen.friendly"
            placeholder="请选择许可证..."
          />
        </div>
      </div>

      <div class="adjacent-input" v-if="license.requiresOnlyOrLater">
        <label for="or-later-checkbox">
          <span class="label__title">后续版本</span>
          <span class="label__description">
            您选择的许可证可以允许后续版本。如果您选中此复选框，则用户可以在许可证后续版本的规定下使用您的资源。
          </span>
        </label>

        <Checkbox
          id="or-later-checkbox"
          v-model="allowOrLater"
          :disabled="!hasPermission"
          description="允许后续版本"
          class="w-1/2"
        >
          允许后续版本
        </Checkbox>
      </div>

      <div class="adjacent-input">
        <label for="license-url">
          <span class="label__title">许可证 URL</span>
          <span class="label__description" v-if="license?.friendly !== '自定义'">
            完整许可证文本的网站位置。如果您不提供链接，则将显示许可证文本。
          </span>
          <span class="label__description" v-else>
            完整许可证文本的网站位置。您必须提供链接，因为您正在自定义许可证。
          </span>
        </label>

        <div class="w-1/2">
          <input
            id="license-url"
            v-model="licenseUrl"
            type="url"
            maxlength="2048"
            :placeholder="license?.friendly !== '自定义' ? `许可证 URL（可选）` : `许可证 URL`"
            :disabled="!hasPermission || licenseId === 'LicenseRef-Unknown'"
            class="w-full"
          />
        </div>
      </div>

      <div class="adjacent-input" v-if="license?.friendly === '自定义'">
        <label for="license-spdx" v-if="!nonSpdxLicense">
          <span class="label__title">SPDX 标识</span>
          <span class="label__description">
            如果您的许可证没有
            <a href="https://spdx.org/licenses/" target="_blank" rel="noopener" class="text-link">
              SPDX 标识</a
            >，只需勾选复选框并输入许可证的名称即可。
          </span>
        </label>
        <label for="license-name" v-else>
          <span class="label__title">许可证名称</span>
          <span class="label__description"
            >许可证的完整名称。如果许可证有SPDX标识，请取消选中复选框并使用标识。</span
          >
        </label>

        <div class="input-stack w-1/2">
          <input
            v-if="!nonSpdxLicense"
            v-model="license.short"
            id="license-spdx"
            class="w-full"
            type="text"
            maxlength="128"
            placeholder="SPDX identifier"
            :disabled="!hasPermission"
          />
          <input
            v-else
            v-model="license.short"
            id="license-name"
            class="w-full"
            type="text"
            maxlength="128"
            placeholder="License name"
            :disabled="!hasPermission"
          />

          <Checkbox
            v-if="license?.friendly === '自定义'"
            v-model="nonSpdxLicense"
            :disabled="!hasPermission"
            description="许可证没有一个 SPDX 标识"
          >
            许可证没有一个 SPDX 标识
          </Checkbox>
        </div>
      </div>

      <div class="input-stack">
        <button
          type="button"
          class="iconified-button brand-button"
          :disabled="
            !hasChanges ||
            !hasPermission ||
            (license.friendly === 'Custom' && (license.short === '' || licenseUrl === ''))
          "
          @click="saveChanges()"
        >
          <SaveIcon/>
          保存改动
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Checkbox, DropdownSelect } from "@modrinth/ui";
import {
  TeamMemberPermission,
  builtinLicenses,
  formatProjectType,
  type BuiltinLicense,
  type Project,
  type TeamMember,
} from "@modrinth/utils";
import { computed, ref, type Ref } from "vue";
import SaveIcon from "~/assets/images/utils/save.svg?component";

const props = defineProps<{
  project: Project;
  currentMember: TeamMember | undefined;
  patchProject: (payload: Object, quiet?: boolean) => Object;
}>();

const licenseUrl = ref(props.project.license.url);
const license: Ref<{
  friendly: string;
  short: string;
  requiresOnlyOrLater?: boolean;
}> = ref({
  friendly: "",
  short: "",
  requiresOnlyOrLater: false,
});

const allowOrLater = ref(props.project.license.id.includes("-or-later"));
const nonSpdxLicense = ref(props.project.license.id.includes("LicenseRef-"));

const oldLicenseId = props.project.license.id;
const trimmedLicenseId = oldLicenseId
  .replaceAll("-only", "")
  .replaceAll("-or-later", "")
  .replaceAll("LicenseRef-", "");

license.value = builtinLicenses.find((x) => x.short === trimmedLicenseId) ?? {
  friendly: "自定义",
  short: oldLicenseId.replaceAll("LicenseRef-", ""),
  requiresOnlyOrLater: oldLicenseId.includes("-or-later"),
};

if (oldLicenseId === "LicenseRef-Unknown") {
  // Mark it as not having a license, forcing the user to select one
  license.value = {
    friendly: "",
    short: oldLicenseId.replaceAll("LicenseRef-", ""),
    requiresOnlyOrLater: false,
  };
}

const hasPermission = computed(() => {
  return (props.currentMember?.permissions ?? 0) & TeamMemberPermission.EDIT_DETAILS;
});

const licenseId = computed(() => {
  let id = "";

  if (
    (nonSpdxLicense && license.value.friendly === "自定义") ||
    license.value.short === "All-Rights-Reserved" ||
    license.value.short === "Unknown"
  ) {
    id += "LicenseRef-";
  }

  id += license.value.short;
  if (license.value.requiresOnlyOrLater) {
    id += allowOrLater.value ? "-or-later" : "-only";
  }

  if (nonSpdxLicense && license.value.friendly === "自定义") {
    id = id.replaceAll(" ", "-");
  }

  return id;
});

const patchRequestPayload = computed(() => {
  const payload: {
    license_id?: string;
    license_url?: string | null; // null = remove url
  } = {};

  if (licenseId.value !== props.project.license.id) {
    payload.license_id = licenseId.value;
  }

  if (licenseUrl.value !== props.project.license.url) {
    payload.license_url = licenseUrl.value ? licenseUrl.value : null;
  }

  return payload;
});

const hasChanges = computed(() => {
  return Object.keys(patchRequestPayload.value).length > 0;
});

function saveChanges() {
  props.patchProject(patchRequestPayload.value);
}
</script>
