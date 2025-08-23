
"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, FileText, Shield, Cookie, Lock, LifeBuoy } from 'lucide-react';

export default function PoliciesPage() {
  const policies = [
    {
      title: 'Terms of Use',
      href: '/terms',
      icon: FileText,
      description: 'The rules for using our service.',
    },
    {
      title: 'Privacy Policy',
      href: '/privacy',
      icon: Lock,
      description: 'How we handle your data.',
    },
    {
      title: 'Cookie Policy',
      href: '/cookies',
      icon: Cookie,
      description: 'Information about the cookies we use.',
    },
  ];

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="flex items-center gap-4 mb-8">
        <Shield className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold font-serif">Policies</h1>
      </div>
      <Card className="shadow-lg font-sans rounded-xl mb-8">
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {policies.map((policy) => (
              <li key={policy.href}>
                <Link href={policy.href} className="block hover:bg-muted/50 transition-colors" target="_blank" rel="noopener noreferrer">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <policy.icon className="h-6 w-6 text-primary" />
                      <div>
                        <h2 className="font-semibold text-lg text-primary">{policy.title}</h2>
                        <p className="text-sm text-muted-foreground">{policy.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-lg font-sans rounded-xl">
        <CardHeader>
            <CardTitle className="font-serif text-2xl flex items-center gap-2">
                <LifeBuoy className="h-6 w-6 text-primary"/>
                Contact & Help
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                If you have any questions, need help, or want to report an issue, please don't hesitate to reach out to our support team.
            </p>
            <a href="mailto:begoodhelp@gmail.com" className="mt-4 inline-block text-primary hover:underline font-semibold">
                begoodhelp@gmail.com
            </a>
        </CardContent>
      </Card>
    </div>
  );
}
