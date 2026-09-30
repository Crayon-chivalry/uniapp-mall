<template>
  <view>
    <up-navbar :title="title" placeholder :autoBack="true">
    </up-navbar>

    <view class="search" @click="onBack">
      <up-search placeholder="搜索关键词" :disabled="true" :showAction="false" bgColor="#F2F2F2"></up-search>
    </view>

    <!-- 商品列表 -->
    <ProductWaterfall v-model="productList" :loadmoreStatus="loadmoreStatus" />
  </view>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

import { shopApi } from "@/api/shopApi"
import type { ProductItem } from "@/api/types"
import { usePagedList } from "@/hooks/usePagedList";
import ProductWaterfall from "@/components/ProductWaterfall.vue"

const title = ref("商品")
const keyword = ref("")

const onBack = () => {
  uni.navigateBack()
}

// 获取商品
const { list: productList, loadmoreStatus, refresh } = usePagedList<ProductItem>(
  (page, pageSize) => shopApi.productList({
    page,
    pageSize,
    keyword: keyword.value
  })
)

onLoad((e) => {
  if (e?.keyword) {
    keyword.value = e.keyword
  }
  if (e?.title) {
    uni.setNavigationBarTitle({ title: e.title })
    title.value = e.title
  }
  void refresh()
})
</script>

<style lang="scss" scoped>
.search {
  padding: $space-3;
  background-color: #fff;
}
</style>