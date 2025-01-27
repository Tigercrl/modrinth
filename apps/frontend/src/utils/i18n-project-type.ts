const projectTypeMessages = defineMessages({
  datapack: {
    id: "project-type.datapack.singular",
    defaultMessage: "数据包",
  },
  mod: {
    id: "project-type.mod.singular",
    defaultMessage: "模组",
  },
  modpack: {
    id: "project-type.modpack.singular",
    defaultMessage: "整合包",
  },
  plugin: {
    id: "project-type.plugin.singular",
    defaultMessage: "插件",
  },
  resourcepack: {
    id: "project-type.resourcepack.singular",
    defaultMessage: "资源包",
  },
  shader: {
    id: "project-type.shader.singular",
    defaultMessage: "光影",
  },
  project: {
    id: "project-type.project.singular",
    defaultMessage: "资源",
  },
  collection: {
    id: "project-type.collection.singular",
    defaultMessage: "收藏夹",
  },
});


export function getProjectTypeMessage(type: keyof typeof projectTypeMessages) {
  return (
    projectTypeMessages[`${type}`] ?? projectTypeMessages[`project`]
  );
}
