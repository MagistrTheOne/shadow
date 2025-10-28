import { MeetingForm } from "@/modules/meetings/ui/components/meeting-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NewMeetingPage = () => {
  return (
    <div className="py-6 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Meeting</h1>
          <p className="text-gray-400">Schedule a new AI-powered meeting session</p>
        </div>
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-8">
            <MeetingForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewMeetingPage;