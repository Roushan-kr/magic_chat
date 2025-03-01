import { Metadata } from "next";
import { CarouselTestimonials } from "@/components/carousel-testimonials";

export const metadata: Metadata = {
  title: 'True Feedback - Anonymous Feedback Platform',
  description: 'Share and receive honest feedback anonymously. A platform where your identity remains private while your voice makes an impact.',
  keywords: ['anonymous feedback', 'honest feedback', 'private messaging', 'secure feedback'],
  openGraph: {
    title: 'True Feedback - Anonymous Feedback Platform',
    description: 'Share and receive honest feedback anonymously',
    type: 'website',
  },
};

export default async function Home() {
  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 lg:px-24 py-16 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <header className="text-center mb-12 md:mb-16 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 animate-gradient">
            Dive into the World of Anonymous Feedback
          </h1>
          <h2 className="mt-4 md:mt-6 text-lg md:text-xl text-gray-300 font-light">
            True Feedback - Where your identity remains a secret, and your voice matters.
          </h2>
        </header>

        <section aria-label="Testimonials" className="w-full max-w-4xl mx-auto mb-12 flex justify-center">
          <CarouselTestimonials />
        </section>
      </main>
      <footer role="contentinfo" className="text-center p-6 bg-gray-900 text-gray-400 border-t border-gray-800">
        <p className="text-sm">
          © {new Date().getFullYear()} True Feedback. All rights reserved.
        </p>
      </footer>
    </>
  );
}
