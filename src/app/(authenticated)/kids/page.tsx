import { getKids } from '@/lib/data';
import { KidCard } from '@/components/kids/kid-card';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, SlidersHorizontal, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default async function KidsPage() {
  const kids = await getKids();
  console.log(`KidsPage: Fetched kids on page load. Total kids: ${kids.length}`);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Kid Profiles"
        description="Manage profiles for all children in the ministry."
      >
        <Button asChild>
          <Link href="/kids/new">
            <PlusCircle />
            Add Kid
          </Link>
        </Button>
      </PageHeader>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search by name..." className="pl-10 text-base py-6" />
        </div>
        <Button variant="outline" size="lg" className="h-14">
          <SlidersHorizontal />
          Filters
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kids.map((kid) => (
          <KidCard key={kid.id} kid={kid} />
        ))}
      </div>
    </div>
  );
}
