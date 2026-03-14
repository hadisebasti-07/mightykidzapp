import Image from 'next/image';
import { Kid } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cake } from 'lucide-react';

type KidCardProps = {
  kid: Kid;
};

export function KidCard({ kid }: KidCardProps) {
  const isBirthdayMonth = new Date().getMonth() + 1 === kid.birthdayMonth;
  const age = new Date().getFullYear() - new Date(kid.dateOfBirth).getFullYear();

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
        <p className="text-sm text-muted-foreground">{age} years old</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-1">
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-8V7h2v5h3l-4 4-4-4h3z"/>
            </svg>
           <span className="font-bold text-lg">{kid.coinsBalance}</span>
        </div>
        <Badge variant="secondary">{kid.gender}</Badge>
      </CardFooter>
    </Card>
  );
}
