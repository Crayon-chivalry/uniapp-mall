<template>
  <view>
    <up-navbar title="我的订单" placeholder :autoBack="true">
    </up-navbar>

    <!-- 标签栏 -->
    <view class="tabs">
      <up-tabs :list="statusList" @click="onChange"></up-tabs>
    </view>

    <!-- 列表 -->
    <view class="order-list">
      <view class="order-item" v-for="item in orderList" :key="item.id"
        @click="navigateByLink('./detail?id=' + item.id)">
        <view class="order-header">
          <view class="order-no">订单号：{{ item.orderNo }}</view>
          <view class="order-status">
            {{ statusNames[item.status] }}
          </view>
        </view>
        <view class="order-goods">
          <view class="goods-item" v-for="p in item.items" :key="p.id">
            <view class="goods-content">
              <view class="goods-cover">
                <img :src="p.productCover" />
              </view>
              <view>
                <view class="goods-name">
                  {{ p.productName }}
                </view>
                <view class="goods-label">
                  {{ formatSpecsLabel(p.skuSpecs) }}
                </view>
              </view>
            </view>
            <view class="goods-right">
              <view>￥{{ p.price }}</view>
              <view class="goods-label">x{{ p.quantity }}</view>
            </view>
          </view>
        </view>
        <view class="order-footer">
          <view class="order-total">
            共{{ item.items.length }}件商品 合计：<strong>¥{{ item.totalAmount }}</strong>
          </view>
          <view class="btn-wrap" v-if="item.status === 'pending'">
            <view class="gray-button">
              取消订单
            </view>
            <view class="button" @click.stop="paymentClick(item)">
              去付款
            </view>
          </view>
          <view class="btn-wrap" v-if="item.status === 'shipped'">
            <view class="button">
              确认收货
            </view>
          </view>
          <view class="btn-wrap" v-if="item.status === 'cancelled'">
            <view class="button">
              删除订单
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <up-loadmore v-if="orderList.length" :status="loadmoreStatus" />
    </view>

    <PaymentPopup v-model="showPaymentPopup" :order="activeOrder" @success="paymentSuccess" />
  </view>
</template>

<script lang="ts" setup>
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";

import type { OrderItem, OrderStatus } from "@/api/types";
import { shopApi } from "@/api/shopApi";
import { usePagedList } from "@/hooks/usePagedList";
import { formatSpecsLabel, navigateByLink } from "@/utils/index"
import PaymentPopup from "./components/PaymentPopup.vue"

type OrderTabStatus = OrderStatus | "all";
type OrderTabItem = (typeof statusList)[number] & { index: number };

const statusList = [
  { name: "全部", value: "all" },
  { name: "待付款", value: "pending" },
  { name: "待发货", value: "paid" },
  { name: "待收货", value: "shipped" },
  { name: "已完成", value: "completed" },
  { name: "已取消", value: "cancelled" },
] satisfies { name: string; value: OrderTabStatus }[];
const activeStatus = ref<OrderTabStatus>("all")

const statusNames: Record<OrderStatus, string> = {
  pending: "待付款",
  paid: "待发货",
  shipped: "待收货",
  completed: "已完成",
  cancelled: "已取消",
};

const showPaymentPopup = ref(false)
const activeOrder = ref<OrderItem | null>(null)

// 列表数据 + 加载更多/刷新（触底加载已由 hook 内部注册）
const { list: orderList, loadmoreStatus, refresh, updateItem } = usePagedList<OrderItem>(
  (page, pageSize) => shopApi.orderList({
    page,
    pageSize,
    status: activeStatus.value === "all" ? undefined : activeStatus.value
  })
)

// tabs 切换：重置回第一页
const onChange = (item: OrderTabItem) => {
  if (item.value === activeStatus.value) return
  activeStatus.value = item.value
  refresh()
}

// 付款成功后无感更新列表，不 refresh（避免列表重置闪动）
const paymentSuccess = (newOrder?: OrderItem) => {
  if (!newOrder) return
  updateItem(
    newOrder.id,
    (item) => item.id,
    () => (activeStatus.value === "pending" ? null : newOrder)
  )
}

// 取消订单
const cancelOrder = () => {

}

// 付款
const paymentClick = (item: OrderItem) => {
  activeOrder.value = item
  showPaymentPopup.value = true
}

// 确认收货
const confirmTake = () => {

}

// 删除订单
const deleteOrder = () => {

}

onLoad(() => {
  refresh()
})
</script>

<style lang="scss" scoped>
.tabs {
  position: sticky;
  top: 44px;
  background-color: #fff;
}

.order-list {
  padding: $space-3;
  @include flex-column($space-3);
}

.order-item {
  padding: $space-3;
  border-radius: $radius-2;
  background-color: #fff;

  .order-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: $space-3;
    border-bottom: 1px solid $color-border;

    .order-status {
      color: $color-primary;
    }
  }
}

.order-goods {
  padding: $space-4 0 $space-2;
  @include flex-column($space-1);

  .goods-item {
    display: flex;
    gap: $space-3;

    .goods-content {
      display: flex;
      flex: 1;
      min-width: 0;
      gap: $space-3;
    }

    .goods-cover {
      display: block;
      flex: 0 0 60px;
      width: 60px;
      height: 60px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .goods-content>div:not(.goods-cover) {
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
}

.order-footer {
  .order-total {
    text-align: right;

    strong {
      font-size: 16px;
    }
  }

  .btn-wrap {
    display: flex;
    justify-content: flex-end;
    gap: $space-3;
    margin-top: $space-3;

    .button {
      padding: $space-2 $space-3;
      background-color: $color-primary;
      color: #fff;
      border-radius: $radius-2;
    }

    .gray-button {
      @extend .button;
      background-color: #ebedf2;
      color: $color-text-secondary;
    }
  }
}
</style>