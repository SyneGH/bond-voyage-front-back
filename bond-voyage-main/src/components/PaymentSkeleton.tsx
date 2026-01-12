export const PaymentSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden animate-pulse">
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-200" />
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-40" />
            <div className="h-3 bg-gray-200 rounded w-32" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded w-24" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-6 bg-gray-200 rounded w-24" />
          </div>
        </div>

        {/* Progress Bar Skeleton */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-16" />
            <div className="h-3 bg-gray-200 rounded w-8" />
          </div>
          <div className="h-2 bg-gray-200 rounded-full" />
        </div>

        {/* Payment History Skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
};
