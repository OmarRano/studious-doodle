import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import StoreCard from '@/components/StoreCard';

interface Store {
  _id: string;
  name: string;
  category: 'store' | 'office';
  description?: string;
  bannerImageUrl?: string;
  buildingLevel: number;
  products: any[];
}

export default function BuildingView() {
  const [, navigate] = useLocation();
  const [stores, setStores] = useState<Store[]>([]);
  const [offices, setOffices] = useState<Store[]>([]);

  const { data: storesData, isLoading } = trpc.stores.list.useQuery({ limit: 50, offset: 0 });

  useEffect(() => {
    if (storesData) {
      const storeList = storesData.filter((s: Store) => s.category === 'store');
      const officeList = storesData.filter((s: Store) => s.category === 'office');
      setStores(storeList);
      setOffices(officeList);
    }
  }, [storesData]);

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading mall...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">🏬 SMART NETWORK MALL</h1>
          <p className="text-lg text-slate-600">Real-world building + dynamic marketing pitches</p>
        </div>

        {/* Level 1: Boutique Stores */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-slate-700 mb-8 flex items-center gap-2">
            🛍️ Level 1 · Boutique Stores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stores.map(store => (
              <StoreCard key={store._id} store={store} onClick={() => navigate(`/store/${store._id}`)} />
            ))}
          </div>
        </div>

        {/* Level 2: Offices & Creative Spaces */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-slate-700 mb-8 flex items-center gap-2">
            🏢 Level 2 · Offices & Creative Spaces
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {offices.map(office => (
              <StoreCard key={office._id} store={office} onClick={() => navigate(`/store/${office._id}`)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}