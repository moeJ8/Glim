import { Footer } from 'flowbite-react'
import { BsFacebook, BsInstagram, BsTwitter, BsGithub, BsLinkedin } from 'react-icons/bs'
import Logo from './Logo';
import { useState } from 'react';
import PolicyModal from './PolicyModal';

export default function FooterCom() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const privacyContent = (
    <div className="space-y-4 text-gray-700 dark:text-gray-300">
      <h3 className="text-xl font-semibold">Privacy Policy for Glim</h3>
      
      <p>At Glim, we take your privacy seriously. This policy describes how we collect, use, and protect your information.</p>
      
      <h4 className="text-lg font-semibold mt-4">Information We Collect</h4>
      <ul className="list-disc pl-5 space-y-2">
        <li>Account information (username, email)</li>
        <li>Profile information you choose to share</li>
        <li>Content you post on our platform</li>
        <li>Usage data and interactions</li>
      </ul>

      <h4 className="text-lg font-semibold mt-4">How We Use Your Information</h4>
      <ul className="list-disc pl-5 space-y-2">
        <li>To provide and improve our services</li>
        <li>To personalize your experience</li>
        <li>To communicate with you about updates and content</li>
        <li>To ensure platform security</li>
      </ul>

      <h4 className="text-lg font-semibold mt-4">Data Protection</h4>
      <p>We implement security measures to protect your data and maintain its confidentiality. Your data is encrypted and stored securely.</p>

      <h4 className="text-lg font-semibold mt-4">Your Rights</h4>
      <p>You have the right to access, modify, or delete your personal information at any time through your account settings.</p>
    </div>
  );

  const termsContent = (
    <div className="space-y-4 text-gray-700 dark:text-gray-300">
      <h3 className="text-xl font-semibold">Terms & Conditions for Glim</h3>
      
      <p>By using Glim, you agree to these terms and conditions. Please read them carefully.</p>
      
      <h4 className="text-lg font-semibold mt-4">User Accounts</h4>
      <ul className="list-disc pl-5 space-y-2">
        <li>You must be 13 or older to create an account</li>
        <li>You are responsible for maintaining account security</li>
        <li>One person may have only one account</li>
        <li>Accounts cannot be transferred or sold</li>
      </ul>

      <h4 className="text-lg font-semibold mt-4">Content Guidelines</h4>
      <ul className="list-disc pl-5 space-y-2">
        <li>You retain rights to content you post</li>
        <li>Content must not violate any laws or rights</li>
        <li>We may remove content that violates our policies</li>
        <li>No spam or misleading content</li>
      </ul>

      <h4 className="text-lg font-semibold mt-4">Platform Usage</h4>
      <p>Our platform is for sharing creative content and fostering community. Users must respect others and follow community guidelines.</p>

      <h4 className="text-lg font-semibold mt-4">Termination</h4>
      <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in harmful behavior.</p>
    </div>
  );

  return (
    <>
      <Footer container className='border-t-8 border-teal-900'>
        <div className='w-full max-2-7xl mx-auto'>
          <div className='grid w-full justify-between sm:flex md:grid-cols-1'>
              <div className='mt-5'>
                  <Logo />
              </div>
              <div className='grid grid-cols-2 gap-8 mt-4 sm:grid-cols-3 sm:gap-6'>
                  <div>
                      <Footer.Title title="About" />
                      <Footer.LinkGroup col>
                          <Footer.Link href='https://moe2.itch.io/' target='_blank' rel='noopener noreferrer'>
                              Itch.io
                          </Footer.Link>
                          <Footer.Link href='/about' target='_blank' rel='noopener noreferrer'>
                                  About
                          </Footer.Link>
                      </Footer.LinkGroup>
                  </div>      
                  <div>
                          <Footer.Title title="Follow Us" />
                          <Footer.LinkGroup col>
                              <Footer.Link href='https://github.com/moeJ8' target='_blank' rel='noopener noreferrer'>
                                  Github
                              </Footer.Link>
                              <Footer.Link href='https://discord.com/users/mohammad9486' target='_blank' rel='noopener noreferrer'>
                                      Discord
                              </Footer.Link>
                          </Footer.LinkGroup>
                  </div> 
                  <div>
                          <Footer.Title title="Legal" />
                          <Footer.LinkGroup col>
                              <Footer.Link href="#" onClick={(e) => {
                                e.preventDefault();
                                setShowPrivacy(true);
                              }}>
                                  Privacy Policy
                              </Footer.Link>
                              <Footer.Link href="#" onClick={(e) => {
                                e.preventDefault();
                                setShowTerms(true);
                              }}>
                                  Terms &amp; Conditions
                              </Footer.Link>
                          </Footer.LinkGroup>
                  </div> 
              </div>
          </div>
          <Footer.Divider />
          <div className='w-full sm:flex sm:items-center sm:justify-between'>
              <Footer.Copyright href='#' by="Glim" year={new Date().getFullYear()} />
              <div className='flex gap-6 sm:mt-0 mt-4 sm:justify-center'>
                  <Footer.Icon href='' target='_blank' rel='noopener noreferrer' icon={BsFacebook} />
                  <Footer.Icon href='' target='_blank' rel='noopener noreferrer' icon={BsInstagram}/>
                  <Footer.Icon href='' target='_blank' rel='noopener noreferrer' icon={BsTwitter}/>
                  <Footer.Icon href='' target='_blank' rel='noopener noreferrer' icon={BsGithub}/>
                  <Footer.Icon href='https://www.linkedin.com/in/mohammad-jada-91209b2a3/' target='_blank' rel='noopener noreferrer' icon={BsLinkedin}/>
              </div>
          </div>
        </div>
      </Footer>

      <PolicyModal 
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        title="Privacy Policy"
        content={privacyContent}
      />

      <PolicyModal 
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        title="Terms & Conditions"
        content={termsContent}
      />
    </>
  );
}
