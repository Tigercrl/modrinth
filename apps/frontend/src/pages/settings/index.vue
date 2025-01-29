<template>
  <div>
    <MessageBanner v-if="flags.developerMode" message-type="warning" class="developer-message">
      <CodeIcon class="inline-flex" />
      <strong>开发者模式</strong>已启用。这将允许你查看整个 Modrinth 网站中各种项目的内部 ID，如果你是使用 Modrinth API 的开发者，这可能会对你有所帮助。点击页脚的 Modrinth 徽标 5 次，即可开关开发者模式。
      <Button :action="() => disableDeveloperMode()">
        {{ formatMessage(developerModeBanner.deactivate) }}
      </Button>
    </MessageBanner>
    <section class="universal-card">
      <h2 class="text-2xl">{{ formatMessage(colorTheme.title) }}</h2>
      <p>{{ formatMessage(colorTheme.description) }}</p>
      <ThemeSelector
        :update-color-theme="updateColorTheme"
        :current-theme="theme.preferred"
        :theme-options="themeOptions"
        :system-theme-color="systemTheme"
      />
    </section>
    <section class="universal-card">
      <h2 class="text-2xl">{{ formatMessage(projectListLayouts.title) }}</h2>
      <p class="mb-4">{{ formatMessage(projectListLayouts.description) }}</p>
      <div class="project-lists">
        <div v-for="projectType in listTypes" :key="projectType.id + '-project-list-layouts'">
          <div class="label">
            <div class="label__title">
              {{
                projectListLayouts[projectType.id]
                  ? formatMessage(projectListLayouts[projectType.id])
                  : projectType.id
              }}
            </div>
          </div>
          <div class="project-list-layouts">
            <button
              class="preview-radio button-base"
              :class="{ selected: cosmetics.searchDisplayMode[projectType.id] === 'list' }"
              @click="() => (cosmetics.searchDisplayMode[projectType.id] = 'list')"
            >
              <div class="preview">
                <div class="layout-list-mode">
                  <div class="example-card card"></div>
                  <div class="example-card card"></div>
                  <div class="example-card card"></div>
                  <div class="example-card card"></div>
                </div>
              </div>
              <div class="label">
                <RadioButtonChecked
                  v-if="cosmetics.searchDisplayMode[projectType.id] === 'list'"
                  class="radio"
                />
                <RadioButtonIcon v-else class="radio" />
                Rows
              </div>
            </button>
            <button
              class="preview-radio button-base"
              :class="{ selected: cosmetics.searchDisplayMode[projectType.id] === 'grid' }"
              @click="() => (cosmetics.searchDisplayMode[projectType.id] = 'grid')"
            >
              <div class="preview">
                <div class="layout-grid-mode">
                  <div class="example-card card"></div>
                  <div class="example-card card"></div>
                  <div class="example-card card"></div>
                  <div class="example-card card"></div>
                  <div class="example-card card"></div>
                  <div class="example-card card"></div>
                </div>
              </div>
              <div class="label">
                <RadioButtonChecked
                  v-if="cosmetics.searchDisplayMode[projectType.id] === 'grid'"
                  class="radio"
                />
                <RadioButtonIcon v-else class="radio" />
                Grid
              </div>
            </button>
            <button
              class="preview-radio button-base"
              :class="{ selected: cosmetics.searchDisplayMode[projectType.id] === 'gallery' }"
              @click="() => (cosmetics.searchDisplayMode[projectType.id] = 'gallery')"
            >
              <div class="preview">
                <div class="layout-gallery-mode">
                  <div class="example-card card"></div>
                  <div class="example-card card"></div>
                  <div class="example-card card"></div>
                  <div class="example-card card"></div>
                </div>
              </div>
              <div class="label">
                <RadioButtonChecked
                  v-if="cosmetics.searchDisplayMode[projectType.id] === 'gallery'"
                  class="radio"
                />
                <RadioButtonIcon v-else class="radio" />
                Gallery
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
    <section class="universal-card">
      <h2 class="text-2xl">{{ formatMessage(toggleFeatures.title) }}</h2>
      <p class="mb-4">{{ formatMessage(toggleFeatures.description) }}</p>
      <div class="adjacent-input small">
        <label for="advanced-rendering">
          <span class="label__title">
            {{ formatMessage(toggleFeatures.advancedRenderingTitle) }}
          </span>
          <span class="label__description">
            {{ formatMessage(toggleFeatures.advancedRenderingDescription) }}
          </span>
        </label>
        <input
          id="advanced-rendering"
          v-model="cosmetics.advancedRendering"
          class="switch stylized-toggle"
          type="checkbox"
        />
      </div>
      <div class="adjacent-input small">
        <label for="external-links-new-tab">
          <span class="label__title">
            {{ formatMessage(toggleFeatures.externalLinksNewTabTitle) }}
          </span>
          <span class="label__description">
            {{ formatMessage(toggleFeatures.externalLinksNewTabDescription) }}
          </span>
        </label>
        <input
          id="external-links-new-tab"
          v-model="cosmetics.externalLinksNewTab"
          class="switch stylized-toggle"
          type="checkbox"
        />
      </div>
      <div v-if="false" class="adjacent-input small">
        <label for="modrinth-app-promos">
          <span class="label__title">
            {{ formatMessage(toggleFeatures.hideModrinthAppPromosTitle) }}
          </span>
          <span class="label__description">
            {{ formatMessage(toggleFeatures.hideModrinthAppPromosDescription) }}
          </span>
        </label>
        <input
          id="modrinth-app-promos"
          v-model="cosmetics.hideModrinthAppPromos"
          class="switch stylized-toggle"
          type="checkbox"
        />
      </div>
      <div class="adjacent-input small">
        <label for="search-layout-toggle">
          <span class="label__title">
            {{ formatMessage(toggleFeatures.rightAlignedFiltersSidebarTitle) }}
          </span>
          <span class="label__description">
            {{ formatMessage(toggleFeatures.rightAlignedFiltersSidebarDescription) }}
          </span>
        </label>
        <input
          id="search-layout-toggle"
          v-model="cosmetics.rightSearchLayout"
          class="switch stylized-toggle"
          type="checkbox"
        />
      </div>
      <div class="adjacent-input small">
        <label for="project-layout-toggle">
          <span class="label__title">
            {{ formatMessage(toggleFeatures.leftAlignedContentSidebarTitle) }}
          </span>
          <span class="label__description">
            {{ formatMessage(toggleFeatures.leftAlignedContentSidebarDescription) }}
          </span>
        </label>
        <input
          id="project-layout-toggle"
          v-model="cosmetics.leftContentLayout"
          class="switch stylized-toggle"
          type="checkbox"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { CodeIcon, RadioButtonChecked, RadioButtonIcon } from "@modrinth/assets";
