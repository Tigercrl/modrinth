// noinspection JSUnusedGlobalSymbols
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import dayjs from 'dayjs'

export const external = (cosmetics) => (cosmetics.externalLinksNewTab ? '_blank' : '')

// Only use on the complete list of versions for a project,
// partial lists will generate the wrong version slugs
export const computeVersions = (versions, members) => {
  const visitedVersions = []
  const returnVersions = []
  const authorMembers = {}

  for (const version of versions.sort(
    (a, b) => dayjs(a.date_published) - dayjs(b.date_published),
  )) {
    if (visitedVersions.includes(version.version_number)) {
      visitedVersions.push(version.version_number)
      version.displayUrlEnding = version.id
    } else {
      visitedVersions.push(version.version_number)
      version.displayUrlEnding = version.version_number
    }
    version.primaryFile = version.files.find((file) => file.primary) ?? version.files[0]

    if (!version.primaryFile) {
      version.primaryFile = {
        hashes: {
          sha1: '',
          sha512: '',
        },
        url: '#',
        filename: 'unknown',
        primary: false,
        size: 0,
        file_type: null,
      }
    }

    version.author = authorMembers[version.author_id]
    if (!version.author) {
      version.author = members.find((x) => x.user.id === version.author_id)
      authorMembers[version.author_id] = version.author
    }

    returnVersions.push(version)
  }

  return returnVersions
    .reverse()
    .map((version, index) => {
      const nextVersion = returnVersions[index + 1]
      if (nextVersion && version.changelog && nextVersion.changelog === version.changelog) {
        return {duplicate: true, ...version}
      }
      return {duplicate: false, ...version}
    })
    .sort((a, b) => dayjs(b.date_published) - dayjs(a.date_published))
}

export const sortedCategories = (tags) => {
  return tags.categories.slice().sort((a, b) => {
    const headerCompare = a.header.localeCompare(b.header)
    if (headerCompare !== 0) {
      return headerCompare
    }
    if (a.header === 'resolutions' && b.header === 'resolutions') {
      return a.name.replace(/\D/g, '') - b.name.replace(/\D/g, '')
    } else if (a.header === 'performance impact' && b.header === 'performance impact') {
      const x = ['potato', 'low', 'medium', 'high', 'screenshot']

      return x.indexOf(a.name) - x.indexOf(b.name)
    }
    return 0
  })
}

