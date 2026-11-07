"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { Button } from "@/components/ui/button";

export function useInfiniteBatch<T extends { id: string }>(items: readonly T[], filterKey = "", batchSize = 10) {
  const signature = JSON.stringify([filterKey, items.map((item) => item.id)]);
  const [page, setPage] = useState({ signature, count: batchSize });
  const count = page.signature === signature ? page.count : batchSize;
  const loadMore = useCallback(() => {
    setPage({ signature, count: Math.min(items.length, count + batchSize) });
  }, [signature, items.length, batchSize, count]);
  return { items: items.slice(0, count), hasMore: count < items.length, loadMore };
}

export function LoadMoreBatch({ hasMore, loadMore, label, root }: {
  hasMore: boolean; loadMore(): void; label: string; root?: RefObject<HTMLUListElement | null>;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = sentinel.current;
    if (!hasMore || !target || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        loadMore();
      }
    }, { root: root?.current ?? null, rootMargin: "160px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore, root]);
  if (!hasMore) return null;
  return <div ref={sentinel} className="flex min-h-16 items-center justify-center py-4"><Button type="button" variant="outline" onClick={loadMore}>Load more {label}</Button></div>;
}
