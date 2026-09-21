import request from "./request";

interface UploadImageData {
  url: string;
}

export const uploadApi = {
  // 上传图片，filePath 为 uni.chooseImage 等接口返回的本地临时路径
  image: (filePath: string) => {
    return request.upload<UploadImageData>("/uploads/images", filePath);
  },
};
