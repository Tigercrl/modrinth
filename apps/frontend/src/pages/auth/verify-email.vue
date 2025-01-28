<template>
  <div>
    <template v-if="auth.user && auth.user.email_verified && !success">
      <h1>{{ formatMessage(alreadyVerifiedMessages.title) }}</h1>

      <section class="auth-form">
        <p>{{ formatMessage(alreadyVerifiedMessages.description) }}</p>

        <NuxtLink class="btn" to="/settings/account">
          <SettingsIcon /> {{ formatMessage(messages.accountSettings) }}
        </NuxtLink>
      </section>
    </template>

    <template v-else-if="success">
      <h1>{{ formatMessage(postVerificationMessages.title) }}</h1>

      <section class="auth-form">
        <p>{{ formatMessage(postVerificationMessages.description) }}</p>

        <NuxtLink v-if="auth.user" class="btn" link="/settings/account">
          <SettingsIcon /> {{ formatMessage(messages.accountSettings) }}
        </NuxtLink>
        <NuxtLink v-else to="/auth/sign-in" class="btn btn-primary continue-btn centered-btn">
          {{ formatMessage(messages.signIn) }} <RightArrowIcon />
        </NuxtLink>
      </section>
    </template>

    <template v-else>
      <h1>{{ formatMessage(failedVerificationMessages.title) }}</h1>

      <section class="auth-form">
        <p>
          <template v-if="auth.user">
            {{ formatMessage(failedVerificationMessages.loggedInDescription) }}
          </template>
          <template v-else>
            {{ formatMessage(failedVerificationMessages.description) }}
          </template>
        </p>

        <button v-if="auth.user" class="btn btn-primary continue-btn" @click="resendVerifyEmail">
          {{ formatMessage(failedVerificationMessages.action) }} <RightArrowIcon />
        </button>

        <NuxtLink v-else to="/auth/sign-in" class="btn btn-primary continue-btn centered-btn">
          {{ formatMessage(messages.signIn) }} <RightArrowIcon />
        </NuxtLink>
      </section>
    </template>
  </div>
</template>
<script setup>
import { SettingsIcon, RightArrowIcon } from "@modrinth/assets";

const { formatMessage } = useVIntl();

const messages = defineMessages({
  title: {
    id: "auth.verify-email.title",
    defaultMessage: "验证邮箱地址",
  },
  accountSettings: {
    id: "auth.verify-email.action.account-settings",
    defaultMessage: "账户设置",
  },
  signIn: {
    id: "auth.verify-email.action.sign-in",
    defaultMessage: "登录",
  },
});

const alreadyVerifiedMessages = defineMessages({
  title: {
    id: "auth.verify-email.already-verified.title",
    defaultMessage: "已验证邮箱地址",
  },
  description: {
    id: "auth.verify-email.already-verified.description",
    defaultMessage: "您的邮箱地址已经被验证了！",
  },
});

const postVerificationMessages = defineMessages({
  title: {
    id: "auth.verify-email.post-verification.title",
    defaultMessage: "验证邮箱地址",
  },
  description: {
    id: "auth.verify-email.post-verification.description",
    defaultMessage: "您的邮箱地址验证成功！",
  },
});

const failedVerificationMessages = defineMessages({
  title: {
    id: "auth.verify-email.failed-verification.title",
    defaultMessage: "邮箱地址验证失败",
  },
  description: {
    id: "auth.verify-email.failed-verification.description",
    defaultMessage:
      "我们无法验证您的电子邮件。请尝试通过登录您的账户并进入仪表板以重新发送验证邮件。",
  },
  loggedInDescription: {
    id: "auth.verify-email.failed-verification.description.logged-in",
    defaultMessage:
      "我们无法验证您的电子邮件。请尝试通过下面的按钮重新发送验证邮件。",
  },
  action: {
    id: "auth.verify-email.failed-verification.action",
    defaultMessage: "重发验证邮件",
  },
});

useHead({
  title: () => `${formatMessage(messages.title)} - Modrinth`,
});

const auth = await useAuth();

const success = ref(false);
const route = useNativeRoute();

if (route.query.flow) {
  try {
    const emailVerified = useState("emailVerified", () => null);

    if (emailVerified.value === null) {
      await useBaseFetch("auth/email/verify", {
        method: "POST",
        body: {
          flow: route.query.flow,
        },
      });
      emailVerified.value = true;
      success.value = true;
    }

    if (emailVerified.value) {
      success.value = true;

      if (auth.value.token) {
        await useAuth(auth.value.token);
      }
    }
  } catch {
    success.value = false;
  }
}
</script>
