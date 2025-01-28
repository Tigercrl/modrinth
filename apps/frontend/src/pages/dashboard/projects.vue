<template>
  <div>
    <Modal ref="editLinksModal" header="修改链接">
      <div class="universal-modal links-modal">
        <p>
          您在下面设置的链接将应用到每个选定的资源。留空的链接将被忽略。您可以使用垃圾桶按钮来删除所有选定资源中的链接。
        </p>
        <section class="links">
          <label
            for="issue-tracker-input"
            title="用户汇报错误、问题和提供建议的地方。"
          >
            <span class="label__title">漏洞追踪器</span>
          </label>
          <div class="input-group shrink-first">
            <input
              id="issue-tracker-input"
              v-model="editLinks.issues.val"
              :disabled="editLinks.issues.clear"
              type="url"
              :placeholder="
                editLinks.issues.clear ? '已有链接将被删除' : '请输入 URL...'
              "
              maxlength="2048"
            />
            <button
              v-tooltip="'删除链接'"
              aria-label="删除链接"
              class="square-button label-button"
              :data-active="editLinks.issues.clear"
              @click="editLinks.issues.clear = !editLinks.issues.clear"
            >
              <TrashIcon/>
            </button>
          </div>
          <label
            for="source-code-input"
            title="包含资源源代码的页面 / 仓库"
          >
            <span class="label__title">源代码</span>
          </label>
          <div class="input-group shrink-first">
            <input
              id="source-code-input"
              v-model="editLinks.source.val"
              :disabled="editLinks.source.clear"
              type="url"
              maxlength="2048"
              :placeholder="
                editLinks.source.clear ? '已有链接将被删除' : '请输入 URL...'
              "
            />
            <button
              v-tooltip="'删除链接'"
              aria-label="删除链接"
              class="square-button label-button"
              :data-active="editLinks.source.clear"
              @click="editLinks.source.clear = !editLinks.source.clear"
            >
              <TrashIcon/>
            </button>
          </div>
          <label
            for="wiki-page-input"
            title="包含资源信息、文档和帮助的页面。"
          >
            <span class="label__title">Wiki</span>
          </label>
          <div class="input-group shrink-first">
            <input
              id="wiki-page-input"
              v-model="editLinks.wiki.val"
              :disabled="editLinks.wiki.clear"
              type="url"
              maxlength="2048"
              :placeholder="
                editLinks.wiki.clear ? '已有链接将被删除' : '请输入 URL...'
              "
            />
            <button
              v-tooltip="'删除链接'"
              aria-label="删除链接"
              class="square-button label-button"
              :data-active="editLinks.wiki.clear"
              @click="editLinks.wiki.clear = !editLinks.wiki.clear"
            >
              <TrashIcon/>
            </button>
          </div>
          <label for="discord-invite-input" title="您的 Discord 服务器的邀请链接。">
            <span class="label__title">Discord 服务器</span>
          </label>
          <div class="input-group shrink-first">
            <input
              id="discord-invite-input"
              v-model="editLinks.discord.val"
              :disabled="editLinks.discord.clear"
              type="url"
              maxlength="2048"
              :placeholder="
                editLinks.discord.clear ? '已有链接将被删除' : '请输入 URL...'
              "
            />
            <button
              v-tooltip="'删除链接'"
              aria-label="删除链接"
              class="square-button label-button"
              :data-active="editLinks.discord.clear"
              @click="editLinks.discord.clear = !editLinks.discord.clear"
            >
              <TrashIcon/>
            </button>
          </div>
        </section>
        <p>
          改动将应用到
          <strong>{{ selectedProjects.length }}</strong>
          个资源
        </p>
        <ul>
          <li
            v-for="project in selectedProjects.slice(
              0,
              editLinks.showAffected ? selectedProjects.length : 3,
            )"
            :key="project.id"
          >
            {{ project.title }}
          </li>
          <li v-if="!editLinks.showAffected && selectedProjects.length > 3">
            <strong>等 {{ selectedProjects.length - 3 }} 个资源...</strong>
          </li>
        </ul>
        <Checkbox
          v-if="selectedProjects.length > 3"
          v-model="editLinks.showAffected"
          :label="editLinks.showAffected ? '隐藏' : '展开'"
          description="显示所有资源"
          :border="false"
          :collapsing-toggle-style="true"
        />
        <div class="push-right input-group">
          <button class="iconified-button" @click="$refs.editLinksModal.hide()">
            <CrossIcon/>
            取消
          </button>
          <button class="iconified-button brand-button" @click="bulkEditLinks()">
            <SaveIcon/>
            保存改动
          </button>
        </div>
      </div>
    </Modal>
    <ModalCreation ref="modal_creation"/>
    <section class="universal-card">
      <div class="header__row">
        <h2 class="header__title text-2xl">资源</h2>
        <div class="input-group">
          <button class="iconified-button brand-button" @click="$refs.modal_creation.show()">
            <PlusIcon/>
            {{ formatMessage(commonMessages.createAProjectButton) }}
          </button>
        </div>
      </div>
      <p v-if="projects.length < 1">
        您没有任何资源。
      </p>
      <template v-else>
        <p>您可以在下面选择多个资源同时进行编辑。</p>
        <div class="input-group">
          <button
            class="iconified-button"
            :disabled="selectedProjects.length === 0"
            @click="$refs.editLinksModal.show()"
          >
            <EditIcon/>
            修改链接
          </button>
          <div class="push-right">
            <div class="labeled-control-row">
              排列方式
              <Multiselect
                v-model="sortBy"
                :searchable="false"
                class="small-select"
                :options="['Name', 'Status', 'Type']"
                :close-on-select="true"
                :show-labels="false"
                :allow-empty="false"
                :custom-label="(option) => {
                  switch (option) {
                    case 'Name':
                      return '名称';
                    case 'Status':
                      return '状态';
                    case 'Type':
                      return '类型';
                    default:
                      return option;
                  }
                }"
                @update:model-value="projects = updateSort(projects, sortBy, descending)"
              />
              <button
                v-tooltip="descending ? '降序' : '升序'"
                class="square-button"
                @click="updateDescending()"
              >
                <DescendingIcon v-if="descending"/>
                <AscendingIcon v-else/>
              </button>
            </div>
          </div>
        </div>
        <div class="grid-table">
          <div class="grid-table__row grid-table__header">
            <div>
              <Checkbox
                :model-value="selectedProjects === projects"
                @update:model-value="
                  selectedProjects === projects
                    ? (selectedProjects = [])
                    : (selectedProjects = projects)
                "
              />
            </div>
            <div>图标</div>
            <div>名称</div>
            <div>ID</div>
            <div>类型</div>
            <div>状态</div>
            <div/>
          </div>
          <div v-for="project in projects" :key="`project-${project.id}`" class="grid-table__row">
            <div>
              <Checkbox
                :disabled="(project.permissions & EDIT_DETAILS) === EDIT_DETAILS"
                :model-value="selectedProjects.includes(project)"
                @update:model-value="
                  selectedProjects.includes(project)
                    ? (selectedProjects = selectedProjects.filter((it) => it !== project))
                    : selectedProjects.push(project)
                "
              />
            </div>
            <div>
              <nuxt-link
                tabindex="-1"
                :to="`/${$getProjectTypeForUrl(project.project_type, project.loaders)}/${
                  project.slug ? project.slug : project.id
                }`"
              >
                <Avatar
                  :src="project.icon_url"
                  aria-hidden="true"
                  :alt="project.title + '的图标'"
                  no-shadow
                />
              </nuxt-link>
            </div>

            <div>
              <span class="project-title">
                <IssuesIcon
                  v-if="project.moderator_message"
                  aria-label="资源收到了来自审核员的消息。查看资源以了解更多信息。"
                />

                <nuxt-link
                  class="hover-link wrap-as-needed"
                  :to="`/${$getProjectTypeForUrl(project.project_type, project.loaders)}/${
                    project.slug ? project.slug : project.id
                  }`"
                >
                  {{ project.title }}
                </nuxt-link>
              </span>
            </div>

            <div>
              <CopyCode :text="project.id"/>
            </div>

            <div>
              {{ $formatProjectType($getProjectTypeForUrl(project.project_type, project.loaders)) }}
            </div>

            <div>
              <Badge v-if="project.status" :type="project.status" class="status"/>
            </div>

            <div>
              <nuxt-link
                class="square-button"
                :to="`/${$getProjectTypeForUrl(project.project_type, project.loaders)}/${
                  project.slug ? project.slug : project.id
                }/settings`"
              >
                <SettingsIcon/>
              </nuxt-link>
            </div>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script>
import {Multiselect} from "vue-multiselect";
import {
  EditIcon,
  IssuesIcon,
  PlusIcon,
  SaveIcon,
  SettingsIcon,
  SortAscendingIcon as AscendingIcon,
  SortDescendingIcon as DescendingIcon,
  TrashIcon,
  XIcon as CrossIcon,
} from "@modrinth/assets";
import {commonMessages} from "@modrinth/ui";

import Badge from "~/components/ui/Badge.vue";
import Checkbox from "~/components/ui/Checkbox.vue";
import Modal from "~/components/ui/Modal.vue";
import Avatar from "~/components/ui/Avatar.vue";
import ModalCreation from "~/components/ui/ModalCreation.vue";
import CopyCode from "~/components/ui/CopyCode.vue";

export default defineNuxtComponent({
  components: {
    Avatar,
    Badge,
    SettingsIcon,
    TrashIcon,
    Checkbox,
    IssuesIcon,
    PlusIcon,
    CrossIcon,
    EditIcon,
    SaveIcon,
    Modal,
    ModalCreation,
    Multiselect,
    CopyCode,
    AscendingIcon,
    DescendingIcon,
  },
  async setup() {
    const {formatMessage} = useVIntl();

    const user = await useUser();
    await initUserProjects();
    return {formatMessage, user: ref(user)};
  },
  data() {
    return {
      projects: this.updateSort(this.user.projects, "Name"),
      versions: [],
      selectedProjects: [],
      sortBy: "Name",
      descending: false,
      editLinks: {
        showAffected: false,
        source: {
          val: "",
          clear: false,
        },
        discord: {
          val: "",
          clear: false,
        },
        wiki: {
          val: "",
          clear: false,
        },
        issues: {
          val: "",
          clear: false,
        },
      },
      commonMessages,
    };
  },
  head: {
    title: "资源 - Modrinth",
  },
  created() {
    this.UPLOAD_VERSION = 1 << 0;
    this.DELETE_VERSION = 1 << 1;
    this.EDIT_DETAILS = 1 << 2;
    this.EDIT_BODY = 1 << 3;
    this.MANAGE_INVITES = 1 << 4;
    this.REMOVE_MEMBER = 1 << 5;
    this.EDIT_MEMBER = 1 << 6;
    this.DELETE_PROJECT = 1 << 7;
  },
  methods: {
    updateDescending() {
      this.descending = !this.descending;
      this.projects = this.updateSort(this.projects, this.sortBy, this.descending);
    },
    updateSort(projects, sort, descending) {
      let sortedArray = projects;
      switch (sort) {
        case "Name":
          sortedArray = projects.slice().sort((a, b) => {
            return a.title.localeCompare(b.title);
          });
          break;
        case "Status":
          sortedArray = projects.slice().sort((a, b) => {
            if (a.status < b.status) {
              return -1;
            }
            if (a.status > b.status) {
              return 1;
            }
            return 0;
          });
          break;
        case "Type":
          sortedArray = projects.slice().sort((a, b) => {
            if (a.project_type < b.project_type) {
              return -1;
            }
            if (a.project_type > b.project_type) {
              return 1;
            }
            return 0;
          });
          break;
        default:
          break;
      }

      if (descending) {
        sortedArray = sortedArray.reverse();
      }

      return sortedArray;
    },
    async bulkEditLinks() {
      try {
        const baseData = {
          issues_url: this.editLinks.issues.clear ? null : this.editLinks.issues.val.trim(),
          source_url: this.editLinks.source.clear ? null : this.editLinks.source.val.trim(),
          wiki_url: this.editLinks.wiki.clear ? null : this.editLinks.wiki.val.trim(),
          discord_url: this.editLinks.discord.clear ? null : this.editLinks.discord.val.trim(),
        };

        if (!baseData.issues_url?.length ?? 1 > 0) {
          delete baseData.issues_url;
        }

        if (!baseData.source_url?.length ?? 1 > 0) {
          delete baseData.source_url;
        }

        if (!baseData.wiki_url?.length ?? 1 > 0) {
          delete baseData.wiki_url;
        }

        if (!baseData.discord_url?.length ?? 1 > 0) {
          delete baseData.discord_url;
        }

        await useBaseFetch(
          `projects?ids=${JSON.stringify(this.selectedProjects.map((x) => x.id))}`,
          {
            method: "PATCH",
            body: baseData,
          },
        );

        this.$refs.editLinksModal.hide();
        this.$notify({
          group: "main",
          title: "Success",
          text: "Bulk edited selected project's links.",
          type: "success",
        });
        this.selectedProjects = [];

        this.editLinks.issues.val = "";
        this.editLinks.source.val = "";
        this.editLinks.wiki.val = "";
        this.editLinks.discord.val = "";
        this.editLinks.issues.clear = false;
        this.editLinks.source.clear = false;
        this.editLinks.wiki.clear = false;
        this.editLinks.discord.clear = false;
      } catch (e) {
        this.$notify({
          group: "main",
          title: "发生错误",
          text: e,
          type: "error",
        });
      }
    },
  },
});
</script>
<style lang="scss" scoped>
.grid-table {
  display: grid;
  grid-template-columns:
    min-content min-content minmax(min-content, 2fr)
    minmax(min-content, 1fr) minmax(min-content, 1fr) minmax(min-content, 1fr) min-content;
  border-radius: var(--size-rounded-sm);
  overflow: hidden;
  margin-top: var(--spacing-card-md);
  outline: 1px solid transparent;

  .grid-table__row {
    display: contents;

    > div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: var(--spacing-card-sm);

      // Left edge of table
      &:first-child {
        padding-left: var(--spacing-card-bg);
      }

      // Right edge of table
      &:last-child {
        padding-right: var(--spacing-card-bg);
      }
    }

    &:nth-child(2n + 1) > div {
      background-color: var(--color-table-alternate-row);
    }

    &.grid-table__header > div {
      background-color: var(--color-bg);
      font-weight: bold;
      color: var(--color-text-dark);
      padding-top: var(--spacing-card-bg);
      padding-bottom: var(--spacing-card-bg);
    }
  }

  @media screen and (max-width: 750px) {
    display: flex;
    flex-direction: column;

    .grid-table__row {
      display: grid;
      grid-template: "checkbox icon name type settings" "checkbox icon id status settings";
      grid-template-columns:
        min-content min-content minmax(min-content, 2fr)
        minmax(min-content, 1fr) min-content;

      :nth-child(1) {
        grid-area: checkbox;
      }

      :nth-child(2) {
        grid-area: icon;
      }

      :nth-child(3) {
        grid-area: name;
      }

      :nth-child(4) {
        grid-area: id;
        padding-top: 0;
      }

      :nth-child(5) {
        grid-area: type;
      }

      :nth-child(6) {
        grid-area: status;
        padding-top: 0;
      }

      :nth-child(7) {
        grid-area: settings;
      }
    }

    .grid-table__header {
      grid-template: "checkbox settings";
      grid-template-columns: min-content minmax(min-content, 1fr);

      :nth-child(2),
      :nth-child(3),
      :nth-child(4),
      :nth-child(5),
      :nth-child(6) {
        display: none;
      }
    }
  }

  @media screen and (max-width: 560px) {
    .grid-table__row {
      display: grid;
      grid-template: "checkbox icon name settings" "checkbox icon id settings" "checkbox icon type settings" "checkbox icon status settings";
      grid-template-columns: min-content min-content minmax(min-content, 1fr) min-content;

      :nth-child(5) {
        padding-top: 0;
      }
    }

    .grid-table__header {
      grid-template: "checkbox settings";
      grid-template-columns: min-content minmax(min-content, 1fr);
    }
  }
}

.project-title {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-card-xs);

  svg {
    color: var(--color-orange);
  }
}

.status {
  margin-top: var(--spacing-card-xs);
}

.hover-link:hover {
  text-decoration: underline;
}

.labeled-control-row {
  flex: 1;
  display: flex;
  flex-direction: row;
  min-width: 0;
  align-items: center;
  gap: var(--spacing-card-md);
  white-space: nowrap;
}

.small-select {
  width: -moz-fit-content;
  width: fit-content;
}

.label-button[data-active="true"] {
  --background-color: var(--color-red);
  --text-color: var(--color-brand-inverted);
}

.links-modal {
  .links {
    display: grid;
    gap: var(--spacing-card-sm);
    grid-template-columns: 1fr 2fr;

    .input-group {
      flex-wrap: nowrap;
    }

    @media screen and (max-width: 530px) {
      grid-template-columns: 1fr;
      .input-group {
        flex-wrap: wrap;
      }
    }
  }

  ul {
    margin: 0 0 var(--spacing-card-sm) 0;
  }
}
</style>
