<template>
  <div>
    <div
      class="p-6 pr-2 pb-4"
      @contextmenu.prevent.stop="(event) => handleRightClick(event, instance.path)"
    >
      <ExportModal ref="exportModal" :instance="instance" />
      <InstanceSettingsModal ref="settingsModal" :instance="instance" :offline="offline" />
      <ContentPageHeader>
        <template #icon>
          <Avatar :src="icon" :alt="instance.name" size="96px" :tint-by="instance.path" />
        </template>
        <template #title>
          {{ instance.name }}
        </template>
        <template #summary> </template>
        <template #stats>
          <div
            class="flex items-center gap-2 font-semibold transform capitalize border-0 border-solid border-divider pr-4 md:border-r"
          >
            <GameIcon class="h-6 w-6 text-secondary" />
            {{ instance.loader }} {{ instance.game_version }}
          </div>
          <div class="flex items-center gap-2 font-semibold">
            <TimerIcon class="h-6 w-6 text-secondary" />
            <template v-if="timePlayed > 0">
              {{ timePlayedHumanized }}
            </template>
            <template v-else> 从未游玩 </template>
          </div>
        </template>
        <template #actions>
          <div class="flex gap-2">
            <ButtonStyled
              v-if="
                ['installing', 'pack_installing', 'minecraft_installing'].includes(
                  instance.install_stage,
                )
              "
              color="brand"
              size="large"
            >
              <button disabled>安装中...</button>
            </ButtonStyled>
            <ButtonStyled
              v-else-if="instance.install_stage !== 'installed'"
              color="brand"
              size="large"
            >
              <button @click="repairInstance()">
                <DownloadIcon />
                修复
              </button>
            </ButtonStyled>
            <ButtonStyled v-else-if="playing === true" color="red" size="large">
              <button @click="stopInstance('InstancePage')">
                <StopCircleIcon />
                停止
              </button>
            </ButtonStyled>
            <ButtonStyled
              v-else-if="playing === false && loading === false"
              color="brand"
              size="large"
            >
              <button @click="startInstance('InstancePage')">
                <PlayIcon />
                启动
              </button>
            </ButtonStyled>
            <ButtonStyled
              v-else-if="loading === true && playing === false"
              color="brand"
              size="large"
            >
              <button disabled>加载中...</button>
            </ButtonStyled>
            <ButtonStyled size="large" circular>
              <button v-tooltip="'实例设置'" @click="settingsModal.show()">
                <SettingsIcon />
              </button>
            </ButtonStyled>
            <ButtonStyled size="large" type="transparent" circular>
              <OverflowMenu
                :options="[
                  {
                    id: 'open-folder',
                    action: () => showProfileInFolder(instance.path),
                  },
                  {
                    id: 'export-mrpack',
                    action: () => $refs.exportModal.show(),
                  },
                ]"
              >
                <MoreVerticalIcon />
                <template #share-instance> <UserPlusIcon /> 分享实例 </template>
                <template #host-a-server> <ServerIcon /> 创建服务器 </template>
                <template #open-folder> <FolderOpenIcon /> 打开文件夹 </template>
                <template #export-mrpack> <PackageIcon /> 导出整合包 </template>
              </OverflowMenu>
            </ButtonStyled>
          </div>
        </template>
      </ContentPageHeader>
    </div>
    <div class="px-6">
      <NavTabs :links="tabs" />
    </div>
    <div v-if="!!instance" class="p-6 pt-4">
      <RouterView v-slot="{ Component }" :key="instance.path">
        <template v-if="Component">
          <Suspense
            :key="instance.path"
            @pending="loadingBar.startLoading()"
            @resolve="loadingBar.stopLoading()"
          >
            <component
              :is="Component"
              :instance="instance"
              :options="options"
              :offline="offline"
              :playing="playing"
              :versions="modrinthVersions"
              :installed="instance.install_stage !== 'installed'"
              @play="updatePlayState"
              @stop="() => stopInstance('InstanceSubpage')"
            ></component>
            <template #fallback>
              <LoadingIndicator />
            </template>
          </Suspense>
        </template>
      </RouterView>
    </div>
    <ContextMenu ref="options" @option-clicked="handleOptionsClick">
      <template #play> <PlayIcon /> 启动 </template>
      <template #stop> <StopCircleIcon /> 停止 </template>
      <template #add_content> <PlusIcon /> 安装资源 </template>
      <template #edit> <EditIcon /> 修改 </template>
      <template #copy_path> <ClipboardCopyIcon /> 复制路径 </template>
      <template #open_folder> <ClipboardCopyIcon /> 打开文件夹 </template>
      <template #copy_link> <ClipboardCopyIcon /> 复制链接 </template>
      <template #open_link> <ClipboardCopyIcon /> 在 Modrinth 中打开 <ExternalIcon /> </template>
      <template #copy_names><EditIcon /> 复制名称 </template>
      <template #copy_slugs><HashIcon /> 复制资源关键字 </template>
      <template #copy_links><GlobeIcon /> 复制链接 </template>
      <template #toggle><EditIcon /> 切换选择 </template>
      <template #disable><XIcon /> 禁用已选资源 </template>
      <template #enable><CheckCircleIcon />启用已选资源 </template>
      <template #hide_show><EyeIcon /> 显示或隐藏未选择资源 </template>
      <template #update_all
        ><UpdatedIcon /> 更新 {{ selected.length > 0 ? '已选' : '全部' }}资源 </template
      >
      <template #filter_update><UpdatedIcon />选择可更新的资源</template>
    </ContextMenu>
  </div>
