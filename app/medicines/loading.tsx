"use client"

import { SkeletonCard } from "@/components/skeleton-card"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mb-12 text-center">
        <div className="h-10 w-1/3 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
        <div className="h-6 w-2/3 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div className="w-full md:w-64 space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
          <div className="space-y-2">
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
          </div>
        </div>

        <div className="w-full md:flex-1">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-full sm:w-[180px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-full sm:w-[120px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <SkeletonCard key={index} />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
