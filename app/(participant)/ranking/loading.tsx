import { CardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4 max-w-3xl">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
