<template>
  <section class="universal-card">
    <Breadcrumbs
      current-title="Withdraw"
      :link-stack="[{ href: '/dashboard/revenue', label: 'Revenue' }]"
    />

    <h2>提现</h2>

    <h3>地区</h3>
    <Multiselect
      id="country-multiselect"
      v-model="country"
      class="country-multiselect"
      placeholder="请选择国家..."
      track-by="id"
      label="name"
      :options="countries"
      :searchable="true"
      :close-on-select="true"
      :show-labels="false"
      :allow-empty="false"
    />

    <h3>提现方式</h3>

    <div class="iconified-input">
      <label class="hidden" for="search">搜索</label>
      <SearchIcon aria-hidden="true"/>
      <input
        id="search"
        v-model="search"
        name="search"
        placeholder="搜索方式..."
        autocomplete="off"
      />
    </div>
    <div class="withdraw-options-scroll">
      <div class="withdraw-options">
        <button
          v-for="method in payoutMethods
            .filter((x) => x.name.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) =>
              a.type !== 'tremendous'
                ? -1
                : a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
            )"
          :key="method.id"
          class="withdraw-option button-base"
          :class="{ selected: selectedMethodId === method.id }"
          @click="() => (selectedMethodId = method.id)"
        >
          <div class="preview" :class="{ 'show-bg': !method.image_url || method.name === 'ACH' }">
            <template v-if="method.image_url && method.name !== 'ACH'">
              <div class="preview-badges">
                <span class="badge">
                  {{
                    getRangeOfMethod(method)
                      .map($formatMoney)
                      .map((i) => i.replace(".00", ""))
                      .join("–")
                  }}
                </span>
              </div>
              <img
                v-if="method.image_url && method.name !== 'ACH'"
                class="preview-img"
                :src="method.image_url"
                :alt="method.name"
              />
            </template>
            <div v-else class="placeholder">
              <template v-if="method.type === 'venmo'">
                <VenmoIcon class="enlarge"/>
              </template>
              <template v-else>
                <PayPalIcon v-if="method.type === 'paypal'"/>
                <span>{{ method.name }}</span>
              </template>
            </div>
          </div>
          <div class="label">
            <RadioButtonChecked v-if="selectedMethodId === method.id" class="radio"/>
            <RadioButtonIcon v-else class="radio"/>
            <span>{{ method.name }}</span>
          </div>
        </button>
      </div>
    </div>

    <h3>金额</h3>
    <p>
      您将提现您从 Modrinth 的 “创作者激励计划” 中获得的收益。您希望将
      <strong>{{ $formatMoney(userBalance.available) }}</strong>
      收益中的多少转入
      {{ selectedMethod.name }}？
    </p>
    <div class="confirmation-input">
      <template v-if="selectedMethod.interval.fixed">
        <Chips
          v-model="amount"
          :items="selectedMethod.interval.fixed.values"
          :format-label="(val) => '$' + val"
        />
      </template>
      <template v-else-if="minWithdrawAmount == maxWithdrawAmount">
        <div>
          <p>
            此方法单次提现金额固定为
            <strong>{{ $formatMoney(minWithdrawAmount) }}</strong>。
          </p>
        </div>
      </template>
      <template v-else>
        <div>
          <p>
            此方法至少提现
            <strong>{{ $formatMoney(minWithdrawAmount) }}</strong>，且最多提现
            <strong>{{ $formatMoney(maxWithdrawAmount) }}</strong>。
          </p>
          <input
            id="confirmation"
            v-model="amount"
            type="text"
            pattern="^\d*(\.\d{0,2})?$"
            autocomplete="off"
            placeholder="请输入提现金额..."
          />
          <p>
            您将提现 <strong>{{ $formatMoney(parsedAmount) }}</strong>。
          </p>
        </div>
      </template>
    </div>

    <div class="confirm-text">
      <template v-if="knownErrors.length === 0 && amount">
        <Checkbox v-if="fees > 0" v-model="agreedFees" description="同意收取手续费">
          我明白我收到的金额中将扣除约 {{ $formatMoney(fees) }} 作为 {{ $formatWallet(selectedMethod.type) }} 手续费。
        </Checkbox>
        <Checkbox v-model="agreedTransfer" description="Confirm transfer">
          <template v-if="selectedMethod.type === 'tremendous'">
            我确认我正在发起转账，我将收到一封包含如何完成提现说明的电子邮件，邮箱地址为：{{ withdrawAccount }}
          </template>
          <template v-else>
            我确认我正在发起转账至 {{ $formatWallet(selectedMethod.type) }} 账户：{{ withdrawAccount }}
          </template>
        </Checkbox>
        <Checkbox v-model="agreedTerms" class="rewards-checkbox">
          我同意
          <nuxt-link to="/legal/cmp" class="text-link">创作者激励条款</nuxt-link>
        </Checkbox>
      </template>
      <template v-else>
        <span v-for="(error, index) in knownErrors" :key="index" class="invalid">
          {{ error }}
        </span>
      </template>
    </div>
    <div class="button-group">
      <nuxt-link to="/dashboard/revenue" class="iconified-button">
        <XIcon/>
        取消
      </nuxt-link>
      <button
        :disabled="
          knownErrors.length > 0 ||
          !amount ||
          !agreedTransfer ||
          !agreedTerms ||
          (fees > 0 && !agreedFees)
        "
        class="iconified-button brand-button"
        @click="withdraw"
      >
        <TransferIcon/>
        提现
      </button>
    </div>
  </section>
