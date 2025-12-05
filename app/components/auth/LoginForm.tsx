"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface LoginFormProps {
  onSuccess?: (user: { id: string; name: string }) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, refreshUser } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !password) {
      setError("Please enter both name and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(name, password);

      if (!result.success) {
        setError(result.error || "Login failed.");
        setLoading(false);
        return;
      }

      // Refresh user state after successful login
      await refreshUser();
      
      // Get user from a fresh fetch to ensure we have the latest data
      try {
        const meRes = await fetch('/api/me', {
          credentials: 'include',
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) {
            onSuccess?.({ id: meData.user.id, name: meData.user.name });
          }
        }
      } catch (err) {
        console.error('Error fetching user after login:', err);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#A3A3A3] mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] transition-all"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your username"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#A3A3A3] mb-2">
          Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#262626] rounded-lg text-white placeholder-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] transition-all"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 netflix-red text-white rounded-lg font-semibold netflix-red-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

