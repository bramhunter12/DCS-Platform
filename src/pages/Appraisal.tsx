import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { getWatchBaseData } from '@/api/watchbase';
import { getWatchAnalyticsData } from '@/api/watchanalytics';
import { getEbayData } from '@/api/ebay';
import { Skeleton } from '@/components/ui/skeleton';

export default function Appraisal() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchBaseData, setWatchBaseData] = useState<any>(null);
  const [watchAnalyticsData, setWatchAnalyticsData] = useState<any>(null);
  const [ebayData, setEbayData] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setSearched(true);
    setError(null);
    setWatchBaseData(null);
    setWatchAnalyticsData(null);
    setEbayData(null);

    try {
      const [wbData, waData, edata] = await Promise.all([
        getWatchBaseData(query),
        getWatchAnalyticsData(query),
        getEbayData(query),
      ]);
      setWatchBaseData(wbData);
      setWatchAnalyticsData(waData);
      setEbayData(edata);
    } catch (err) {
      console.error("Error fetching watch data:", err);
      setError('Failed to fetch watch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderWatchBaseContent = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      );
    }
    if (!watchBaseData) {
      return <p className="text-sm text-gray-500">{searched && !error ? 'No data found.' : 'Technical specs will appear here.'}</p>;
    }
    return (
      <ul className="space-y-2">
        {Object.entries(watchBaseData.specs).map(([key, value]) => (
          <li key={key} className="flex justify-between text-sm">
            <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span>
            <span>{String(value)}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderWatchAnalyticsContent = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      );
    }
    if (!watchAnalyticsData) {
      return <p className="text-sm text-gray-500">{searched && !error ? 'No data found.' : 'Market trends will appear here.'}</p>;
    }
    return (
      <ul className="space-y-2">
        {Object.entries(watchAnalyticsData.market_trends).map(([key, value]) => (
          <li key={key} className="flex justify-between text-sm">
            <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span>
            <span>{String(value)}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderEbayContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </div>
      );
    }
    if (!ebayData || ebayData.recent_sales.length === 0) {
      return <p className="text-sm text-gray-500">{searched && !error ? 'No data found.' : 'Recent sales will appear here.'}</p>;
    }
    return (
      <ul className="space-y-4">
        {ebayData.recent_sales.map((sale: any) => (
          <li key={sale.id} className="border-b pb-2 last:border-b-0">
            <p className="font-semibold text-sm">{sale.title}</p>
            <div className="flex justify-between text-xs text-gray-600">
              <span>{sale.price}</span>
              <span>{sale.date}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            <span className="block">Watch Appraisal</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Get a comprehensive appraisal of your timepiece using real-time market data.
          </p>
        </div>

        <div className="mt-12 max-w-lg mx-auto">
          <form onSubmit={handleSearch} className="sm:flex">
            <Input
              type="search"
              placeholder="Enter watch model or reference..."
              className="w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto" disabled={loading}>
              {loading ? 'Searching...' : <><Search className="mr-2 h-4 w-4" /> Search</>}
            </Button>
          </form>
        </div>

        {error && (
          <div className="mt-8 max-w-lg mx-auto">
            <Alert variant="destructive">
              <AlertDescription className="flex justify-between items-center">
                {error}
                <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>WatchBase Specs</CardTitle>
            </CardHeader>
            <CardContent>
              {renderWatchBaseContent()}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>WatchAnalytics Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {renderWatchAnalyticsContent()}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>eBay Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {renderEbayContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}