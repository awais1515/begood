
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldCheck } from "lucide-react";

interface WelcomeNotificationProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function WelcomeNotification({ isOpen, onAccept }: WelcomeNotificationProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onAccept()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 font-serif text-2xl">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Welcome on BeGood!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-4 space-y-3">
            <p className="text-destructive">Please follow the rules.</p>
            <ul className="list-disc list-outside space-y-2 pl-5 text-card-foreground">
              <li>Stay safe.</li>
              <li>Don't give out personal information too early.</li>
              <li>Respect others and treat them with kindness.</li>
              <li>Always report inappropriate behaviour.</li>
              <li>Make sure your photos, age and introduction are accurate.</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onAccept} className="w-full">
            Accept
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
