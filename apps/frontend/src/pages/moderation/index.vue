<template>
  <div>
    <section class="universal-card">
      <h2>统计</h2>
      <div class="grid-display">
        <div class="grid-display__item">
          <div class="label">资源</div>
          <div class="value">
            {{ formatNumber(stats.projects, false) }}
          </div>
        </div>
        <div class="grid-display__item">
          <div class="label">版本</div>
          <div class="value">
            {{ formatNumber(stats.versions, false) }}
          </div>
        </div>
        <div class="grid-display__item">
          <div class="label">文件</div>
          <div class="value">
            {{ formatNumber(stats.files, false) }}
          </div>
        </div>
        <div class="grid-display__item">
          <div class="label">创作者</div>
          <div class="value">
            {{ formatNumber(stats.authors, false) }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup>
import { formatNumber } from "@modrinth/utils";

useHead({
  title: "审核概览 - Modrinth",
});

const { data: stats } = await useAsyncData("statistics", () => useBaseFetch("statistics"));
</script>