</template>
<script setup>
import {
  Avatar,
  ButtonStyled,
  ContentPageHeader,
  LoadingIndicator,
  OverflowMenu,
} from '@modrinth/ui'
import {
  CheckCircleIcon,
  ClipboardCopyIcon,
  DownloadIcon,
  EditIcon,
  ExternalIcon,
  EyeIcon,
  FolderOpenIcon,
  GameIcon,
  GlobeIcon,
  HashIcon,
  MoreVerticalIcon,
  PackageIcon,
  PlayIcon,
  PlusIcon,
  ServerIcon,
  SettingsIcon,
  StopCircleIcon,
  TimerIcon,
  UpdatedIcon,
  UserPlusIcon,
  XIcon,
} from '@modrinth/assets'
import { finish_install, get, get_full_path, kill, run } from '@/helpers/profile'
import { get_by_profile_path } from '@/helpers/process'
import { process_listener, profile_listener } from '@/helpers/events'
import { useRoute, useRouter } from 'vue-router'
import { computed, onUnmounted, ref, watch } from 'vue'
import { handleError, useBreadcrumbs, useLoading } from '@/store/state'
import { showProfileInFolder } from '@/helpers/utils.js'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import NavTabs from '@/components/ui/NavTabs.vue'
import { trackEvent } from '@/helpers/analytics'
import { convertFileSrc } from '@tauri-apps/api/core'
import { handleSevereError } from '@/store/error.js'
import { get_project, get_version_many } from '@/helpers/cache.js'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import ExportModal from '@/components/ui/ExportModal.vue'
import InstanceSettingsModal from '@/components/ui/modal/InstanceSettingsModal.vue'

dayjs.extend(duration)
dayjs.extend(relativeTime)

const route = useRoute()

const router = useRouter()
const breadcrumbs = useBreadcrumbs()

const offline = ref(!navigator.onLine)
window.addEventListener('offline', () => {
  offline.value = true
})
window.addEventListener('online', () => {
  offline.value = false
})

const instance = ref()
const modrinthVersions = ref([])
const playing = ref(false)
const loading = ref(false)

async function fetchInstance() {
  instance.value = await get(route.params.id).catch(handleError)

  if (!offline.value && instance.value.linked_data && instance.value.linked_data.project_id) {
    get_project(instance.value.linked_data.project_id, 'must_revalidate')
      .catch(handleError)
      .then((project) => {
        if (project && project.versions) {
          get_version_many(project.versions, 'must_revalidate')
            .catch(handleError)
            .then((versions) => {
              modrinthVersions.value = versions.sort(
                (a, b) => dayjs(b.date_published) - dayjs(a.date_published),
              )
            })
        }
      })
  }

  await updatePlayState()
}

async function updatePlayState() {
  const runningProcesses = await get_by_profile_path(route.params.id).catch(handleError)

  playing.value = runningProcesses.length > 0
}

await fetchInstance()
watch(
  () => route.params.id,
  async () => {
    if (route.params.id && route.path.startsWith('/instance')) {
      await fetchInstance()
    }
  },
)

const basePath = computed(() => `/instance/${encodeURIComponent(route.params.id)}`)

const tabs = computed(() => [
  {
    label: '资源',
    href: `${basePath.value}`,
  },
  {
    label: '世界',
    href: `${basePath.value}/worlds`,
  },
  {
    label: '日志',
    href: `${basePath.value}/logs`,
  },
])

breadcrumbs.setName(
  'Instance',
  instance.value.name.length > 40
    ? instance.value.name.substring(0, 40) + '...'
    : instance.value.name,
)

breadcrumbs.setContext({
  name: instance.value.name,
  link: route.path,
  query: route.query,
})

const loadingBar = useLoading()

const options = ref(null)

const startInstance = async (context) => {
  loading.value = true
  try {
    await run(route.params.id)
    playing.value = true
  } catch (err) {
    handleSevereError(err, { profilePath: route.params.id })
  }
  loading.value = false

  trackEvent('InstanceStart', {
    loader: instance.value.loader,
    game_version: instance.value.game_version,
    source: context,
  })
}

const stopInstance = async (context) => {
  playing.value = false
  await kill(route.params.id).catch(handleError)

  trackEvent('InstanceStop', {
    loader: instance.value.loader,
    game_version: instance.value.game_version,
    source: context,
  })
}

const repairInstance = async () => {
  await finish_install(instance.value)
}

