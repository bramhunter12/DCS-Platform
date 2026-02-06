import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { AdminListings } from '@/components/admin/AdminListings';
import { Shield } from 'lucide-react';

export default function Admin() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      navigate('/dashboard');
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted w-1/3" />
            <div className="h-48 bg-muted" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || role !== 'admin') return null;

  return (
    <Layout>
      <div className="container py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="font-serif text-3xl font-medium">Admin Panel</h1>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="listings">Listing Moderation</TabsTrigger>
            <TabsTrigger value="settings">Platform Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="listings">
            <AdminListings />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
