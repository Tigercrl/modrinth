<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import type { Ref } from 'vue'
import { SearchIcon, XIcon, ClipboardCopyIcon, GlobeIcon, ExternalIcon } from '@modrinth/assets'
import type { Category, GameVersion, Platform, ProjectType, SortType, Tags } from '@modrinth/ui'
import {
  SearchFilterControl,
  SearchSidebarFilter,
  Button,
  Checkbox,
  DropdownSelect,
  LoadingIndicator,
  Pagination,
  useSearch,
} from '@modrinth/ui'
import { handleError } from '@/store/state'
import { useBreadcrumbs } from '@/store/breadcrumbs'
import { get_categories, get_game_versions, get_loaders } from '@/helpers/tags'
import type { LocationQuery } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import SearchCard from '@/components/ui/SearchCard.vue'
import { get as getInstance, get_projects as getInstanceProjects } from '@/helpers/profile.js'
import { get_search_results } from '@/helpers/cache.js'
import NavTabs from '@/components/ui/NavTabs.vue'
import type Instance from '@/components/ui/Instance.vue'
import InstanceIndicator from '@/components/ui/InstanceIndicator.vue'
import { defineMessages, useVIntl } from '@vintl/vintl'
import ContextMenu from '@/components/ui/ContextMenu.vue'
import { openUrl } from '@tauri-apps/plugin-opener'
import {formatProjectType} from "@modrinth/utils";

const { formatMessage } = useVIntl()

const router = useRouter()
const route = useRoute()

const projectTypes = computed(() => {
  return [route.params.projectType as ProjectType]
})

const [categories, loaders, availableGameVersions] = await Promise.all([
  get_categories().catch(handleError).then(ref),
  get_loaders().catch(handleError).then(ref),
  get_game_versions().catch(handleError).then(ref),
])

const tags: Ref<Tags> = computed(() => ({
  gameVersions: availableGameVersions.value as GameVersion[],
  loaders: loaders.value as Platform[],
  categories: categories.value as Category[],
}))

type Instance = {
  game_version: string
  loader: string
  path: string
  install_stage: string
  icon_path?: string
  name: string
}

type InstanceProject = {
  metadata: {
    project_id: string
  }
}

const instance: Ref<Instance | null> = ref(null)
const instanceProjects: Ref<InstanceProject[] | null> = ref(null)
const instanceHideInstalled = ref(false)
const newlyInstalled = ref([])

const PERSISTENT_QUERY_PARAMS = ['i', 'ai']

await updateInstanceContext()

watch(route, () => {
  updateInstanceContext()
})

async function updateInstanceContext() {
  if (route.query.i) {
    ;[instance.value, instanceProjects.value] = await Promise.all([
      getInstance(route.query.i).catch(handleError),
      getInstanceProjects(route.query.i).catch(handleError),
    ])
    newlyInstalled.value = []
  }

  if (route.query.ai && !(projectTypes.value.length === 1 && projectTypes.value[0] === 'modpack')) {
    instanceHideInstalled.value = route.query.ai === 'true'
  }

  if (instance.value && instance.value.path !== route.query.i && route.path.startsWith('/browse')) {
    instance.value = null
    instanceHideInstalled.value = false
  }
}

const instanceFilters = computed(() => {
  const filters = []

  if (instance.value) {
    const gameVersion = instance.value.game_version
    if (gameVersion) {
      filters.push({
        type: 'game_version',
        option: gameVersion,
      })
    }

    const platform = instance.value.loader

    const supportedModLoaders = ['fabric', 'forge', 'quilt', 'neoforge']

    if (platform && projectTypes.value.includes('mod') && supportedModLoaders.includes(platform)) {
      filters.push({
        type: 'mod_loader',
        option: platform,
      })
    }

    if (instanceHideInstalled.value && instanceProjects.value) {
      const installedMods = Object.values(instanceProjects.value)
        .filter((x) => x.metadata)
        .map((x) => x.metadata.project_id)

      installedMods.push(...newlyInstalled.value)

      installedMods
        ?.map((x) => ({
          type: 'project_id',
          option: `project_id:${x}`,
          negative: true,
        }))
        .forEach((x) => filters.push(x))
    }
  }

  return filters
})

const {
  // Selections
  query,
  currentSortType,
  currentFilters,
  toggledGroups,
  maxResults,
  currentPage,
  overriddenProvidedFilterTypes,

  // Lists
  filters,
  sortTypes,

  // Computed
  requestParams,

  // Functions
  createPageParams,
} = useSearch(projectTypes, tags, instanceFilters)

const offline = ref(!navigator.onLine)
window.addEventListener('offline', () => {
  offline.value = true
})
window.addEventListener('online', () => {
  offline.value = false
})

const breadcrumbs = useBreadcrumbs()
breadcrumbs.setContext({ name: '探索资源', link: route.path, query: route.query })

const loading = ref(true)

const projectType = ref(route.params.projectType)

watch(projectType, () => {
  loading.value = true
})

type SearchResult = {
  project_id: string
}

