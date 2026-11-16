"use client";

import { motion } from "framer-motion";
import { Testimonial } from "@/types/espace";

interface TestimonialBlockProps {
  testimonial: Testimonial;
}

export default function TestimonialBlock({ testimonial }: TestimonialBlockProps) {
  if (!testimonial.quote) return null;

  return (
    <section className="section-padding bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-luxury-gold text-6xl font-serif mb-8 leading-none">&ldquo;</div>
          <blockquote className="font-serif text-2xl md:text-3xl text-luxury-charcoal leading-relaxed italic mb-10">
            {testimonial.quote}
          </blockquote>
          <div className="luxury-divider mx-auto mb-8" />
          {testimonial.author && (
            <div>
              <p className="font-medium text-luxury-charcoal text-lg">
                {testimonial.author}
              </p>
              {testimonial.role && (
                <p className="text-sm text-luxury-gold uppercase tracking-wider mt-1">
                  {testimonial.role}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
