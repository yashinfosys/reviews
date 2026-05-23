export function DatabaseUnavailable() {
  return (
    <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
      Database not connected. Please configure DATABASE_URL in Vercel Environment Variables.
    </div>
  );
}
