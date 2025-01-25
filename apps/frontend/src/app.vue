<template>
  <NuxtLayout>
    <ModrinthLoadingIndicator />
    <Notifications />
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup lang="ts">
import ModrinthLoadingIndicator from "~/components/ui/modrinth-loading-indicator.ts";
import Notifications from "~/components/ui/Notifications.vue";
import 'dayjs/locale/zh-cn'
import dayjs from "dayjs";

dayjs.locale('zh-cn')
</script>
