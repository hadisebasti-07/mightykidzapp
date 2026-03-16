'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Kid } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Cake,
  Coins,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';

type KidCardProps = {
  kid: Kid;
  onDelete: () => void;
};

export function KidCard({ kid, onDelete }: KidCardProps) {
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
           <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/50 hover:bg-background">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/kids/${kid.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
