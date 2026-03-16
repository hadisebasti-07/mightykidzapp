'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  UserCheck,
  X,
  QrCode,
  UserPlus,
  CameraOff,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { getKids, getRecentActivities } from '@/lib/data';
import { Kid } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Confetti } from '@/components/confetti';
import { generatePersonalizedCheckinMessage } from '@/ai/flows/generate-personalized-checkin-message';

export default function HomePage() {
  const [allKids, setAllKids] = useState<Kid[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Kid[]>([]);
  const [quickCheckInKids, setQuickCheckInKids] = useState<Kid[]>([]);

  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [isScannerOpen, setScannerOpen] = useState(false);

  // State for the success overlay
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchKidsAndActivities = async () => {
      const kidsData = await getKids();
      setAllKids(kidsData);

      // Populate quick check-in
      const recentActivities = getRecentActivities().filter(
        (a) => a.type === 'check-in'
      );
      const recentKidNames = [...new Set(recentActivities.map((a) => a.kidName))];
      const quickKids = recentKidNames
        .map((name) =>
          kidsData.find((k) => `${k.firstName} ${k.lastName}` === name)
        )
        .filter((k): k is Kid => !!k)
        .slice(0, 3); // Show top 3
      setQuickCheckInKids(quickKids);
    };
    fetchKidsAndActivities();
  }, []);

  useEffect(() => {
    if (isScannerOpen) {
      const enableCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'environment' },
            });
            setHasCameraPermission(true);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description:
                'Please enable camera permissions in your browser settings to scan barcodes.',
            });
          }
        } else {
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Not Supported',
                description: 'Your browser does not support camera access.',
            });
        }
      };

      enableCamera();
    } else {
      // Cleanup: stop the stream when scanner closes.
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setHasCameraPermission(null);
    }
  }, [isScannerOpen, toast]);

  // Effect to handle the success overlay
  useEffect(() => {
    if (showSuccess && selectedKid) {
      const getMessage = async () => {
        setIsLoadingMessage(true);
        try {
          const isBirthday = new Date().getMonth() + 1 === selectedKid.birthdayMonth && new Date().getDate() === new Date(selectedKid.dateOfBirth).getDate();
          const result = await generatePersonalizedCheckinMessage({
            kidName: selectedKid.firstName,
            isBirthday: isBirthday,
          });
          setSuccessMessage(result);
        } catch (error) {
          console.error('Error generating message:', error);
          setSuccessMessage(`Welcome, ${selectedKid.firstName}! We're so glad you're here!`);
        }
        setIsLoadingMessage(false);
      };
      getMessage();

      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 8000); // Auto-close after 8 seconds

      return () => clearTimeout(timer);
    }
  }, [showSuccess, selectedKid]);

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
    if (isScannerOpen) {
      setScannerOpen(false);
      // Use a timeout to allow the scanner dialog to close before showing the success overlay
      setTimeout(() => {
        setShowSuccess(true);
      }, 300);
    } else {
      setShowSuccess(true);
    }
  };

  const handleSimulateScan = () => {
    if (allKids.length > 0) {
      const randomKid = allKids[Math.floor(Math.random() * allKids.length)];
      handleCheckIn(randomKid);
    } else {
      toast({
        title: 'No kids to check in',
        description: 'Please add some kids first.',
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Sunday Check-In"
          description="Search for a child or use one of the quick options below."
        >
          <Button asChild>
            <Link href="/kids/new">
              <UserPlus />
              Register New Kid
            </Link>
          </Button>
        </PageHeader>

        <div className="mx-auto w-full max-w-3xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
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
            <Dialog open={isScannerOpen} onOpenChange={setScannerOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-auto w-20 flex-col gap-1 rounded-2xl"
                >
                  <QrCode className="h-8 w-8" />
                  <span className="text-xs">Scan</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Scan Barcode</DialogTitle>
                </DialogHeader>
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                  <video
                    ref={videoRef}
                    className="h-full w-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="h-2/3 w-2/3 rounded-lg border-4 border-dashed border-primary" />
                  </div>
                  {hasCameraPermission === false && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-4 text-center text-white">
                      <CameraOff className="mb-4 h-16 w-16" />
                      <h3 className="text-2xl font-bold">
                        Camera Access Required
                      </h3>
                      <p>
                        Please allow camera access in your browser settings to
                        use the scanner.
                      </p>
                    </div>
                  )}
                </div>
                <Button onClick={handleSimulateScan} className="w-full">
                  Simulate Scan & Check In
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="mx-auto w-full max-w-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Search Results</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchResults([]);
                  setSearchTerm('');
                }}
              >
                <X className="mr-2 h-4 w-4" /> Clear Search
              </Button>
            </div>
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
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg"
                  onClick={() => handleCheckIn(kid)}
                >
                  <UserCheck className="mr-2 h-5 w-5" />
                  Check In
                </Button>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && (
          <div className="mx-auto w-full max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle>Quick Check-In</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickCheckInKids.length > 0 ? (
                  quickCheckInKids.map((kid) => (
                    <div
                      key={kid.id}
                      className="flex items-center gap-4 rounded-xl border bg-background p-4 shadow-sm"
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
                      <Button
                        size="lg"
                        className="h-14 px-8 text-lg"
                        onClick={() => handleCheckIn(kid)}
                      >
                        <UserCheck className="mr-2 h-5 w-5" />
                        Check In
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No recent check-ins found.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {showSuccess && selectedKid && (
        <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
          <Confetti />
          <div className="relative flex flex-col items-center rounded-3xl bg-background/80 p-12 text-center backdrop-blur-lg">
            <Avatar className="h-40 w-40 border-8 border-background shadow-lg">
              <AvatarImage src={selectedKid.photoUrl} alt={selectedKid.firstName} />
              <AvatarFallback className="text-6xl">
                {selectedKid.firstName.charAt(0)}
                {selectedKid.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="mt-6">
              {isLoadingMessage ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              ) : (
                <h2 className="font-headline text-4xl font-bold leading-tight tracking-tighter md:text-5xl">
                  {successMessage}
                </h2>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-lg font-semibold text-primary-foreground">
              <Sparkles className="size-5 text-primary" />
              <span>+10 Coins Earned!</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
