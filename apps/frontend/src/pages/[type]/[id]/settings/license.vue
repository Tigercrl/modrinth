<template>
  <div>
    <section class="universal-card">
      <div class="adjacent-input">
        <label for="license-multiselect">
          <span class="label__title size-card-header">许可证</span>
          <span class="label__description">
            为您的{{ $formatProjectType(project.project_type) }}选择一个合适的许可证是非常重要的。您可以从列表中选择或提供自定义许可证。您也可以为您选择的许可证提供自定义 URL，否则将显示许可证内容。
            <span v-if="license && license.friendly === 'Custom'" class="label__subdescription">
              请输入
              <a href="https://spdx.org/licenses/" target="_blank" rel="noopener" class="text-link">
                SPDX 许可证标识</a
              >。
              如果您的许可证没有 SPDX 标识（例如，如果您自己编写了许可证，或者许可证是特定于 Minecraft 的），只需勾选该框并输入许可证的名称即可。
            </span>
            <span class="label__subdescription">
              感到困惑？有关更多信息，请参阅我们的
              <a
                href="https://blog.modrinth.com/licensing-guide/"
                target="_blank"
                rel="noopener"
                class="text-link"
              >
                许可指南</a
              >。
            </span>
          </span>
        </label>
        <div class="input-stack">
          <Multiselect
            id="license-multiselect"
            v-model="license"
            placeholder="请选择许可证..."
            track-by="short"
            label="friendly"
            :options="defaultLicenses"
            :searchable="true"
            :close-on-select="true"
            :show-labels="false"
            :class="{
              'known-error': license?.short === '' && showKnownErrors,
            }"
            :disabled="!hasPermission"
          />
          <Checkbox
            v-if="license?.requiresOnlyOrLater"
            v-model="allowOrLater"
            :disabled="!hasPermission"
            description="允许许可证的更新版本"
          >
            允许许可证的更新版本
          </Checkbox>
          <Checkbox
            v-if="license?.friendly === 'Custom'"
            v-model="nonSpdxLicense"
            :disabled="!hasPermission"
            description="许可证没有一个 SPDX 标识"
          >
            许可证没有一个 SPDX 标识
          </Checkbox>
          <input
            v-if="license?.friendly === 'Custom'"
            v-model="license.short"
            type="text"
            maxlength="2048"
            :placeholder="nonSpdxLicense ? '许可证名称' : 'SPDX 标识'"
            :class="{
              'known-error': license.short === '' && showKnownErrors,
            }"
            :disabled="!hasPermission"
          />
          <input
            v-model="licenseUrl"
            type="url"
            maxlength="2048"
            placeholder="许可证 URL（可选）"
            :disabled="!hasPermission || licenseId === 'LicenseRef-Unknown'"
          />
        </div>
      </div>
      <div class="input-stack">
        <button
          type="button"
          class="iconified-button brand-button"
          :disabled="!hasChanges || license === null"
          @click="saveChanges()"
        >
          <SaveIcon/>
          保存改动
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import Multiselect from "vue-multiselect";
import Checkbox from "~/components/ui/Checkbox";
import SaveIcon from "~/assets/images/utils/save.svg?component";

