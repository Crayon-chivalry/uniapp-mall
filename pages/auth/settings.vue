<template>
  <view>
    <up-navbar title="设置" placeholder :autoBack="true">
    </up-navbar>

    <view class="container">
      <view class="card">
        <view class="card-cell">
          <view>头像</view>
          <up-avatar :src="user?.avatar" :size="36" @click="chooseImage"></up-avatar>
        </view>
        <view class="card-cell">
          <view>昵称</view>
          <view class="items-center" @click="handlelShowDialog(1, user?.nickname)">
            <text class="card-label">{{ user?.nickname }}</text>
            <up-icon name="arrow-right"></up-icon>
          </view>
        </view>
        <view class="card-cell">
          <view>手机号</view>
          <view class="items-center" @click="handlelShowDialog(2, user?.phone)">
            <text class="card-label">{{ user?.phone }}</text>
            <up-icon name="arrow-right"></up-icon>
          </view>
        </view>
        <view class="card-cell">
          <view>修改密码</view>
          <up-icon name="arrow-right"></up-icon>
        </view>
      </view>

      <view class="card">
        <view class="card-cell">
          <view>关于我们</view>
          <up-icon name="arrow-right"></up-icon>
        </view>
        <view class="card-cell">
          <view>用户协议</view>
          <up-icon name="arrow-right"></up-icon>
        </view>
        <view class="card-cell">
          <view>隐私协议</view>
          <up-icon name="arrow-right"></up-icon>
        </view>
      </view>

      <up-button type="primary" text="退出登录" class="out-btn" @click="handleOut"></up-button>

      <!-- 修改昵称手机号对话框 -->
      <up-modal :show="show" :title="title" showCancelButton @cancel="show = false" @confirm="modalConfirm">
        <up-input placeholder="请输入内容" border="surround" v-model="updateValue"></up-input>
      </up-modal>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";

import { useUserStore } from "@/store/modules/userStore";
import { userApi } from "@/api/userApi";
import { uploadApi } from "@/api/uploadApi";
import type { UpdateProfileParams } from "@/api/types";

const { user, signOut, updateUser } = useUserStore()

const show = ref(false)
const updateType = ref(1)
const updateValue = ref("")
const title = computed(() => updateType.value === 1 ? "修改昵称" : "修改手机号")

// 显示修改对话框
const handlelShowDialog = (type: number, value: string) => {
  if(type === 2) {
    uni.showToast({
      title: "暂不支持修改手机号，请联系客服",
      icon: "none"
    })
    return
  }
  updateType.value = type
  updateValue.value = value
  show.value = true
}

// 对话框确认修改
const modalConfirm = () => {
  if(updateType.value === 1) updateProfile({ nickname: updateValue.value });
  if(updateType.value === 2) updateProfile({ phone: updateValue.value });
  show.value = false
}

// 选择图片上传头像
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album'], //从相册选择
    success: async (res) => {
      const { data } = await uploadApi.image(res.tempFilePaths[0])
      updateProfile({ avatar: data.url });
    }
  });
}

// 修改资料
const updateProfile = async (params: UpdateProfileParams) => {
  const res = await userApi.updateProfile(params);
  updateUser(params)
  uni.showToast({
    title: res.message,
    icon: "none"
  })
}

// 退出登录
const handleOut = () => {
  signOut()
  uni.navigateTo({ url: "/pages/auth/login" })
}
</script>

<style lang="scss" scoped>
.container {
  padding: $space-3;
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.card {
  padding: 0 $space-3;
  border-radius: $radius-4;
  background-color: #fff;

  .card-cell {
    padding: $space-4 0;
    @include flex-between;
    border-bottom: 1px solid $color-border;

    &:last-child {
      border: none;
    }

    .items-center {
      display: flex;
      align-items: center;
    }
  }

  .card-label {
    color: $color-text-secondary;
  }

  .avatar {
    width: 30px;
    border-radius: 99px;
  }
}

.out-btn {
  margin-top: $space-1;
  width: 100%;
}
</style>