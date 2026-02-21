import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-black text-white">
        <div className="container">
          <div className="flex items-center gap-12">
          <div className="max-w-3xl flex-1">
            <p className="text-sm uppercase tracking-widest text-primary mb-4">
              The Prestige Watch Exchange
            </p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-medium leading-tight mb-6">
              Where Trust Meets{' '}
              <span className="text-primary">Exceptional</span> Timepieces
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-2xl">
              A curated exchange for serious collectors. Every seller verified. 
              Every listing authenticated. Every transaction protected.
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-nowrap gap-4">
              <Link to="/browse">
                <Button size="lg" className="text-base px-8 bg-primary text-primary-foreground hover:bg-primary/80">
                  Browse Exchange
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="lg" variant="outline" className="text-base px-8 border-white bg-white text-black hover:bg-white/90 hover:text-black">
                  Become a Seller
                </Button>
              </Link>
              <Link to="/community">
                <Button size="lg" variant="outline" className="text-base px-8 border-white bg-white text-black hover:bg-white/90 hover:text-black">
                  Forums
                </Button>
              </Link>
              <Link to="/appraisal-tool">
                <Button size="lg" variant="outline" className="text-base px-8 border-white bg-white text-black hover:bg-white/90 hover:text-black">
                  Watch Appraisal Tool
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex flex-shrink-0 items-center justify-center">
            <img src="/DCSLogo.png" alt="DCS Logo" className="w-[620px] h-[620px] object-contain" />
          </div>
          </div>
        </div>
        
        {/* Decorative element */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-[600px] bg-gradient-to-l from-muted/50 to-transparent pointer-events-none" />
      </section>

    </Layout>
  );
}