export default defineNuxtComponent({
  components: {
    Multiselect,
    Checkbox,
    SaveIcon,
  },
  props: {
    project: {
      type: Object,
      default() {
        return {};
      },
    },
    currentMember: {
      type: Object,
      default() {
        return null;
      },
    },
    patchProject: {
      type: Function,
      default() {
        return () => {
          this.$notify({
            group: "main",
            title: "发生错误",
            text: "资源信息修改函数未定义",
            type: "error",
          });
        };
      },
    },
  },
  data() {
    return {
      licenseUrl: "",
      license: {friendly: "", short: "", requiresOnlyOrLater: false},
      allowOrLater: this.project.license.id.includes("-or-later"),
      nonSpdxLicense: this.project.license.id.includes("LicenseRef-"),
      showKnownErrors: false,
    };
  },
  async setup(props) {
    const defaultLicenses = shallowRef([
      {friendly: "自定义", short: ""},
      {
        friendly: "保留所有权利 / 无许可证",
        short: "All-Rights-Reserved",
      },
      {friendly: "Apache License 2.0", short: "Apache-2.0"},
      {
        friendly: '两句版BSD许可证',
        short: "BSD-2-Clause",
      },
      {
        friendly: '三句版BSD许可证',
        short: "BSD-3-Clause",
      },
      {
        friendly: "CC0（公有领域等效）",
        short: "CC0-1.0",
      },
      {friendly: "CC-BY 4.0", short: "CC-BY-4.0"},
      {
        friendly: "CC-BY-SA 4.0",
        short: "CC-BY-SA-4.0",
      },
      {
        friendly: "CC-BY-NC 4.0",
        short: "CC-BY-NC-4.0",
      },
      {
        friendly: "CC-BY-NC-SA 4.0",
        short: "CC-BY-NC-SA-4.0",
      },
      {
        friendly: "CC-BY-ND 4.0",
        short: "CC-BY-ND-4.0",
      },
      {
        friendly: "CC-BY-NC-ND 4.0",
        short: "CC-BY-NC-ND-4.0",
      },
      {
        friendly: "GNU Affero 通用公共许可证 v3",
        short: "AGPL-3.0",
        requiresOnlyOrLater: true,
      },
      {
        friendly: "GNU 宽通用公共许可证 v2.1",
        short: "LGPL-2.1",
        requiresOnlyOrLater: true,
      },
      {
        friendly: "GNU 宽通用公共许可证 v3",
        short: "LGPL-3.0",
        requiresOnlyOrLater: true,
      },
      {
        friendly: "GNU 通用公共许可证 v2",
        short: "GPL-2.0",
        requiresOnlyOrLater: true,
      },
      {
        friendly: "GNU 通用公共许可证 v3",
        short: "GPL-3.0",
        requiresOnlyOrLater: true,
      },
      {friendly: "ISC 许可证", short: "ISC"},
      {friendly: "MIT 许可证", short: "MIT"},
      {friendly: "Mozilla 公共许可证 2.0", short: "MPL-2.0"},
      {friendly: "zlib 许可证", short: "Zlib"},
    ]);

    const licenseUrl = ref(props.project.license.url);

    const licenseId = props.project.license.id;
    const trimmedLicenseId = licenseId
      .replaceAll("-only", "")
      .replaceAll("-or-later", "")
      .replaceAll("LicenseRef-", "");

    const license = ref(
      defaultLicenses.value.find((x) => x.short === trimmedLicenseId) ?? {
        friendly: "Custom",
        short: licenseId.replaceAll("LicenseRef-", ""),
      },
    );

    if (licenseId === "LicenseRef-Unknown") {
      license.value = {
        friendly: "Unknown",
        short: licenseId.replaceAll("LicenseRef-", ""),
      };
    }

    return {
      defaultLicenses,
      licenseUrl,
      license,
    };
  },
  computed: {
    hasPermission() {
      const EDIT_DETAILS = 1 << 2;
      return (this.currentMember.permissions & EDIT_DETAILS) === EDIT_DETAILS;
    },
    licenseId() {
      let id = "";
      if (this.license === null) return id;
      if (
        (this.nonSpdxLicense && this.license.friendly === "Custom") ||
        this.license.short === "All-Rights-Reserved" ||
        this.license.short === "Unknown"
      ) {
        id += "LicenseRef-";
      }
      id += this.license.short;
      if (this.license.requiresOnlyOrLater) {
        id += this.allowOrLater ? "-or-later" : "-only";
      }
      if (this.nonSpdxLicense && this.license.friendly === "Custom") {
        id = id.replaceAll(" ", "-");
      }
      return id;
    },
    patchData() {
      const data = {};

      if (this.licenseId !== this.project.license.id) {
        data.license_id = this.licenseId;
        data.license_url = this.licenseUrl ? this.licenseUrl : null;
      } else if (this.licenseUrl !== this.project.license.url) {
        data.license_url = this.licenseUrl ? this.licenseUrl : null;
      }

      return data;
    },
    hasChanges() {
      return Object.keys(this.patchData).length > 0;
    },
  },
  methods: {
    saveChanges() {
      if (this.hasChanges) {
        this.patchProject(this.patchData);
      }
    },
  },
});
</script>
