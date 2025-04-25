<template>
  <div>
    <section class="universal-card">
      <h2>External links</h2>
      <div class="adjacent-input">
        <label
          id="project-issue-tracker"
          title="用户汇报错误、问题和提供建议的地方。"
        >
          <span class="label__title">漏洞追踪器</span>
          <span class="label__description">
            用户报告错误、问题和提供建议的地方。
          </span>
        </label>
        <input
          id="project-issue-tracker"
          v-model="issuesUrl"
          type="url"
          placeholder="请输入 URL..."
          maxlength="2048"
          :disabled="!hasPermission"
        />
      </div>
      <div class="adjacent-input">
        <label
          id="project-source-code"
          title="包含资源源代码的页面 / 仓库"
        >
          <span class="label__title">源代码</span>
          <span class="label__description">
            包含资源源代码的页面 / 仓库
          </span>
        </label>
        <input
          id="project-source-code"
          v-model="sourceUrl"
          type="url"
          maxlength="2048"
          placeholder="请输入 URL..."
          :disabled="!hasPermission"
        />
      </div>
      <div class="adjacent-input">
        <label
          id="project-wiki-page"
          title="包含资源信息、文档和帮助的页面。"
        >
          <span class="label__title">Wiki</span>
          <span class="label__description">
            包含资源信息、文档和帮助的页面。
          </span>
        </label>
        <input
          id="project-wiki-page"
          v-model="wikiUrl"
          type="url"
          maxlength="2048"
          placeholder="请输入 URL..."
          :disabled="!hasPermission"
        />
      </div>
      <div class="adjacent-input">
        <label id="project-discord-invite" title="您的 Discord 服务器的邀请链接。">
          <span class="label__title">Discord 服务器</span>
          <span class="label__description"> 您的 Discord 服务器的邀请链接。 </span>
        </label>
        <input
          id="project-discord-invite"
          v-model="discordUrl"
          type="url"
          maxlength="2048"
          placeholder="请输入 URL..."
          :disabled="!hasPermission"
        />
      </div>
      <span class="label">
        <span class="label__title">赞助</span>
        <span class="label__description">
          一个赞助链接，让用户支持您的创作。
        </span>
      </span>

      <div
        v-for="(donationLink, index) in donationLinks"
        :key="`donation-link-${index}`"
        class="input-group donation-link-group"
      >
        <input
          v-model="donationLink.url"
          type="url"
          maxlength="2048"
          placeholder="请输入 URL..."
          :disabled="!hasPermission"
          @input="updateDonationLinks"
        />
        <DropdownSelect
          v-model="donationLink.id"
          name="赞助平台选择器"
          :options="tags.donationPlatforms.map((x) => x.short)"
          :display-name="
            (option) => {
              if(option === 'other') return '其他'
              return tags.donationPlatforms.find((platform) => platform.short === option)?.name
            }
          "
          placeholder="请选择平台..."
          render-up
          class="platform-selector"
          @update:model-value="updateDonationLinks"
        />
      </div>
      <div class="button-group">
        <button
          type="button"
          class="iconified-button brand-button"
          :disabled="!hasChanges"
          @click="saveChanges()"
        >
          <SaveIcon />
          保存改动
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { DropdownSelect } from "@modrinth/ui";
import { SaveIcon } from "@modrinth/assets";

const tags = useTags();

const props = defineProps({
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
      return () => {};
    },
  },
});

const issuesUrl = ref(props.project.issues_url);
const sourceUrl = ref(props.project.source_url);
const wikiUrl = ref(props.project.wiki_url);
const discordUrl = ref(props.project.discord_url);

const rawDonationLinks = JSON.parse(JSON.stringify(props.project.donation_urls));
rawDonationLinks.push({
  id: null,
  platform: null,
  url: null,
});
const donationLinks = ref(rawDonationLinks);

const hasPermission = computed(() => {
  const EDIT_DETAILS = 1 << 2;
  return (props.currentMember.permissions & EDIT_DETAILS) === EDIT_DETAILS;
});

const patchData = computed(() => {
  const data = {};

  if (checkDifference(issuesUrl.value, props.project.issues_url)) {
    data.issues_url = issuesUrl.value === "" ? null : issuesUrl.value.trim();
  }
  if (checkDifference(sourceUrl.value, props.project.source_url)) {
    data.source_url = sourceUrl.value === "" ? null : sourceUrl.value.trim();
  }
  if (checkDifference(wikiUrl.value, props.project.wiki_url)) {
    data.wiki_url = wikiUrl.value === "" ? null : wikiUrl.value.trim();
  }
  if (checkDifference(discordUrl.value, props.project.discord_url)) {
    data.discord_url = discordUrl.value === "" ? null : discordUrl.value.trim();
  }

  const validDonationLinks = donationLinks.value.filter((link) => link.url && link.id);

  if (
    validDonationLinks !== props.project.donation_urls &&
    !(
      props.project.donation_urls &&
      props.project.donation_urls.length === 0 &&
      validDonationLinks.length === 0
    )
  ) {
    data.donation_urls = validDonationLinks;
  }

  if (data.donation_urls) {
    data.donation_urls.forEach((link) => {
      const platform = tags.value.donationPlatforms.find((platform) => platform.short === link.id);
      link.platform = platform.name;
    });
  }

  return data;
});

const hasChanges = computed(() => {
  return Object.keys(patchData.value).length > 0;
});

async function saveChanges() {
  if (patchData.value && (await props.patchProject(patchData.value))) {
    donationLinks.value = JSON.parse(JSON.stringify(props.project.donation_urls));
    donationLinks.value.push({
      id: null,
      platform: null,
      url: null,
    });
  }
}

function updateDonationLinks() {
  const links = donationLinks.value;
  links.forEach((link) => {
    if (link.url) {
      const url = link.url.toLowerCase();
      if (url.includes("patreon.com")) {
        link.id = "patreon";
      } else if (url.includes("ko-fi.com")) {
        link.id = "ko-fi";
      } else if (url.includes("paypal.com") || url.includes("paypal.me")) {
        link.id = "paypal";
      } else if (url.includes("buymeacoffee.com") || url.includes("buymeacoff.ee")) {
        link.id = "bmac";
      } else if (url.includes("github.com/sponsors")) {
        link.id = "github";
      }
    }
  });
  if (!links.find((link) => !(link.url && link.id))) {
    links.push({
      id: null,
      platform: null,
      url: null,
    });
  }
  donationLinks.value = links;
}

function checkDifference(newLink, existingLink) {
  if (newLink === "" && existingLink !== null) {
    return true;
  }
  if (!newLink && !existingLink) {
    return false;
  }
  return newLink !== existingLink;
}
</script>
<style lang="scss" scoped>
.donation-link-group {
  input {
    flex-grow: 2;
    max-width: 26rem;
  }

  :deep(.animated-dropdown .selected) {
    height: 40px;
  }
}

.button-group {
  justify-content: flex-start;
}
</style>