export const formatNumber = (number, abbreviate = true) => {
  const x = Number(number)
  if (x >= 100000000 && abbreviate) {
    return `${(x / 100000000).toFixed(2).toString()} 亿`
  } else if (x >= 10000 && abbreviate) {
    return `${(x / 10000).toFixed(1).toString()} 万`
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatMoney(number, abbreviate = false) {
  const x = Number(number)
  if (x >= 100000000 && abbreviate) {
    return `${(x / 100000000).toFixed(2).toString()} 亿`
  } else if (x >= 10000 && abbreviate) {
    return `${(x / 10000).toFixed(1).toString()} 万`
  }
  return `$${x.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KiB', 'MiB', 'GiB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export const capitalizeString = (name) => {
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : name
}

export const formatWallet = (name) => {
  switch (name) {
    case 'paypal':
      return 'PayPal'
    case 'all':
      return '所有方式'
    default:
      return capitalizeString(name)
  }
}

export const formatProjectType = (name) => {
  switch (name) {
    case 'resourcepack':
      return '资源包'
    case 'datapack':
      return '数据包'
    case 'shader':
      return '光影'
    case 'mod':
      return '模组'
    case 'modpack':
      return '整合包'
    case 'project':
      return '资源'
    case 'project_update':
      return '资源更新'
    case 'status_change':
      return '资源状态变更'
    case 'moderation_message':
      return '审核消息'
  }

  return capitalizeString(name)
}

export const formatCategory = (name) => {
  switch (name) {
    case 'modloader':
      return "Risugami's ModLoader"
    case 'bungeecord':
      return 'BungeeCord'
    case 'liteloader':
      return 'LiteLoader'
    case 'neoforge':
      return 'NeoForge'
    case 'optifine':
      return 'OptiFine'
    case 'pbr':
      return 'PBR'
    case 'gui':
      return '界面'
    case 'adventure':
      return '冒险'
    case 'combat':
      return '战斗'
    case 'cursed':
      return '古怪'
    case 'decoration':
      return '装饰'
    case 'modded':
      return '模组支持'
    case 'realistic':
      return '现实'
    case 'simplistic':
      return '简约'
    case 'themed':
      return '主题'
    case 'tweaks':
      return '调整'
    case 'utility':
      return '工具'
    case 'vanilla-like':
      return '类原版'
    case 'vanilla':
      return '原版'
    case 'game-mechanics':
      return '游戏机制'
    case 'worldgen':
      return '世界生成'
    case 'core-shaders':
      return '核心着色器'
    case '8x-':
      return '8x 或更低'
    case '512x+':
      return '512x 或更高'
    case 'kitchen-sink':
      return '综合'
    case 'path-tracing':
      return '光线追踪'
    case 'datapack':
      return '数据包'
    case 'colored-lighting':
      return '彩色照明'
    case 'cartoon':
      return '卡通'
    case 'fantasy':
      return '幻想'
    case 'semi-realistic':
      return '半现实'
    case 'economy':
      return '经济'
    case 'equipment':
      return '武器装备'
    case 'food':
      return '食物'
    case 'library':
      return '前置库'
    case 'magic':
      return '魔法'
    case 'management':
      return '管理'
    case 'minigame':
      return '小游戏'
    case 'mobs':
      return '生物'
    case 'optimization':
      return '优化'
    case 'social':
      return '社交'
    case 'storage':
      return '存储'
    case 'technology':
      return '科技'
    case 'transportation':
      return '交通'
    case 'audio':
      return '音频'
    case 'blocks':
      return '方块'
    case 'entities':
      return '实体'
    case 'environment':
      return '环境'
    case 'fonts':
      return '字体'
    case 'items':
      return '物品'
    case 'locale':
      return '语言'
    case 'models':
      return '模型'
    case 'atmosphere':
      return '天空'
    case 'bloom':
      return '泛光'
    case 'foliage':
      return '树叶'
    case 'reflections':
      return '反射'
    case 'shadows':
      return '阴影'
    case 'challenging':
      return '挑战'
    case 'lightweight':
      return '轻量'
    case 'multiplayer':
      return '多人'
    case 'quests':
      return '任务'
    case 'high':
      return '高'
    case 'low':
      return '低'
    case 'medium':
      return '中'
    case 'potato':
      return '土豆服务器'
    case 'screenshot':
      return '别人的世界'
    default:
      break;
  }

  return capitalizeString(name)
}

export const formatCategoryHeader = (name) => {
  switch (name) {
    case 'categories':
      return '分类'
    case 'features':
      return '功能'
    case 'resolutions':
      return '分辨率'
    case 'performance impact':
      return '性能影响'
    case 'downloads':
      return '下载量'
    default:
      return capitalizeString(name)
  }
}

export const formatProjectStatus = (name) => {
  if (name === 'approved') {
    return '公共'
  } else if (name === 'processing') {
    return '审核中'
  } else if (name === 'rejected') {
    return '未过审'
  } else if (name === 'draft') {
    return '草稿'
  } else if (name === 'unlisted') {
    return '隐藏'
  } else if (name === 'private') {
    return '私密'
  } else if (name === 'withheld') {
    return '保留'
  } else if (name === 'archived') {
    return '已归档'
  }

  return capitalizeString(name)
}

export const formatVersions = (versionArray, gameVersions) => {
  const allVersions = gameVersions.slice().reverse()
  const allReleases = allVersions.filter((x) => x.version_type === 'release')

  const intervals = []
  let currentInterval = 0

  for (let i = 0; i < versionArray.length; i++) {
    const index = allVersions.findIndex((x) => x.version === versionArray[i])
    const releaseIndex = allReleases.findIndex((x) => x.version === versionArray[i])

    if (i === 0) {
      intervals.push([[versionArray[i], index, releaseIndex]])
    } else {
      const intervalBase = intervals[currentInterval]

      if (
        (index - intervalBase[intervalBase.length - 1][1] === 1 ||
          releaseIndex - intervalBase[intervalBase.length - 1][2] === 1) &&
        (allVersions[intervalBase[0][1]].version_type === 'release' ||
          allVersions[index].version_type !== 'release')
      ) {
        intervalBase[1] = [versionArray[i], index, releaseIndex]
      } else {
        currentInterval += 1
        intervals[currentInterval] = [[versionArray[i], index, releaseIndex]]
      }
    }
  }

  const newIntervals = []
  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i]

    if (interval.length === 2 && interval[0][2] !== -1 && interval[1][2] === -1) {
      let lastSnapshot = null
      for (let j = interval[1][1]; j > interval[0][1]; j--) {
        if (allVersions[j].version_type === 'release') {
          newIntervals.push([
            interval[0],
            [
              allVersions[j].version,
              j,
              allReleases.findIndex((x) => x.version === allVersions[j].version),
            ],
          ])

          if (lastSnapshot !== null && lastSnapshot !== j + 1) {
            newIntervals.push([[allVersions[lastSnapshot].version, lastSnapshot, -1], interval[1]])
          } else {
            newIntervals.push([interval[1]])
          }

          break
        } else {
          lastSnapshot = j
        }
      }
    } else {
      newIntervals.push(interval)
    }
  }

  const output = []

  for (const interval of newIntervals) {
    if (interval.length === 2) {
      output.push(`${interval[0][0]}–${interval[1][0]}`)
    } else {
      output.push(interval[0][0])
    }
  }

  return (output.length === 0 ? versionArray : output).join(', ')
}

export function cycleValue(value, values) {
  const index = values.indexOf(value) + 1
  return values[index % values.length]
}

export const fileIsValid = (file, validationOptions) => {
  const {maxSize, alertOnInvalid} = validationOptions
  if (maxSize !== null && maxSize !== undefined && file.size > maxSize) {
    if (alertOnInvalid) {
      alert(`File ${file.name} is too big! Must be less than ${formatBytes(maxSize)}`)
    }
    return false
  }

  return true
}

export const acceptFileFromProjectType = (projectType) => {
  switch (projectType) {
    case 'mod':
      return '.jar,.zip,.litemod,application/java-archive,application/x-java-archive,application/zip'
    case 'plugin':
      return '.jar,.zip,application/java-archive,application/x-java-archive,application/zip'
    case 'resourcepack':
      return '.zip,application/zip'
    case 'shader':
      return '.zip,application/zip'
    case 'datapack':
      return '.zip,application/zip'
    case 'modpack':
      return '.mrpack,application/x-modrinth-modpack+zip,application/zip'
    default:
      return '*'
  }
}

// Sorts alphabetically, but correctly identifies 8x, 128x, 256x, etc
// identifier[0], then if it ties, identifier[1], etc
export const sortByNameOrNumber = (sortable, identifiers) => {
  sortable.sort((a, b) => {
    for (const identifier of identifiers) {
      const aNum = parseFloat(a[identifier])
      const bNum = parseFloat(b[identifier])
      if (isNaN(aNum) && isNaN(bNum)) {
        // Both are strings, sort alphabetically
        const stringComp = a[identifier].localeCompare(b[identifier])
        if (stringComp != 0) return stringComp
      } else if (!isNaN(aNum) && !isNaN(bNum)) {
        // Both are numbers, sort numerically
        const numComp = aNum - bNum
        if (numComp != 0) return numComp
      } else {
        // One is a number and one is a string, numbers go first
        const numStringComp = isNaN(aNum) ? 1 : -1
        if (numStringComp != 0) return numStringComp
      }
    }
    return 0
  })
  return sortable
}

export const getArrayOrString = (x: string[] | string): string[] => {
  if (typeof x === 'string') {
    return [x]
  } else {
    return x
  }
}
