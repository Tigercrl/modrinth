<template>
  <div>
    <template v-if="flow">
      <label for="two-factor-code">
        <span class="label__title">{{ formatMessage(messages.twoFactorCodeLabel) }}</span>
        <span class="label__description">
          {{ formatMessage(messages.twoFactorCodeLabelDescription) }}
        </span>
      </label>
      <input
        id="two-factor-code"
        v-model="twoFactorCode"
        maxlength="11"
        type="text"
        :placeholder="formatMessage(messages.twoFactorCodeInputPlaceholder)"
        autocomplete="one-time-code"
        autofocus
        @keyup.enter="begin2FASignIn"
      />

      <button class="btn btn-primary continue-btn" @click="begin2FASignIn">
        {{ formatMessage(commonMessages.signInButton) }}
        <RightArrowIcon/>
      </button>
    </template>
    <template v-else>
      <h1>{{ formatMessage(messages.signInWithLabel) }}</h1>

      <section class="third-party">
        <a class="btn" :href="getAuthUrl('discord', redirectTarget)">
          <SSODiscordIcon/>
          <span>Discord</span>
        </a>
        <a class="btn" :href="getAuthUrl('github', redirectTarget)">
          <SSOGitHubIcon/>
          <span>GitHub</span>
        </a>
        <a class="btn" :href="getAuthUrl('microsoft', redirectTarget)">
          <SSOMicrosoftIcon/>
          <span>微软</span>
        </a>
        <a class="btn" :href="getAuthUrl('google', redirectTarget)">
          <SSOGoogleIcon/>
          <span>谷歌</span>
        </a>
        <a class="btn" :href="getAuthUrl('steam', redirectTarget)">
          <SSOSteamIcon/>
          <span>Steam</span>
        </a>
        <a class="btn" :href="getAuthUrl('gitlab', redirectTarget)">
          <SSOGitLabIcon/>
          <span>GitLab</span>
        </a>
      </section>

      <h1>{{ formatMessage(messages.usePasswordLabel) }}</h1>

      <section class="auth-form">
        <div class="iconified-input">
          <label for="email" hidden>{{ formatMessage(messages.emailUsernameLabel) }}</label>
          <MailIcon/>
          <input
            id="email"
            v-model="email"
            type="text"
            autocomplete="username"
            class="auth-form__input"
            :placeholder="formatMessage(messages.emailUsernameLabel)"
          />
        </div>

        <div class="iconified-input">
          <label for="password" hidden>{{ formatMessage(messages.passwordLabel) }}</label>
          <KeyIcon/>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="auth-form__input"
            :placeholder="formatMessage(messages.passwordLabel)"
          />
        </div>

        <HCaptcha ref="captcha" v-model="token"/>

        <button
          class="btn btn-primary continue-btn centered-btn"
          :disabled="!token"
          @click="beginPasswordSignIn()"
        >
          {{ formatMessage(commonMessages.signInButton) }}
          <RightArrowIcon/>
        </button>

        <p>
          <IssuesIcon/>
          电脑端请先下载并运行
          <a class="text-link" href="/patch.jar"
             download="ModrinthCnLoginPatch-1.0.0.jar">
            汉化站修复补丁
          </a>
          以进行登录。手机端暂不支持登录。
        </p>

        <div class="auth-form__additional-options">
          <NuxtLink
            class="text-link"
            :to="{path: '/auth/reset-password', query: route.query}">
            忘记密码？
          </NuxtLink>
          •
          <NuxtLink
            class="text-link"
            :to="{path: '/auth/sign-up', query: route.query}">
            创建账户
          </NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import {
  IssuesIcon,
  KeyIcon,
  MailIcon,
  RightArrowIcon,
  SSODiscordIcon,
  SSOGitHubIcon,
  SSOGitLabIcon,
  SSOGoogleIcon,
  SSOMicrosoftIcon,
  SSOSteamIcon,
} from "@modrinth/assets";
import {commonMessages} from "@modrinth/ui";
import HCaptcha from "@/components/ui/HCaptcha.vue";

const {formatMessage} = useVIntl();

const messages = defineMessages({
  additionalOptionsLabel: {
    id: "auth.sign-in.additional-options",
    defaultMessage:
      "<forgot-password-link>忘记密码？</forgot-password-link> • <create-account-link>创建账户</create-account-link>",
  },
  emailUsernameLabel: {
    id: "auth.sign-in.email-username.label",
    defaultMessage: "用户名或密码",
  },
  passwordLabel: {
    id: "auth.sign-in.password.label",
    defaultMessage: "密码",
  },
  signInWithLabel: {
    id: "auth.sign-in.sign-in-with",
    defaultMessage: "使用第三方平台登录",
  },
  signInTitle: {
    id: "auth.sign-in.title",
    defaultMessage: "登录",
  },
  twoFactorCodeInputPlaceholder: {
    id: "auth.sign-in.2fa.placeholder",
    defaultMessage: "请输入代码...",
  },
  twoFactorCodeLabel: {
    id: "auth.sign-in.2fa.label",
    defaultMessage: "请输入两部验证代码",
  },
  twoFactorCodeLabelDescription: {
    id: "auth.sign-in.2fa.description",
    defaultMessage: "请输入两部验证代码以继续",
  },
  usePasswordLabel: {
    id: "auth.sign-in.use-password",
    defaultMessage: "或使用密码",
  },
});

useHead({
  title() {
    return `${formatMessage(messages.signInTitle)} - Modrinth`;
  },
});

const auth = await useAuth();
const route = useNativeRoute();

const redirectTarget = route.query.redirect || "";

if (route.query.code && !route.fullPath.includes("new_account=true")) {
  await finishSignIn();
}

if (auth.value.user) {
  await finishSignIn();
}

const captcha = ref();

const email = ref("");
const password = ref("");
const token = ref("");

const flow = ref(route.query.flow);

async function beginPasswordSignIn() {
  startLoading();
  try {
    const res = await useBaseFetch("auth/login", {
      method: "POST",
      body: {
        username: email.value,
        password: password.value,
        challenge: token.value,
      },
    });

    if (res.flow) {
      flow.value = res.flow;
    } else {
      await finishSignIn(res.session);
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

const twoFactorCode = ref(null);

async function begin2FASignIn() {
  startLoading();
  try {
    const res = await useBaseFetch("auth/login/2fa", {
      method: "POST",
      body: {
        flow: flow.value,
        code: twoFactorCode.value ? twoFactorCode.value.toString() : twoFactorCode.value,
      },
    });

    await finishSignIn(res.session);
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

async function finishSignIn(token) {
  if (route.query.launcher) {
    await navigateTo(`https://launcher-files.modrinth.com/?code=${token}`, {external: true});
    return;
  }

  if (token) {
    await useAuth(token);
    await useUser();
  }

  if (route.query.redirect) {
    const redirect = decodeURIComponent(route.query.redirect);
    await navigateTo(redirect, {
      replace: true,
    });
  } else {
    await navigateTo("/dashboard");
  }
}
</script>
