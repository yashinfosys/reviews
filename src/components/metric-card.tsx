import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-slate-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {note ? <p className="mt-2 text-sm text-slate-500">{note}</p> : null}
      </CardContent>
    </Card>
  );
}
