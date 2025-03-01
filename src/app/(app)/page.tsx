"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import data from "@/data/message.json";
import { Mail } from "lucide-react";

export default function Home() {
  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 lg:px-24 py-16 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <section className="text-center mb-12 md:mb-16 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 animate-gradient">
            Dive into the World of Anonymous Feedback
          </h1>
          <p className="mt-4 md:mt-6 text-lg md:text-xl text-gray-300 font-light">
            True Feedback - Where your identity remains a secret, and your voice matters.
          </p>
        </section>

        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: true,
            })
          ]}
          className="w-full max-w-md md:max-w-xl relative"
        >
          <CarouselContent>
            {data.map((message, index) => (
              <CarouselItem key={index} className="p-2 md:p-4">
                <Card className="border border-gray-700 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300 shadow-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg md:text-xl font-semibold text-blue-400">
                      {message.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row items-start space-y-3 md:space-y-0 md:space-x-4">
                    <Mail className="flex-shrink-0 text-purple-400 w-5 h-5 md:w-6 md:h-6" />
                    <div className="space-y-2">
                      <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                        {message.content}
                      </p>
                      <p className="text-xs text-gray-400">
                        {message.received}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12 bg-gray-700 hover:bg-gray-600" />
          <CarouselNext className="hidden md:flex -right-12 bg-gray-700 hover:bg-gray-600" />
        </Carousel>
      </main>
      <footer className="text-center p-6 bg-gray-900 text-gray-400 border-t border-gray-800">
        <p className="text-sm">
          © {new Date().getFullYear()} True Feedback. All rights reserved.
        </p>
      </footer>
    </>
  );
}
