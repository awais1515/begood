
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export default function CookiePolicyPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleManageConsent = () => {
    if (typeof window !== "undefined") {
      // By removing the item, the banner will reappear on the next load.
      localStorage.removeItem('cookie_consent');
      window.location.reload();
    }
  };

  return (
    <main className="bg-background text-foreground font-sans">
      <div className="max-w-4xl mx-auto py-10 px-6">
        <h1 className="text-4xl font-bold text-primary mb-4 font-serif">Cookie Policy</h1>
        <p className="text-muted-foreground">
          <strong>Effective Date:</strong> {currentDate}
        </p>
        <p className="mt-6">This Cookie Policy explains how BeGood uses cookies and similar technologies when you visit or use our website.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">1. What are cookies?</h2>
        <p className="text-muted-foreground">A cookie is a small text file that a website stores on your computer or mobile device when you visit the site. Cookies allow the website to recognize you, remember your preferences (such as your login session or theme settings), and improve your user experience.</p>
        
        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">2. What types of cookies do we use?</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li><strong>Strictly Necessary Cookies:</strong> These are essential for the website to function and cannot be switched off. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms.</li>
          <li><strong>Performance and Analytics Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. For example, we use Google Analytics to understand how visitors engage with the site. This data is collected in an aggregated form.</li>
          <li><strong>Functionality Cookies:</strong> These are used to recognize you when you return to our website and to remember your preferences (for example, your choice of theme).</li>
        </ul>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">3. Third-Party Cookies</h2>
        <p className="text-muted-foreground">We use third-party providers like Google (for Firebase and Analytics) who may place cookies on your device to provide their services and to collect statistical data about your use of the website.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">4. Managing Your Cookie Settings</h2>
        <p className="text-muted-foreground">When you first visit our site, you are presented with a cookie banner where you can accept or decline non-essential cookies. You can change or withdraw your consent at any time. Clicking the button below will reset your consent choice, allowing you to update your preferences on your next page load.</p>
        <div className="mt-4">
          <Button onClick={handleManageConsent}>
            <Cookie className="mr-2 h-4 w-4" />
            Manage Cookie Consent
          </Button>
        </div>
        <p className="mt-4 text-muted-foreground">You can also control and/or delete cookies as you wish – for details, see <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">allaboutcookies.org</a>.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">5. Contact Us</h2>
        <p className="text-muted-foreground">If you have any questions about our use of cookies, please contact us at <a href="mailto:begoodhelp@gmail.com" className="text-primary hover:underline">begoodhelp@gmail.com</a>.</p>

        <div className="mt-10">
            <Link href="/" className="text-primary hover:underline">
                Back to Home
            </Link>
        </div>
      </div>
    </main>
  );
}
