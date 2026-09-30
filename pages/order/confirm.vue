<template>
  <view class="page">
    <up-navbar title="确认订单" placeholder :autoBack="true">
    </up-navbar>

    <!-- 收货地址 -->
    <view class="address" @click="handleSelectAddress">
      <view v-if="address">
        <view class="address-detail">
          <up-tag text="默认" plain size="mini" type="primary"></up-tag>
          <span>{{ address.detailAddress }}</span>
        </view>
        <view class="address-label">
          {{ address.receiverName }} {{ address.receiverPhone }}
        </view>
      </view>
      <view v-else>请添加收货地址</view>
      <up-icon name="arrow-right"></up-icon>
    </view>

    <!-- 商品 -->
    <view class="goods">
      <view class="goods-item" v-for="item in checkoutItems" :key="item.sku.id">
        <view class="goods-cover">
          <img :src="item.sku.cover || item.product.cover" />
        </view>
        <view class="goods-content">
          <view>
            <view class="goods-name">{{ item.product.name }}</view>
            <view class="goods-label">
              {{ formatSpecsLabel(item.sku.specs) }}
            </view>
          </view>
          <view class="goods-cell">
            <view class="goods-price">￥{{ item.sku.price }}</view>
            <view class="goods-quantity">x{{ item.quantity }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 其他信息 -->
    <view class="cells">
      <view class="cell">
        <view>配送方式</view>
        <view>普通快递</view>
      </view>
      <view class="cell">
        <view>优惠券</view>
        <view>无</view>
      </view>
      <view>
        <view>买家留言</view>
        <view class="input-wrap">
          <up-input placeholder="给商家留言（选填）" border="none" v-model="remark"></up-input>
        </view>
      </view>
    </view>

    <!-- 相关金额 -->
    <view class="cells">
      <view class="cell">
        <view>商品金额</view>
        <view>￥{totalAmount}</view>
      </view>
      <view class="cell">
        <view>运费</view>
        <view>￥0</view>
      </view>
      <view class="cell">
        <view>优惠</view>
        <view>-￥0</view>
      </view>
      <view class="cell-footer">
        <view>
          小计：<text class="amount">￥{{ totalAmount }}</text>
        </view>
      </view>
    </view>

    <view class="placeholder"></view>
    <view class="submit-bar">
      <view class="btn" @click="submitOrder">
        立即支付 ￥{{ totalAmount }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import type { AddressItem } from "@/api/types"
import { useCartStore } from '@/store/modules/cartStore';
import { formatSpecsLabel } from '@/utils';

const { checkoutItems } = useCartStore()

const address = ref<AddressItem | null>(null)
const remark = ref("")

const totalAmount = checkoutItems.value.reduce(
  (total, item) => total + Number(item.sku.price) * item.quantity,
  0,
);

const handleSelectAddress = () => {

}

const submitOrder = () => {

}
</script>

<style lang="scss" scoped>
.page {
  @include flex-column($space-2);
}

.address {
  position: relative;
  @include flex-between;
  gap: $space-2;
  padding: $space-4 $space-3;
  background-color: #fff;

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

.goods {
  margin-top: $space-2;
  padding: $space-3;
  @include flex-column($space-4);
  background-color: #fff;

  .goods-item {
    display: flex;
    gap: $space-3;
    background-color: #fff;
  }

  .goods-cover {
    width: 64px;
    height: 64px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .goods-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .goods-name {
      @include text-hidden(2);
    }

    .goods-label {
      margin-top: $space-2;
      color: $color-text-secondary;
      font-size: 12px;
    }

    .goods-cell {
      @include flex-between;
    }

    .goods-price {
      color: #e02020;
    }

    .goods-quantity {
      color: $color-text-secondary;
      font-size: 12px;
    }
  }
}

.cells {
  margin-top: $space-2;
  padding: $space-4 $space-3;
  @include flex-column($space-4);
  background-color: #fff;
  font-size: 13px;

  .cell {
    @include flex-between;
    gap: $space-4;
  }

  .input-wrap {
    margin-top: $space-2;
    padding: $space-2;
    border-radius: $radius-2;
    background-color: #F6F3F2;
  }

  .cell-footer {
    padding-top: $space-4;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid $color-border;
    font-size: 16px;

    .amount {
      color: $color-primary;
    }
  }
}

.placeholder {
  margin-top: $space-2;
  height: 60px;
}

.submit-bar {
  padding: $space-2;
  position: fixed;
  inset: auto 0 0 0;
  background-color: #fff;
  border-top: 1px solid $color-border;
  height: 60px;
  box-sizing: border-box;

  .btn {
    height: 100%;
    @include flex-center;
    background-color: $color-primary;
    color: #fff;
    font-size: 16px;
  }
}
</style>