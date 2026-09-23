<template>
  <view>
    <up-navbar title="收货地址" placeholder :autoBack="true">
    </up-navbar>

    <view class="address">
      <view class="address-item" v-for="item in list" :key="item.id">
        <view class="header">
          <view>收货人：{{ item.receiverName }}</view>
          <view>{{ item.receiverPhone }}</view>
        </view>
        <view class="details">
          {{ item.province + item.city + item.district + item.detailAddress }}
        </view>
        <view class="footer">
          <up-checkbox label="默认地址" name="agree" usedAlone labelSize="24rpx" labelColor="#8B8D8C" activeColor="#DD261C"
            size="32rpx" v-model:checked="item.isDefault"></up-checkbox>
          <view class="btn-wrap">
            <view class="btn">
              <up-icon name="edit-pen"></up-icon>
              <text>编辑</text>
            </view>
            <view class="btn">
              <up-icon name="trash"></up-icon>
              <text>删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <empty v-if="list.length === 0" />
  </view>
</template>

<script lang="ts" setup>
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";

import { addressApi } from "@/api/addressApi";
import type { AddressItem } from "@/api/types";

const list = ref<AddressItem[]>([])

// 获取地址
const getAddressList = async () => {
  const { data } = await addressApi.list()
  list.value = data
}

onLoad(() => {
  getAddressList()
})
</script>

<style lang="scss" scoped>
.address {
  padding: $space-3 $space-3 64px;
  @include flex-column($space-3);

  .address-item {
    padding: $space-3;
    border-radius: $radius-2;
    background-color: #fff;
    border: 1px solid transparent;

    &-selected {
      border-color: $color-primary;
      background-color: rgba($color-primary, 0.06);
      box-shadow: 0 0 0 1px rgba($color-primary, 0.12);
    }

    .header {
      @include flex-between;
    }

    .details {
      margin-top: $space-3;
      color: $color-text-secondary;
      font-size: 13px;
    }

    .footer {
      margin-top: $space-3;
      padding-top: $space-3;
      @include flex-between;
      border-top: 1px solid $color-border;

      :deep(.u-checkbox) {
        margin: 0;
      }
    }

    .btn-wrap {
      display: flex;
      gap: $space-6;

      .btn {
        display: flex;
        align-items: center;
        gap: $space-1;
      }
    }
  }
}
</style>