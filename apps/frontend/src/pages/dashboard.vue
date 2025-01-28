<template>
  <div class="normal-page">
    <div class="normal-page__sidebar">
      <aside class="universal-card">
        <h1>仪表盘</h1>
        <NavStack>
          <NavStackItem link="/dashboard" label="概览">
            <DashboardIcon aria-hidden="true" />
          </NavStackItem>
          <NavStackItem link="/dashboard/notifications" label="通知">
            <NotificationsIcon aria-hidden="true" />
          </NavStackItem>
          <NavStackItem link="/dashboard/reports" label="处理中举报">
            <ReportIcon aria-hidden="true" />
          </NavStackItem>
          <NavStackItem link="/dashboard/analytics" label="数据分析">
            <ChartIcon aria-hidden="true" />
          </NavStackItem>

          <h3>管理</h3>
          <NavStackItem v-if="true" link="/dashboard/projects" label="资源">
            <ListIcon aria-hidden="true" />
          </NavStackItem>
          <NavStackItem v-if="true" link="/dashboard/organizations" label="组织">
            <OrganizationIcon aria-hidden="true" />
          </NavStackItem>
          <NavStackItem
            link="/dashboard/collections"
            :label="formatMessage(commonMessages.collectionsLabel)"
          >
            <LibraryIcon aria-hidden="true" />
          </NavStackItem>
          <NavStackItem link="/dashboard/revenue" label="收益">
            <CurrencyIcon aria-hidden="true" />
          </NavStackItem>
        </NavStack>
      </aside>
    </div>
    <div class="normal-page__content">
      <NuxtPage :route="route" />
    </div>
  </div>
</template>
<script setup>
import {
  DashboardIcon,
  CurrencyIcon,
  ListIcon,
  ReportIcon,
  BellIcon as NotificationsIcon,
  OrganizationIcon,
  LibraryIcon,
  ChartIcon,
} from "@modrinth/assets";
import { commonMessages } from "@modrinth/ui";
import NavStack from "~/components/ui/NavStack.vue";
import NavStackItem from "~/components/ui/NavStackItem.vue";

const { formatMessage } = useVIntl();

definePageMeta({
  middleware: "auth",
});

const route = useNativeRoute();
</script>
