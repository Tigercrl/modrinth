<template>
  <div>
    <div class="universal-card">
      <h2>数据分析</h2>

      <p>
        这个页面显示了您的资源 <strong>{{ project.title }}</strong> 的数据分析。您可以看到您的资源的下载量、浏览量和收益，以及按地区划分的下载量和浏览量。
      </p>
    </div>

    <ChartDisplay :projects="[props.project]" />
  </div>
</template>

<script setup>
import ChartDisplay from "~/components/ui/charts/ChartDisplay.vue";

const props = defineProps({
  project: {
    type: Object,
    default() {
      return {};
    },
  },
});
</script>

<style scoped lang="scss">
.markdown-body {
  margin-bottom: var(--gap-md);
}
</style>
