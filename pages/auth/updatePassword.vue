<template>
  <div class="page">
    <up-navbar title="修改密码" placeholder :autoBack="true">
    </up-navbar>

    <up-form labelPosition="left" :model="formData" :rules="rules" ref="formRef" class="form" errorType="toast"
      labelWidth="140rpx">
      <up-form-item prop="oldPassword" label="旧密码">
        <up-input v-model="formData.oldPassword" type="password" border="surround" placeholder="请输入旧密码"></up-input>
      </up-form-item>
      <up-form-item prop="newPassword" label="新密码">
        <up-input v-model="formData.newPassword" type="password" border="surround" placeholder="请输入新密码"></up-input>
      </up-form-item>
      <up-form-item prop="confirmPassword" label="确认密码">
        <up-input v-model="formData.confirmPassword" type="password" border="surround" placeholder="请再次输入密码"></up-input>
      </up-form-item>
    </up-form>

    <up-button type="primary" text="确认" @click="submit"></up-button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import { userApi } from "@/api/userApi";

type FormRef = {
  validate: () => Promise<boolean>
}

const formRef = ref<FormRef | null>(null)

const rules = {
  'oldPassword': {
    type: 'string',
    required: true,
    message: '请填写旧密码',
    trigger: ['blur', 'change'],
  },
  'newPassword': {
    type: 'string',
    required: true,
    message: '请填写新密码',
    trigger: ['blur', 'change'],
  },
  'confirmPassword': [{
			type: 'string',
			required: true,
			message: '请再次填写密码',
			trigger: ['blur', 'change'],
		}, {
			trigger: ['blur', 'change'],
			validator: (rule : object, value : string, callback : (error ?: any) => void) => {
				if (value !== formData.value.newPassword) {
					callback(new Error('密码不一致'));
				} else {
					callback()
				}
			}
		}],
}
const formData = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
})


const submit = () => {
  formRef.value?.validate().then(async (valid: boolean) => {
    if (!valid) return
    const { confirmPassword, ...submitData } = formData.value
    const res = await userApi.updatePassword(submitData)
    uni.showToast({
      title: res.message
    })
  }).catch(() => { })
}
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
</style>