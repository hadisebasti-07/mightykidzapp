
import { PageHeader } from '@/components/page-header';
import { KidForm } from '@/components/kids/kid-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function RegisterKidPage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-2xl">
        <PageHeader
          title="Register a New Child"
          description="Fill out the form below to register your child for MightyKidz. Your submission will be reviewed by an administrator."
        />
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Child's Information</CardTitle>
            <CardDescription>
              Please provide the following details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KidForm isPublic={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
