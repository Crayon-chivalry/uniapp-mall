<template>
  <up-popup :show="show" mode="right" zIndex="998">
    <view class="popup">
      <up-navbar title="收银台" placeholder @left-click="show = false">
      </up-navbar>

      <view class="total">
        <view>实付金额</view>
        <view>￥<text class="amount">{{ order?.totalAmount }}</text></view>
      </view>

      <view class="types">
        <view class="types-title">选中支付方式</view>
        <up-radio-group placement="column" v-model="type" active-color="#DD261C">
          <view class="type-item" v-for="item in paymentTypes" :key="item.type" @click="type = item.type">
            <view class="type-left">
              <image :src="item.icon" class="type-icon" mode="widthFix" />
              <view>{{ item.name }}</view>
            </view>
            <up-radio :name="item.type"></up-radio>
          </view>
        </up-radio-group>
      </view>

      <div class="btn" @click="confirmPayment">支付￥{{ order?.totalAmount }}</div>
    </view>
  </up-popup>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import type { OrderItem } from "@/api/types"
import { shopApi } from '@/api/shopApi';

interface PaymentTypeInterface {
  name: string
  type: string
  icon: string
}

const porps = defineProps<{
  order?: OrderItem | null
}>()

const emit = defineEmits(["success"])

const show = defineModel<boolean>()

const paymentTypes: PaymentTypeInterface[] = [
  { name: "支付宝", type: "alipay", icon: "/static/images/alipay.png" },
  { name: "微信支付", type: "wechat", icon: "/static/images/wechat.png" }
]
const type = ref("alipay")

// 付款
const confirmPayment = async () => {
  if (!porps.order) {
    uni.showToast({
      title: "订单不存在",
      icon: "error"
    })
    return
  }
  const res = await shopApi.orderPayment(porps.order?.id, type.value)
  uni.showToast({
    title: res.message
  })
  setTimeout(() => {
    show.value = false
    emit("success", res.data)
  }, 1000)
}
</script>

<style lang="scss" scoped>
.popup {
  width: 100vw;
  background-color: #fff;
}

.total {
  padding: $space-6 0;
  text-align: center;
  @include flex-column($space-2);

  .amount {
    font-size: 34px;
    font-weight: 600;
  }
}

.types {
  padding: 0 $space-4;

  .types-title {
    margin-bottom: $space-3;
    font-weight: 600;
  }

  .type-item {
    padding: $space-3 0;
    @include flex-between;

    .type-left {
      display: flex;
      align-items: center;
      gap: $space-2;
    }

    .type-icon {
      width: 30px;
    }
  }
}

.btn {
  position: fixed;
  height: 40px;
  @include flex-center;
  background-color: $color-primary;
  inset: auto $space-3 $space-3;
  color: #fff;
  font-size: 16px;
}
</style>