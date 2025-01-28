<template>
  <ReportView
    :auth="auth"
    :report-id="route.params.id"
    :breadcrumbs-stack="[{ href: '/dashboard/reports', label: '处理中举报' }]"
  />
</template>
<script setup>
import ReportView from "~/components/ui/report/ReportView.vue";

const route = useNativeRoute();
const auth = await useAuth();

useHead({
  title: `举报 ${route.params.id} - Modrinth`,
});
</script>
