import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, MessageSquare, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  content: string;
  category: 'market_insights' | 'reference_guides' | 'authentication';
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
  comment_count: number;
}

const categoryLabels: Record<string, string> = {
  market_insights: 'Market Insights',
  reference_guides: 'Reference Guides',
  authentication: 'Authentication',
};

export default function Community() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  
  const selectedCategory = searchParams.get('category') || 'all';
  const canPost = role === 'individual_seller' || role === 'super_seller' || role === 'admin';

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    
    let query = supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        category,
        created_at,
        author_id
      `)
      .order('created_at', { ascending: false });

    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory as 'market_insights' | 'reference_guides' | 'authentication');
    }

    const { data } = await query;
    
    if (data) {
      // Fetch profiles and comment counts
      const postsWithData = await Promise.all(
        data.map(async (post) => {
          const [{ count }, { data: profileData }] = await Promise.all([
            supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id),
            supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', post.author_id)
              .maybeSingle()
          ]);
          
          return {
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            created_at: post.created_at,
            profiles: profileData,
            comment_count: count || 0,
          } as Post;
        })
      );
      setPosts(postsWithData);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="container py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="font-serif text-4xl font-medium mb-2">Community</h1>
            <p className="text-muted-foreground">
              Insights and discussions from verified members.
            </p>
          </div>
          
          {canPost && (
            <Link to="/community/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </Link>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSearchParams({})}
          >
            All
          </Button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSearchParams({ category: key })}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border border-border p-6 animate-pulse">
                <div className="h-4 bg-muted w-1/4 mb-3" />
                <div className="h-6 bg-muted w-2/3 mb-2" />
                <div className="h-4 bg-muted w-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 border border-border">
            <p className="text-muted-foreground mb-4">No posts yet in this category.</p>
            {canPost && (
              <Link to="/community/new">
                <Button>Be the First to Post</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/community/${post.id}`}
                className="block border border-border p-6 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs uppercase tracking-widest text-primary">
                    {categoryLabels[post.category]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    by {post.profiles?.full_name || 'Anonymous'}
                  </span>
                </div>
                
                <h2 className="font-serif text-xl font-medium mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {post.content}
                </p>
                
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{post.comment_count} comments</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Observer CTA */}
        {!canPost && (
          <div className="mt-12 bg-secondary border border-border p-8 text-center">
            <h3 className="font-serif text-xl font-medium mb-2">
              Join the Conversation
            </h3>
            <p className="text-muted-foreground mb-4">
              Upgrade to a seller account to post and comment in the community.
            </p>
            <Link to="/pricing">
              <Button>View Membership Tiers</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
