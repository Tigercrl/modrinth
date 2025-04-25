<template>
  <ConfirmModal
    v-if="currentMember"
    ref="deleteVersionModal"
    title="您确定要删除这个版本吗？"
    description="这个版本将会永久消失！（真的很久！）"
    :has-to-type="false"
    proceed-label="删除"
    @proceed="deleteVersion()"
  />
  <section class="experimental-styles-within overflow-visible">
    <div
      v-if="currentMember && isPermission(currentMember?.permissions, 1 << 0)"
      class="card flex items-center gap-4"
    >
      <FileInput
        :max-size="524288000"
        :accept="acceptFileFromProjectType(project.project_type)"
        prompt="上传版本"
        class="btn btn-primary"
        aria-label="上传版本"
        @change="handleFiles"
      >
        <UploadIcon aria-hidden="true" />
      </FileInput>
      <span class="flex items-center gap-2">
        <InfoIcon aria-hidden="true" /> 单击选择文件或将文件拖放至此页面上传
      </span>
      <DropArea :accept="acceptFileFromProjectType(project.project_type)" @change="handleFiles" />
    </div>
    <ProjectPageVersions
      :project="project"
      :versions="versions"
      :show-files="flags.showVersionFilesInTable"
      :current-member="!!currentMember"
      :loaders="tags.loaders"
      :game-versions="tags.gameVersions"
      :base-id="baseDropdownId"
      :version-link="
        (version) =>
          `/${project.project_type}/${
            project.slug ? project.slug : project.id
          }/version/${encodeURI(version.displayUrlEnding)}`
      "
    >
      <template #actions="{ version }">
        <ButtonStyled circular type="transparent">
          <a
            v-tooltip="`下载`"
            :href="getPrimaryFile(version).url"
            class="group-hover:!bg-brand group-hover:[&>svg]:!text-brand-inverted"
            aria-label="下载"
            @click="emit('onDownload')"
          >
            <DownloadIcon aria-hidden="true" />
          </a>
        </ButtonStyled>
        <ButtonStyled circular type="transparent">
          <OverflowMenu
            class="group-hover:!bg-button-bg"
            :dropdown-id="`${baseDropdownId}-${version.id}`"
            :options="[
              {
                id: 'download',
                color: 'primary',
                hoverFilled: true,
                link: getPrimaryFile(version).url,
                action: () => {
                  emit('onDownload');
                },
              },
              {
                id: 'new-tab',
                action: () => {},
                link: `/${project.project_type}/${
                  project.slug ? project.slug : project.id
                }/version/${encodeURI(version.displayUrlEnding)}`,
                external: true,
              },
              {
                id: 'copy-link',
                action: () =>
                  copyToClipboard(
                    `https://modrinth.com/${project.project_type}/${
                      project.slug ? project.slug : project.id
                    }/version/${encodeURI(version.displayUrlEnding)}`,
                  ),
              },
              {
                id: 'share',
                action: () => {},
                shown: false,
              },
              {
                id: 'report',
                color: 'red',
                hoverFilled: true,
                action: () => (auth.user ? reportVersion(version.id) : navigateTo('/auth/sign-in')),
                shown: !currentMember,
              },
              { divider: true, shown: currentMember || flags.developerMode },
              {
                id: 'copy-id',
                action: () => {
                  copyToClipboard(version.id);
                },
                shown: currentMember || flags.developerMode,
              },
              {
                id: 'copy-maven',
                action: () => {
                  copyToClipboard(`maven.modrinth:${project.slug}:${version.id}`);
                },
                shown: flags.developerMode,
              },
              { divider: true, shown: currentMember },
              {
                id: 'edit',
                link: `/${project.project_type}/${
                  project.slug ? project.slug : project.id
                }/version/${encodeURI(version.displayUrlEnding)}/edit`,
                shown: currentMember,
              },
              {
                id: 'delete',
                color: 'red',
                hoverFilled: true,
                action: () => {
                  selectedVersion = version.id;
                  deleteVersionModal.show();
                },
                shown: currentMember,
              },
            ]"
            aria-label="更多选项"
          >
            <MoreVerticalIcon aria-hidden="true" />
            <template #download>
              <DownloadIcon aria-hidden="true" />
              下载
            </template>
            <template #new-tab>
              <ExternalIcon aria-hidden="true" />
              在新标签页中打开
            </template>
            <template #copy-link>
              <LinkIcon aria-hidden="true" />
              复制链接
            </template>
            <template #share>
              <ShareIcon aria-hidden="true" />
              分享
            </template>
            <template #report>
              <ReportIcon aria-hidden="true" />
              举报
            </template>
            <template #edit>
              <EditIcon aria-hidden="true" />
              修改
            </template>
            <template #delete>
              <TrashIcon aria-hidden="true" />
              删除
            </template>
            <template #copy-id>
              <ClipboardCopyIcon aria-hidden="true" />
              Copy ID
            </template>
            <template #copy-maven>
              <ClipboardCopyIcon aria-hidden="true" />
              Copy Modrinth Maven
            </template>
          </OverflowMenu>
        </ButtonStyled>
      </template>
    </ProjectPageVersions>
  </section>
</template>

<script setup>
import {
  ButtonStyled,
  OverflowMenu,
  FileInput,
  ProjectPageVersions,
  ConfirmModal,
} from "@modrinth/ui";
import {
  DownloadIcon,
  MoreVerticalIcon,
  TrashIcon,
  ExternalIcon,
  LinkIcon,
  ShareIcon,
  EditIcon,
  ReportIcon,
  UploadIcon,
  InfoIcon,
  ClipboardCopyIcon,
} from "@modrinth/assets";
import DropArea from "~/components/ui/DropArea.vue";
import { acceptFileFromProjectType } from "~/helpers/fileUtils.js";

const props = defineProps({
  project: {
    type: Object,
    default() {
      return {};
    },
  },
  versions: {
    type: Array,
    default() {
      return [];
    },
  },
  currentMember: {
    type: Object,
    default() {
      return null;
    },
  },
});

const tags = useTags();
const flags = useFeatureFlags();
const auth = await useAuth();

const deleteVersionModal = ref();
const selectedVersion = ref(null);

const emit = defineEmits(["onDownload", "deleteVersion"]);

const router = useNativeRouter();

const baseDropdownId = useId();

function getPrimaryFile(version) {
  return version.files.find((x) => x.primary) || version.files[0];
}

async function handleFiles(files) {
  await router.push({
    name: "type-id-version-version",
    params: {
      type: props.project.project_type,
      id: props.project.slug ? props.project.slug : props.project.id,
      version: "create",
    },
    state: {
      newPrimaryFile: files[0],
    },
  });
}

async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}

function deleteVersion() {
  emit("deleteVersion", selectedVersion.value);
  selectedVersion.value = null;
}
</script>
