import { MeetingList } from "@/modules/meetings/ui/components/meeting-list";
import { Suspense } from "react";
import { LoadingState } from "@/components/loading-state";

const MeetingsPage = () => {
  return (
    <div className="py-6 px-4 md:px-8">
      <Suspense fallback={<LoadingState title="Loading meetings..." description="Fetching your scheduled and past meetings." />}>
        <MeetingList />
      </Suspense>
    </div>
  );
};

export default MeetingsPage;