import { Button, ThemeSelector } from "@modrinth/ui";
import MessageBanner from "~/components/ui/MessageBanner.vue";
import type { DisplayLocation } from "~/plugins/cosmetics";
import { formatProjectType } from "@modrinth/utils";
import { isDarkTheme, type Theme } from "~/plugins/theme/index.ts";

useHead({
  title: "外观设置 - Modrinth",
});

const { formatMessage } = useVIntl();

const developerModeBanner = defineMessages({
  description: {
    id: "settings.display.banner.developer-mode.description",
    defaultMessage:
      "<strong>开发者模式</strong>已启用。这将允许你查看整个 Modrinth 网站中各种项目的内部 ID，如果你是使用 Modrinth API 的开发者，这可能会对你有所帮助。点击页脚的 Modrinth 徽标 5 次，即可开关开发者模式。",
  },
  deactivate: {
    id: "settings.display.banner.developer-mode.button",
    defaultMessage: "禁用开发者模式",
  },
});

const colorTheme = defineMessages({
  title: {
    id: "settings.display.theme.title",
    defaultMessage: "主题",
  },
  description: {
    id: "settings.display.theme.description",
    defaultMessage: "在此设备上为 Modrinth 选择您喜欢的主题。",
  },
});

const projectListLayouts = defineMessages({
  title: {
    id: "settings.display.project-list-layouts.title",
    defaultMessage: "列表布局",
  },
  description: {
    id: "settings.display.project-list-layouts.description",
    defaultMessage:
      "为该设备上显示项目列表的每个页面选择您喜欢的布局。",
  },
  mod: {
    id: "settings.display.project-list-layouts.mod",
    defaultMessage: "模组页面",
  },
  plugin: {
    id: "settings.display.project-list-layouts.plugin",
    defaultMessage: "插件页面",
  },
  datapack: {
    id: "settings.display.project-list-layouts.datapack",
    defaultMessage: "数据包页面",
  },
  shader: {
    id: "settings.display.project-list-layouts.shader",
    defaultMessage: "光影页面",
  },
  resourcepack: {
    id: "settings.display.project-list-layouts.resourcepack",
    defaultMessage: "资源包页面",
  },
  modpack: {
    id: "settings.display.project-list-layouts.modpack",
    defaultMessage: "整合包页面",
  },
  user: {
    id: "settings.display.project-list-layouts.user",
    defaultMessage: "用户列表页面",
  },
  collection: {
    id: "settings.display.project-list.layouts.collection",
    defaultMessage: "收藏夹",
  },
});

