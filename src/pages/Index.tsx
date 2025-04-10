import { Navbar } from '@/components/Navbar';
import Hero from '@/components/Hero';
import ContactForm from '@/components/ContactForm';
import { useEffect, useRef, useState } from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

const Index = () => {
  const classificationImageRef = useRef<HTMLImageElement>(null);
  const [isClassificationImageVisible, setIsClassificationImageVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setIsClassificationImageVisible(entry.isIntersecting);
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    });

    if (classificationImageRef.current) {
      observer.observe(classificationImageRef.current);
    }

    return () => {
      if (classificationImageRef.current) {
        observer.unobserve(classificationImageRef.current);
      }
    };
  }, []);
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      
      {/* Features Section */}
      <section id="features" className="bg-secondary/30 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform streamlines the entire incident reporting process, from automatic categorization to log generation.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-sm animate-slide card-hover grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 flex flex-col justify-center">
              <span className="font-bold text-primary text-xl">📋</span>
              <h3 className="text-xl font-semibold mb-4">Automated Incident Classification</h3>
              <p className="text-muted-foreground">Classifies reports in seconds with explanations and full audit trails.</p>
            </div>
            <div className="md:col-span-2 flex items-center justify-center relative overflow-hidden">
              <img 
                ref={classificationImageRef}
                src="/incident_example.png" 
                alt="Automated Classification" 
                className={`w-full h-auto object-contain rounded-lg transition-all duration-1000 ${
                  isClassificationImageVisible 
                    ? 'opacity-100 scale-100 translate-x-0 translate-y-0' 
                    : 'opacity-0 scale-50 translate-x-1/4 translate-y-1/4 origin-bottom-right'
                }`}
              />
            </div>
          </div>
          <div className="h-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
              icon: "⏱️", // Stopwatch icon for real-time updates
                title: "Real-Time Clery Log Updates",
                description: "Automatically updates Clery logs, ensuring accuracy and compliance."
                },
                {
                icon: "✔️", // Checkmark icon for institution-specific learning
                title: "Institution-Specific Learning",
                description: "Adopts the unique policies of each university, refining based on feedback."
                },
                {
                icon: "👥", // Two-person icon for human-centric review
                title: "Human-Centric Review System",
                description: "Compliance officers retain final decision-making authority."
                }
                ].map((feature, index) => (
              <div 
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm animate-slide card-hover"
              style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="font-bold text-primary text-xl">{feature.icon}</span>
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section id="faq" className="bg-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">FAQ</h2>
            <p className="text-lg text-muted-foreground">
              Frequently Asked Questions.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-lg font-medium">
                Can Salus integrate with my current RMS?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! Our system integrates with leading Records Management Systems (RMS) to pull incident data automatically.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-lg font-medium">
                How long does it take to implement Salus?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Implementation varies by institution, but most universities are fully onboarded within a few weeks. Our team ensures a smooth transition with minimal disruption.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-lg font-medium">
                Is Salus FERPA compliant?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, Salus is FERPA compliant. Our platform automatically redacts FERPA-sensitive information from reports and records, ensuring that student privacy is protected while maintaining compliance with federal regulations. Salus is designed to help universities securely manage public safety data without risking unauthorized access to protected student information.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left text-lg font-medium">
                Is my data secure?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes. We use end-to-end encryption, secure cloud storage, and strict access controls to protect your institution's data.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      
      {/* Contact Us Section */}
      <section id="contact-us" className="bg-secondary/30 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <ContactForm />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-secondary py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <span className="text-lg font-semibold">© Salus Solutions Inc. 2025</span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8">
              <div>
                <h4 className="font-semibold mb-3">Platform</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#features" className="text-muted-foreground hover:text-primary">Features</a></li>
                  <li><a href="#faq" className="text-muted-foreground hover:text-primary">FAQ</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="https://calendly.com/george-trysalus" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">Book a Demo</a></li>
                  <li><a href="#contact-us" className="text-muted-foreground hover:text-primary">Contact Us</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
