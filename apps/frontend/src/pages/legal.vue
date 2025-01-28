<template>
  <div class="normal-page">
    <div class="normal-page__sidebar">
      <aside class="universal-card">
        <h1>政策条款</h1>
        <NavStack>
          <NavStackItem link="/legal/terms" label="使用条款">
            <HeartHandshakeIcon aria-hidden="true" />
          </NavStackItem>
          <NavStackItem link="/legal/rules" label="内容规则">
            <ScaleIcon aria-hidden="true" />
          </NavStackItem>
          <NavStackItem link="/legal/copyright" label="版权政策">
            <CopyrightIcon aria-hidden="true" />
          </NavStackItem>
          <NavStackItem link="/legal/security" label="安全注意">
            <ShieldIcon aria-hidden="true" />
          </NavStackItem>

          <h3>隐私</h3>
          <NavStackItem link="/legal/privacy" label="隐私政策">
            <LockIcon aria-hidden="true" />
          </NavStackItem>
          <NavStackItem link="/legal/ccpa" label="加州隐私声明">
            <InfoIcon aria-hidden="true" />
          </NavStackItem>

          <h3>创作者激励</h3>
          <NavStackItem link="/legal/cmp" label="创作者激励条款">
            <CurrencyIcon aria-hidden="true" />
          </NavStackItem>
          <NavStackItem link="/legal/cmp-info" label="创作者激励详情">
            <InfoIcon aria-hidden="true" />
          </NavStackItem>
        </NavStack>
      </aside>
    </div>
    <div class="normal-page__content">
      <NuxtPage class="universal-card" :route="route" />
    </div>
  </div>
</template>

<script setup>
import {
  InfoIcon,
  HeartHandshakeIcon,
  LockIcon,
  ScaleIcon,
  ShieldIcon,
  CurrencyIcon,
  CopyrightIcon,
} from "@modrinth/assets";
import NavStack from "~/components/ui/NavStack.vue";
import NavStackItem from "~/components/ui/NavStackItem.vue";

const route = useNativeRoute();
</script>

<style lang="scss" scoped>
.normal-page__content :deep(a) {
  color: var(--color-link);
  text-decoration: underline;

  &:focus-visible,
  &:hover {
    color: var(--color-link-hover);
  }

  &:active {
    color: var(--color-link-active);
  }
}
</style>
