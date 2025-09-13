import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Pill, BookUser, Bot, LayoutDashboard, GanttChartSquare } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <Stethoscope className="h-10 w-10 text-primary" />,
    title: 'Role-Based Dashboards',
    description: 'Secure, tailored dashboards for Doctors, Admins, Pharmacists, and Receptionists.',
  },
  {
    icon: <GanttChartSquare className="h-10 w-10 text-primary" />,
    title: 'Real-Time Scheduling',
    description: 'Streamlined, real-time appointment booking and management system.',
  },
  {
    icon: <Pill className="h-10 w-10 text-primary" />,
    title: 'Medication Management',
    description: 'Efficiently track medicine stock with automated low-supply alerts.',
  },
  {
    icon: <Bot className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Summaries',
    description: 'Automatically summarize patient notes into structured data using AI.',
  },
  {
    icon: <LayoutDashboard className="h-10 w-10 text-primary" />,
    title: 'Dynamic Analytics',
    description: 'Vital stats at a glance: patient numbers, appointments, and bed occupancy.',
  },
  {
    icon: <BookUser className="h-10 w-10 text-primary" />,
    title: 'Patient Management',
    description: 'Comprehensive system for patient registration, records, and care history.',
  },
];

const Header = () => (
  <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-14 items-center">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
        <span className="font-headline">MediChain</span>
      </Link>
      <nav className="ml-auto flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </nav>
    </div>
  </header>
);

const Footer = () => (
    <footer className="border-t">
        <div className="container py-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                    <span className="font-headline">MediChain</span>
                </div>
                <p className="text-sm text-muted-foreground mt-4 md:mt-0">© 2024 MediChain. All rights reserved.</p>
            </div>
        </div>
    </footer>
);

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-medical-team');
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tight">
                The Future of Hospital Management is Here.
              </h1>
              <p className="text-lg text-muted-foreground">
                MediChain is an intelligent, all-in-one Hospital Medical Information System (HMIS) designed to streamline operations, enhance patient care, and empower medical professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/login">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  className="rounded-xl shadow-2xl"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </div>
          </div>
        </section>

        <section id="features" className="bg-muted py-20 md:py-24">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">A Comprehensive Solution</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                From patient intake to AI-driven insights, MediChain provides the tools you need for a modern healthcare facility.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="bg-background/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
