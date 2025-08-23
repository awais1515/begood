
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function PreferencesSelector() {
  return (
    <Card className="shadow-lg font-sans rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-serif flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notification Preferences
        </CardTitle>
        <CardDescription>Manage how you get notified about activity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2 p-3 rounded-md hover:bg-muted/50 transition-colors">
            <Label htmlFor="match-notifications" className="flex flex-col space-y-1 cursor-pointer">
              <span>New Match Notifications</span>
              <span className="font-normal leading-snug text-muted-foreground text-sm">
                Get notified when you get a new match with someone.
              </span>
            </Label>
            <Switch id="match-notifications" defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between space-x-2 p-3 rounded-md hover:bg-muted/50 transition-colors">
            <Label htmlFor="message-notifications" className="flex flex-col space-y-1 cursor-pointer">
              <span>New Message Notifications</span>
              <span className="font-normal leading-snug text-muted-foreground text-sm">
                Receive an alert when you get a new message.
              </span>
            </Label>
            <Switch id="message-notifications" defaultChecked />
        </div>
        <Separator />
        <div className="flex items-center justify-between space-x-2 p-3 rounded-md hover:bg-muted/50 transition-colors">
            <Label htmlFor="notification-sound" className="flex flex-col space-y-1 cursor-pointer">
              <span>Notification Sound</span>
              <span className="font-normal leading-snug text-muted-foreground text-sm">
                Play a sound when a notification arrives.
              </span>
            </Label>
            <Switch id="notification-sound" />
        </div>
      </CardContent>
    </Card>
  );
}
