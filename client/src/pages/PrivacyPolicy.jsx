import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-4 text-gray-700 dark:text-gray-300">
        <h3 className="text-xl font-semibold">Privacy Policy for Glim</h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <p>At Glim, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines our practices concerning the collection, use, and safeguarding of your data when you use our platform.</p>
        
        <h4 className="text-lg font-semibold mt-4">1. Information We Collect</h4>
        <p>We collect the following types of information:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Account Information:</strong> Username, email address, password (encrypted), and optional profile details</li>
          <li><strong>Profile Information:</strong> Any content you choose to add to your profile, including biography, profile picture, and links</li>
          <li><strong>Content Data:</strong> Blog posts, comments, likes, and other interactions you create on our platform</li>
          <li><strong>Usage Information:</strong> How you interact with our services, including page views, clicks, and time spent on the platform</li>
          <li><strong>Device Information:</strong> Browser type, IP address, device identifiers, and operating system</li>
        </ul>

        <h4 className="text-lg font-semibold mt-4">2. How We Use Your Information</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Provide and Improve Services:</strong> To operate our platform, personalize your experience, and develop new features</li>
          <li><strong>Communication:</strong> To send you updates, notifications, and respond to your inquiries</li>
          <li><strong>Security:</strong> To protect our platform, users, and detect fraudulent or illegal activities</li>
          <li><strong>Analytics:</strong> To understand user behavior and optimize our services</li>
        </ul>

        <h4 className="text-lg font-semibold mt-4">3. Cookies and Similar Technologies</h4>
        <p>We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings.</p>

        <h4 className="text-lg font-semibold mt-4">4. Data Sharing and Disclosure</h4>
        <p>We may share your information under the following circumstances:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>With Service Providers:</strong> Third-party vendors who assist in operating our platform</li>
          <li><strong>For Legal Reasons:</strong> When required by law, government request, or to protect rights and safety</li>
          <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
        </ul>

        <h4 className="text-lg font-semibold mt-4">5. Data Security</h4>
        <p>We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure. Your data is encrypted in transit and at rest.</p>

        <h4 className="text-lg font-semibold mt-4">6. User Rights</h4>
        <p>You have the right to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Access, correct, or delete your personal information</li>
          <li>Object to or restrict certain processing of your data</li>
          <li>Download a copy of your data in a portable format</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>

        <h4 className="text-lg font-semibold mt-4">7. Children&apos;s Privacy</h4>
        <p>Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us.</p>

        <h4 className="text-lg font-semibold mt-4">8. Changes to This Policy</h4>
        <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the &quot;Last Updated&quot; date.</p>

        <h4 className="text-lg font-semibold mt-4">9. Contact Us</h4>
        <p>If you have any questions or concerns about this Privacy Policy, please contact us at: <a href="mailto:glimapp2@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">glimapp2@gmail.com</a></p>
      </div>
    </div>
  );
} 