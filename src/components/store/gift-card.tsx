import Image from 'next/image';
import { Gift } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type GiftCardProps = {
  gift: Gift;
  onRedeem: () => void;
  canRedeem: boolean;
};

export function GiftCard({ gift, onRedeem, canRedeem }: GiftCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full">
          <Image
            src={gift.imageUrl}
            alt={gift.name}
            fill
            className="object-cover"
            data-ai-hint="gift prize"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <h3 className="text-xl font-bold font-headline">{gift.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {gift.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center bg-secondary/50">
        <div className="flex items-center gap-1">
            <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-8V7h2v5h3l-4 4-4-4h3z"/>
            </svg>
           <span className="font-bold text-2xl">{gift.coinCost}</span>
        </div>
        <Button size="lg" onClick={onRedeem} disabled={!canRedeem} className="px-6 py-6 text-base">
          Redeem
        </Button>
      </CardFooter>
    </Card>
  );
}
