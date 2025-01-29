<template>
  <div>
    <h1>{{ formatMessage(messages.welcomeLongTitle) }}</h1>

    <section class="auth-form">
      <p>
        {{ formatMessage(messages.welcomeDescription) }}
      </p>

      <Checkbox
        v-model="subscribe"
        class="subscribe-btn"
        :label="formatMessage(messages.subscribeCheckbox)"
        :description="formatMessage(messages.subscribeCheckbox)"
      />

      <button class="btn btn-primary continue-btn centered-btn" @click="continueSignUp">
        {{ formatMessage(commonMessages.continueButton) }}
        <RightArrowIcon/>
      </button>

      <p>
        创建账户即表示您同意 Modrinth 的
        <NuxtLink to="/legal/terms" class="text-link">
          条款
        </NuxtLink>
        和
        <NuxtLink to="/legal/privacy" class="text-link">
          隐私政策
        </NuxtLink>。
      </p>
    </section>
  </div>
</template>
<script setup>
import {Checkbox, commonMessages} from "@modrinth/ui";
import {RightArrowIcon} from "@modrinth/assets";

const {formatMessage} = useVIntl();

const messages = defineMessages({
  subscribeCheckbox: {
    id: "auth.welcome.checkbox.subscribe",
    defaultMessage: "订阅 Modrinth 更新",
  },
  tosLabel: {
    id: "auth.welcome.label.tos",
    defaultMessage:
      "创建账户即表示您同意 Modrinth 的 <terms-link>条款</terms-link> 和 <privacy-policy-link>隐私政策</privacy-policy-link>。",
  },
  welcomeDescription: {
    id: "auth.welcome.description",
    defaultMessage:
      "感谢您创建账户。您现在可以关注和创建资源、接收您最喜爱资源的更新通知等更多操作！",
  },
  welcomeLongTitle: {
    id: "auth.welcome.long-title",
    defaultMessage: "欢迎来到 Modrinth！",
  },
  welcomeTitle: {
    id: "auth.welcome.title",
    defaultMessage: "欢迎",
  },
});

useHead({
  title: () => `${formatMessage(messages.welcomeTitle)} - Modrinth`,
});

const subscribe = ref(true);

async function continueSignUp() {
  const route = useRoute();

  await useAuth(route.query.authToken);
  await useUser();

  if (subscribe.value) {
    try {
      await useBaseFetch("auth/email/subscribe", {
        method: "POST",
      });
    } catch {
      /* empty */
    }
  }

  if (route.query.redirect) {
    await navigateTo(route.query.redirect);
  } else {
    await navigateTo("/dashboard");
  }
}
</script>
