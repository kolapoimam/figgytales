
import React from 'react';
import { Button } from '@/components/Button';
import { useFiles } from '@/context/FileContext';
import { LogIn, LogOut } from 'lucide-react';

const LoginButton: React.FC = () => {
  const { user, login, logout } = useFiles();

  if (user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => logout()}
        className="flex items-center gap-2"
      >
        <LogOut size={16} />
        <span>Logout</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => login('google')}
      className="flex items-center gap-2"
    >
      <LogIn size={16} />
      <span>Sign in with Google</span>
    </Button>
  );
};

export default LoginButton;
