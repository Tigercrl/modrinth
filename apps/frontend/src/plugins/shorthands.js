import {getProjectTypeForUrlShorthand} from "~/helpers/projects.js";
import {
  capitalizeString,
  computeVersions,
  cycleValue,
  formatBytes,
  formatCategory,
  formatCategoryHeader,
  formatMoney,
  formatNumber,
  formatProjectType,
  formatWallet,
  sortedCategories,
} from "@modrinth/utils";

export default defineNuxtPlugin((nuxtApp) => {
  const tagStore = useTags();

  nuxtApp.provide("formatNumber", formatNumber);
  nuxtApp.provide("capitalizeString", capitalizeString);
  nuxtApp.provide("formatMoney", formatMoney);
  nuxtApp.provide("formatVersion", (versionsArray) => formatVersions(tagStore, versionsArray));
  nuxtApp.provide("orElse", (first, otherwise) => first ?? otherwise);
  nuxtApp.provide("external", () => {
    return useCosmetics().value.externalLinksNewTab ? "_blank" : "";
  });
  nuxtApp.provide("formatBytes", formatBytes);
  nuxtApp.provide("formatWallet", formatWallet);
  nuxtApp.provide("formatProjectType", formatProjectType);
  nuxtApp.provide("formatCategory", formatCategory);
  nuxtApp.provide("formatCategoryHeader", formatCategoryHeader);
  nuxtApp.provide("formatReportType", (name) => {
    switch (name) {
      case 'spam':
        return '恶意灌水'
      case 'inappropriate':
        return '不恰当内容'
      case 'name-squatting':
        return '恶意占用资源名称'
      case 'copyright':
        return '版权原因'
      case 'malicious':
        return '恶意软件'
    }
  });

  /*
    Only use on the complete list of versions for a project, partial lists will generate
    the wrong version slugs
  */
  nuxtApp.provide("computeVersions", computeVersions);
  nuxtApp.provide("getProjectTypeForDisplay", (type, categories) => {
    if (type === "mod") {
      const isPlugin = categories.some((category) => {
        return tagStore.value.loaderData.allPluginLoaders.includes(category);
      });
      const isMod = categories.some((category) => {
        return tagStore.value.loaderData.modLoaders.includes(category);
      });
      const isDataPack = categories.some((category) => {
        return tagStore.value.loaderData.dataPackLoaders.includes(category);
      });

      if (isMod && isPlugin && isDataPack) {
        return "模组、插件、数据包";
      } else if (isMod && isPlugin) {
        return "模组、插件";
      } else if (isMod && isDataPack) {
        return "模组、数据包";
      } else if (isPlugin && isDataPack) {
        return "插件、数据包";
      } else if (isDataPack) {
        return "数据包";
      } else if (isPlugin) {
        return "插件";
      }
    }

    return type;
  });
  nuxtApp.provide("getProjectTypeForUrl", (type, loaders, tags) =>
    getProjectTypeForUrlShorthand(type, loaders, tags),
  );
  nuxtApp.provide("cycleValue", cycleValue);
  nuxtApp.provide("sortedCategories", sortedCategories);
  nuxtApp.provide("notify", (notif) => addNotification(notif));
});

const formatVersions = (tag, versionArray) => {
  const allVersions = tag.value.gameVersions.slice().reverse();
  const allReleases = allVersions.filter((x) => x.version_type === "release");

  const intervals = [];
  let currentInterval = 0;

  for (let i = 0; i < versionArray.length; i++) {
    const index = allVersions.findIndex((x) => x.version === versionArray[i]);
    const releaseIndex = allReleases.findIndex((x) => x.version === versionArray[i]);

    if (i === 0) {
      intervals.push([[versionArray[i], index, releaseIndex]]);
    } else {
      const intervalBase = intervals[currentInterval];

      if (
        (index - intervalBase[intervalBase.length - 1][1] === 1 ||
          releaseIndex - intervalBase[intervalBase.length - 1][2] === 1) &&
        (allVersions[intervalBase[0][1]].version_type === "release" ||
          allVersions[index].version_type !== "release")
      ) {
        intervalBase[1] = [versionArray[i], index, releaseIndex];
      } else {
        currentInterval += 1;
        intervals[currentInterval] = [[versionArray[i], index, releaseIndex]];
      }
    }
  }

  const newIntervals = [];
  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];

    if (interval.length === 2 && interval[0][2] !== -1 && interval[1][2] === -1) {
      let lastSnapshot = null;
      for (let j = interval[1][1]; j > interval[0][1]; j--) {
        if (allVersions[j].version_type === "release") {
          newIntervals.push([
            interval[0],
            [
              allVersions[j].version,
              j,
              allReleases.findIndex((x) => x.version === allVersions[j].version),
            ],
          ]);

          if (lastSnapshot !== null && lastSnapshot !== j + 1) {
            newIntervals.push([[allVersions[lastSnapshot].version, lastSnapshot, -1], interval[1]]);
          } else {
            newIntervals.push([interval[1]]);
          }

          break;
        } else {
          lastSnapshot = j;
        }
      }
    } else {
      newIntervals.push(interval);
    }
  }

  const output = [];

  for (const interval of newIntervals) {
    if (interval.length === 2) {
      output.push(`${interval[0][0]}–${interval[1][0]}`);
    } else {
      output.push(interval[0][0]);
    }
  }

  return (output.length === 0 ? versionArray : output).join(", ");
};
