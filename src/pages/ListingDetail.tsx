import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { TierBadge } from '@/components/ui/tier-badge';
import { ConditionBadge } from '@/components/ui/condition-badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  FileText, 
  Shield, 
  ChevronLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface ListingDetail {
  id: string;
  model: string;
  reference_number: string;
  serial_number: string | null;
  year_produced: number | null;
  year_produced_end: number | null;
  condition: 'unworn' | 'excellent' | 'very_good' | 'good' | 'fair';
  has_box: boolean;
  has_papers: boolean;
  asking_price: number;
  currency: string;
  description: string | null;
  seller_id: string;
  status: string;
  brands: { name: string } | null;
  listing_photos: { storage_path: string; photo_type: string; display_order: number }[];
}

interface SellerInfo {
  full_name: string | null;
  kyc_status: string;
  role: 'admin' | 'observer' | 'individual_seller' | 'super_seller' | 'buyer';
}

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  useEffect(() => {
    // Show cancelled checkout message
    if (searchParams.get('checkout') === 'cancelled') {
      toast({
        title: "Checkout Cancelled",
        description: "Your purchase was not completed.",
        variant: "default",
      });
    }
  }, [searchParams]);

  const fetchListing = async () => {
    if (!id) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('listings')
      .select(`
        id,
        model,
        reference_number,
        serial_number,
        year_produced,
        year_produced_end,
        condition,
        has_box,
        has_papers,
        asking_price,
        currency,
        description,
        seller_id,
        status,
        brands (name),
        listing_photos (storage_path, photo_type, display_order)
      `)
      .eq('id', id)
      .eq('status', 'approved')
      .maybeSingle();

    if (error || !data) {
      setLoading(false);
      return;
    }

    setListing(data as ListingDetail);

    // Fetch seller info
    const [{ data: profileData }, { data: roleData }] = await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, kyc_status')
        .eq('user_id', data.seller_id)
        .maybeSingle(),
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.seller_id)
        .maybeSingle()
    ]);

    setSeller({
      full_name: profileData?.full_name || null,
      kyc_status: profileData?.kyc_status || 'not_started',
      role: roleData?.role || 'observer'
    });

    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase this watch.",
        variant: "destructive",
      });
      navigate('/auth?redirect=' + encodeURIComponent(`/listing/${id}`));
      return;
    }

    if (listing?.seller_id === user.id) {
      toast({
        title: "Cannot purchase",
        description: "You cannot purchase your own listing.",
        variant: "destructive",
      });
      return;
    }

    setPurchasing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { listingId: id }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "Failed to start checkout",
        variant: "destructive",
      });
      setPurchasing(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      unworn: 'Unworn',
      excellent: 'Excellent',
      very_good: 'Very Good',
      good: 'Good',
      fair: 'Fair'
    };
    return labels[condition] || condition;
  };

  const getPhotoUrl = (path: string) => {
    const { data } = supabase.storage.from('listing-photos').getPublicUrl(path);
    return data.publicUrl;
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

  if (!listing) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="text-center py-24">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="font-serif text-2xl font-medium mb-2">Listing Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This listing may have been sold or removed.
            </p>
            <Button onClick={() => navigate('/browse')}>
              Browse Listings
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const sortedPhotos = [...(listing.listing_photos || [])].sort(
    (a, b) => a.display_order - b.display_order
  );

  return (
    <Layout>
      <div className="container py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/browse')}
          className="mb-6 -ml-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Browse
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-square bg-muted border border-border flex items-center justify-center">
              {sortedPhotos.length > 0 ? (
                <img
                  src={getPhotoUrl(sortedPhotos[selectedImage]?.storage_path)}
                  alt={`${listing.brands?.name} ${listing.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-muted-foreground">
                  {listing.brands?.name} {listing.model}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {sortedPhotos.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {sortedPhotos.map((photo, index) => (
                  <button
                    key={photo.storage_path}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-muted border transition-colors ${
                      selectedImage === index 
                        ? 'border-primary' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={getPhotoUrl(photo.storage_path)}
                      alt={photo.photo_type}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                {listing.brands?.name}
              </p>
              <h1 className="font-serif text-3xl font-medium mb-4">
                {listing.model}
              </h1>
              <p className="text-muted-foreground">
                Ref. {listing.reference_number}
              </p>
            </div>

            {/* Price */}
            <div className="border-y border-border py-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Asking Price
              </p>
              <p className="font-serif text-4xl font-medium">
                {formatPrice(listing.asking_price, listing.currency)}
              </p>
            </div>

            {/* Quick specs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Condition
                </p>
                <ConditionBadge condition={listing.condition} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Year
                </p>
                <p className="text-sm">
                  {listing.year_produced 
                    ? listing.year_produced_end 
                      ? `${listing.year_produced}-${listing.year_produced_end}`
                      : listing.year_produced
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Box
                </p>
                <div className="flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{listing.has_box ? 'Included' : 'Not included'}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Papers
                </p>
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{listing.has_papers ? 'Included' : 'Not included'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Description
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Seller info */}
            <div className="bg-muted/50 border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Seller
                  </p>
                  <p className="font-medium">
                    {seller?.full_name || 'Verified Seller'}
                  </p>
                </div>
                {seller && <TierBadge tier={seller.role} />}
              </div>
              
              {seller?.kyc_status === 'verified' && (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <Shield className="h-4 w-4" />
                  <span>Identity Verified</span>
                </div>
              )}
            </div>

            {/* Purchase button */}
            <Button 
              size="lg" 
              className="w-full h-14 text-base"
              onClick={handlePurchase}
              disabled={purchasing || listing.seller_id === user?.id}
            >
              {purchasing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : listing.seller_id === user?.id ? (
                'This is your listing'
              ) : (
                `Purchase for ${formatPrice(listing.asking_price, listing.currency)}`
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment processing. Funds held until delivery confirmed.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
