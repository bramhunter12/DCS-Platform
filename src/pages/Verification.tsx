import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  ArrowRight,
  FileCheck,
  Camera,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

type VerificationStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

export default function Verification() {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<VerificationStatus>('not_started');
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setStatus(profile.kyc_status as VerificationStatus);
    }
  }, [profile]);

  // Check for completed verification from return URL
  useEffect(() => {
    if (searchParams.get('completed') === 'true') {
      checkVerificationStatus();
    }
  }, [searchParams]);

  const checkVerificationStatus = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-verification-status');
      
      if (error) throw error;
      
      if (data.status) {
        setStatus(data.status);
        if (data.verified_at) {
          setVerifiedAt(data.verified_at);
        }
        
        if (data.status === 'verified') {
          await refreshProfile();
          toast({
            title: 'Identity Verified',
            description: 'Your identity has been successfully verified.',
          });
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const startVerification = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-verification-session');
      
      if (error) throw error;
      
      if (data.url) {
        // Redirect to Stripe Identity verification
        window.location.href = data.url;
      } else if (data.status === 'verified') {
        setStatus('verified');
        toast({
          title: 'Already Verified',
          description: 'Your identity is already verified.',
        });
      }
    } catch (error) {
      console.error('Error starting verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to start verification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user || !profile) return null;

  return (
    <Layout>
      <div className="container py-12 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-primary mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-medium mb-4">
            Identity Verification
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Complete identity verification to build trust with buyers and unlock 
            full selling privileges on the exchange.
          </p>
        </div>

        {/* Status Card */}
        <div className="border border-border mb-8">
          <div className="p-6 border-b border-border bg-secondary/30">
            <h2 className="font-medium">Verification Status</h2>
          </div>
          <div className="p-6">
            <div className={cn(
              "flex items-center gap-4 p-4 border",
              status === 'verified' ? "border-green-500/30 bg-green-500/10" :
              status === 'pending' ? "border-yellow-500/30 bg-yellow-500/10" :
              status === 'rejected' ? "border-red-500/30 bg-red-500/10" :
              "border-border bg-secondary/30"
            )}>
              {status === 'verified' && (
                <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
              )}
              {status === 'pending' && (
                <Clock className="h-8 w-8 text-yellow-500 shrink-0" />
              )}
              {status === 'rejected' && (
                <AlertCircle className="h-8 w-8 text-red-500 shrink-0" />
              )}
              {status === 'not_started' && (
                <Shield className="h-8 w-8 text-muted-foreground shrink-0" />
              )}
              
              <div className="flex-1">
                <p className="font-medium">
                  {status === 'verified' && 'Verified'}
                  {status === 'pending' && 'Verification In Progress'}
                  {status === 'rejected' && 'Verification Failed'}
                  {status === 'not_started' && 'Not Started'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {status === 'verified' && (
                    verifiedAt 
                      ? `Verified on ${new Date(verifiedAt).toLocaleDateString()}`
                      : 'Your identity has been verified'
                  )}
                  {status === 'pending' && 'Your documents are being reviewed'}
                  {status === 'rejected' && 'Please try again with valid documents'}
                  {status === 'not_started' && 'Complete verification to start selling'}
                </p>
              </div>

              {isChecking && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {status === 'not_started' && (
                <Button 
                  onClick={startVerification} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      Start Verification
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}

              {status === 'pending' && (
                <>
                  <Button 
                    onClick={checkVerificationStatus} 
                    disabled={isChecking}
                    variant="outline"
                    className="flex-1"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Check Status'
                    )}
                  </Button>
                  <Button 
                    onClick={startVerification} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Continue Verification'
                    )}
                  </Button>
                </>
              )}

              {status === 'rejected' && (
                <Button 
                  onClick={startVerification} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      Try Again
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}

              {status === 'verified' && (
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  className="flex-1"
                >
                  Return to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* What's Required */}
        {status !== 'verified' && (
          <div className="border border-border">
            <div className="p-6 border-b border-border bg-secondary/30">
              <h2 className="font-medium">What You'll Need</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-primary flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Government-Issued ID</h3>
                  <p className="text-sm text-muted-foreground">
                    Passport, driver's license, or national ID card. 
                    The document must be valid and not expired.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-primary flex items-center justify-center shrink-0">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Selfie Photo</h3>
                  <p className="text-sm text-muted-foreground">
                    A live photo of your face to match against your ID document. 
                    This helps prevent identity fraud.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-primary flex items-center justify-center shrink-0">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Clear, Legible Photos</h3>
                  <p className="text-sm text-muted-foreground">
                    Ensure good lighting and that all text on your documents 
                    is clearly visible. Avoid glare and shadows.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Note */}
        <div className="mt-8 p-4 bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground text-center">
            Your documents are securely processed by Stripe Identity. 
            We do not store copies of your ID documents.
          </p>
        </div>
      </div>
    </Layout>
  );
}
