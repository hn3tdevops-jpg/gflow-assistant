import { useCurrentUser } from '../hooks/useCurrentUser';

export default function SettingsPage() {
  const { userId } = useCurrentUser();

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Account</h1>
      <p className="text-sm text-gray-400">FGFlow Studio stores lyrics under your local user scope.</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current local owner id</p>
        <code className="text-sm text-emerald-300 break-all">{userId}</code>
      </div>
    </div>
  );
}
