import { Footer } from 'flowbite-react'
import { BsGithub } from 'react-icons/bs'
import { FaEnvelope } from 'react-icons/fa'
import Logo from './Logo';
import { useState } from 'react';
import CustomModal from './CustomModal';
import { Link } from 'react-router-dom';

export default function FooterCom() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const privacyContent = (
    <div className="space-y-4 text-gray-700 dark:text-gray-300">
      <h3 className="text-xl font-semibold">Privacy Policy for Glim</h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="mb-6 bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <p className="text-blue-700 dark:text-blue-300 font-medium">
          You can also view this policy on a dedicated page: 
          <Link 
            to="/privacy-policy" 
            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            onClick={() => setShowPrivacy(false)}
          >
            Privacy Policy Page
          </Link>
        </p>
      </div>
      
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
  );

  const termsContent = (
    <div className="space-y-4 text-gray-700 dark:text-gray-300">
      <h3 className="text-xl font-semibold">Terms & Conditions for Glim</h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Last Updated: {new Date().toLocaleDateString()}</p>
      
      <div className="mb-6 bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <p className="text-blue-700 dark:text-blue-300 font-medium">
          You can also view these terms on a dedicated page: 
          <Link 
            to="/terms-conditions" 
            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            onClick={() => setShowTerms(false)}
          >
            Terms & Conditions Page
          </Link>
        </p>
      </div>
      
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
  );

  return (
    <>
      <Footer container className='border-t-8 border-teal-900'>
        <div className='w-full max-w-7xl mx-auto'>
          <div className='flex justify-between items-start pt-8'>
            <div className='hidden'>
              <Logo />
            </div>
            <div className='grid grid-cols-3 w-full gap-6'>
              <div className='text-center'>
                <h2 className='text-gray-700 dark:text-gray-300 font-bold mb-4'>ABOUT</h2>
                <ul className='flex flex-col items-center space-y-2 text-gray-600 dark:text-gray-300'>
                  <li>
                    <Link to='/' className="font-medium">
                      Glim
                    </Link>
                  </li>
                  <li>
                    <Link to='/about' className="font-medium">
                      About
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className='text-center'>
                <h2 className='text-gray-700 dark:text-gray-300 font-bold mb-4'>FOLLOW US</h2>
                <ul className='flex flex-col items-center space-y-2 text-gray-600 dark:text-gray-300'>
                  <li>
                    <a href='https://github.com/moeJ8' target='_blank' rel='noopener noreferrer' className="font-medium">
                      Github
                    </a>
                  </li>
                  <li>
                    <a href='https://discord.com/users/mohammad9486' target='_blank' rel='noopener noreferrer' className="font-medium">
                      Discord
                    </a>
                  </li>
                </ul>
              </div>
              
              <div className='text-center'>
                <h2 className='text-gray-700 dark:text-gray-300 font-bold mb-4'>LEGAL</h2>
                <ul className='flex flex-col items-center space-y-2 text-gray-600 dark:text-gray-300'>
                  <li>
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      setShowPrivacy(true);
                    }} className="font-medium">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      setShowTerms(true);
                    }} className="font-medium">
                      Terms &amp; Conditions
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <Footer.Divider />
          
          <div className='w-full flex justify-between items-center'>
              <div>
                © {new Date().getFullYear()} Glim
              </div>
              <div className='flex gap-6'>
                  <Footer.Icon href='mailto:glimapp2@gmail.com' target='_blank' rel='noopener noreferrer' icon={FaEnvelope} className='' />
                  <Footer.Icon href='https://github.com/moeJ8' target='_blank' rel='noopener noreferrer' icon={BsGithub}/>
              </div>
          </div>
        </div>
      </Footer>

      <CustomModal 
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        title="Privacy Policy"
        maxWidth="4xl"
      >
        {privacyContent}
      </CustomModal>

      <CustomModal 
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        title="Terms & Conditions"
        maxWidth="4xl"
      >
        {termsContent}
      </CustomModal>
    </>
  );
}