const handleRightClick = (event) => {
  const baseOptions = [
    { name: 'add_content' },
    { type: 'divider' },
    { name: 'edit' },
    { name: 'open_folder' },
    { name: 'copy_path' },
  ]

  options.value.showMenu(
    event,
    instance.value,
    playing.value
      ? [
          {
            name: 'stop',
            color: 'danger',
          },
          ...baseOptions,
        ]
      : [
          {
            name: 'play',
            color: 'primary',
          },
          ...baseOptions,
        ],
  )
}

const handleOptionsClick = async (args) => {
  switch (args.option) {
    case 'play':
      await startInstance('InstancePageContextMenu')
      break
    case 'stop':
      await stopInstance('InstancePageContextMenu')
      break
    case 'add_content':
      await router.push({
        path: `/browse/${instance.value.loader === 'vanilla' ? 'datapack' : 'mod'}`,
        query: { i: route.params.id },
      })
      break
    case 'edit':
      await router.push({
        path: `/instance/${encodeURIComponent(route.params.id)}/options`,
      })
      break
    case 'open_folder':
      await showProfileInFolder(instance.value.path)
      break
    case 'copy_path': {
      const fullPath = await get_full_path(instance.value.path)
      await navigator.clipboard.writeText(fullPath)
      break
    }
  }
}

const unlistenProfiles = await profile_listener(async (event) => {
  if (event.profile_path_id === route.params.id) {
    if (event.event === 'removed') {
      await router.push({
        path: '/',
      })
      return
    }
    instance.value = await get(route.params.id).catch(handleError)
  }
})

const unlistenProcesses = await process_listener((e) => {
  if (e.event === 'finished' && e.profile_path_id === route.params.id) {
    playing.value = false
  }
})

const icon = computed(() =>
  instance.value.icon_path ? convertFileSrc(instance.value.icon_path) : null,
)

const settingsModal = ref()

const timePlayed = computed(() => {
  return instance.value.recent_time_played + instance.value.submitted_time_played
})

const timePlayedHumanized = computed(() => {
  const duration = dayjs.duration(timePlayed.value, 'seconds')
  const hours = Math.floor(duration.asHours())
  if (hours >= 1) {
    return hours + ' 小时'
  }

  const minutes = Math.floor(duration.asMinutes())
  if (minutes >= 1) {
    return minutes + ' 分钟'
  }

  const seconds = Math.floor(duration.asSeconds())
  return seconds + ' 秒'
})

onUnmounted(() => {
  unlistenProcesses()
  unlistenProfiles()
})
</script>

<style scoped lang="scss">
.instance-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.button-group {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

.side-cards {
  position: fixed;
  width: 300px;
  display: flex;
  flex-direction: column;

  min-height: calc(100vh - 3.25rem);
  max-height: calc(100vh - 3.25rem);
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }

  .card {
    min-height: unset;
    margin-bottom: 0;
  }
}

.instance-nav {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 1rem;
  gap: 0.5rem;
  background: var(--color-raised-bg);
  height: 100%;
}

.name {
  font-size: 1.25rem;
  color: var(--color-contrast);
  overflow: hidden;
  text-overflow: ellipsis;
}

.metadata {
  text-transform: capitalize;
}

.instance-container {
  display: flex;
  flex-direction: row;
  overflow: auto;
  gap: 1rem;
  min-height: 100%;
  padding: 1rem;
}

.instance-info {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.badge {
  display: flex;
  align-items: center;
  font-weight: bold;
  width: fit-content;
  color: var(--color-orange);
}

.pages-list {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);

  .btn {
    font-size: 100%;
    font-weight: 400;
    background: inherit;
    transition: all ease-in-out 0.1s;
    width: 100%;
    color: var(--color-primary);
    box-shadow: none;

    &.router-link-exact-active {
      box-shadow: var(--shadow-inset-lg);
      background: var(--color-button-bg);
      color: var(--color-contrast);
    }

    &:hover {
      background-color: var(--color-button-bg);
      color: var(--color-contrast);
      box-shadow: var(--shadow-inset-lg);
      text-decoration: none;
    }

    svg {
      width: 1.3rem;
      height: 1.3rem;
    }
  }
}

.instance-nav {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: left;
  padding: 1rem;
  gap: 0.5rem;
  height: min-content;
  width: 100%;
}

.instance-button {
  width: fit-content;
}

.actions {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.5rem;
}

.content {
  margin: 0 1rem 0.5rem 20rem;
  width: calc(100% - 20rem);
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.stats {
  grid-area: stats;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: var(--gap-md);

  .stat {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: fit-content;
    gap: var(--gap-xs);
    --stat-strong-size: 1.25rem;

    strong {
      font-size: var(--stat-strong-size);
    }

    p {
      margin: 0;
    }

    svg {
      height: var(--stat-strong-size);
      width: var(--stat-strong-size);
    }
  }

  .date {
    margin-top: auto;
  }

  @media screen and (max-width: 750px) {
    flex-direction: row;
    column-gap: var(--gap-md);
    margin-top: var(--gap-xs);
  }

  @media screen and (max-width: 600px) {
    margin-top: 0;

    .stat-label {
      display: none;
    }
  }
}
</style>
