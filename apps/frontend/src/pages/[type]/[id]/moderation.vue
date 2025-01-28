<template>
  <div>
    <section class="universal-card">
      <h2>资源状态</h2>
      <Badge :type="project.status"/>
      <p v-if="isApproved(project)">
        您的资源已过审，您可以在
        <router-link :to="`${getProjectLink(project)}/settings`" class="text-link"
        >资源设置
        </router-link
        >
        中修改资源的可见性
      </p>
      <div v-else-if="isUnderReview(project)">
        <p>
          Modrinth
          的审核团队一直在努力审查所有提交的资源。通常，您提交的审核会在24到48小时内被处理。请注意，较大的资源，特别是整合包，可能需要更多的时间来审核。并且某些节假日或事件也可能导致审核推迟，这具体取决于审核员的情况。如果
          Modrinth 的审核员发现问题，他们会在下面留言。
        </p>
        <p>
          如果您的审核时间超过 48 小时，请查看我们关于
          <a
            class="text-link"
            href="https://support.modrinth.com/en/articles/8793355-modrinth-project-review-times"
            target="_blank"
          >
            审核时间的支持文章
          </a>
          以了解审核延迟情况。
        </p>
      </div>
      <template v-else-if="isRejected(project)">
        <p>
          您的资源目前不符合 Modrinth 的
          <nuxt-link to="/legal/rules" class="text-link" target="_blank">内容规定</nuxt-link>
          ，审核员要求您进行修改。请阅读以下审核员的留言，并在重新提交前处理他们的改进需求。
        </p>
        <p class="warning">
          <IssuesIcon/>
          重复提交而不解决审核团队的改进需求可能导致帐户封禁。
        </p>
      </template>
      <h3>当前可见性</h3>
      <ul class="visibility-info">
        <li v-if="isListed(project)">
          <CheckIcon class="good"/>
          可被搜索
        </li>
        <li v-else>
          <ExitIcon class="bad"/>
          不可被搜索
        </li>
        <li v-if="isListed(project)">
          <CheckIcon class="good"/>
          可在个人资料中看到
        </li>
        <li v-else>
          <ExitIcon class="bad"/>
          不可在个人资料中看到
        </li>
        <li v-if="isPrivate(project)">
          <ExitIcon class="bad"/>
          不可通过 URL 访问
        </li>
        <li v-else>
          <CheckIcon class="good"/>
          可通过 URL 访问
        </li>
      </ul>
    </section>
    <section id="messages" class="universal-card">
      <h2>消息</h2>
      <p>
        这是与 Modrinth 审核员的私人对话。他们可能会给您发送有关此资源问题的信息。只有当您提交审核时，该对话才会被查看。如有其他疑问，请联系
        <a href="https://support.modrinth.com">Modrinth 支持</a>。
      </p>
      <ConversationThread
        v-if="thread"
        :thread="thread"
        :project="project"
        :set-status="setStatus"
        :current-member="currentMember"
        :auth="auth"
        @update-thread="(newThread) => (thread = newThread)"
      />
    </section>
  </div>
</template>
<script setup>
import {CheckIcon, ExitIcon, IssuesIcon} from "@modrinth/assets";
import {Badge} from "@modrinth/ui";
import ConversationThread from "~/components/ui/thread/ConversationThread.vue";
import {
  getProjectLink,
  isApproved,
  isListed,
  isPrivate,
  isRejected,
  isUnderReview,
} from "~/helpers/projects.js";

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
  resetProject: {
    type: Function,
    required: true,
    default: () => {
    },
  },
});

const app = useNuxtApp();
const auth = await useAuth();

const {data: thread} = await useAsyncData(`thread/${props.project.thread_id}`, () =>
  useBaseFetch(`thread/${props.project.thread_id}`),
);

async function setStatus(status) {
  startLoading();

  try {
    const data = {};
    data.status = status;
    await useBaseFetch(`project/${props.project.id}`, {
      method: "PATCH",
      body: data,
    });

    const project = props.project;
    project.status = status;
    await props.resetProject();
    thread.value = await useBaseFetch(`thread/${thread.value.id}`);
  } catch (err) {
    app.$notify({
      group: "main",
      title: "发生错误",
      text: err.data ? err.data.description : err,
      type: "error",
    });
  }

  stopLoading();
}
</script>
<style lang="scss" scoped>
.stacked {
  display: flex;
  flex-direction: column;
}

.status-message {
  :deep(.badge) {
    display: contents;

    svg {
      vertical-align: top;
      margin: 0;
    }
  }

  p:last-child {
    margin-bottom: 0;
  }
}

.unavailable-error {
  .code {
    margin-top: var(--spacing-card-sm);
  }

  svg {
    vertical-align: top;
  }
}

.visibility-info {
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: var(--spacing-card-xs);
  }
}

svg {
  &.good {
    color: var(--color-green);
  }

  &.bad {
    color: var(--color-red);
  }
}

.warning {
  color: var(--color-orange);
  font-weight: bold;
}
</style>
