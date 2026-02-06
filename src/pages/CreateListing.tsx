import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { PhotoUpload, PhotoType, PHOTO_SLOTS } from '@/components/listing/PhotoUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Database } from '@/integrations/supabase/types';

type WatchCondition = Database['public']['Enums']['watch_condition'];

const CONDITIONS: { value: WatchCondition; label: string; description: string }[] = [
  { value: 'unworn', label: 'Unworn', description: 'Never worn, with all original tags and stickers' },
  { value: 'excellent', label: 'Excellent', description: 'Minimal signs of wear, near-mint condition' },
  { value: 'very_good', label: 'Very Good', description: 'Light wear consistent with occasional use' },
  { value: 'good', label: 'Good', description: 'Visible wear but fully functional' },
  { value: 'fair', label: 'Fair', description: 'Significant wear, may need service' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CHF', label: 'CHF' },
];

const listingSchema = z.object({
  brand_id: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required').max(100),
  reference_number: z.string().min(1, 'Reference number is required').max(50),
  serial_number: z.string().max(50).optional(),
  year_produced: z.number().min(1900).max(new Date().getFullYear()).optional(),
  year_produced_end: z.number().min(1900).max(new Date().getFullYear()).optional(),
  condition: z.enum(['unworn', 'excellent', 'very_good', 'good', 'fair']),
  has_box: z.boolean(),
  has_papers: z.boolean(),
  asking_price: z.number().min(100, 'Minimum price is $100'),
  currency: z.string().min(1),
  description: z.string().max(2000, 'Description must be under 2000 characters').optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

export default function CreateListing() {
  const { user, role, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<Record<PhotoType, File | null>>({
    dial: null,
    caseback: null,
    side: null,
    clasp: null,
    box: null,
    papers: null,
  });

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      brand_id: '',
      model: '',
      reference_number: '',
      serial_number: '',
      condition: 'excellent',
      has_box: false,
      has_papers: false,
      asking_price: undefined,
      currency: 'USD',
      description: '',
    },
  });

  const hasBox = form.watch('has_box');
  const hasPapers = form.watch('has_papers');

  // Fetch brands
  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const canSell = role === 'individual_seller' || role === 'super_seller' || role === 'admin';

  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted w-1/3" />
            <div className="h-96 bg-muted" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!canSell) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-serif text-2xl font-medium mb-4">
              Seller Account Required
            </h1>
            <p className="text-muted-foreground mb-6">
              You need a seller account to create listings on the exchange.
            </p>
            <Button onClick={() => navigate('/pricing')}>
              View Membership Tiers
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handlePhotoChange = (type: PhotoType, file: File | null) => {
    setPhotos(prev => ({ ...prev, [type]: file }));
  };

  const validatePhotos = (): boolean => {
    const requiredPhotos: PhotoType[] = ['dial', 'caseback', 'side', 'clasp'];
    if (hasBox) requiredPhotos.push('box');
    if (hasPapers) requiredPhotos.push('papers');

    for (const type of requiredPhotos) {
      if (!photos[type]) {
        toast({
          title: 'Missing Photo',
          description: `Please upload a ${PHOTO_SLOTS.find(s => s.type === type)?.label} photo.`,
          variant: 'destructive',
        });
        return false;
      }
    }
    return true;
  };

  const uploadPhoto = async (listingId: string, type: PhotoType, file: File, order: number): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${listingId}/${type}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('listing-photos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Save photo record
    const { error: dbError } = await supabase
      .from('listing_photos')
      .insert({
        listing_id: listingId,
        storage_path: fileName,
        photo_type: type,
        display_order: order,
      });

    if (dbError) throw dbError;

    return fileName;
  };

  const onSubmit = async (data: ListingFormData) => {
    if (!user) return;
    if (!validatePhotos()) return;

    setSubmitting(true);
    try {
      // Create listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          seller_id: user.id,
          brand_id: data.brand_id,
          model: data.model,
          reference_number: data.reference_number,
          serial_number: data.serial_number || null,
          year_produced: data.year_produced || null,
          year_produced_end: data.year_produced_end || null,
          condition: data.condition,
          has_box: data.has_box,
          has_papers: data.has_papers,
          asking_price: data.asking_price,
          currency: data.currency,
          description: data.description || null,
          status: 'pending_review',
        })
        .select('id')
        .single();

      if (listingError) throw listingError;

      // Upload photos
      const photoTypes: PhotoType[] = ['dial', 'caseback', 'side', 'clasp'];
      if (hasBox && photos.box) photoTypes.push('box');
      if (hasPapers && photos.papers) photoTypes.push('papers');

      for (let i = 0; i < photoTypes.length; i++) {
        const type = photoTypes[i];
        const file = photos[type];
        if (file) {
          await uploadPhoto(listing.id, type, file, i + 1);
        }
      }

      toast({
        title: 'Listing Submitted',
        description: 'Your listing has been submitted for review.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </button>
            <h1 className="font-serif text-3xl font-medium">Create Listing</h1>
            <p className="text-muted-foreground mt-2">
              All listings are reviewed before going live on the exchange.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              {/* Watch Details */}
              <div className="space-y-6">
                <h2 className="font-serif text-xl font-medium border-b border-border pb-4">
                  Watch Details
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="brand_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Submariner Date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="reference_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 126610LN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serial_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number</FormLabel>
                        <FormControl>
                          <Input placeholder="For verification only" {...field} />
                        </FormControl>
                        <FormDescription>
                          Visible on caseback photo for verification
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="year_produced"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Produced</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 2023"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter a single year or start of range
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year_produced_end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Range End (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 2024"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          If year is estimated range
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CONDITIONS.map((condition) => (
                            <SelectItem key={condition.value} value={condition.value}>
                              <div>
                                <span className="font-medium">{condition.label}</span>
                                <span className="text-muted-foreground ml-2">
                                  — {condition.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-6 p-6 bg-secondary">
                  <FormField
                    control={form.control}
                    name="has_box"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 cursor-pointer">
                          Includes Original Box
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="has_papers"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 cursor-pointer">
                          Includes Papers/Warranty
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-6">
                <h2 className="font-serif text-xl font-medium border-b border-border pb-4">
                  Pricing
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="asking_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asking Price *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CURRENCIES.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-6">
                <h2 className="font-serif text-xl font-medium border-b border-border pb-4">
                  Description
                </h2>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide any additional details about the watch, its history, or included accessories..."
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum 2000 characters. No markdown or HTML.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Photos */}
              <div className="space-y-6">
                <h2 className="font-serif text-xl font-medium border-b border-border pb-4">
                  Photos
                </h2>

                <PhotoUpload
                  photos={photos}
                  onPhotoChange={handlePhotoChange}
                  hasBox={hasBox}
                  hasPapers={hasPapers}
                />
              </div>

              {/* Submit */}
              <div className="border-t border-border pt-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Your listing will be reviewed within 24-48 hours.
                  </p>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Submit for Review
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