type SearchResults = {
  total_hits: number
  limit: number
  hits: SearchResult[]
}

const results: Ref<SearchResults | null> = shallowRef(null)
const pageCount = computed(() =>
  results.value ? Math.ceil(results.value.total_hits / results.value.limit) : 1,
)

watch(requestParams, () => {
  if (!route.params.projectType) return
  refreshSearch()
})

async function refreshSearch() {
  let rawResults = await get_search_results(requestParams.value)
  if (!rawResults) {
    rawResults = {
      result: {
        hits: [],
        total_hits: 0,
        limit: 1,
      },
    }
  }
  if (instance.value) {
    for (const val of rawResults.result.hits) {
      val.installed =
        newlyInstalled.value.includes(val.project_id) ||
        Object.values(instanceProjects.value).some(
          (x) => x.metadata && x.metadata.project_id === val.project_id,
        )
    }
  }
  results.value = rawResults.result

  const persistentParams: LocationQuery = {}

  for (const [key, value] of Object.entries(route.query)) {
    if (PERSISTENT_QUERY_PARAMS.includes(key)) {
      persistentParams[key] = value
    }
  }

  if (instanceHideInstalled.value) {
    persistentParams.ai = 'true'
  } else {
    delete persistentParams.ai
  }

  const params = {
    ...persistentParams,
    ...createPageParams(),
  }

  breadcrumbs.setContext({
    name: '探索资源',
    link: `/browse/${projectType.value}`,
    query: params,
  })
  await router.replace({ path: route.path, query: params })
  loading.value = false
}

async function setPage(newPageNumber: number) {
  currentPage.value = newPageNumber

  await onSearchChangeToTop()
}

const searchWrapper: Ref<HTMLElement | null> = ref(null)

