import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TierBadge } from '@/components/ui/tier-badge';
import { ConditionBadge } from '@/components/ui/condition-badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, SlidersHorizontal, Package, FileText } from 'lucide-react';

interface Listing {
  id: string;
  model: string;
  reference_number: string;
  year_produced: number | null;
  condition: 'unworn' | 'excellent' | 'very_good' | 'good' | 'fair';
  has_box: boolean;
  has_papers: boolean;
  asking_price: number;
  currency: string;
  seller_id: string;
  brands: { name: string } | null;
  profiles: { 
    full_name: string | null;
    user_id: string;
  } | null;
  seller_role: 'admin' | 'observer' | 'individual_seller' | 'super_seller';
}

interface Brand {
  id: string;
  name: string;
}

export default function Browse() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    fetchBrands();
    fetchListings();
  }, [selectedBrand, selectedCondition, sortBy]);

  const fetchBrands = async () => {
    const { data } = await supabase
      .from('brands')
      .select('id, name')
      .eq('is_active', true)
      .order('display_order');
    
    if (data) setBrands(data);
  };

  const fetchListings = async () => {
    setLoading(true);
    
    let query = supabase
      .from('listings')
      .select(`
        id,
        model,
        reference_number,
        year_produced,
        condition,
        has_box,
        has_papers,
        asking_price,
        currency,
        seller_id,
        brands (name)
      `)
      .eq('status', 'approved');

    if (selectedBrand !== 'all') {
      query = query.eq('brand_id', selectedBrand);
    }

    if (selectedCondition !== 'all') {
      query = query.eq('condition', selectedCondition as 'unworn' | 'excellent' | 'very_good' | 'good' | 'fair');
    }

    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'price_low') {
      query = query.order('asking_price', { ascending: true });
    } else if (sortBy === 'price_high') {
      query = query.order('asking_price', { ascending: false });
    }

    const { data } = await query;
    
    if (data) {
      // Fetch seller profiles and roles separately
      const listingsWithSellers = await Promise.all(
        data.map(async (listing) => {
          const [{ data: profileData }, { data: roleData }] = await Promise.all([
            supabase
              .from('profiles')
              .select('full_name, user_id')
              .eq('user_id', listing.seller_id)
              .maybeSingle(),
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', listing.seller_id)
              .maybeSingle()
          ]);
          
          return {
            ...listing,
            profiles: profileData,
            seller_role: roleData?.role || 'individual_seller'
          };
        })
      );
      setListings(listingsWithSellers as unknown as Listing[]);
    }
    setLoading(false);
  };

  const filteredListings = listings.filter((listing) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      listing.model.toLowerCase().includes(searchLower) ||
      listing.reference_number.toLowerCase().includes(searchLower) ||
      listing.brands?.name.toLowerCase().includes(searchLower)
    );
  });

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Layout>
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-medium mb-4">Browse Exchange</h1>
          <p className="text-muted-foreground">
            Verified listings from authenticated sellers.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by brand, model, or reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-4">
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="unworn">Unworn</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="very_good">Very Good</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-border p-6 animate-pulse">
                <div className="aspect-square bg-muted mb-4" />
                <div className="h-4 bg-muted mb-2 w-1/3" />
                <div className="h-6 bg-muted mb-2 w-2/3" />
                <div className="h-4 bg-muted w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground mb-4">No listings found matching your criteria.</p>
            <Button variant="outline" onClick={() => {
              setSearch('');
              setSelectedBrand('all');
              setSelectedCondition('all');
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Link 
                key={listing.id} 
                to={`/listing/${listing.id}`}
                className="group border border-border bg-card hover:border-primary/50 transition-colors"
              >
                {/* Placeholder image */}
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">
                    {listing.brands?.name}
                  </span>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {listing.brands?.name}
                    </span>
                    <ConditionBadge condition={listing.condition} />
                  </div>
                  
                  <h3 className="font-serif text-lg font-medium mb-1 group-hover:text-primary transition-colors">
                    {listing.model}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    Ref. {listing.reference_number}
                    {listing.year_produced && ` • ${listing.year_produced}`}
                  </p>
                  
                  <div className="flex items-center gap-3 mb-4">
                    {listing.has_box && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Package className="h-3 w-3" />
                        <span>Box</span>
                      </div>
                    )}
                    {listing.has_papers && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>Papers</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="font-serif text-xl font-medium">
                      {formatPrice(listing.asking_price, listing.currency)}
                    </p>
                    <TierBadge tier={listing.seller_role} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
