<template>
  <div class="page">
    <up-navbar title="找回密码" placeholder :autoBack="true">
    </up-navbar>

    <up-form labelPosition="left" :model="formData" :rules="rules" ref="formRef" class="form" errorType="toast"
      labelWidth="140rpx">
      <up-form-item prop="phone" label="手机号">
        <up-input v-model="formData.phone" type="password" border="surround" placeholder="请输入旧密码"></up-input>
      </up-form-item>
      <up-form-item prop="code" label="验证码">
        <up-input v-model="formData.code" border="surround" placeholder="请输入验证码">
          <template #suffix>
            <up-code :seconds="seconds" ref="uCodeRef" @change="codeChange"></up-code>
            <up-button type="primary" size="mini" @click="getCode">{{tips}}</up-button>
          </template>
        </up-input>
      </up-form-item>
      <up-form-item prop="newPassword" label="新密码">
        <up-input v-model="formData.newPassword" type="password" border="surround" placeholder="请输入新密码"></up-input>
      </up-form-item>
    </up-form>

    <up-button type="primary" disabled text="暂不支持找回" @click="submit"></up-button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

type FormRef = {
  validate: () => Promise<boolean>
}

type UCodeRef = {
  start: () => void
}

const formRef = ref<FormRef | null>(null)
const uCodeRef = ref<UCodeRef | null>(null)

const rules = {
  'phone': {
    type: 'string',
    required: true,
    message: '请填写手机号',
    trigger: ['blur', 'change'],
  },
  'code': {
    type: 'string',
    required: true,
    message: '请填写验证码',
    trigger: ['blur', 'change'],
  },
  'confirmPassword': {
    type: 'string',
    required: true,
    message: '请再次填写密码',
    trigger: ['blur', 'change'],
  }
}
const formData = ref({
  phone: "",
  code: "",
  newPassword: "",
})

const seconds = ref(60)
const tips = ref("")

const codeChange = (text: string) => {
  tips.value = text;
};

const getCode = () => {
  uCodeRef.value?.start()
}

const submit = () => {
  formRef.value?.validate().then(async (valid: boolean) => {
    if (!valid) return
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