import { PageHeader } from '@/components/page-header';
import { GiftForm } from '@/components/store/gift-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewGiftPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Add New Gift"
        description="Create a new gift for the reward store."
      />
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Gift Details</CardTitle>
            <CardDescription>
              Fill out the form below to add a new gift.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GiftForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
