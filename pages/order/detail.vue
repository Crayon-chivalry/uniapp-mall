<template>
  <view>
    <up-navbar title="订单详情" placeholder :autoBack="true">
    </up-navbar>

    <view class="order-detail" v-if="order">
      <!-- 地址 -->
      <view class="address">
        <u-icon name="map"></u-icon>
        <view>
          <view class="address-detail">
            <text>
              {{ order.province +
                order.city +
                order.district +
                order.detailAddress }}
            </text>
          </view>
          <view class="address-label">
            {{ order.receiverName }} {{ order.receiverPhone }}
          </view>
        </view>
      </view>

      <!-- 商品 -->
      <view class="order-goods">
        <view class="goods-item" v-for="item in order.items" :key="item.id">
          <view class="goods-content">
            <view class="view" @click="navigateByLink('/pages/product/detail?id=' + item.id)">
              <image :src="item.productCover" />
            </view>
            <view>
              <view class="goods-name">
                {{ item.productName }}
              </view>
              <view class="goods-label">
                {{ formatSpecsLabel(item.skuSpecs) }}
              </view>
            </view>
          </view>
          <view class="goods-right">
            <view>￥{{ item.price }}</view>
            <view class="goods-label">x{{ item.quantity }}</view>
          </view>
        </view>
        <view class="order-total">
          共{{ order.items.length }}件商品 合计：<strong>¥{{ order.totalAmount }}</strong>
        </view>
      </view>

      <view class="order-info">
        <view class="info-item">
          <text>订单号</text>
          <text>{{ order.orderNo }}</text>
        </view>
        <view class="info-item">
          <text>支付方式</text>
          <text>{{ paymentMethods[order.paymentType] || "-" }}</text>
        </view>
        <view class="info-item">
          <text>支付时间</text>
          <text>{{ formatLocalTime(order.createdAt) }}</text>
        </view>
        <view class="info-item">
          <text>下单时间</text>
          <text>{{ formatLocalTime(order.paidAt) }}</text>
        </view>
        <view class="info-item">
          <text>配送方式</text>
          <text>-</text>
        </view>
        <view class="info-item">
          <text>留言</text>
          <text>{{ order.remark || "-" }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

import { shopApi } from "@/api/shopApi";
import type { OrderItem } from "@/api/types";
import { formatSpecsLabel, navigateByLink, formatLocalTime } from "@/utils/index"

const paymentMethods: Record<string, string> = {
  alipay: "支付宝",
  wechat: "微信支付",
};

const orderId = ref("")
const order = ref<OrderItem | null>(null)

// 获取订单
const getDetail = async () => {
  const { data } = await shopApi.orderDetail(Number(orderId.value))
  order.value = data
}

onLoad((e) => {
  if (e?.id) {
    orderId.value = e.id
  }
  getDetail()
})
</script>

<style lang="scss" scoped>
.order-detail {
  @include flex-column($space-2);
  padding-bottom: 46px; // 底部操作栏高度
}

.address {
  position: relative;
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-4 $space-3;
  background-color: #fff;

  .address-icon {
    font-size: 18px;
  }

  .address-detail {
    display: flex;
    align-items: center;
    gap: $space-1;
  }

  .address-label {
    margin-top: $space-2;
    color: $color-text-secondary;
    font-size: 12px;
  }

  ::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: repeating-linear-gradient(-45deg,
        #ff976a 0,
        #ff976a 20%,
        transparent 0,
        transparent 25%,
        #1989fa 0,
        #1989fa 45%,
        transparent 0,
        transparent 50%);
    background-size: 80px;
  }
}

.order-goods {
  padding: $space-3;
  @include flex-column($space-1);
  background-color: #fff;

  .goods-item {
    display: flex;
    gap: $space-3;

    .goods-content {
      display: flex;
      flex: 1;
      min-width: 0;
      gap: $space-3;
    }

    .view {
      display: block;
      flex: 0 0 60px;
      width: 60px;
      height: 60px;

      image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .goods-content>view:not(.view) {
      flex: 1;
      min-width: 0;
    }

    .goods-name {
      @include text-hidden(2);
    }

    .goods-label {
      margin-top: $space-2;
      color: $color-text-secondary;
      font-size: 12px;
    }

    .goods-right {
      flex: 0 0 auto;
      text-align: right;
    }
  }

  .order-total {
    text-align: right;

    strong {
      font-size: 16px;
      color: $color-primary;
    }
  }
}

.order-info {
  padding: $space-3;
  @include flex-column($space-4);
  background-color: #fff;

  .info-item {
    display: flex;
    justify-content: space-between;

    text:first-child {
      color: $color-text-secondary;
    }
  }
}

.action-bar {
  padding: 0 $space-3;
  height: 46px;
  position: fixed;
  inset: auto 0 0;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: $space-3;
  border-top: 1px solid $color-border;
  font-size: 14px;
  box-sizing: border-box;

  .button {
    padding: $space-2 $space-3;
    background-color: $color-primary;
    color: #fff;
    border-radius: $radius-2;
  }

  .gray-button {
    @extend .button;
    background-color: #EBEDF2;
    color: $color-text-secondary;
  }
}
</style>