import { Footer} from 'flowbite-react'
import { Link } from 'react-router-dom';
import {BsFacebook, BsInstagram,BsTwitter, BsGithub, BsLinkedin} from 'react-icons/bs'

export default function FooterCom() {
  return (
    <Footer container className='border-t-8 border-teal-500'>
      <div className='w-full max-2-7xl mx-auto'>
        <div className='grid w-full justify-between sm:flex md:grid-cols-1'>
            <div className='mt-5'>
            <Link to ="/" className="self-center whitespace-nowrap text-lg sm:text-xl font-semibold dark:text-white">
                <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">Moe&apos;s</span>
                Blog
            </Link>
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
                            <Footer.Link href='#'>
                                Privecy Policy
                            </Footer.Link>
                            <Footer.Link href='#'>
                                    Terms &amp; Conditions
                            </Footer.Link>
                        </Footer.LinkGroup>
                </div> 
            </div>
        </div>
        <Footer.Divider />
        <div className='w-full sm:flex sm:items-center sm: justify-between'>
            <Footer.Copyright href='#' by="Moe's Blog" year={new Date().getFullYear()} />
            <div className='flex gap-6 sm:mt-0 mt-4 sm:justify-center'>
                <Footer.Icon href='https://www.facebook.com/johncena' target='_blank' rel='noopener noreferrer' icon={BsFacebook} />
                <Footer.Icon href='https://www.instagram.com/cristiano/' target='_blank' rel='noopener noreferrer' icon={BsInstagram}/>
                <Footer.Icon href='https://x.com/leomessioffici?lang=he&mx=2' target='_blank' rel='noopener noreferrer' icon={BsTwitter}/>
                <Footer.Icon href='https://github.com/moeJ8' target='_blank' rel='noopener noreferrer' icon={BsGithub}/>
                <Footer.Icon href='https://www.linkedin.com/in/mohammad-jada-91209b2a3/' target='_blank' rel='noopener noreferrer' icon={BsLinkedin}/>
            </div>
        </div>
      </div>
    </Footer>
  )
}
