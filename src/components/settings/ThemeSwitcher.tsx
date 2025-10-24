
"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  const themes = [
    { name: "Light", value: "light", icon: Sun },
    { name: "Dark", value: "dark", icon: Moon },
    { name: "System", value: "system", icon: Monitor },
  ];

  return (
    <Card className="shadow-lg font-sans rounded-xl">
        <CardHeader>
            <CardTitle className="text-2xl font-serif">Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the app.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {themes.map((t) => (
                <Button
                    key={t.value}
                    variant={theme === t.value ? "default" : "outline"}
                    onClick={() => setTheme(t.value)}
                >
                    <t.icon className="mr-2 h-5 w-5" />
                    {t.name}
                </Button>
            ))}
            </div>
        </CardContent>
    </Card>
  );
}
