
import Link from "next/link";

export default function TermsOfUsePage() {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <main className="bg-background text-foreground font-sans">
      <div className="max-w-4xl mx-auto py-10 px-6">
        <h1 className="text-4xl font-bold text-primary mb-4 font-serif">Terms of Use</h1>
        <p className="text-muted-foreground">
            <strong>Effective Date:</strong> {currentDate}
        </p>

        <p className="mt-6">Welcome to BeGood! These Terms of Use ("Terms") govern your use of the BeGood web application and website (collectively, the "Web App") and any related services provided by us. By accessing or using our Web App, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, do not use the Web App.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">1. Eligibility</h2>
        <p className="text-muted-foreground">You must be at least 18 years old to use the Web App. By using it, you represent and warrant that you have the right, authority, and capacity to enter into these Terms and to abide by all of the terms and conditions set forth herein.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">2. Your Account</h2>
        <p className="text-muted-foreground">You agree to provide accurate, current, and complete information during the registration process. Providing false information is strictly prohibited and may result in account termination. You are responsible for maintaining the confidentiality of your account login information and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use, or suspected unauthorized use, of your account or any other breach of security.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">3. User Conduct and Content Rules</h2>
        <div className="text-muted-foreground space-y-4">
            <p>You agree not to use the Web App to post, upload, transmit, or otherwise make available any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, invasive of another's privacy, hateful, or otherwise objectionable.</p>
            <p>You are solely responsible for all content you post, including your profile information, photos, and messages ("User Content"). You represent and warrant that your User Content and your conduct on the platform comply with all applicable laws and regulations.</p>
            <p>We do not claim ownership of your User Content, but you grant us a license to use it to operate and improve the service. We are not responsible for the conduct or content of any user and assume no liability for any user-generated content.</p>
            <p>We actively monitor for suspicious or abusive behavior. Users may report inappropriate activity, and we reserve the right to investigate and suspend or terminate accounts engaged in such conduct without notice.</p>
            <p>We reserve the right to verify the authenticity of any account registration, including through email confirmation and automated abuse detection. Fake, automated, or bot-created accounts are prohibited and may be removed without notice.</p>
        </div>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">4. Content Ownership</h2>
        <p className="text-muted-foreground">You retain all ownership rights to your User Content. However, by submitting content on the Web App, you grant us a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the content in connection with providing and promoting the Web App and our business.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">5. Termination</h2>
        <p className="text-muted-foreground">We may terminate or suspend your account and bar access to the Web App immediately, without prior notice or liability, if you breach these Terms. This may include IP-based restrictions or permanent account suspension for serious abuse. You may terminate your account at any time from the settings page, which will result in the permanent deletion of your data as described in our Privacy Policy.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">6. Disclaimers</h2>
        <div className="text-muted-foreground space-y-4">
          <p>The Web App is provided on an "AS IS" and "AS AVAILABLE" basis. We expressly disclaim any warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
          <p>We make no guarantees regarding the accuracy, completeness, or reliability of the Web App or any content thereon. We do not conduct background checks on our users. We do not endorse or accept responsibility for any content posted by users, and you use the Web App and interact with other users at your own risk.</p>
        </div>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">7. Limitation of Liability</h2>
        <p className="text-muted-foreground">In no event shall we, nor our directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Web App; (ii) any conduct or content of any third party on the Web App; (iii) any content obtained from the Web App; and (iv) unauthorized access, use, or alteration of your transmissions or content.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">8. Governing Law</h2>
        <p className="text-muted-foreground">These Terms shall be governed and construed in accordance with applicable laws, without regard to conflict of law provisions.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">9. Changes to Terms</h2>
        <p className="text-muted-foreground">We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will make reasonable efforts to provide at least 30 days’ notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">10. Entire Agreement</h2>
        <p className="text-muted-foreground">These Terms constitute the entire agreement between you and us regarding your use of the Web App and supersede and replace any prior agreements we might have had between us regarding the Web App.</p>
        
        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">11. Contact Us</h2>
        <p className="text-muted-foreground">If you have any questions about these Terms, please contact us at <a href="mailto:begoodhelp@gmail.com" className="text-primary hover:underline">begoodhelp@gmail.com</a>.</p>
        
        <div className="mt-10">
            <Link href="/" className="text-primary hover:underline">
                Back to Home
            </Link>
        </div>
      </div>
    </main>
  );
}
