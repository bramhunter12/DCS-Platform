import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { TierBadge, Tier } from '@/components/ui/tier-badge';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Search, UserCog, RefreshCw } from 'lucide-react';

interface UserWithRole {
  user_id: string;
  email: string;
  full_name: string | null;
  kyc_status: string;
  subscription_status: string | null;
  zero_fee_eligible: boolean | null;
  role: Tier | null;
}

const ROLE_OPTIONS: { value: Tier; label: string }[] = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'observer', label: 'Private Holder' },
  { value: 'individual_seller', label: 'Verified Dealer' },
  { value: 'super_seller', label: 'Certified Partner' },
  { value: 'admin', label: 'Admin' },
];

export function AdminUserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, kyc_status, subscription_status, zero_fee_eligible')
        .order('email');

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles = profiles?.map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          role: (userRole?.role as Tier) || null,
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Tier) => {
    setUpdatingUser(userId);
    try {
      // Check if user has existing role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
        
        if (error) throw error;
      }

      // Update local state
      setUsers(users.map((u) => 
        u.user_id === userId ? { ...u, role: newRole } : u
      ));

      toast.success('Role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleZeroFeeToggle = async (userId: string, enabled: boolean) => {
    setUpdatingUser(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ zero_fee_eligible: enabled })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(users.map((u) => 
        u.user_id === userId ? { ...u, zero_fee_eligible: enabled } : u
      ));

      toast.success(`Zero-fee period ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating zero-fee status:', error);
      toast.error('Failed to update zero-fee status');
    } finally {
      setUpdatingUser(null);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getKycBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-primary" />
          <h2 className="font-serif text-xl font-medium">User Management</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchUsers}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>KYC Status</TableHead>
              <TableHead>Zero-Fee Period</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.full_name || 'No name'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role && <TierBadge tier={user.role} />}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getKycBadgeVariant(user.kyc_status)}>
                      {user.kyc_status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.zero_fee_eligible ?? false}
                      onCheckedChange={(checked) => handleZeroFeeToggle(user.user_id, checked)}
                      disabled={updatingUser === user.user_id}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role || undefined}
                      onValueChange={(value) => handleRoleChange(user.user_id, value as Tier)}
                      disabled={updatingUser === user.user_id}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Set role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
