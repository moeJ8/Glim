import CallToActionDonate from '../components/CallToActionDonate'

export default function About() {
  return (
    <div className="min-h-screen">
      <div className="w-full mb-8">
        <img
          src="https://images.unsplash.com/photo-1687875494709-f019861f1ff4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Group meditation session outdoors"
          className="w-full h-[60vh] object-cover shadow-lg"
        />
      </div>
      <div className="max-w-2xl mx-auto p-3">
        <h1 className="text-3xl font-semibold text-center my-7">About Us</h1>
        <div className="text-md text-gray-600 flex flex-col gap-6 dark:text-gray-300">
          <p>
            Join our diverse community where every voice matters. Whether you&apos;re passionate about art, supporting causes, sharing knowledge, or making a difference - this is your platform to connect, inspire, and create meaningful change.
          </p>

          <p>
            We believe in the power of collective action and the importance of diverse perspectives. Our platform serves as a space where individuals from all walks of life can come together to share their stories, ideas, and experiences. Through meaningful connections and collaborative efforts, we strive to make a positive impact in our communities and beyond.
          </p>

          <p>
            Your participation is what makes this community thrive. We encourage you to engage with others, share your unique perspective, and be part of the change you want to see in the world. Together, we can create a more inclusive, inspiring, and impactful space for everyone.
          </p>
        </div>
        <div className="p-6">
          <CallToActionDonate/>
        </div>
      </div>
    </div>
  )
}
