
import React from 'react';
import { Button } from '@/components/Button';
import { useFiles } from '@/context/FileContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, User } from 'lucide-react';

const LoginButton: React.FC = () => {
  const { user } = useFiles();
  const navigate = useNavigate();

  if (user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2"
      >
        <User size={16} />
        <span>My Profile</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate('/auth')}
      className="flex items-center gap-2"
    >
      <LogIn size={16} />
      <span>Sign In</span>
    </Button>
  );
};

export default LoginButton;
