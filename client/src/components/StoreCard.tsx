import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Store {
  _id: string;
  name: string;
  category: 'store' | 'office';
  description?: string;
  bannerImageUrl?: string;
  buildingLevel: number;
  products: any[];
}

interface StoreCardProps {
  store: Store;
  onClick: () => void;
}

export default function StoreCard({ store, onClick }: StoreCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-300 overflow-hidden"
      onClick={onClick}
    >
      <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 relative overflow-hidden">
        {store.bannerImageUrl ? (
          <img
            src={store.bannerImageUrl}
            alt={store.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <span className="text-4xl">
              {store.category === 'store' ? '🛍️' : '🏢'}
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={store.category === 'store' ? 'default' : 'secondary'}>
            Level {store.buildingLevel}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{store.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 line-clamp-2">
          {store.description || 'Explore this store in our virtual mall'}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {store.products.length} products
          </span>
          <Badge variant="outline" className="text-xs">
            {store.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}