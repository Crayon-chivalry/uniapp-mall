<template>
  <view class="page">
    <up-navbar :title="title" placeholder :autoBack="true">
    </up-navbar>

    <up-form labelPosition="left" :model="formData" :rules="rules" ref="formRef" class="form" errorType="toast"
      labelWidth="140rpx">
      <up-form-item prop="receiverName" label="收货人">
        <up-input v-model="formData.receiverName" border="surround" placeholder="请输入收货人姓名"></up-input>
      </up-form-item>
      <up-form-item prop="receiverPhone" label="手机号">
        <up-input v-model="formData.receiverPhone" type="number" border="surround" placeholder="请输入手机号"></up-input>
      </up-form-item>
      <up-form-item prop="district" label="地区">
        <view class="region-input" @click="showRegionPicker = true">
          <text v-if="regionText" class="region-input__value">{{ regionText }}</text>
          <text v-else class="region-input__placeholder">请选择地区</text>
          <up-icon name="arrow-right" color="#909399"></up-icon>
        </view>
      </up-form-item>
      <up-form-item prop="detailAddress" label="详细地址">
        <up-textarea v-model="formData.detailAddress" placeholder="请输入详细地址"></up-textarea>
      </up-form-item>
      <up-form-item prop="receiverPhone" label="默认地址">
        <up-switch v-model="formData.isDefault" activeColor="#DD261C"></up-switch>
      </up-form-item>
    </up-form>

    <up-button type="primary" text="确认" @click="submit"></up-button>

    <!-- 选择地区 -->
    <up-picker ref="regionPickerRef" v-model:show="showRegionPicker" :columns="regionColumns" keyName="label"
      title="所在地区" @change="onRegionChange" @confirm="onRegionConfirm"></up-picker>
  </view>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { computed, nextTick, ref } from 'vue';

import type { AddressItem } from "@/api/types"
import { addressApi } from '@/api/addressApi';
import areas from '@/static/json/areas.json';

type FormRef = {
  validate: () => Promise<boolean>
}

const formRef = ref<FormRef | null>(null)

const rules = {
  'receiverName': {
    type: 'string',
    required: true,
    message: '请填写收货人',
    trigger: ['blur', 'change'],
  },
  'receiverPhone': {
    type: 'string',
    required: true,
    message: '请填写手机号',
    trigger: ['blur', 'change'],
  },
  'district': {
    type: 'string',
    required: true,
    message: '请选择地区',
    trigger: ['blur', 'change'],
  },
  'detailAddress': {
    type: 'string',
    required: true,
    message: '请填写详细地址',
    trigger: ['blur', 'change'],
  },
}
const formData = ref<AddressItem>({
  id: 0,
  receiverName: "",
  receiverPhone: "",
  province: "",
  city: "",
  district: "",
  detailAddress: "",
  postalCode: "",
  isDefault: false
})

const addressId = ref<string | null>(null)
const title = computed(() => addressId.value ? "编辑地址" : "添加地址")

// 省市区选择（up-picker 三列联动，areas.json 为 { value, label, children } 树）
const regionPickerRef = ref<any>(null)
const showRegionPicker = ref(false)
const regionText = ref("")
const regionCodes = ref<string[]>([])
const regionColumns = ref([
  areas.map((item: any) => ({ label: item.label, value: item.value })),
  areas[0]?.children ?? [],
  areas[0]?.children?.[0]?.children ?? []
])

// 滚动某列后，联动更新后面的列（setColumnValues 内部会把后续列索引重置为 0）
const onRegionChange = (e: any) => {
  const { columnIndex, indexs } = e
  if (columnIndex === 0) {
    const cities = areas[indexs[0]]?.children ?? []
    regionPickerRef.value?.setColumnValues(1, cities)
    regionPickerRef.value?.setColumnValues(2, cities[0]?.children ?? [])
  } else if (columnIndex === 1) {
    const districts = areas[indexs[0]]?.children?.[indexs[1]]?.children ?? []
    regionPickerRef.value?.setColumnValues(2, districts)
  }
}

// 确认后回写表单：province/city/district 存名称，codes 存区域码
const onRegionConfirm = (e: any) => {
  const { value } = e
  formData.value.province = value[0]?.label ?? ""
  formData.value.city = value[1]?.label ?? ""
  formData.value.district = value[2]?.label ?? ""
  regionCodes.value = [value[0]?.value, value[1]?.value, value[2]?.value]
  formData.value.postalCode = regionCodes.value[regionCodes.value.length - 1]
  regionText.value = [formData.value.province, formData.value.city, formData.value.district].filter(Boolean).join(" ")
}

// 在列表中按名称或区域码定位索引，找不到回退 0（容错后端数据不一致）
const findRegionIdx = (list: any[], val: string) => {
  if (!val) return 0
  const idx = list.findIndex((item: any) => item.label === val || String(item.value) === val)
  return idx >= 0 ? idx : 0
}

// 编辑模式回填：表单 + 区域码 + picker 三列定位到已存地区
const applyRegion = (province: string, city: string, district: string) => {
  const pIdx = findRegionIdx(areas, province)
  const cities = areas[pIdx]?.children ?? []
  const cIdx = findRegionIdx(cities, city)
  const districts = cities[cIdx]?.children ?? []
  const dIdx = findRegionIdx(districts, district)

  formData.value.province = province
  formData.value.city = city
  formData.value.district = district
  regionCodes.value = [areas[pIdx]?.value, cities[cIdx]?.value, districts[dIdx]?.value]
  regionText.value = [province, city, district].filter(Boolean).join(" ")

  regionColumns.value = [
    areas.map((item: any) => ({ label: item.label, value: item.value })),
    cities,
    districts
  ]
  // setLastIndex 必须传 true，否则下次滚动的联动判断会基于旧索引出错
  nextTick(() => {
    regionPickerRef.value?.setIndexs([pIdx, cIdx, dIdx], true)
  })
}

const getAddress = async () => {
  const { data } = await addressApi.details(Number(addressId.value))
  const {id, createdAt, updatedAt, ...newData } = data
  formData.value = { ...formData.value, ...newData } as typeof formData.value
  applyRegion(data.province, data.city, data.district)
}

// 提交
const submit = () => {
  formRef.value?.validate().then(async (valid: boolean) => {
    if (!valid) return
    const {id, createdAt, updatedAt, ...submit } = formData.value
    const res = addressId.value ? await addressApi.update(Number(addressId.value), submit) : await addressApi.add(submit)
    uni.showToast({
      title: res.message
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 300)
  }).catch(() => { })
}

onLoad((e) => {
  if (e?.id) {
    addressId.value = e.id
    getAddress()
  }
  uni.setNavigationBarTitle({
    title: title.value
  })
})
</script>

<style lang="scss" scoped>
.page {
  padding: $space-3;
}

.form {
  margin-bottom: $space-4;
  padding: $space-3;
  border-radius: $radius-3;
  background-color: #fff;
}

.region-input {
  flex: 1;
  min-height: 76rpx;
  padding: 0 24rpx;
  border: 1px solid #dcdfe6;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.region-input__value {
  color: #303133;
  font-size: 30rpx;
}

.region-input__placeholder {
  color: #909399;
  font-size: 30rpx;
}
</style>