</template>

<script setup>
import {Multiselect} from "vue-multiselect";
import {
  PayPalIcon,
  RadioButtonChecked,
  RadioButtonIcon,
  SearchIcon,
  TransferIcon,
  XIcon,
} from "@modrinth/assets";
import {Breadcrumbs, Checkbox, Chips} from "@modrinth/ui";
import {all} from "iso-3166-1";
import VenmoIcon from "~/assets/images/external/venmo.svg?component";
import {useCountryNames} from "~/utils/analytics.js";

const auth = await useAuth();
const data = useNuxtApp();

const countries = computed(() =>
  all().map((x) => ({
    id: x.alpha2,
    name: useCountryNames()(x.alpha2),
  })),
);
const search = ref("");

const amount = ref("");
const country = ref(
  countries.value.find((x) => x.id === (auth.value.user.payout_data.paypal_region ?? "CN")),
);

const [{data: userBalance}, {data: payoutMethods, refresh: refreshPayoutMethods}] =
  await Promise.all([
    useAsyncData(`payout/balance`, () => useBaseFetch(`payout/balance`, {apiVersion: 3})),
    useAsyncData(`payout/methods?country=${country.value.id}`, () =>
      useBaseFetch(`payout/methods?country=${country.value.id}`, {apiVersion: 3}),
    ),
  ]);

const selectedMethodId = ref(payoutMethods.value[0].id);
const selectedMethod = computed(() =>
  payoutMethods.value.find((x) => x.id === selectedMethodId.value),
);

const parsedAmount = computed(() => {
  const regex = /^\$?(\d*(\.\d{2})?)$/gm;
  const matches = regex.exec(amount.value);
  return matches && matches[1] ? parseFloat(matches[1]) : 0.0;
});
const fees = computed(() => {
  return Math.min(
    Math.max(
      selectedMethod.value.fee.min,
      selectedMethod.value.fee.percentage * parsedAmount.value,
    ),
    selectedMethod.value.fee.max ?? Number.MAX_VALUE,
  );
});

const getIntervalRange = (intervalType) => {
  if (!intervalType) {
    return [];
  }

  const {min, max, values} = intervalType;
  if (values) {
    const first = values[0];
    const last = values.slice(-1)[0];
    return first === last ? [first] : [first, last];
  }

  return min === max ? [min] : [min, max];
};

const getRangeOfMethod = (method) => {
  return getIntervalRange(method.interval?.fixed || method.interval?.standard);
};

const maxWithdrawAmount = computed(() => {
  const interval = selectedMethod.value.interval;
  return interval?.standard ? interval.standard.max : interval?.fixed?.values.slice(-1)[0] ?? 0;
});

const minWithdrawAmount = computed(() => {
  const interval = selectedMethod.value.interval;
  return interval?.standard ? interval.standard.min : interval?.fixed?.values?.[0] ?? fees.value;
});

const withdrawAccount = computed(() => {
  if (selectedMethod.value.type === "paypal") {
    return auth.value.user.payout_data.paypal_address;
  } else if (selectedMethod.value.type === "venmo") {
    return auth.value.user.payout_data.venmo_handle;
  } else {
    return auth.value.user.email;
  }
});
const knownErrors = computed(() => {
  const errors = [];
  if (selectedMethod.value.type === "paypal" && !auth.value.user.payout_data.paypal_address) {
    errors.push("请在仪表盘中绑定 PayPal 账户以继续。");
  }
  if (selectedMethod.value.type === "venmo" && !auth.value.user.payout_data.venmo_handle) {
    errors.push("请在仪表盘中绑定 Venmo 账户以继续。");
  }
  if (selectedMethod.value.type === "tremendous") {
    if (!auth.value.user.email) {
      errors.push("请在账户设置中设置邮箱地址以继续。");
    }
    if (!auth.value.user.email_verified) {
      errors.push("请验证您的邮箱地址以继续。");
    }
  }

  if (!parsedAmount.value && amount.value.length > 0) {
    errors.push(`${amount.value} 不是一个有效的金额。`);
  } else if (
    parsedAmount.value > userBalance.value.available ||
    parsedAmount.value > maxWithdrawAmount.value
  ) {
    const maxAmount = Math.min(userBalance.value.available, maxWithdrawAmount.value);
    errors.push(`金额不能大于 ${data.$formatMoney(maxAmount)}`);
  } else if (parsedAmount.value <= fees.value || parsedAmount.value < minWithdrawAmount.value) {
    const minAmount = Math.max(fees.value + 0.01, minWithdrawAmount.value);
    errors.push(`金额不能小于 ${data.$formatMoney(minAmount)}`);
  }

  return errors;
});

