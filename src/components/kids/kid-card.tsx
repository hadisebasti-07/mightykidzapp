'use client';

import Image from 'next/image';
import { Kid } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cake, Coins } from 'lucide-react';
import { useEffect, useState } from 'react';

type KidCardProps = {
  kid: Kid;
};

export function KidCard({ kid }: KidCardProps) {
  const [isBirthdayMonth, setIsBirthdayMonth] = useState(false);
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date();
    const birthDate = new Date(kid.dateOfBirth);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    setAge(calculatedAge);
    setIsBirthdayMonth(today.getMonth() + 1 === kid.birthdayMonth);
  }, [kid.dateOfBirth, kid.birthdayMonth]);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full">
          <Image
            src={kid.photoUrl}
            alt={`${kid.firstName} ${kid.lastName}`}
            fill
            className="object-cover"
            data-ai-hint="happy child"
          />
          {isBirthdayMonth && (
            <Badge className="absolute top-3 right-3 border-2 border-background bg-pink-500 text-white hover:bg-pink-600">
              <Cake className="mr-1.5 h-4 w-4" />
              Birthday!
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="text-xl font-bold font-headline truncate">
          {kid.firstName} {kid.lastName}
        </h3>
        {age !== null && (
          <p className="text-sm text-muted-foreground">{age} years old</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-primary">
            <Coins className="w-5 h-5" />
           <span className="font-bold text-lg">{kid.coinsBalance}</span>
        </div>
        <Badge variant="secondary">{kid.gender}</Badge>
      </CardFooter>
    </Card>
  );
}
