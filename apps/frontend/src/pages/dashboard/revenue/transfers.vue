<template>
  <div>
    <section class="universal-card payout-history">
      <Breadcrumbs
        current-title="提现历史"
        :link-stack="[{ href: '/dashboard/revenue', label: '收益' }]"
      />
      <h2>提现历史</h2>
      <p>您从 Modrinth 提现的所有资金都将在此列出：</p>
      <div class="input-group">
        <DropdownSelect
          v-model="selectedYear"
          :options="years"
          :display-name="(x) => (x === 'all' ? '所有时间' : x)"
          name="年份过滤器"
        />
        <DropdownSelect
          v-model="selectedMethod"
          :options="methods"
          :display-name="$formatWallet"
          name="方式过滤器"
        />
      </div>
      <p>
        {{
          selectedYear !== "all"
            ? selectedMethod !== "all"
              ? formatMessage(messages.transfersTotalYearMethod, {
                amount: $formatMoney(totalAmount),
                year: selectedYear,
                method: formatWallet(selectedMethod),
              })
              : formatMessage(messages.transfersTotalYear, {
                amount: $formatMoney(totalAmount),
                year: selectedYear,
              })
            : selectedMethod !== "all"
              ? formatMessage(messages.transfersTotalMethod, {
                amount: $formatMoney(totalAmount),
                method: formatWallet(selectedMethod),
              })
              : formatMessage(messages.transfersTotal, {amount: $formatMoney(totalAmount)})
        }}
      </p>
      <div
        v-for="payout in filteredPayouts"
        :key="payout.id"
        class="universal-card recessed payout"
      >
        <div class="platform">
          <PayPalIcon v-if="payout.method === 'paypal'"/>
          <TremendousIcon v-else-if="payout.method === 'tremendous'"/>
          <VenmoIcon v-else-if="payout.method === 'venmo'"/>
          <UnknownIcon v-else/>
        </div>
        <div class="payout-info">
          <div>
            <strong>
              {{ $dayjs(payout.created).format('YYYY/MM/DD hh:mm:ss') }}
            </strong>
          </div>
          <div>
            <span class="amount">{{ $formatMoney(payout.amount) }}</span>
            <template v-if="payout.fee">⋅ 手续费 {{ $formatMoney(payout.fee) }}</template>
          </div>
          <div class="payout-status">
            <span>
              <Badge v-if="payout.status === 'success'" color="green" type="成功"/>
              <Badge v-else-if="payout.status === 'cancelling'" color="yellow" type="取消中"/>
              <Badge v-else-if="payout.status === 'cancelled'" color="red" type="已取消"/>
              <Badge v-else-if="payout.status === 'failed'" color="red" type="失败"/>
              <Badge v-else-if="payout.status === 'in-transit'" color="yellow" type="提现中"/>
              <Badge v-else :type="payout.status"/>
            </span>
            <template v-if="payout.method">
              <span>⋅</span>
              <span>{{ formatWallet(payout.method) }} ({{ payout.method_address }})</span>
            </template>
          </div>
        </div>
        <div class="input-group">
          <button
            v-if="payout.status === 'in-transit'"
            class="iconified-button raised-button"
            @click="cancelPayout(payout.id)"
          >
            <XIcon/>
            取消提现
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup>
import {PayPalIcon, UnknownIcon, XIcon} from "@modrinth/assets";
import {Badge, Breadcrumbs, DropdownSelect} from "@modrinth/ui";
import dayjs from "dayjs";
import TremendousIcon from "~/assets/images/external/tremendous.svg?component";
import VenmoIcon from "~/assets/images/external/venmo-small.svg?component";
import {formatWallet} from "@modrinth/utils";

const vintl = useVIntl();
const {formatMessage} = vintl;

useHead({
  title: "提现历史 - Modrinth",
});

const data = await useNuxtApp();
const auth = await useAuth();

const {data: payouts, refresh} = await useAsyncData(`payout`, () =>
  useBaseFetch(`payout`, {
    apiVersion: 3,
  }),
);

const sortedPayouts = computed(() =>
  payouts.value.sort((a, b) => dayjs(b.created) - dayjs(a.created)),
);

const years = computed(() => {
  const values = sortedPayouts.value.map((x) => dayjs(x.created).year());
  return ["all", ...new Set(values)];
});

const selectedYear = ref("all");

const methods = computed(() => {
  const values = sortedPayouts.value.filter((x) => x.method).map((x) => x.method);
  return ["all", ...new Set(values)];
});

const selectedMethod = ref("all");

const filteredPayouts = computed(() =>
  sortedPayouts.value
    .filter((x) => selectedYear.value === "all" || dayjs(x.created).year() === selectedYear.value)
    .filter((x) => selectedMethod.value === "all" || x.method === selectedMethod.value),
);

const totalAmount = computed(() =>
  filteredPayouts.value.reduce((sum, payout) => sum + payout.amount, 0),
);

async function cancelPayout(id) {
  startLoading();
  try {
    await useBaseFetch(`payout/${id}`, {
      method: "DELETE",
      apiVersion: 3,
    });
    await refresh();
    await useAuth(auth.value.token);
  } catch (err) {
    data.$notify({
      group: "main",
      title: "发生错误",
      text: err.data.description,
      type: "error",
    });
  }
  stopLoading();
}

const messages = defineMessages({
  transfersTotal: {
    id: "revenue.transfers.total",
    defaultMessage: "您累积提现了 {amount}。",
  },
  transfersTotalYear: {
    id: "revenue.transfers.total.year",
    defaultMessage: "您在 {year} 年中累积提现了 {amount}。",
  },
  transfersTotalMethod: {
    id: "revenue.transfers.total.method",
    defaultMessage: "您使用 {method} 累积提现了 {amount}。",
  },
  transfersTotalYearMethod: {
    id: "revenue.transfers.total.year_method",
    defaultMessage: "您在 {year} 年中使用 {method} 累积提现了 {amount}。",
  },
});
</script>
<style lang="scss" scoped>
.payout {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .platform {
    display: flex;
    padding: 0.75rem;
    background-color: var(--color-raised-bg);
    width: fit-content;
    height: fit-content;
    border-radius: 20rem;

    svg {
      width: 2rem;
      height: 2rem;
    }
  }

  .payout-status {
    display: flex;
    gap: 0.5ch;
  }

  .amount {
    color: var(--color-heading);
    font-weight: 500;
  }

  @media screen and (min-width: 800px) {
    flex-direction: row;
    align-items: center;

    .input-group {
      margin-left: auto;
    }
  }
}
</style>
