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
  formatVersions,
  formatWallet,
  sortedCategories,
} from "@modrinth/utils";

export default defineNuxtPlugin((nuxtApp) => {
  const tagStore = useTags();

  nuxtApp.provide("formatNumber", formatNumber);
  nuxtApp.provide("capitalizeString", capitalizeString);
  nuxtApp.provide("formatMoney", formatMoney);
  nuxtApp.provide("formatVersion", (versionsArray) => formatVersions(versionsArray, tagStore.value.gameVersions));
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
  nuxtApp.provide("sortedCategories", () => sortedCategories(tagStore.value));
  nuxtApp.provide("notify", (notif) => addNotification(notif));
});
