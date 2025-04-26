import React from 'react';

export default function TermsConditions() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-4 text-gray-700 dark:text-gray-300">
        <h3 className="text-xl font-semibold">Terms & Conditions for Glim</h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <p>By accessing or using Glim, you agree to be bound by these Terms and Conditions. Please read them carefully before using our platform.</p>
        
        <h4 className="text-lg font-semibold mt-4">1. Acceptance of Terms</h4>
        <p>By accessing or using our platform, you agree to these Terms and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
        
        <h4 className="text-lg font-semibold mt-4">2. User Accounts</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>You are responsible for maintaining the confidentiality of your account credentials</li>
          <li>One person may have only one account</li>
          <li>Accounts cannot be transferred or sold</li>
          <li>We reserve the right to terminate accounts that violate our policies</li>
        </ul>

        <h4 className="text-lg font-semibold mt-4">3. Content Guidelines</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>You retain ownership rights to content you post, but grant us a license to use, modify, and display it</li>
          <li>Content must not infringe on any third-party rights or violate any laws</li>
          <li>We may remove content that violates our policies or terms</li>
          <li>Prohibited content includes: spam, malware, illegal content, hate speech, harassment, and misleading information</li>
        </ul>

        <h4 className="text-lg font-semibold mt-4">4. Intellectual Property</h4>
        <p>The Glim name, logo, website design, and content created by our team are protected by intellectual property laws. You may not use, reproduce, or distribute our trademarks, content, or design without our express permission.</p>

        <h4 className="text-lg font-semibold mt-4">5. User Conduct</h4>
        <p>When using our platform, you agree to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Respect the rights and dignity of others</li>
          <li>Not engage in any activity that may interfere with proper functioning of the platform</li>
          <li>Not attempt to gain unauthorized access to any part of our services</li>
          <li>Not use our platform for any illegal or unauthorized purpose</li>
        </ul>

        <h4 className="text-lg font-semibold mt-4">6. Limitation of Liability</h4>
        <p>To the maximum extent permitted by law, Glim and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or use, arising out of or in connection with these Terms or your use of the platform.</p>

        <h4 className="text-lg font-semibold mt-4">7. Disclaimer of Warranties</h4>
        <p>Our platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied. We do not guarantee that our services will be uninterrupted, timely, secure, or error-free.</p>

        <h4 className="text-lg font-semibold mt-4">8. Changes to Terms</h4>
        <p>We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting an updated version on our website. Your continued use of the platform after such changes constitutes your acceptance of the new Terms.</p>

        <h4 className="text-lg font-semibold mt-4">9. Governing Law</h4>
        <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Glim operates, without regard to its conflict of law provisions.</p>

        <h4 className="text-lg font-semibold mt-4">10. Contact Information</h4>
        <p>For any questions regarding these Terms, please contact us at: <a href="mailto:glimapp2@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">glimapp2@gmail.com</a></p>
      </div>
    </div>
  );
} 