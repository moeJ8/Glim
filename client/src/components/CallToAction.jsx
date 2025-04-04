import { Button } from "flowbite-react";

export default function CallToAction() {
  return (
    <div className="relative border border-teal-500 rounded-tl-3xl rounded-br-3xl overflow-hidden">
      <div 
        className="absolute inset-0 bg-[url('https://womenfitnessmag.com/wp-content/uploads/2022/08/How-To-Reconnect-With-Your-.jpg')] bg-cover bg-center"
        style={{ filter: 'brightness(0.7)' }}
      ></div>
      <div className="relative min-h-[400px] flex flex-col justify-center items-center text-center p-8 gap-4">
        <h2 className="text-2xl font-bold text-white">
          SHARE YOUR VOICE WITH THE WORLD
        </h2>
        <p className="text-white my-2 max-w-xl">
          Join our community of writers and share your stories, insights, and perspectives. Start publishing your articles today and make an impact.
        </p>
        <Button gradientDuoTone="pinkToOrange" className="rounded-tl-xl rounded-bl-none">
          <a href="/create-post" target="_blank" rel="noopener noreferrer">
            Become a Publisher
          </a>
        </Button>
      </div>
    </div>
  )
}
