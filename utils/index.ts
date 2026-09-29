import type { SpecsItem } from "@/api/types";

// 根据 linkUrl 跳转：外链新窗口打开，站内路由跳转
export const navigateByLink = (linkUrl: string | null | undefined) => {
	if (!linkUrl) return;

	// #ifdef H5
	if (/^https?:\/\//.test(linkUrl)) {
		window.open(linkUrl, "_blank", "noopener,noreferrer");
		return;
	}
	// #endif

	uni.navigateTo({
		url: linkUrl,
		fail: () => {
			// tabbar 页面不能用 navigateTo，回退 switchTab
			uni.switchTab({ url: linkUrl });
		},
	});
};

// 格式化商品规格展示文案
export const formatSpecsLabel = (specs: SpecsItem[]) => {
	return (
		specs
			.filter((spec) => spec.name && spec.value)
			.map((spec) => `${spec.name}：${spec.value}`)
			.join(" / ") || "默认"
	);
};

// 格式化时间
export const formatLocalTime = (isoString: string): string => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');

  return `${y}-${m}-${d} ${h}:${min}:${s}`;
};
