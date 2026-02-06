import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PurchasedListing {
  id: string;
  model: string;
  reference_number: string;
  asking_price: number;
  currency: string;
  brands: { name: string } | null;
}

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<PurchasedListing | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');
  const listingId = searchParams.get('listing_id');

  useEffect(() => {
    if (listingId) {
      fetchListing();
    } else {
      setLoading(false);
    }
  }, [listingId]);

  const fetchListing = async () => {
    if (!listingId) return;

    const { data } = await supabase
      .from('listings')
      .select(`
        id,
        model,
        reference_number,
        asking_price,
        currency,
        brands (name)
      `)
      .eq('id', listingId)
      .maybeSingle();

    if (data) {
      setListing(data as PurchasedListing);
    }
    setLoading(false);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-lg mx-auto text-center">
          {/* Success icon */}
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>

          <h1 className="font-serif text-3xl font-medium mb-4">
            Purchase Successful
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Your payment has been processed. The seller will be notified and will ship your watch soon.
          </p>

          {/* Order details */}
          {listing && (
            <div className="bg-muted/50 border border-border p-6 mb-8 text-left">
              <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                Order Details
              </h2>
              
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-muted border border-border flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {listing.brands?.name}
                  </p>
                  <p className="font-medium">{listing.model}</p>
                  <p className="text-sm text-muted-foreground">
                    Ref. {listing.reference_number}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-serif text-lg font-medium">
                    {formatPrice(listing.asking_price, listing.currency)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* What's next */}
          <div className="bg-card border border-border p-6 mb-8 text-left">
            <h2 className="font-medium mb-4">What happens next?</h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">1</span>
                <span>The seller receives notification of your purchase</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-muted text-muted-foreground text-xs flex items-center justify-center flex-shrink-0">2</span>
                <span>Seller ships the watch with tracking information</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-muted text-muted-foreground text-xs flex items-center justify-center flex-shrink-0">3</span>
                <span>You receive and inspect the watch</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-muted text-muted-foreground text-xs flex items-center justify-center flex-shrink-0">4</span>
                <span>Confirm delivery to release payment to seller</span>
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/browse">Continue Browsing</Link>
            </Button>
          </div>

          {sessionId && (
            <p className="text-xs text-muted-foreground mt-8">
              Transaction ID: {sessionId.slice(0, 20)}...
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
