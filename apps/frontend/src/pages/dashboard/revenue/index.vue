<template>
  <div>
    <section class="universal-card">
      <h2 class="text-2xl">收益</h2>
      <div v-if="userBalance.available >= minWithdraw">
        <p>
          您有
          <strong>{{ $formatMoney(userBalance.available) }}</strong>
          可提现，有
          <strong>{{ $formatMoney(userBalance.pending) }}</strong>
          正在
          <nuxt-link class="text-link" to="/legal/cmp-info#pending">等待中</nuxt-link>。
        </p>
      </div>
      <p v-else>
        您赚取了
        <strong>{{ $formatMoney(userBalance.available) }}</strong
        >，低于最低提现额 ${{ minWithdraw }}，因此无法提现。
        您有
        <strong>{{ $formatMoney(userBalance.pending) }}</strong>
        正在
        <nuxt-link class="text-link" to="/legal/cmp-info#pending">等待中</nuxt-link>。
      </p>
      <div class="input-group mt-4">
        <nuxt-link
          v-if="userBalance.available >= minWithdraw"
          class="iconified-button brand-button"
          to="/dashboard/revenue/withdraw"
        >
          <TransferIcon/>
          提现
        </nuxt-link>
        <NuxtLink class="iconified-button" to="/dashboard/revenue/transfers">
          <HistoryIcon/>
          查看提现历史
        </NuxtLink>
      </div>
      <p>
        在 Modrinth 上发布资源并从您的账户中提现资金，即表示您同意
        <nuxt-link to="/legal/cmp" class="text-link">创作者激励条款</nuxt-link>。如需了解奖励制度的更多信息，请
        <nuxt-link to="/legal/cmp-info" class="text-link">点击此处</nuxt-link>
        查看我们的信息页面。
      </p>
    </section>
    <section class="universal-card">
      <h2 class="text-2xl">提现方式</h2>
      <h3>PayPal</h3>
      <template v-if="auth.user.auth_providers.includes('paypal')">
        <p>
          您的 PayPal
          {{ auth.user.payout_data.paypal_country }}
          账户目前与邮箱
          {{ auth.user.payout_data.paypal_address }}
          绑定
        </p>
        <button class="btn mt-4" @click="removeAuthProvider('paypal')">
          <XIcon/>
          解绑
        </button>
      </template>
      <template v-else>
        <p>绑定您的 PayPal 账户，以提现到您的 PayPal 账户。</p>
        <a class="btn mt-4" :href="`${getAuthUrl('paypal')}&token=${auth.token}`">
          <PayPalIcon/>
          登录 PayPal
        </a>
      </template>
      <h3>Tremendous</h3>
      <p>
        Tremendous 提现将提现至和您 Modrinth 邮箱一致的账户。点此
        <nuxt-link to="/settings/account" class="text-link">修改 / 设置您的 Modrinth 电子邮箱
        </nuxt-link>
        .
      </p>
      <h3>Venmo</h3>
      <p>请在下面输入您的 Venmo 用户名，以提现到您的 Venmo 账户。</p>
      <label class="hidden" for="venmo">Venmo 地址</label>
      <input
        id="venmo"
        v-model="auth.user.payout_data.venmo_handle"
        class="mt-4"
        type="search"
        name="search"
        placeholder="@xxxxx"
        autocomplete="off"
      />
      <button class="btn btn-secondary" @click="updateVenmo">
        <SaveIcon/>
        保存信息
      </button>
    </section>
  </div>
</template>
<script setup>
import {HistoryIcon, PayPalIcon, SaveIcon, TransferIcon, XIcon} from "@modrinth/assets";

const auth = await useAuth();
const minWithdraw = ref(0.01);

const {data: userBalance} = await useAsyncData(`payout/balance`, () =>
  useBaseFetch(`payout/balance`, {apiVersion: 3}),
);

async function updateVenmo() {
  startLoading();
  try {
    const data = {
      venmo_handle: auth.value.user.payout_data.venmo_handle ?? null,
    };

    await useBaseFetch(`user/${auth.value.user.id}`, {
      method: "PATCH",
      body: data,
      apiVersion: 3,
    });
    await useAuth(auth.value.token);
  } catch (err) {
    const data = useNuxtApp();
    data.$notify({
      group: "main",
      title: "发生错误",
      text: err.data.description,
      type: "error",
    });
  }
  stopLoading();
}
</script>
<style lang="scss" scoped>
strong {
  color: var(--color-text-dark);
  font-weight: 500;
}
</style>
