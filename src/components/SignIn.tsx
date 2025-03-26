// components/SignIn.tsx
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SignIn: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      onSuccess();
    } catch (error) {
      // Error is handled by useAuth via toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
};

export default SignIn;