async function onSearchChangeToTop() {
  await nextTick()

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function clearSearch() {
  query.value = ''
}

watch(
  () => route.params.projectType,
  async (newType) => {
    // Check if the newType is not the same as the current value
    if (!newType || newType === projectType.value) return

    projectType.value = newType

    currentSortType.value = { display: '相关性', name: 'relevance' }
    query.value = ''
  },
)

const selectableProjectTypes = computed(() => {
  let dataPacks = false,
    mods = false,
    modpacks = false

  if (instance.value) {
    if (
      availableGameVersions.value.findIndex((x) => x.version === instance.value.game_version) <=
      availableGameVersions.value.findIndex((x) => x.version === '1.13')
    ) {
      dataPacks = true
    }

    if (instance.value.loader !== 'vanilla') {
      mods = true
    }
  } else {
    dataPacks = true
    mods = true
    modpacks = true
  }

  const params: LocationQuery = {}

  if (route.query.i) {
    params.i = route.query.i
  }
  if (route.query.ai) {
    params.ai = route.query.ai
  }

  const links = [
    { label: '整合包', href: `/browse/modpack`, shown: modpacks },
    { label: '模组', href: `/browse/mod`, shown: mods },
    { label: '资源包', href: `/browse/resourcepack` },
    { label: '数据包', href: `/browse/datapack`, shown: dataPacks },
    { label: '光影', href: `/browse/shader` },
  ]

  if (params) {
    return links.map((link) => {
      return {
        ...link,
        href: {
          path: link.href,
          query: params,
        },
      }
    })
  }

  return links
})

const messages = defineMessages({
  gameVersionProvidedByInstance: {
    id: 'search.filter.locked.instance-game-version.title',
    defaultMessage: '游戏版本已跟随实例',
  },
  modLoaderProvidedByInstance: {
    id: 'search.filter.locked.instance-loader.title',
    defaultMessage: '加载器类型已跟随实例',
  },
  providedByInstance: {
    id: 'search.filter.locked.instance',
    defaultMessage: '跟随实例',
  },
  syncFilterButton: {
    id: 'search.filter.locked.instance.sync',
    defaultMessage: '跟随实例',
  },
})

const options = ref(null)
const handleRightClick = (event, result) => {
  options.value.showMenu(event, result, [
    {
      name: 'open_link',
    },
    {
      name: 'copy_link',
    },
  ])
}
const handleOptionsClick = (args) => {
  switch (args.option) {
    case 'open_link':
      openUrl(`https://modrinth.com/${args.item.project_type}/${args.item.slug}`)
      break
    case 'copy_link':
      navigator.clipboard.writeText(
        `https://modrinth.com/${args.item.project_type}/${args.item.slug}`,
      )
      break
  }
}

await refreshSearch()
</script>

<template>
  <Teleport v-if="filters" to="#sidebar-teleport-target">
    <div
      v-if="instance"
      class="border-0 border-b-[1px] p-4 last:border-b-0 border-[--brand-gradient-border] border-solid"
    >
      <Checkbox
        v-model="instanceHideInstalled"
        label="隐藏已安装资源"
        class="filter-checkbox"
        @update:model-value="onSearchChangeToTop()"
        @click.prevent.stop
      />
    </div>
    <SearchSidebarFilter
      v-for="filter in filters.filter((f) => f.display !== 'none')"
      :key="`filter-${filter.id}`"
      v-model:selected-filters="currentFilters"
      v-model:toggled-groups="toggledGroups"
      v-model:overridden-provided-filter-types="overriddenProvidedFilterTypes"
      :provided-filters="instanceFilters"
      :filter-type="filter"
      class="border-0 border-b-[1px] [&:first-child>button]:pt-4 last:border-b-0 border-[--brand-gradient-border] border-solid"
      button-class="button-animation flex flex-col gap-1 px-4 py-3 w-full bg-transparent cursor-pointer border-none hover:bg-button-bg"
      content-class="mb-3"
      inner-panel-class="ml-2 mr-3"
      :open-by-default="
        filter.id.startsWith('category') || filter.id === 'environment' || filter.id === 'license'
      "
    >
      <template #header>
        <h3 class="text-base m-0">{{ filter.formatted_name }}</h3>
      </template>
      <template #locked-game_version>
        {{ formatMessage(messages.gameVersionProvidedByInstance) }}
      </template>
      <template #locked-mod_loader>
        {{ formatMessage(messages.modLoaderProvidedByInstance) }}
      </template>
      <template #sync-button> {{ formatMessage(messages.syncFilterButton) }} </template>
    </SearchSidebarFilter>
  </Teleport>
  <div ref="searchWrapper" class="flex flex-col gap-3 p-6">
    <template v-if="instance">
      <InstanceIndicator :instance="instance" />
      <h1 class="m-0 mb-1 text-xl">安装资源至实例</h1>
    </template>
    <NavTabs :links="selectableProjectTypes" />
    <div class="iconified-input">
      <SearchIcon aria-hidden="true" class="text-lg" />
      <input
        v-model="query"
        class="h-12 card-shadow"
        autocomplete="off"
        spellcheck="false"
        type="text"
        :placeholder="`搜索${formatProjectType(projectType)}...`"
      />
      <Button v-if="query" class="r-btn" @click="() => clearSearch()">
        <XIcon />
      </Button>
    </div>
    <div class="flex gap-2">
      <DropdownSelect
        v-slot="{ selected }"
        v-model="currentSortType"
        class="max-w-[16rem]"
        name="排列方式"
        :options="sortTypes as any"
        :display-name="(option: SortType | undefined) => {
          switch (option?.display) {
            case 'Relevance':
              return '相关性'
            case 'Downloads':
              return '下载量'
            case 'Followers':
              return '关注者'
            case 'Date published':
              return '发布时间'
            case 'Date updated':
              return '更新时间'
            default:
              return option?.display
          }
        }"
      >
        <span class="font-semibold text-primary">排列方式：</span>
        <span class="font-semibold text-secondary">{{ selected }}</span>
      </DropdownSelect>
      <DropdownSelect
        v-slot="{ selected }"
        v-model="maxResults"
        name="显示数目"
        :options="[5, 10, 15, 20, 50, 100]"
        class="max-w-[10rem]"
      >
        <span class="font-semibold text-primary">显示数目：</span>
        <span class="font-semibold text-secondary">{{ selected }}</span>
      </DropdownSelect>
      <Pagination :page="currentPage" :count="pageCount" class="ml-auto" @switch-page="setPage" />
    </div>
    <SearchFilterControl
      v-model:selected-filters="currentFilters"
      :filters="filters.filter((f) => f.display !== 'none')"
      :provided-filters="instanceFilters"
      :overridden-provided-filter-types="overriddenProvidedFilterTypes"
      :provided-message="messages.providedByInstance"
    />
    <div class="search">
      <section v-if="loading" class="offline">
        <LoadingIndicator />
      </section>
      <section v-else-if="offline && results.total_hits === 0" class="offline">
        您当前处于离线状态。连接到互联网以浏览 Modrinth！
      </section>
      <section v-else class="project-list display-mode--list instance-results" role="list">
        <SearchCard
          v-for="result in results.hits"
          :key="result?.project_id"
          :project="result"
          :instance="instance"
          :categories="[
            ...categories.filter(
              (cat) =>
                result?.display_categories.includes(cat.name) && cat.project_type === projectType,
            ),
            ...loaders.filter(
              (loader) =>
                result?.display_categories.includes(loader.name) &&
                loader.supported_project_types?.includes(projectType),
            ),
          ]"
          :installed="result.installed || newlyInstalled.includes(result.project_id)"
          @install="
            (id) => {
              newlyInstalled.push(id)
            }
          "
          @contextmenu.prevent.stop="(event) => handleRightClick(event, result)"
        />
        <ContextMenu ref="options" @option-clicked="handleOptionsClick">
          <template #open_link> <GlobeIcon /> 在 Modrinth 中打开 <ExternalIcon /> </template>
          <template #copy_link> <ClipboardCopyIcon /> 复制链接 </template>
        </ContextMenu>
      </section>
      <div class="flex justify-end">
        <pagination
          :page="currentPage"
          :count="pageCount"
          class="pagination-after"
          @switch-page="setPage"
        />
      </div>
    </div>
  </div>
</template>
