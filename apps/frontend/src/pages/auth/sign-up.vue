<template>
  <div>
    <h1>{{ formatMessage(messages.signUpWithTitle) }}</h1>

    <section class="third-party">
      <a class="btn discord-btn" :href="getAuthUrl('discord', redirectTarget)">
        <SSODiscordIcon />
        <span>Discord</span>
      </a>
      <a class="btn" :href="getAuthUrl('github', redirectTarget)">
        <SSOGitHubIcon />
        <span>GitHub</span>
      </a>
      <a class="btn" :href="getAuthUrl('microsoft', redirectTarget)">
        <SSOMicrosoftIcon />
        <span>微软</span>
      </a>
      <a class="btn" :href="getAuthUrl('google', redirectTarget)">
        <SSOGoogleIcon />
        <span>谷歌</span>
      </a>
      <a class="btn" :href="getAuthUrl('steam', redirectTarget)">
        <SSOSteamIcon />
        <span>Steam</span>
      </a>
      <a class="btn" :href="getAuthUrl('gitlab', redirectTarget)">
        <SSOGitLabIcon />
        <span>GitLab</span>
      </a>
    </section>

    <h1>{{ formatMessage(messages.createAccountTitle) }}</h1>

    <section class="auth-form">
      <div class="iconified-input">
        <label for="email" hidden>{{ formatMessage(messages.emailLabel) }}</label>
        <MailIcon />
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="username"
          class="auth-form__input"
          :placeholder="formatMessage(messages.emailLabel)"
        />
      </div>

      <div class="iconified-input">
        <label for="username" hidden>{{ formatMessage(messages.usernameLabel) }}</label>
        <UserIcon />
        <input
          id="username"
          v-model="username"
          type="text"
          autocomplete="username"
          class="auth-form__input"
          :placeholder="formatMessage(messages.usernameLabel)"
        />
      </div>

      <div class="iconified-input">
        <label for="password" hidden>{{ formatMessage(messages.passwordLabel) }}</label>
        <KeyIcon />
        <input
          id="password"
          v-model="password"
          class="auth-form__input"
          type="password"
          autocomplete="new-password"
          :placeholder="formatMessage(messages.passwordLabel)"
        />
      </div>

      <div class="iconified-input">
        <label for="confirm-password" hidden>{{ formatMessage(messages.passwordLabel) }}</label>
        <KeyIcon />
        <input
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          autocomplete="new-password"
          class="auth-form__input"
          :placeholder="formatMessage(messages.confirmPasswordLabel)"
        />
      </div>

      <Checkbox
        v-model="subscribe"
        class="subscribe-btn"
        :label="formatMessage(messages.subscribeLabel)"
        :description="formatMessage(messages.subscribeLabel)"
      />

      <p v-if="!route.query.launcher">
        创建账户即表示您同意 Modrinth 的
        <NuxtLink to="/legal/terms" class="text-link">
          条款
        </NuxtLink>
        和
        <NuxtLink to="/legal/privacy" class="text-link">
          隐私政策
        </NuxtLink>。
      </p>

      <HCaptcha ref="captcha" v-model="token" />

      <button
        class="btn btn-primary continue-btn centered-btn"
        :disabled="!token"
        @click="createAccount"
      >
        {{ formatMessage(messages.createAccountButton) }} <RightArrowIcon />
      </button>

      <div class="auth-form__additional-options">
        {{ formatMessage(messages.alreadyHaveAccountLabel) }}
        <NuxtLink
          class="text-link"
          :to="{
            path: '/auth/sign-in',
            query: route.query,
          }"
        >
          {{ formatMessage(commonMessages.signInButton) }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  RightArrowIcon,
  UserIcon,
  SSOGitHubIcon,
  SSOMicrosoftIcon,
  SSOGoogleIcon,
  SSOSteamIcon,
  SSODiscordIcon,
  KeyIcon,
  MailIcon,
  SSOGitLabIcon,
} from "@modrinth/assets";
import { Checkbox, commonMessages } from "@modrinth/ui";
import HCaptcha from "@/components/ui/HCaptcha.vue";

const { formatMessage } = useVIntl();

const messages = defineMessages({
  title: {
    id: "auth.sign-up.title",
    defaultMessage: "注册",
  },
  signUpWithTitle: {
    id: "auth.sign-up.title.sign-up-with",
    defaultMessage: "使用第三方平台注册",
  },
  createAccountTitle: {
    id: "auth.sign-up.title.create-account",
    defaultMessage: "或手动创建账户",
  },
  emailLabel: {
    id: "auth.sign-up.email.label",
    defaultMessage: "邮箱地址",
  },
  usernameLabel: {
    id: "auth.sign-up.label.username",
    defaultMessage: "用户名",
  },
  passwordLabel: {
    id: "auth.sign-up.password.label",
    defaultMessage: "密码",
  },
  confirmPasswordLabel: {
    id: "auth.sign-up.confirm-password.label",
    defaultMessage: "重复密码",
  },
  subscribeLabel: {
    id: "auth.sign-up.subscribe.label",
    defaultMessage: "订阅 Modrinth 更新",
  },
  legalDisclaimer: {
    id: "auth.sign-up.legal-dislaimer",
    defaultMessage:
      "创建账户即表示您同意 Modrinth 的 <terms-link>条款</terms-link> 和 <privacy-policy-link>隐私政策</privacy-policy-link>。",
  },
  createAccountButton: {
    id: "auth.sign-up.action.create-account",
    defaultMessage: "创建账户",
  },
  alreadyHaveAccountLabel: {
    id: "auth.sign-up.sign-in-option.title",
    defaultMessage: "已经有账户了？",
  },
});

useHead({
  title: () => `${formatMessage(messages.title)} - Modrinth`,
});

const auth = await useAuth();
const route = useNativeRoute();

const redirectTarget = route.query.redirect;

if (auth.value.user) {
  await navigateTo("/dashboard");
}

const captcha = ref();

const email = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const token = ref("");
const subscribe = ref(true);

async function createAccount() {
  startLoading();
  try {
    if (confirmPassword.value !== password.value) {
      addNotification({
        group: "main",
        title: formatMessage(commonMessages.errorNotificationTitle),
        text: formatMessage({
          id: "auth.sign-up.notification.password-mismatch.text",
          defaultMessage: "Passwords do not match!",
        }),
        type: "error",
      });
      captcha.value?.reset();
    }

    const res = await useBaseFetch("auth/create", {
      method: "POST",
      body: {
        username: username.value,
        password: password.value,
        email: email.value,
        challenge: token.value,
        sign_up_newsletter: subscribe.value,
      },
    });

    if (route.query.launcher) {
      await navigateTo(`https://launcher-files.modrinth.com/?code=${res.session}`, {
        external: true,
      });
      return;
    }

    await useAuth(res.session);
    await useUser();

    if (route.query.redirect) {
      await navigateTo(route.query.redirect);
    } else {
      await navigateTo("/dashboard");
    }
  } catch (err) {
    addNotification({
      group: "main",
      title: formatMessage(commonMessages.errorNotificationTitle),
      text: err.data ? err.data.description : err,
      type: "error",
    });
    captcha.value?.reset();
  }
  stopLoading();
}
</script>
