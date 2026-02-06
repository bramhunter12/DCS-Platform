import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Watch, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Shield, 
  User, 
  Building2,
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SellerIntent = 'private_holder' | 'verified_dealer' | 'certified_partner' | null;

const steps = [
  { id: 1, name: 'Intent', description: 'Your selling role' },
  { id: 2, name: 'Details', description: 'Role confirmation' },
  { id: 3, name: 'Verification', description: 'Identity check' },
];

export default function SellerOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIntent, setSelectedIntent] = useState<SellerIntent>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, profile, role, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=signup');
    }
  }, [user, loading, navigate]);

  // If user already has a seller role, redirect to dashboard
  useEffect(() => {
    if (!loading && role && role !== 'observer' && role !== 'buyer') {
      navigate('/dashboard');
    }
  }, [role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const handleIntentSelect = (intent: SellerIntent) => {
    setSelectedIntent(intent);
  };

  const handleContinue = async () => {
    if (currentStep === 1 && selectedIntent) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // For now, just move to step 3 (verification info)
      // In production, this would trigger the actual role update for Private Holder
      // or initiate payment flow for paid tiers
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Complete onboarding - update role based on intent
      setIsSubmitting(true);
      try {
        // For Private Holder, they can sell immediately with observer role
        // The database functions already allow observers to sell
        if (selectedIntent === 'private_holder') {
          toast({
            title: 'Welcome, Private Holder',
            description: 'You can now list up to 3 watches on the exchange.',
          });
          navigate('/dashboard');
        } else if (selectedIntent === 'verified_dealer') {
          // Redirect to subscription setup (would integrate with Stripe)
          toast({
            title: 'Verified Dealer Application',
            description: 'You will be redirected to complete your subscription.',
          });
          navigate('/dashboard');
        } else if (selectedIntent === 'certified_partner') {
          // Redirect to partnership application
          toast({
            title: 'Partnership Application Received',
            description: 'Our team will review your application and contact you within 48 hours.',
          });
          navigate('/dashboard');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Watch className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-medium">Prestige Exchange</span>
          </Link>
          <Link 
            to="/dashboard" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </Link>
        </div>
      </header>

      <main className="container py-12 max-w-4xl">
        {/* Progress Steps */}
        <nav aria-label="Progress" className="mb-12">
          <ol className="flex items-center justify-center gap-8">
            {steps.map((step, stepIdx) => (
              <li key={step.name} className="relative flex items-center">
                <div 
                  className={cn(
                    "flex h-10 w-10 items-center justify-center border-2 transition-colors",
                    currentStep > step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={cn(
                    "text-sm font-medium",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div 
                    className={cn(
                      "hidden sm:block absolute left-full w-8 h-0.5 ml-3",
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Step 1: Intent Selection */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="font-serif text-3xl font-medium mb-4">
                How do you intend to sell?
              </h1>
              <p className="text-muted-foreground">
                Select the role that best describes your selling activity. 
                This determines your listing limits, fees, and available tools.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Private Holder */}
              <button
                onClick={() => handleIntentSelect('private_holder')}
                className={cn(
                  "text-left border p-6 transition-all hover:border-primary/50",
                  selectedIntent === 'private_holder' 
                    ? "border-primary bg-primary/5" 
                    : "border-border"
                )}
              >
                <User className="h-8 w-8 text-primary mb-4" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Free • 3.5% commission
                </p>
                <h3 className="font-serif text-xl font-medium mb-2">Private Holder</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selling a personal timepiece with no monthly commitment.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>1–3 active listings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Standard review queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Identity verification</span>
                  </li>
                </ul>
              </button>

              {/* Verified Dealer */}
              <button
                onClick={() => handleIntentSelect('verified_dealer')}
                className={cn(
                  "text-left border p-6 transition-all hover:border-primary/50 relative",
                  selectedIntent === 'verified_dealer' 
                    ? "border-primary bg-primary/5" 
                    : "border-border"
                )}
              >
                <div className="absolute -top-3 left-6 bg-primary text-primary-foreground px-3 py-1 text-xs uppercase tracking-widest">
                  Popular
                </div>
                <Shield className="h-8 w-8 text-primary mb-4" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  $50/month • 2.5% commission
                </p>
                <h3 className="font-serif text-xl font-medium mb-2">Verified Dealer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Repeat sellers who value speed, tools, and credibility.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Up to 25 active listings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Priority review queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Listing templates & tools</span>
                  </li>
                </ul>
              </button>

              {/* Certified Partner */}
              <button
                onClick={() => handleIntentSelect('certified_partner')}
                className={cn(
                  "text-left border p-6 transition-all hover:border-primary/50 bg-secondary",
                  selectedIntent === 'certified_partner' 
                    ? "border-primary" 
                    : "border-border"
                )}
              >
                <Building2 className="h-8 w-8 text-primary mb-4" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  $195/month • 0% commission
                </p>
                <h3 className="font-serif text-xl font-medium mb-2">Certified Partner</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Institutional-grade access for high-volume operations.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Unlimited listings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Branded storefront</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Advanced analytics</span>
                  </li>
                </ul>
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              All seller tiers participate in a 90-day zero-fee launch period.
            </p>
          </div>
        )}

        {/* Step 2: Role Confirmation */}
        {currentStep === 2 && selectedIntent && (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center">
              <h1 className="font-serif text-3xl font-medium mb-4">
                {selectedIntent === 'private_holder' && 'Private Holder'}
                {selectedIntent === 'verified_dealer' && 'Verified Dealer'}
                {selectedIntent === 'certified_partner' && 'Certified Exchange Partner'}
              </h1>
              <p className="text-muted-foreground">
                Review your selected role and understand what's expected.
              </p>
            </div>

            <div className="border border-border">
              <div className="p-6 border-b border-border bg-secondary/50">
                <h2 className="font-serif text-xl font-medium">Role Requirements</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 border border-primary flex items-center justify-center shrink-0">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Identity Verification</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete government ID verification to build trust with buyers. 
                      This is required for all sellers on the exchange.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 border border-primary flex items-center justify-center shrink-0">
                    <Watch className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Structured Listings</h3>
                    <p className="text-sm text-muted-foreground">
                      Each listing requires structured details: brand, model, reference number, 
                      condition, and a 6-photo documentation set.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 border border-primary flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Listing Approval</h3>
                    <p className="text-sm text-muted-foreground">
                      All listings undergo admin review before going live. 
                      This ensures every watch meets exchange standards.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role-specific details */}
            <div className="border border-border p-6">
              <h3 className="font-medium mb-4">Your Tier Includes</h3>
              
              {selectedIntent === 'private_holder' && (
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>1–3 active listings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>3.5% commission per sale</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Standard review queue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>No monthly commitment</span>
                  </div>
                </div>
              )}

              {selectedIntent === 'verified_dealer' && (
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Up to 25 active listings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>2.5% commission per sale</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Priority review queue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>$50/month subscription</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Listing templates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Basic performance insights</span>
                  </div>
                </div>
              )}

              {selectedIntent === 'certified_partner' && (
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Unlimited listings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>0% commission</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Priority verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>$195/month subscription</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Branded storefront</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Dedicated support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Early access to tools</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Verification Info */}
        {currentStep === 3 && (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center">
              <h1 className="font-serif text-3xl font-medium mb-4">
                Identity Verification
              </h1>
              <p className="text-muted-foreground">
                All sellers must complete identity verification. 
                This builds trust and protects the exchange community.
              </p>
            </div>

            <div className="border border-border">
              <div className="p-6 border-b border-border bg-secondary/50">
                <h2 className="font-serif text-xl font-medium">What You'll Need</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Government-Issued ID</h3>
                    <p className="text-sm text-muted-foreground">
                      Passport, driver's license, or national ID card. 
                      Must be valid and clearly readable.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Proof of Address</h3>
                    <p className="text-sm text-muted-foreground">
                      Utility bill, bank statement, or government letter dated within the last 3 months.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Selfie Verification</h3>
                    <p className="text-sm text-muted-foreground">
                      A live selfie to match against your ID photo. 
                      This confirms you are who you claim to be.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 p-6">
              <h3 className="font-medium mb-2">What Happens Next</h3>
              <p className="text-sm text-muted-foreground">
                {selectedIntent === 'private_holder' && (
                  <>After completing this step, you'll be able to create up to 3 listings. 
                  Verification typically completes within 24-48 hours.</>
                )}
                {selectedIntent === 'verified_dealer' && (
                  <>You'll be redirected to set up your $50/month subscription, then complete 
                  identity verification. Priority review ensures faster approval.</>
                )}
                {selectedIntent === 'certified_partner' && (
                  <>Our team will review your partnership application and contact you within 
                  48 hours. Priority verification is included with your tier.</>
                )}
              </p>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Your information is encrypted and processed securely through our verification partner.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
          {currentStep > 1 ? (
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          ) : (
            <Link to="/dashboard">
              <Button 
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          )}

          <Button 
            onClick={handleContinue}
            disabled={currentStep === 1 && !selectedIntent || isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/80"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : currentStep === 3 ? (
              selectedIntent === 'private_holder' ? (
                <>
                  Complete Setup
                  <Check className="h-4 w-4 ml-2" />
                </>
              ) : selectedIntent === 'verified_dealer' ? (
                <>
                  Continue to Subscription
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
