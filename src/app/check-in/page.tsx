'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserCheck, X } from 'lucide-react';
import { getKids } from '@/lib/data';
import { Kid } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckInSuccessDialog } from '@/components/check-in/check-in-success-dialog';

export default function CheckInPage() {
  const allKids = getKids();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Kid[]>([]);
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [isSuccessOpen, setSuccessOpen] = useState(false);

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    const results = allKids.filter(
      (kid) =>
        kid.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kid.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kid.parentPhone.includes(searchTerm)
    );
    setSearchResults(results);
  };
  
  const handleCheckIn = (kid: Kid) => {
    setSelectedKid(kid);
    setSuccessOpen(true);
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Sunday Check-In"
          description="Quickly search for a child to check them in."
        />
        <div className="mx-auto w-full max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or parent phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-full bg-card py-8 pl-14 pr-28 text-lg"
            />
            <Button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-6 py-6 text-base"
            >
              Search
            </Button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl space-y-4">
          {searchResults.length > 0 && (
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Search Results</h2>
                <Button variant="ghost" size="sm" onClick={() => { setSearchResults([]); setSearchTerm(''); }}>
                    <X className="mr-2 h-4 w-4" /> Clear
                </Button>
            </div>
          )}
          {searchResults.map((kid) => (
            <div
              key={kid.id}
              className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
            >
              <Avatar className="h-16 w-16">
                <AvatarImage src={kid.photoUrl} alt={kid.firstName} />
                <AvatarFallback>
                  {kid.firstName.charAt(0)}
                  {kid.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-xl font-bold">
                  {kid.firstName} {kid.lastName}
                </p>
                <p className="text-muted-foreground">
                  Parent: {kid.parentName}
                </p>
              </div>
              <Button size="lg" className="h-14 px-8 text-lg" onClick={() => handleCheckIn(kid)}>
                <UserCheck className="mr-2 h-5 w-5" />
                Check In
              </Button>
            </div>
          ))}
        </div>
      </div>
      {selectedKid && (
        <CheckInSuccessDialog
          kid={selectedKid}
          open={isSuccessOpen}
          onOpenChange={setSuccessOpen}
        />
      )}
    </>
  );
}
