import { MeetingForm } from "@/modules/meetings/ui/components/meeting-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NewMeetingPage = () => {
  return (
    <div className="py-4 px-4 md:px-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Meeting</CardTitle>
        </CardHeader>
        <CardContent>
          <MeetingForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewMeetingPage;