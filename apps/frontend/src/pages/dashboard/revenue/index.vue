<template>
  <div>
    <section class="universal-card">
      <h2 class="text-2xl">收益</h2>
      <div class="grid-display">
        <div class="grid-display__item">
          <div class="label">可提现</div>
          <div class="value">
            {{ $formatMoney(userBalance.available) }}
          </div>
        </div>
        <div class="grid-display__item">
          <div class="label">
            等待中
            <nuxt-link
              v-tooltip="`点此阅读 Modrinth 如何处理你的收入。`"
              class="align-middle text-link"
              to="/legal/cmp-info#pending"
            >
              <UnknownIcon />
            </nuxt-link>
          </div>
          <div class="value">
            {{ $formatMoney(userBalance.pending) }}
          </div>
        </div>
        <div class="grid-display__item available-soon">
          <h3 class="label">
            等待列表
            <nuxt-link
              v-tooltip="`点击阅读 Modrinth 如何处理你的收入。`"
              class="align-middle text-link"
              to="/legal/cmp-info#pending"
            >
              <UnknownIcon />
            </nuxt-link>
          </h3>
          <ul class="available-soon-list">
            <li v-for="date in availableSoonDateKeys" :key="date" class="available-soon-item">
              <span class="amount">
                {{ $formatMoney(availableSoonDates[date]) }}
                <small
                  v-if="availableSoonDateKeys.indexOf(date) === availableSoonDateKeys.length - 1"
                  >†</small
                >
              </span>
              <span class="date">
                {{ formatDate(dayjs(date)) }}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div class="input-group mt-4">
        <span :class="{ 'disabled-cursor-wrapper': userBalance.available < minWithdraw }">
          <nuxt-link
            :aria-disabled="userBalance.available < minWithdraw ? 'true' : 'false'"
            :class="{ 'disabled-link': userBalance.available < minWithdraw }"
            :disabled="userBalance.available < minWithdraw ? 'true' : 'false'"
            :tabindex="userBalance.available < minWithdraw ? -1 : undefined"
            class="iconified-button brand-button"
            to="/dashboard/revenue/withdraw"
          >
            <TransferIcon /> 提现
          </nuxt-link>
        </span>
        <NuxtLink class="iconified-button" to="/dashboard/revenue/transfers">
          <HistoryIcon />
          查看提现历史
        </NuxtLink>
      </div>
      <p>
        <small>
          在 Modrinth 上发布资源并从您的账户中提现资金，即表示您同意
          <nuxt-link class="text-link" to="/legal/cmp">创作者激励条款</nuxt-link>。如需了解奖励制度的更多信息，请
          <nuxt-link class="text-link" to="/legal/cmp-info">点击此处</nuxt-link>
          查看我们的信息页面。
        </small>
      </p>
      <p>
        <small>
          †持续变动中，可能随时发生变化。最终金额可在本月的最后一天查看。
        </small>
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
          <XIcon />
          解绑
        </button>
      </template>
      <template v-else>
        <p>绑定您的 PayPal 账户，以提现到您的 PayPal 账户。</p>
        <a :href="`${getAuthUrl('paypal')}&token=${auth.token}`" class="btn mt-4">
          <PayPalIcon />
          登录 PayPal
        </a>
      </template>
      <h3>Tremendous</h3>
      <p>
        Tremendous 提现将提现至和您 Modrinth 邮箱一致的账户。<nuxt-link class="text-link" to="/settings/account">点此</nuxt-link>
        修改 / 设置您的 Modrinth 邮箱。
      </p>
      <h3>Venmo</h3>
      <p>请在下面输入您的 Venmo 用户名，以提现到您的 Venmo 账户。</p>
      <label class="hidden" for="venmo">Venmo 地址</label>
      <input
        id="venmo"
        v-model="auth.user.payout_data.venmo_handle"
        autocomplete="off"
        class="mt-4"
        name="search"
        placeholder="@example"
        type="search"
      />
      <button class="btn btn-secondary" @click="updateVenmo">
        <SaveIcon />
        保存信息
      </button>
    </section>
  </div>
</template>
<script setup>
import {
  HistoryIcon,
  PayPalIcon,
  SaveIcon,
  TransferIcon,
  UnknownIcon,
  XIcon,
} from "@modrinth/assets";
import { formatDate } from "@modrinth/utils";
import dayjs from "dayjs";
import { computed } from "vue";

const auth = await useAuth();
const minWithdraw = ref(0.01);

const {data: userBalance} = await useAsyncData(`payout/balance`, () =>
  useBaseFetch(`payout/balance`, {apiVersion: 3}),
);

const deadlineEnding = computed(() => {
  let deadline = dayjs().subtract(2, "month").endOf("month").add(60, "days");
  if (deadline.isBefore(dayjs().startOf("day"))) {
    deadline = dayjs().subtract(1, "month").endOf("month").add(60, "days");
  }
  return deadline;
});

const availableSoonDates = computed(() => {
  // Get the next 3 dates from userBalance.dates that are from now to the deadline + 4 months to make sure we get all the pending ones.
  const dates = Object.keys(userBalance.value.dates)
    .filter((date) => {
      const dateObj = dayjs(date);
      return (
        dateObj.isAfter(dayjs()) && dateObj.isBefore(dayjs(deadlineEnding.value).add(4, "month"))
      );
    })
    .sort((a, b) => dayjs(a).diff(dayjs(b)));

  return dates.reduce((acc, date) => {
    acc[date] = userBalance.value.dates[date];
    return acc;
  }, {});
});

const availableSoonDateKeys = computed(() => Object.keys(availableSoonDates.value));

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

.disabled-cursor-wrapper {
  cursor: not-allowed;
}

.disabled-link {
  pointer-events: none;
}

.grid-display {
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}

.available-soon {
  .label {
    margin: 0;
  }

  &-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  &-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.2rem 0 0;
    border-bottom: 1px solid var(--color-divider);

    .amount {
      font-weight: 600;

      small {
        vertical-align: top;
        margin: 0;
        padding: 0;
      }
    }

    .date {
      color: var(--color-text-secondary);
      font-size: 0.9em;
    }

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
