<template>
  <div v-if="showInvitation" class="universal-card information invited">
    <h2>邀请您共创资源</h2>
    <p>
      您被邀请成为该资源创作者的一员并担任 “{{ currentMember.role }}”。
    </p>
    <div class="input-group">
      <button class="iconified-button brand-button" @click="acceptInvite()">
        <CheckIcon/>
        同意
      </button>
      <button class="iconified-button danger-button" @click="declineInvite()">
        <CrossIcon/>
        拒绝
      </button>
    </div>
  </div>
  <div
    v-if="
      currentMember &&
      nags.filter((x) => x.condition).length > 0 &&
      (project.status === 'draft' || tags.rejectedStatuses.includes(project.status))
    "
    class="author-actions universal-card mb-4"
  >
    <div class="header__row">
      <div class="header__title">
        <h2>发布建议</h2>
        <div class="checklist">
          <span class="checklist__title">进度：</span>
          <div class="checklist__items">
            <div
              v-for="nag in nags"
              :key="`checklist-${nag.id}`"
              v-tooltip="nag.title"
              :aria-label="nag.title"
              class="circle"
              :class="'circle ' + (!nag.condition ? 'done' : '') + nag.status"
            >
              <CheckIcon v-if="!nag.condition"/>
              <RequiredIcon v-else-if="nag.status === 'required'"/>
              <SuggestionIcon v-else-if="nag.status === 'suggestion'"/>
              <ModerationIcon v-else-if="nag.status === 'review'"/>
            </div>
          </div>
        </div>
      </div>
      <div class="input-group">
        <button
          class="square-button"
          :class="{ 'not-collapsed': !collapsed }"
          @click="toggleCollapsed()"
        >
          <DropdownIcon/>
        </button>
      </div>
    </div>
    <div v-if="!collapsed" class="grid-display width-16">
      <div
        v-for="nag in nags.filter((x) => x.condition && !x.hide)"
        :key="nag.id"
        class="grid-display__item"
      >
        <span class="label">
          <RequiredIcon
            v-if="nag.status === 'required'"
            v-tooltip="'Required'"
            aria-label="Required"
            :class="nag.status"
          />
          <SuggestionIcon
            v-else-if="nag.status === 'suggestion'"
            v-tooltip="'Suggestion'"
            aria-label="Suggestion"
            :class="nag.status"
          />
          <ModerationIcon
            v-else-if="nag.status === 'review'"
            v-tooltip="'Review'"
            aria-label="Review"
            :class="nag.status"
          />{{ nag.title }}</span
        >
        {{ nag.description }}
        <NuxtLink
          v-if="nag.link"
          :class="{ invisible: nag.link.hide }"
          class="goto-link"
          :to="`/${project.project_type}/${project.slug ? project.slug : project.id}/${
            nag.link.path
          }`"
        >
          {{ nag.link.title }}
          <ChevronRightIcon class="featured-header-chevron" aria-hidden="true"/>
        </NuxtLink>
        <button
          v-else-if="nag.action"
          class="btn btn-orange"
          :disabled="nag.action.disabled()"
          @click="nag.action.onClick"
        >
          <SendIcon/>
          {{ nag.action.title }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {capitalizeString, formatProjectType} from "@modrinth/utils";

import ChevronRightIcon from "~/assets/images/utils/chevron-right.svg?component";
import DropdownIcon from "~/assets/images/utils/dropdown.svg?component";
import CheckIcon from "~/assets/images/utils/check.svg?component";
import CrossIcon from "~/assets/images/utils/x.svg?component";
import RequiredIcon from "~/assets/images/utils/asterisk.svg?component";
import SuggestionIcon from "~/assets/images/utils/lightbulb.svg?component";
import ModerationIcon from "~/assets/images/sidebar/admin.svg?component";
import SendIcon from "~/assets/images/utils/send.svg?component";
import {acceptTeamInvite, removeTeamMember} from "~/helpers/teams.js";

const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  versions: {
    type: Array,
    default() {
      return [];
    },
  },
  currentMember: {
    type: Object,
    default: null,
  },
  allMembers: {
    type: Object,
    default: null,
  },
  isSettings: {
    type: Boolean,
    default: false,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  routeName: {
    type: String,
    default: "",
  },
  auth: {
    type: Object,
    required: true,
  },
  tags: {
    type: Object,
    required: true,
  },
  setProcessing: {
    type: Function,
    default() {
      return () => {
        addNotification({
          group: "main",
          title: "发生错误",
          text: "setProcessing 函数未定义",
          type: "error",
        });
      };
    },
  },
  toggleCollapsed: {
    type: Function,
    default() {
      return () => {
        addNotification({
          group: "main",
          title: "发生错误",
          text: "toggleCollapsed 函数未定义",
          type: "error",
        });
      };
    },
  },
  updateMembers: {
    type: Function,
    default() {
      return () => {
        addNotification({
          group: "main",
          title: "发生错误",
          text: "updateMembers 函数未定义",
          type: "error",
        });
      };
    },
  },
});

const featuredGalleryImage = computed(() => props.project.gallery.find((img) => img.featured));

const nags = computed(() => [
  {
    condition: props.versions.length < 1,
    title: "发布一个版本",
    id: "upload-version",
    description: "提交审核的资源至少需要拥有一个版本。",
    status: "required",
    link: {
      path: "versions",
      title: "前往版本页面",
      hide: props.routeName === "type-id-versions",
    },
  },
  {
    condition:
      props.project.body === "" || props.project.body.startsWith("# Placeholder description"),
    title: "添加描述",
    id: "add-description",
    description:
      "一个清晰的资源和功能描述是必需的。",
    status: "required",
    link: {
      path: "settings/description",
      title: "前往描述设置",
      hide: props.routeName === "type-id-settings-description",
    },
  },
  {
    condition: !props.project.icon_url,
    title: "添加图标",
    id: "add-icon",
    description:
      "您的资源应该有一个漂亮的图标，以便用户找到您的资源。",
    status: "suggestion",
    link: {
      path: "settings",
      title: "前往通用设置",
      hide: props.routeName === "type-id-settings",
    },
  },
  {
    condition: props.project.gallery.length === 0 || !featuredGalleryImage,
    title: "提供展示图片",
    id: "feature-gallery-image",
    description: "展示图片可能是许多用户的第一印象。",
    status: "suggestion",
    link: {
      path: "gallery",
      title: "前往画廊",
      hide: props.routeName === "type-id-gallery",
    },
  },
  {
    hide: props.project.versions.length === 0,
    condition: props.project.categories.length < 1,
    title: "选择标签",
    id: "select-tags",
    description: "请选择符合资源特点的标签。",
    status: "suggestion",
    link: {
      path: "settings/tags",
      title: "前往标签设置",
      hide: props.routeName === "type-id-settings-tags",
    },
  },
  {
    condition: !(
      props.project.issues_url ||
      props.project.source_url ||
      props.project.wiki_url ||
      props.project.discord_url ||
      props.project.donation_urls.length > 0
    ),
    title: "添加外部链接",
    id: "add-links",
    description:
      "添加 Modrinth 之外有关该资源的链接，例如源代码、反馈和 Discord 服务器邀请。",
    status: "suggestion",
    link: {
      path: "settings/links",
      title: "前往链接设置",
      hide: props.routeName === "type-id-settings-links",
    },
  },
  {
    hide:
      props.project.versions.length === 0 ||
      props.project.project_type === "resourcepack" ||
      props.project.project_type === "plugin" ||
      props.project.project_type === "shader" ||
      props.project.project_type === "datapack",
    condition:
      props.project.client_side === "unknown" ||
      props.project.server_side === "unknown" ||
      (props.project.client_side === "unsupported" && props.project.server_side === "unsupported"),
    title: "选择支持的环境",
    id: "select-environments",
    description: `请选择该${formatProjectType(
      props.project.project_type,
    ).toLowerCase()}是否在客户端 和/或 服务器中有效。`,
    status: "required",
    link: {
      path: "settings",
      title: "前往通用设置",
      hide: props.routeName === "type-id-settings",
    },
  },
  {
    condition: props.project.license.id === "LicenseRef-Unknown",
    title: "选择许可证",
    id: "select-license",
    description: `请选择该${formatProjectType(
      props.project.project_type,
    ).toLowerCase()}的分发许可证。`,
    status: "required",
    link: {
      path: "settings/license",
      title: "前往许可证设置",
      hide: props.routeName === "type-id-settings-license",
    },
  },
  {
    condition: props.project.status === "draft",
    title: "提交审核",
    id: "submit-for-review",
    description:
      "您的资源当前只能由创作者查看。它必须经过审核的审查才能被其他用户访问。",
    status: "review",
    link: null,
    action: {
      onClick: submitForReview,
      title: "提交审核",
      disabled: () => nags.value.filter((x) => x.condition && x.status === "required").length > 0,
    },
  },
  {
    condition: props.tags.rejectedStatuses.includes(props.project.status),
    title: "重新提交审核",
    id: "resubmit-for-review",
    description: `Modrinth 团队${formatProjectStatusVerb(props.project.status)}了您的资源。在大多数情况下，您可以在处理审核员的消息后重新提交审核。`,
    status: "review",
    link: {
      path: "moderation",
      title: "前往审核页面",
      hide: props.routeName === "type-id-moderation",
    },
  },
]);

const formatProjectStatusVerb = (name) => {
  if (name === 'approved') {
    return '通过'
  } else if (name === 'rejected') {
    return '驳回'
  } else if (name === 'unlisted') {
    return '隐藏'
  } else if (name === 'withheld') {
    return '保留'
  } else if (name === 'archived') {
    return '归档'
  }

  return capitalizeString(name)
}

const showInvitation = computed(() => {
  if (props.allMembers && props.auth) {
    const member = props.allMembers.find((x) => x.user.id === props.auth.user.id);
    return member && !member.accepted;
  }
  return false;
});

const acceptInvite = () => {
  acceptTeamInvite(props.project.team);
  props.updateMembers();
};

const declineInvite = () => {
  removeTeamMember(props.project.team, props.auth.user.id);
  props.updateMembers();
};

const submitForReview = async () => {
  if (
    !props.acknowledgedMessage ||
    nags.value.filter((x) => x.condition && x.status === "required").length === 0
  ) {
    await props.setProcessing();
  }
};
</script>

<style lang="scss" scoped>
.author-actions {
  margin-top: var(--spacing-card-md);

  &:empty {
    display: none;
  }

  .invisible {
    visibility: hidden;
  }

  .header__row {
    align-items: center;
    column-gap: var(--spacing-card-lg);
    row-gap: var(--spacing-card-md);
    max-width: 100%;

    .header__title {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      column-gap: var(--spacing-card-lg);
      row-gap: var(--spacing-card-md);
      flex-basis: min-content;

      h2 {
        margin: 0 auto 0 0;
      }
    }

    button {
      svg {
        transition: transform 0.25s ease-in-out;
      }

      &.not-collapsed svg {
        transform: rotate(180deg);
      }
    }
  }

  .grid-display__item .label {
    display: flex;
    gap: var(--spacing-card-xs);
    align-items: center;

    .required {
      color: var(--color-red);
    }

    .suggestion {
      color: var(--color-purple);
    }

    .review {
      color: var(--color-orange);
    }
  }

  .checklist {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--spacing-card-xs);
    width: fit-content;
    flex-wrap: wrap;
    max-width: 100%;

    .checklist__title {
      font-weight: bold;
      margin-right: var(--spacing-card-xs);
      color: var(--color-text-dark);
    }

    .checklist__items {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--spacing-card-xs);
      width: fit-content;
      max-width: 100%;
    }

    .circle {
      --circle-size: 2rem;
      --background-color: var(--color-bg);
      --content-color: var(--color-gray);
      width: var(--circle-size);
      height: var(--circle-size);
      border-radius: 50%;
      background-color: var(--background-color);
      display: flex;
      justify-content: center;
      align-items: center;

      svg {
        color: var(--content-color);
        width: calc(var(--circle-size) / 2);
        height: calc(var(--circle-size) / 2);
      }

      &.required {
        --content-color: var(--color-red);
      }

      &.suggestion {
        --content-color: var(--color-purple);
      }

      &.review {
        --content-color: var(--color-orange);
      }

      &.done {
        --background-color: var(--color-green);
        --content-color: var(--color-brand-inverted);
      }
    }
  }
}
</style>
