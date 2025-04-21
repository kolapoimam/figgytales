
import React, { useEffect, useState, useRef } from 'react';
import FileUploader from '@/components/FileUploader';
import PreviewGrid from '@/components/PreviewGrid';
import Header from '@/components/Header';
import SettingsPanel from '@/components/SettingsPanel';
import RoadmapSection from '@/components/RoadmapSection';
import Footer from '@/components/Footer';
import { useFiles } from '@/context/FileContext';
import { Button } from '@/components/ui/button';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Sparkles, 
  MousePointer, 
  RefreshCw, 
  Lightbulb, 
  Zap,
  Bot,
  Upload,
  FileSymlink,
  ChevronDown
} from 'lucide-react';

const Index: React.FC = () => {
  const { clearFiles } = useFiles();
  const [showUploader, setShowUploader] = useState(false);
  const uploaderRef = useRef<HTMLDivElement>(null);
  
  // Clear any existing stories when component mounts
  useEffect(() => {
    clearFiles();
  }, [clearFiles]);
  
  const scrollToUploader = () => {
    setShowUploader(true);
    setTimeout(() => {
      uploaderRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  const carouselImages = [
    {
      src: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2070&auto=format&fit=crop",
      alt: "UI Design elements with user stories",
      title: "Transform UI designs into comprehensive user stories",
      description: "Upload your screens and let AI do the heavy lifting"
    },
    {
      src: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=2070&auto=format&fit=crop",
      alt: "Team collaboration",
      title: "Streamline your agile development process",
      description: "Get everyone on the same page with clear user stories and acceptance criteria"
    },
    {
      src: "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?q=80&w=2070&auto=format&fit=crop",
      alt: "AI generation concept",
      title: "Powered by cutting-edge AI",
      description: "Our intelligent algorithms understand design context and user needs"
    }
  ];
  
  const features = [
    {
      icon: <Bot className="h-10 w-10 text-orange-500" />,
      title: "AI-Powered Analysis",
      description: "Our advanced AI analyzes your design screens to extract meaningful user stories that capture the intended functionality."
    },
    {
      icon: <Zap className="h-10 w-10 text-orange-500" />,
      title: "Instant Generation",
      description: "Convert designs to user stories in seconds, not hours. Save valuable time in your agile process."
    },
    {
      icon: <RefreshCw className="h-10 w-10 text-orange-500" />,
      title: "Customizable Output",
      description: "Control the number of stories and acceptance criteria to match your team's needs and sprint planning."
    },
    {
      icon: <Lightbulb className="h-10 w-10 text-orange-500" />,
      title: "Context Awareness",
      description: "The AI understands design patterns and user flows, creating cohesive stories that make sense for your application."
    }
  ];
  
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 w-full mx-auto pb-20">
        {/* Hero Carousel Section */}
        <section className="relative">
          <Carousel className="w-full">
            <CarouselContent>
              {carouselImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-[70vh] w-full overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center" 
                      style={{ 
                        backgroundImage: `url(${image.src})`,
                        filter: 'brightness(0.7)'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-4xl">
                        {image.title}
                      </h1>
                      <p className="text-xl md:text-2xl text-white/90 max-w-2xl mb-8">
                        {image.description}
                      </p>
                      <Button 
                        onClick={scrollToUploader} 
                        size="lg" 
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Get Started
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute bottom-4 left-4 z-10">
              <CarouselPrevious className="bg-white/20 hover:bg-white/40 border-0" />
            </div>
            <div className="absolute bottom-4 right-4 z-10">
              <CarouselNext className="bg-white/20 hover:bg-white/40 border-0" />
            </div>
          </Carousel>
          
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div 
              className="animate-bounce bg-white/20 p-2 w-10 h-10 ring-1 ring-white/20 shadow-lg rounded-full flex items-center justify-center mb-4 cursor-pointer"
              onClick={scrollToUploader}
            >
              <ChevronDown className="h-6 w-6 text-white" />
            </div>
          </div>
        </section>
        
        {/* Key Features Section */}
        <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How FiggyTales Transforms Your Design Process</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Streamline your agile workflow by automatically generating user stories from your design mockups
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-secondary/30 p-6 rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-20 px-4 md:px-8 bg-secondary/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Three simple steps to transform your design mockups into comprehensive user stories
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Upload Your Designs</h3>
                <p className="text-muted-foreground">
                  Drag and drop up to 5 design screens or paste directly from your clipboard.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                  <MousePointer className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Configure Settings</h3>
                <p className="text-muted-foreground">
                  Choose how many stories and acceptance criteria you want to generate for each screen.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Generate Stories</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes your screens and instantly creates detailed user stories and acceptance criteria.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-20 px-4 md:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about using FiggyTales
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-medium">What file formats are supported?</AccordionTrigger>
              <AccordionContent>
                FiggyTales supports all major image formats including PNG, JPG, JPEG, SVG, and WEBP. 
                The maximum file size is 10MB per image, and you can upload up to 5 design screens at once.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-medium">How accurate are the generated user stories?</AccordionTrigger>
              <AccordionContent>
                Our AI is trained to identify UI patterns and infer user intentions from design elements. 
                The accuracy depends on the clarity of your designs and the level of detail they contain. 
                For best results, upload screens that clearly show user interactions and interface elements.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-medium">Can I customize the user story format?</AccordionTrigger>
              <AccordionContent>
                Yes, you can select the audience type (internal or external) and specify the user type in the settings panel. 
                You can also control the number of user stories and acceptance criteria generated for each design screen.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-medium">Is my design data secure?</AccordionTrigger>
              <AccordionContent>
                Yes, we take data security seriously. Your uploaded designs are processed securely and are not stored permanently on our servers. 
                All processing happens in isolated environments, and your designs are automatically deleted after story generation is complete.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-medium">Can I export the generated user stories?</AccordionTrigger>
              <AccordionContent>
                Yes, once stories are generated, you can export them in various formats, share them with your team, or save them for future reference. 
                We provide easy sharing options to integrate with your existing workflow tools.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
        
        {/* Get Started Section */}
        <div ref={uploaderRef} className={`max-w-5xl mx-auto px-4 md:px-6 transition-all duration-500 ease-in-out ${showUploader ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
          <div className="bg-secondary/30 p-8 rounded-xl mb-10 border border-border">
            <h2 className="text-2xl font-semibold mb-6 text-center">Get Started</h2>
            <FileUploader />
            <PreviewGrid />
            <SettingsPanel />
          </div>
          
          <RoadmapSection />
        </div>
        
        {!showUploader && (
          <section className="py-16 px-4 text-center">
            <Button 
              onClick={scrollToUploader} 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <FileSymlink className="mr-2 h-5 w-5" />
              Get Started Now
            </Button>
          </section>
        )}
      </div>
      
      <Footer />
    </main>
  );
};

export default Index;
