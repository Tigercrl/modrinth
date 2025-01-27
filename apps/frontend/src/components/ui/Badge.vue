<template>
  <span
    :class="
      'badge flex items-center gap-1 font-semibold text-secondary ' + color + ' type--' + type
    "
  >
    <template v-if="color"> <span class="circle" /> {{ capitalizeString(type) }}</template>

    <!-- User roles -->
    <template v-else-if="type === 'admin'"> <ModrinthIcon /> Modrinth 团队</template>
    <template v-else-if="type === 'moderator'"> <ModeratorIcon /> 审核员</template>
    <template v-else-if="type === 'creator'"><CreatorIcon /> 创作者</template>
    <template v-else-if="type === 'plus'"><PlusIcon /> Modrinth+</template>

    <!-- Project statuses -->
    <template v-else-if="type === 'approved'"><GlobeIcon /> 公共</template>
    <template v-else-if="type === 'approved-general'"><CheckIcon /> 已过审</template>
    <template v-else-if="type === 'unlisted' || type === 'withheld'"
      ><LinkIcon /> 隐藏</template
    >
    <template v-else-if="type === 'private'"><LockIcon /> 私密</template>
    <template v-else-if="type === 'scheduled'"> <CalendarIcon /> 计划中</template>
    <template v-else-if="type === 'draft'"><DraftIcon /> 草稿</template>
    <template v-else-if="type === 'archived'"> <ArchiveIcon /> 已归档</template>
    <template v-else-if="type === 'rejected'"><CrossIcon /> 未过审</template>
    <template v-else-if="type === 'processing'"> <ProcessingIcon /> 审核中</template>

    <!-- Team members -->
    <template v-else-if="type === 'accepted'"><CheckIcon /> 已通过</template>
    <template v-else-if="type === 'pending'"> <ProcessingIcon /> 等待中 </template>

    <!-- Transaction statuses -->
    <template v-else-if="type === 'success'"><CheckIcon /> 成功</template>

    <!-- Report status -->
    <template v-else-if="type === 'closed'"> <CloseIcon /> 已关闭</template>

    <!-- Other -->
    <template v-else> <span class="circle" /> {{ capitalizeString(type) }} </template>
  </span>
</template>

<script setup>
import {
  GlobeIcon,
  LinkIcon,
  ModrinthIcon,
  PlusIcon,
  ScaleIcon as ModeratorIcon,
  BoxIcon as CreatorIcon,
  FileTextIcon as DraftIcon,
  XIcon as CrossIcon,
  ArchiveIcon,
  UpdatedIcon as ProcessingIcon,
  CheckIcon,
  LockIcon,
  CalendarIcon,
  XCircleIcon as CloseIcon,
} from "@modrinth/assets";
import { capitalizeString } from "@modrinth/utils";

defineProps({
  type: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "",
  },
});
</script>

<style lang="scss" scoped>
.badge {
  .circle {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    display: inline-block;
    margin-right: 0.25rem;
    background-color: var(--badge-color);
  }

  svg {
    vertical-align: -15%;
    width: 1em;
    height: 1em;
  }

  &.type--closed,
  &.type--withheld,
  &.type--rejected,
  &.red {
    --badge-color: var(--color-red);
  }

  &.type--pending,
  &.type--moderator,
  &.type--processing,
  &.type--scheduled,
  &.orange {
    --badge-color: var(--color-orange);
  }

  &.type--accepted,
  &.type--admin,
  &.type--success,
  &.type--approved-general,
  &.green {
    --badge-color: var(--color-green);
  }

  &.type--creator,
  &.blue {
    --badge-color: var(--color-blue);
  }

  &.type--unlisted,
  &.type--plus,
  &.purple {
    --badge-color: var(--color-purple);
  }

  &.type--private,
  &.type--approved,
  &.gray {
    --badge-color: var(--color-secondary);
  }
}
</style>
