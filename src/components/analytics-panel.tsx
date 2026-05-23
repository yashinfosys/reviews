import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PlatformPoint = {
  platform: string;
  count: number;
  rating: number;
};

export function AnalyticsPanel({ data }: { data: PlatformPoint[] }) {
  const max = Math.max(...data.map((item) => item.count), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform-wise analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {data.map((item) => (
            <div key={item.platform}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">{item.platform}</span>
                <span className="text-slate-500">{item.count} reviews · {item.rating.toFixed(1)} avg</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
