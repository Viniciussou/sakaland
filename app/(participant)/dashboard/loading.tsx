import { CardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
