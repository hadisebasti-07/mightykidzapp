import { PageHeader } from '@/components/page-header';
import { VolunteerForm } from '@/components/volunteers/volunteer-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function NewVolunteerPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Add New Volunteer"
        description="Create a new profile for a volunteer."
      />
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Information</CardTitle>
            <CardDescription>
              Fill out the form below to add a new volunteer to the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VolunteerForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