const agreedTransfer = ref(false);
const agreedFees = ref(false);
const agreedTerms = ref(false);

watch(country, async () => {
  await refreshPayoutMethods();
  if (payoutMethods.value && payoutMethods.value[0]) {
    selectedMethodId.value = payoutMethods.value[0].id;
  }
});

watch(selectedMethod, () => {
  if (selectedMethod.value.interval?.fixed) {
    amount.value = selectedMethod.value.interval.fixed.values[0];
  }
  if (maxWithdrawAmount.value === minWithdrawAmount.value) {
    amount.value = maxWithdrawAmount.value;
  }
  agreedTransfer.value = false;
  agreedFees.value = false;
  agreedTerms.value = false;
});

async function withdraw() {
  startLoading();
  try {
    const auth = await useAuth();

    await useBaseFetch(`payout`, {
      method: "POST",
      body: {
        amount: parsedAmount.value,
        method: selectedMethod.value.type,
        method_id: selectedMethod.value.id,
      },
      apiVersion: 3,
    });
    await useAuth(auth.value.token);
    await navigateTo("/dashboard/revenue");
    data.$notify({
      group: "main",
      title: "提现成功",
      text:
        selectedMethod.value.type === "tremendous"
          ? "一封包含如何完成提现说明的电子邮件已发送至您邮箱！"
          : `收益已转入您的 ${data.$formatWallet(selectedMethod.value.type)} 账户！`,
      type: "success",
    });
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
</script>

<style lang="scss" scoped>
.withdraw-options-scroll {
  max-height: 460px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: var(--gap-md);
    border: 3px solid var(--color-bg);
  }

  &::-webkit-scrollbar-track {
    background: var(--color-bg);
    border: 3px solid var(--color-bg);
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--color-raised-bg);
    border-radius: var(--radius-lg);
    border: 3px solid var(--color-bg);
  }
}

.withdraw-options {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--gap-lg);
  padding-right: 0.5rem;

  @media screen and (min-width: 300px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (min-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.withdraw-option {
  width: 100%;
  border-radius: var(--radius-md);
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--color-divider);
  background-color: var(--color-button-bg);
  color: var(--color-text);

  &.selected {
    color: var(--color-contrast);

    .label svg {
      color: var(--color-brand);
    }
  }

  .preview {
    display: flex;
    justify-content: center;
    aspect-ratio: 30 / 19;
    position: relative;

    .preview-badges {
      // These will float over the image in the bottom right corner
      position: absolute;
      bottom: 0;
      right: 0;
      padding: var(--gap-sm) var(--gap-xs);

      .badge {
        background-color: var(--color-button-bg);
        border-radius: var(--radius-xs);
        padding: var(--gap-xs) var(--gap-sm);
        font-size: var(--font-size-xs);
      }
    }

    &.show-bg {
      background-color: var(--color-bg);
    }

    img {
      -webkit-user-drag: none;
      -khtml-user-drag: none;
      -moz-user-drag: none;
      -o-user-drag: none;
      user-drag: none;
      user-select: none;
      width: 100%;
      height: auto;
      object-fit: cover;
    }

    .placeholder {
      display: flex;
      align-items: center;
      gap: var(--gap-xs);

      svg {
        width: 2rem;
        height: auto;
      }

      span {
        font-weight: var(--font-weight-bold);
        font-size: 2rem;
        font-style: italic;
      }

      .enlarge {
        width: auto;
        height: 1.5rem;
      }
    }
  }

  .label {
    display: flex;
    align-items: center;
    padding: var(--gap-md) var(--gap-lg);

    svg {
      min-height: 1rem;
      min-width: 1rem;
      margin-right: 0.5rem;
    }

    span {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
}

.invalid {
  color: var(--color-red);
}

.confirm-text {
  margin: var(--spacing-card-md) 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-card-sm);
}

.iconified-input {
  margin-bottom: var(--spacing-card-md);
}

.country-multiselect,
.iconified-input {
  max-width: 16rem;
}

.rewards-checkbox {
  a {
    margin-left: 0.5ch;
  }
}
</style>
