"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { testimonials } from "@/data/message";
import Autoplay from "embla-carousel-autoplay";
import { Mail } from "lucide-react";

export function CarouselTestimonials() {
  return (
    <Carousel
      opts={{
        align: "center",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 3000,
          stopOnInteraction: true,
        }),
      ]}
      className="w-full max-w-md md:max-w-xl relative"
    >
      <CarouselContent>
        {testimonials.map((message, index) => (
          <CarouselItem key={index} className="p-3 md:p-6">
            <article
              itemScope
              itemType="https://schema.org/Review"
              className="h-full"
            >
              <Card className="border border-gray-700/50 bg-gray-800/30 backdrop-blur-md hover:bg-gray-800/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]">
                <CardHeader className="pb-4">
                  <CardTitle
                    itemProp="name"
                    className="text-lg md:text-xl font-semibold text-blue-400/90 hover:text-blue-400 transition-colors"
                  >
                    {message.author.name}
                  </CardTitle>
                  <p className="text-sm text-gray-400">
                    {message.author.role}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-start gap-4">
                  <Mail className="flex-shrink-0 text-purple-400/80 w-6 h-6 mt-1" />
                  <div className="space-y-3">
                    <p
                      itemProp="reviewBody"
                      className="text-gray-200/90 text-sm md:text-base leading-relaxed"
                    >
                      {message.content}
                    </p>
                    <time
                      itemProp="datePublished"
                      className="text-xs text-gray-400/80 font-light"
                    >
                      {message.rating}
                    </time>
                  </div>
                </CardContent>
              </Card>
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious 
        className="hidden md:flex -left-12 bg-gray-700/80 hover:bg-gray-600 transition-colors duration-200"
        aria-label="View previous testimonial" 
      />
      <CarouselNext 
        className="hidden md:flex -right-12 bg-gray-700/80 hover:bg-gray-600 transition-colors duration-200"
        aria-label="View next testimonial"
      />
    </Carousel>
  );
}
