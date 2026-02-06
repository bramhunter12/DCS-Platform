import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Watch, RefreshCw, CheckCircle, XCircle, Eye } from 'lucide-react';

type ListingStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'sold' | 'archived';

interface Listing {
  id: string;
  model: string;
  reference_number: string;
  asking_price: number;
  currency: string;
  status: ListingStatus;
  created_at: string;
  seller_id: string;
  brand: { name: string } | null;
}

const STATUS_OPTIONS: { value: ListingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'draft', label: 'Draft' },
  { value: 'sold', label: 'Sold' },
  { value: 'archived', label: 'Archived' },
];

export function AdminListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('pending_review');
  const [updatingListing, setUpdatingListing] = useState<string | null>(null);
  
  // Rejection dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingListingId, setRejectingListingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('listings')
        .select(`
          id,
          model,
          reference_number,
          asking_price,
          currency,
          status,
          created_at,
          seller_id,
          brand:brands(name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setListings((data as unknown as Listing[]) || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const handleApprove = async (listingId: string) => {
    setUpdatingListing(listingId);
    try {
      const { error } = await supabase
        .from('listings')
        .update({ 
          status: 'approved' as ListingStatus,
          approved_at: new Date().toISOString(),
        })
        .eq('id', listingId);

      if (error) throw error;

      setListings(listings.map((l) =>
        l.id === listingId ? { ...l, status: 'approved' as ListingStatus } : l
      ));

      toast.success('Listing approved');
    } catch (error) {
      console.error('Error approving listing:', error);
      toast.error('Failed to approve listing');
    } finally {
      setUpdatingListing(null);
    }
  };

  const openRejectDialog = (listingId: string) => {
    setRejectingListingId(listingId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectingListingId) return;

    setUpdatingListing(rejectingListingId);
    try {
      const { error } = await supabase
        .from('listings')
        .update({ 
          status: 'rejected' as ListingStatus,
          rejection_reason: rejectionReason || null,
        })
        .eq('id', rejectingListingId);

      if (error) throw error;

      setListings(listings.map((l) =>
        l.id === rejectingListingId ? { ...l, status: 'rejected' as ListingStatus } : l
      ));

      toast.success('Listing rejected');
      setRejectDialogOpen(false);
    } catch (error) {
      console.error('Error rejecting listing:', error);
      toast.error('Failed to reject listing');
    } finally {
      setUpdatingListing(null);
      setRejectingListingId(null);
    }
  };

  const filteredListings = listings.filter((listing) =>
    listing.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.brand?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeVariant = (status: ListingStatus) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending_review': return 'secondary';
      case 'rejected': return 'destructive';
      case 'sold': return 'outline';
      default: return 'outline';
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Watch className="h-5 w-5 text-primary" />
          <h2 className="font-serif text-xl font-medium">Listing Moderation</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchListings}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by model, reference, or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as ListingStatus | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Listings Table */}
      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Watch</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading listings...
                </TableCell>
              </TableRow>
            ) : filteredListings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No listings found
                </TableCell>
              </TableRow>
            ) : (
              filteredListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{listing.brand?.name}</p>
                      <p className="text-sm text-muted-foreground">{listing.model}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {listing.reference_number}
                  </TableCell>
                  <TableCell>
                    {formatPrice(listing.asking_price, listing.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(listing.status)}>
                      {listing.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {listing.status === 'pending_review' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApprove(listing.id)}
                            disabled={updatingListing === listing.id}
                            title="Approve"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openRejectDialog(listing.id)}
                            disabled={updatingListing === listing.id}
                            title="Reject"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Listing</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this listing. This will be visible to the seller.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={updatingListing !== null}
            >
              Reject Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
