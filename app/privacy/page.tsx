
import Link from "next/link";

export default function PrivacyPolicyPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <main className="bg-background text-foreground font-sans">
      <div className="max-w-4xl mx-auto py-10 px-6">
        <h1 className="text-4xl font-bold text-primary mb-4 font-serif">Privacy Policy</h1>
        <p className="text-muted-foreground">
          <strong>Effective Date:</strong> {currentDate}
        </p>

        <p className="mt-6">Welcome to BeGood. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application and services (the "Web App" or "Services"). Please read this Privacy Policy carefully. If you do not agree with the terms, please do not access or use the Web App.</p>
        <p className="mt-4">We reserve the right to make changes to this Privacy Policy at any time. Updates will be reflected in the "Effective Date" at the top. We encourage you to review this page periodically.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">1. Information We Collect</h2>
        <p className="text-muted-foreground">We collect information that you provide to us, that we collect automatically, and that we may receive from third parties.</p>
        
        <h3 className="text-xl font-semibold mt-4 mb-2">a) Information You Provide to Us</h3>
        <p className="text-muted-foreground">We collect personal information you voluntarily provide when you create an account and use the Services, including:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
          <li>Account Information: Name, email address, password, and date of birth.</li>
          <li>Profile Information: Your username, photos, gender, country, bio, interests, "personas", who you're "looking for", and your "purpose" for using the app.</li>
          <li>Communications: Any messages sent to our support team or feedback you provide.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">b) Information We Collect Automatically</h3>
        <p className="text-muted-foreground">When you use our Web App, we may automatically collect:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
            <li>Usage Data: Information about your interactions with the Services, such as profiles you view, like, or dislike.</li>
            <li>Device Information: Device and browser type, IP address, operating system, and access times.</li>
            <li>Location Data: With your explicit browser permission, we collect your geolocation to enable features like "Nearby". You can enable or disable this at any time in your browser settings.</li>
        </ul>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">2. How We Use Your Information</h2>
        <p className="text-muted-foreground">We use your information to:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
            <li>Create and manage your account and profile.</li>
            <li>Provide, maintain, and improve our Services, including matching you with other users.</li>
            <li>Enable user-to-user communications (chat).</li>
            <li>Monitor and analyze usage to improve your experience.</li>
            <li>Communicate with you about your account or our services.</li>
            <li>Enforce our Terms of Use and prevent prohibited activities.</li>
        </ul>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">3. How We Share Your Information</h2>
        <p className="text-muted-foreground">We may share your information in these circumstances:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
            <li><strong>With Other Users:</strong> When you use the app, your profile information (including username, photos, age, bio, etc.) is visible to other users. Your interactions, such as liking a profile, may also be shared to facilitate matches.</li>
            <li><strong>With Service Providers:</strong> We use third-party service providers (e.g., Firebase for hosting and database, Google Analytics) who help us operate the Web App. They are contractually obligated to protect your data.</li>
            <li><strong>For Legal Reasons:</strong> We may disclose your information if required by law, such as in response to a court order or subpoena.</li>
            <li><strong>To Enforce Our Rights:</strong> We may share information to enforce our Terms of Use, protect our rights, or investigate and prevent fraud or security issues.</li>
        </ul>
        <p className="mt-4 text-muted-foreground">We do not sell your personal data.</p>
        
        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">4. Your Rights and Choices</h2>
        <p className="text-muted-foreground">You have control over your personal information:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
            <li><strong>Access and Update:</strong> You can review and update your profile information at any time through the "Edit Profile" page.</li>
            <li><strong>Account Deletion:</strong> You can delete your account at any time from the "Settings" page. When you delete your account, your profile is no longer visible, and we initiate a process to permanently delete your data from our systems. This process is handled by automated Cloud Functions and is irreversible.</li>
            <li><strong>Location Services:</strong> You can control location data sharing through your browser's permission settings.</li>
            <li><strong>Communications:</strong> You can opt-out of promotional emails by following the unsubscribe instructions in those emails.</li>
        </ul>
         <p className="mt-4 text-muted-foreground">Users in certain jurisdictions (like the EEA, UK, and California) may have additional rights. Please see the relevant sections below.</p>
        
        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">5. Your European Rights (GDPR & UK GDPR)</h2>
        <p className="text-muted-foreground">If you are a resident of the European Economic Area (EEA) or the United Kingdom, you have certain data protection rights. We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.</p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
            <li><strong>Right of Access:</strong> You have the right to access your personal data.</li>
            <li><strong>Right to Rectification:</strong> You have the right to have your information rectified if that information is inaccurate or incomplete.</li>
            <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You have the right to request the deletion of your personal data.</li>
            <li><strong>Right to Restrict Processing:</strong> You have the right to request that we restrict the processing of your personal information.</li>
            <li><strong>Right to Data Portability:</strong> You have the right to be provided with a copy of the information we have on you in a structured, machine-readable, and commonly used format.</li>
            <li><strong>Right to Object:</strong> You have the right to object to our processing of your Personal Data.</li>
        </ul>
        <p className="mt-2 text-muted-foreground">To exercise these rights, please contact us at the email address provided in the "Contact Us" section. Most of these rights can be exercised directly through the "Edit Profile" and "Settings" pages on the app.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">6. Your California Privacy Rights (CCPA)</h2>
        <p className="text-muted-foreground">If you are a California resident, you are afforded certain rights regarding your personal information. These include:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
            <li><strong>Right to Know and Access:</strong> You have the right to know what personal information is being collected about you and to access that information.</li>
            <li><strong>Right to Deletion:</strong> You have the right to request the deletion of your personal information.</li>
            <li><strong>Right to Opt-Out:</strong> We do not sell personal information, so the right to opt-out is not applicable.</li>
            <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights.</li>
        </ul>
        <p className="mt-2 text-muted-foreground">To exercise these rights, please contact us at the email address provided in the "Contact Us" section.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">7. Data Retention</h2>
        <p className="text-muted-foreground">We retain your data as long as your account is active. If you delete your profile, we permanently delete your data in accordance with our automated cleanup procedures, typically within a few days to weeks. We may retain some information for a limited period for legal or security reasons after account deletion.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">8. Security</h2>
        <p className="text-muted-foreground">We use technical and organizational measures to protect your information, including HTTPS encryption and secure Firebase backend rules. However, no online system is 100% secure, and we cannot guarantee absolute security.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">9. Children’s Privacy</h2>
        <p className="text-muted-foreground">Our Web App is intended only for users aged 18 and above. We do not knowingly collect or process data from anyone under 18. If we discover that we have received information from a minor, we will delete it immediately.</p>

        <h2 className="text-2xl font-bold text-primary mt-8 mb-2 font-serif">10. Contact Us</h2>
        <p className="text-muted-foreground">If you have questions about this Privacy Policy or your rights, contact us at:</p>
        <p className="text-muted-foreground mt-2"><a href="mailto:begoodhelp@gmail.com" className="text-primary hover:underline">📧 begoodhelp@gmail.com</a></p>

        <div className="mt-10">
            <Link href="/" className="text-primary hover:underline">
                Back to Home
            </Link>
        </div>
      </div>
    </main>
  );
}
