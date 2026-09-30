<template>
  <view class="page">
    <up-navbar title="搜索" placeholder :autoBack="true">
    </up-navbar>

    <view class="search">
      <up-search placeholder="搜索关键词" :showAction="false" bgColor="#F2F2F2" @search="onSearch"></up-search>
    </view>

    <div class="record">
      <div class="record-header">
        <div>最近搜索</div>
        <div class="record-header-right" v-if="isDelete">
          <div @click="onClear">全部删除</div>
          <div>|</div>
          <div @click="isDelete = false">完成</div>
        </div>
        <up-icon name="trash" @click="isDelete = true" v-else></up-icon>
      </div>

      <div class="record-list">
        <div class="record-item" v-for="(item, index) in searchList" :key="index" @click="handClick(item)">
          <span>{{ item }}</span>
          <up-icon name="close" size="14" v-if="isDelete"></up-icon>
        </div>
      </div>
    </div>
  </view>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const isDelete = ref(false)
const searchList = ref<string[]>(JSON.parse(localStorage.getItem("searchList") || "[]"))

// 搜索
const onSearch = (value: string) => {
  const has = searchList.value.find((item) => item === value);
  if (has) {
    searchList.value = [value, ...searchList.value.filter((item) => item !== value)]
  } else {
    searchList.value = [value, ...searchList.value]
  }
  uni.navigateTo({url: `/pages/product/index?keyword=${value}&title=搜索`})
}

// 全部清空
const onClear = () => {
  searchList.value = []
  isDelete.value = false
}

// 删除单个
const onDeleteItem = (value: string) => {
  searchList.value = searchList.value.filter((item) => item !== value)
}

// 点击搜索记录
const handClick = (value: string) => {
  if (isDelete.value) {
    onDeleteItem(value)
  } else {
    onSearch(value)
  }
}

watch(searchList, (newVal) => {
  localStorage.setItem("searchList", JSON.stringify(newVal));
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #fff;
}

.search {
  padding: $space-2;
  background-color: #fff;
}

.record {
  padding: $space-3;
}

.record-header {
  @include flex-between;

  .record-header-right {
    display: flex;
    gap: $space-2;
    color: $color-text-secondary;
  }
}

.record-list {
  margin-top: $space-3;
  display: flex;
  flex-wrap: wrap;
  gap: $space-3;

  .record-item {
    padding: $space-2;
    display: flex;
    align-items: center;
    gap: $space-2;
    font-size: 12px;
    border-radius: $radius-2;
    background-color: #f5f5f5;
  }
}
</style>