const toggleFeatures = defineMessages({
  title: {
    id: "settings.display.flags.title",
    defaultMessage: "开关功能",
  },
  description: {
    id: "settings.display.flags.description",
    defaultMessage: "在此设备上启用或禁用某些功能。",
  },
  advancedRenderingTitle: {
    id: "settings.display.sidebar.advanced-rendering.title",
    defaultMessage: "高级渲染",
  },
  advancedRenderingDescription: {
    id: "settings.display.sidebar.advanced-rendering.description",
    defaultMessage:
      "启用高级渲染，例如模糊效果（没有硬件加速时可能导致性能问题）。",
  },
  externalLinksNewTabTitle: {
    id: "settings.display.sidebar.external-links-new-tab.title",
    defaultMessage: "在新标签页打开外部链接",
  },
  externalLinksNewTabDescription: {
    id: "settings.display.sidebar.external-links-new-tab.description",
    defaultMessage:
      "让 Modrinth 以外的链接在新标签页中打开。无论如何设置，同一域名和 Markdown 描述中的链接都会在同一标签页中打开，而广告和编辑页面中的链接则会在新标签页中打开。",
  },
  hideModrinthAppPromosTitle: {
    id: "settings.display.sidebar.hide-app-promos.title",
    defaultMessage: "隐藏 Modrinth App 推广",
  },
  hideModrinthAppPromosDescription: {
    id: "settings.display.sidebar.hide-app-promos.description",
    defaultMessage:
      '从导航栏中隐藏 “获取 Modrinth App” 按钮，您仍可在主页或页脚找到获取 Modrinth App 页面。',
  },
  rightAlignedFiltersSidebarTitle: {
    id: "settings.display.sidebar.right-aligned-filters-sidebar.title",
    defaultMessage: "筛选器侧边栏靠右",
  },
  rightAlignedFiltersSidebarDescription: {
    id: "settings.display.sidebar.right-aligned-filters-sidebar.description",
    defaultMessage: "在搜索页面中将筛选器侧边栏放置在搜索结果的右侧。",
  },
  leftAlignedContentSidebarTitle: {
    id: "settings.display.sidebar.left-aligned-content-sidebar.title",
    defaultMessage: "资源页面侧边栏靠左",
  },
  leftAlignedContentSidebarDescription: {
    id: "settings.display.sidebar.right-aligned-content-sidebar.description",
    defaultMessage: "在资源页面中将侧边栏放置在页面内容的左边。",
  },
});

const cosmetics = useCosmetics();
const flags = useFeatureFlags();
const tags = useTags();

const theme = useTheme();

// On the server the value of native theme can be 'unknown'. To hydrate
// correctly, we need to make sure we aren't using 'unknown' and values between
// server and client renders are in sync.

const serverSystemTheme = useState(() => {
  const theme_ = theme.native;
  if (theme_ === "unknown") return "light";
  return theme_;
});

const systemTheme = useMountedValue((mounted): Theme => {
  const systemTheme_ = mounted ? theme.native : serverSystemTheme.value;
  return systemTheme_ === "light" ? theme.preferences.light : theme.preferences.dark;
});

const themeOptions = computed(() => {
  const options: ("system" | Theme)[] = ["system", "light", "dark", "oled"];
  if (flags.value.developerMode || theme.preferred === "retro") {
    options.push("retro");
  }
  return options;
});

function updateColorTheme(value: Theme | "system") {
  if (value !== "system") {
    if (isDarkTheme(value)) {
      theme.preferences.dark = value;
    } else {
      theme.preferences.light = value;
    }
  }

  theme.preferred = value;
}

function disableDeveloperMode() {
  flags.value.developerMode = !flags.value.developerMode;
  saveFeatureFlags();
  addNotification({
    group: "main",
    title: "Developer mode deactivated",
    text: "Developer mode has been disabled",
    type: "success",
  });
}

const listTypes = computed(() => {
  const types = tags.value.projectTypes.map((type) => {
    return {
      id: type.id as DisplayLocation,
      name: formatProjectType(type.id) + "s",
      display: "the " + formatProjectType(type.id).toLowerCase() + "s search page",
    };
  });

  types.push({
    id: "user" as DisplayLocation,
    name: "User profiles",
    display: "user pages",
  });

  return types;
});
</script>
<style scoped lang="scss">
.project-lists {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);

  > :first-child .label__title {
    margin-top: 0;
  }

  .preview {
    --_layout-width: 7rem;
    --_layout-height: 4.5rem;
    --_layout-gap: 0.25rem;

    .example-card {
      border-radius: 0.5rem;
      width: var(--_layout-width);
      height: calc((var(--_layout-height) - 3 * var(--_layout-gap)) / 4);
      padding: 0;
    }

    .layout-list-mode {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--_layout-gap);
    }

    .layout-grid-mode {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: var(--_layout-gap);

      .example-card {
        width: calc((var(--_layout-width) - 2 * var(--_layout-gap)) / 3);
        height: calc((var(--_layout-height) - var(--_layout-gap)) / 2);
      }
    }

    .layout-gallery-mode {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--_layout-gap);

      .example-card {
        width: calc((var(--_layout-width) - var(--_layout-gap)) / 2);
        height: calc((var(--_layout-height) - var(--_layout-gap)) / 2);
      }
    }
  }
}

.project-list-layouts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
  gap: var(--gap-lg);

  .preview-radio .example-card {
    border: 2px solid transparent;
  }

  .preview-radio.selected .example-card {
    border-color: var(--color-brand);
    background-color: var(--color-brand-highlight);
  }

  .preview {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.developer-message {
  svg {
    vertical-align: middle;
    margin-bottom: 2px;
    margin-right: 0.5rem;
  }

  .btn {
    margin-top: var(--gap-sm);
  }
}
</style>
