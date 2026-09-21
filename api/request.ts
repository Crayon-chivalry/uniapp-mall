import type { ApiResponse } from "./types";

// 接口基础地址，后续可按环境区分
const BASE_URL = "http://localhost:3000/api/app";

const TOKEN_KEY = "token";

// 登录页路径
const LOGIN_PAGE = "/pages/login/index";

const TIMEOUT = 10000;

// 仅对提交类请求展示全局 loading，GET 查询类请求由页面自行处理骨架屏/局部 loading
const SUBMIT_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  data?: any;
  header?: Record<string, string>;
}

function getToken(): string {
  return uni.getStorageSync(TOKEN_KEY) || "";
}

// 获取当前页面完整路径（含参数），用于登录后回跳
function getCurrentFullPath(): string {
  const pages = getCurrentPages();
  const current = pages[pages.length - 1] as any;
  if (!current) return "";
  // H5 下优先取完整路径
  if (current.$page?.fullPath) return current.$page.fullPath;
  const query = current.options
    ? Object.keys(current.options)
        .map((key) => `${key}=${current.options[key]}`)
        .join("&")
    : "";
  return `/${current.route}${query ? `?${query}` : ""}`;
}

// token 失效：清除登录信息并跳转登录页
function handleUnauthorized() {
  uni.removeStorageSync(TOKEN_KEY);

  const pages = getCurrentPages();
  const current = pages[pages.length - 1] as any;
  const currentRoute = current?.route ? `/${current.route}` : "";

  // 已在登录页时不重复跳转
  if (currentRoute === LOGIN_PAGE) return;

  uni.reLaunch({
    url: `${LOGIN_PAGE}?redirect=${encodeURIComponent(getCurrentFullPath())}`,
  });
}

function showError(content: string) {
  uni.showToast({
    title: content,
    icon: "none",
  });
}

interface UploadOptions {
  url: string;
  filePath: string;
  name?: string;
  formData?: Record<string, any>;
}

interface RequestFn {
  <T = any>(options: RequestOptions): Promise<ApiResponse<T>>;
  get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  upload<T = any>(url: string, filePath: string, name?: string, formData?: Record<string, any>): Promise<ApiResponse<T>>;
}

const request = (function <T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
  const method = options.method || "GET";
  const isSubmitRequest = SUBMIT_METHODS.includes(method);

  if (isSubmitRequest) {
    uni.showLoading({ title: "加载中…", mask: true });
  }

  const token = getToken();

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${options.url}`,
      // 官方类型未包含 PATCH（小程序不支持），H5/App 实际可用
      method: method as any,
      data: options.data,
      timeout: TIMEOUT,
      header: {
        ...(options.header || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      success: (res) => {
        if (isSubmitRequest) uni.hideLoading();

        const result = (res.data || {}) as ApiResponse<T>;

        // token 失效，清除登录信息并跳转登录页
        if (result.code === 40101 || (res.statusCode === 401 && !result.code)) {
          handleUnauthorized();
          reject(new Error(result.message || "登录已过期"));
          return;
        }

        // 统一处理后端返回格式
        if (res.statusCode >= 400 || result.code !== 0) {
          const content = result.message || `请求失败（${res.statusCode}）`;
          showError(content);
          reject(new Error(content));
          return;
        }

        resolve(result);
      },
      fail: (err) => {
        if (isSubmitRequest) uni.hideLoading();

        const content = err.errMsg || "网络异常，请稍后重试";
        showError(content);
        reject(new Error(content));
      },
    });
  });
}) as RequestFn;

// 快捷方法，对齐 axios 用法
request.get = function <T = any>(url: string, params?: Record<string, any>) {
  return request<T>({ url, method: "GET", data: params });
};

request.post = function <T = any>(url: string, data?: any) {
  return request<T>({ url, method: "POST", data });
};

request.put = function <T = any>(url: string, data?: any) {
  return request<T>({ url, method: "PUT", data });
};

request.patch = function <T = any>(url: string, data?: any) {
  return request<T>({ url, method: "PATCH", data });
};

request.delete = function <T = any>(url: string, data?: any) {
  return request<T>({ url, method: "DELETE", data });
};

// 文件上传，filePath 为 uni.chooseImage 等接口返回的本地临时路径
request.upload = function <T = any>(
  url: string,
  filePath: string,
  name = "file",
  formData?: Record<string, any>
) {
  const uploadOptions: UploadOptions = { url, filePath, name, formData };
  const token = getToken();

  return new Promise<ApiResponse<T>>((resolve, reject) => {
    uni.uploadFile({
      url: `${BASE_URL}${uploadOptions.url}`,
      filePath: uploadOptions.filePath,
      name: uploadOptions.name,
      formData: uploadOptions.formData,
      timeout: TIMEOUT,
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        // uploadFile 返回的 data 是字符串，需手动解析
        let result: ApiResponse<T>;
        try {
          result = JSON.parse(res.data) as ApiResponse<T>;
        } catch {
          const content = `上传失败（${res.statusCode}）`;
          showError(content);
          reject(new Error(content));
          return;
        }

        if (result.code === 40101 || (res.statusCode === 401 && !result.code)) {
          handleUnauthorized();
          reject(new Error(result.message || "登录已过期"));
          return;
        }

        if (res.statusCode >= 400 || result.code !== 0) {
          const content = result.message || `上传失败（${res.statusCode}）`;
          showError(content);
          reject(new Error(content));
          return;
        }

        resolve(result);
      },
      fail: (err) => {
        const content = err.errMsg || "网络异常，请稍后重试";
        showError(content);
        reject(new Error(content));
      },
    });
  });
};

export default request;
