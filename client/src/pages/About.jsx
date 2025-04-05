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
            Welcome to our platform dedicated to advancing and protecting women&apos;s rights. Our mission is to create a space where voices for gender equality can be heard, stories can be shared, and meaningful discussions about women&apos;s rights can flourish. Through our blog posts and community engagement, we aim to raise awareness about critical issues affecting women globally, from workplace equality and reproductive rights to education access and fighting gender-based discrimination. We believe that by sharing knowledge, experiences, and resources, we can contribute to building a more equitable world where all women can thrive and exercise their fundamental human rights.
          </p>

          <p>
            WR is a movement fueled by the unwavering belief in equality, dignity, and opportunity for every woman. We exist to challenge outdated norms, break systemic barriers, and forge paths toward a world where women thrive on their terms.
            At WR, action speaks louder than words. Through bold advocacy, transformative education, and community-driven solutions, we address the pressing issues facing women globally. Our work is rooted in amplifying voices, inspiring resilience, and building a future where justice and equity are not ideals but everyday realities.
            This is more than a mission &ndash; it&apos;s a commitment. Together, we are rewriting the story, one powerful step at a time.
          </p>

          <p>
            We encourage you to leave comments on our posts, share your thoughts, and engage with our community. Your voice matters, and your participation is essential in driving our collective impact. Let&apos;s continue to create a world where women&apos;s rights are not just a promise but a reality.
          </p>
        </div>
        <div className="p-6">
          <CallToActionDonate/>
        </div>
      </div>
    </div>
  )
}
