
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

const Hero = () => {
  const navigate = useNavigate();
  const imageRef = useRef<HTMLImageElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setIsVisible(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    });

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 md:pt-40 md:pb-12">
        <div className="flex flex-col items-center text-center">
          <div className="flex-1 md:pr-12 mb-12">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5 animate-slide">
              Clery Compliance Made Simple
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              AI-Powered Clery Reporting and Log Creation
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Reduce Administrative Burden. Improve Accuracy. Strengthen Compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
              href="https://calendly.com/george-trysalus"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-md px-6 animate-pop bg-primary text-white rounded-lg flex items-center justify-center gap-2 py-3"

              >
              Book a Demo
              <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="overflow-hidden w-full">
            <img 
              ref={imageRef}
              src="/categories_example.png" 
              alt="Categories" 
              className={`w-full h-auto object-contain rounded-lg border border-black border-4 transition-all duration-500 ease-out ${
                isVisible 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-50 transform-origin-center'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
