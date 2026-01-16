
"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronRight, FileText, Shield, Cookie, Lock, LifeBuoy, Mail } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto p-4 md:p-6 h-full">
      <h1 className="hidden md:block text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Policies</h1>
      <p className="hidden md:block text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">Legal documents and how to get help</p>

      <Card className="bg-[#1a1a1a] border-white/5 text-white shadow-xl rounded-3xl overflow-hidden mb-6">
        <CardHeader className="border-b border-white/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#A42347]/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#A42347]" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white tracking-wide">Legal Documents</CardTitle>
              <CardDescription className="text-white/40 mt-0.5">
                Review our terms and policies
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-white/5">
            {policies.map((policy) => (
              <li key={policy.href}>
                <Link
                  href={policy.href}
                  className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition-all group border-l-4 border-transparent hover:border-[#A42347]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#A42347]/10 transition-colors">
                      <policy.icon className="h-5 w-5 text-white/60 group-hover:text-[#A42347] transition-colors" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white group-hover:text-[#A42347] transition-colors">{policy.title}</h2>
                      <p className="text-sm text-white/40">{policy.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-[#A42347] group-hover:translate-x-1 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a1a] border-white/5 text-white shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-white/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#A42347]/10 flex items-center justify-center">
              <LifeBuoy className="h-5 w-5 text-[#A42347]" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white tracking-wide">Contact & Help</CardTitle>
              <CardDescription className="text-white/40 mt-0.5">
                Get in touch with our support team
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-white/50 mb-5 leading-relaxed">
            If you have any questions, need help, or want to report an issue, please don't hesitate to reach out to our support team.
          </p>
          <a
            href="mailto:begoodhelp@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#A42347] to-[#8B1D3B] hover:opacity-90 text-white font-medium rounded-xl shadow-lg shadow-[#A42347]/20 transition-opacity"
          >
            <Mail className="h-4 w-4" />
            begoodhelp@gmail.com
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

