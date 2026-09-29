import { computed, ref } from "vue";
import type { Ref } from "vue";
import { onReachBottom } from "@dcloudio/uni-app";

import type { ApiResponse, ListResult } from "@/api/types";

type Fetcher<T> = (page: number, pageSize: number) => Promise<ApiResponse<ListResult<T>>>

/**
 * 分页列表通用逻辑：触底加载更多 + 重置刷新（tab 切换等场景）
 * 通过 requestSeq 丢弃过期响应，避免快速切换 tab 时旧数据覆盖新数据
 */
export function usePagedList<T>(fetcher: Fetcher<T>, options?: { pageSize?: number }) {
  const pageSize = options?.pageSize ?? 10

  // 断言为 Ref<T[]>：ref 内部的 UnwrapRefSimple<T> 对未约束泛型无法与 T 互相赋值
  const list = ref([]) as Ref<T[]>
  const page = ref(0)
  const total = ref(0)
  const loading = ref(false)
  // 首屏未加载（page 为 0）时不视为已加载完
  const finished = computed(() => page.value > 0 && list.value.length >= total.value)

  // up-loadmore 组件状态
  const loadmoreStatus = computed(() => {
    if (page.value === 0) return "loadmore"
    if (loading.value) return "loading"
    return finished.value ? "nomore" : "loadmore"
  })

  let requestSeq = 0

  const load = async (reset = false) => {
    if (loading.value && !reset) return
    if (!reset && finished.value) return
    const seq = ++requestSeq
    const target = reset ? 1 : page.value + 1
    loading.value = true
    try {
      const { data } = await fetcher(target, pageSize)
      if (seq !== requestSeq) return // 过期响应丢弃
      page.value = target
      total.value = data.pagination.total
      list.value = reset ? data.list : [...list.value, ...data.list]
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  // 重置回第一页（tab 切换、下拉刷新后重查）
  const refresh = () => load(true)
  // 加载下一页（页级滚动时 hook 内部已注册触底触发，也可手动调用）
  const loadMore = () => load(false)

  // 按 key 无感更新单条：updater 返回新项则原位替换，返回 null 则移除（total 同步减一）
  const updateItem = (
    key: string | number,
    getKey: (item: T) => string | number,
    updater: (item: T) => T | null
  ) => {
    let removed = false
    const next: T[] = []
    list.value.forEach((item) => {
      if (getKey(item) !== key) {
        next.push(item)
        return
      }
      const updated = updater(item)
      if (updated) next.push(updated)
      else removed = true
    })
    list.value = next
    if (removed) total.value--
  }

  onReachBottom(() => loadMore())

  return { list, total, loading, finished, loadmoreStatus, refresh, loadMore, updateItem }
}
