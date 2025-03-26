// components/LoginButton.tsx
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
import SignIn from '@/components/SignIn';
import SignUp from '@/components/SignUp';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const LoginButton: React.FC = () => {
  const { user, logout } = useAuth();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const handleSignInSuccess = () => {
    setIsSignInOpen(false);
  };

  const handleSignUpSuccess = () => {
    setIsSignUpOpen(false);
  };

  return (
    <>
      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Hello, {user.name}</span>
          <Button variant="outline" onClick={logout}>
            Sign Out
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button onClick={() => setIsSignInOpen(true)}>
            Sign In
          </Button>
          <Button variant="outline" onClick={() => setIsSignUpOpen(true)}>
            Sign Up
          </Button>
        </div>
      )}

      {/* Sign In Dialog */}
      <Dialog open={isSignInOpen} onOpenChange={setIsSignInOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In to Your Account</DialogTitle>
          </DialogHeader>
          <SignIn onSuccess={handleSignInSuccess} />
        </DialogContent>
      </Dialog>

      {/* Sign Up Dialog */}
      <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create an Account</DialogTitle>
          </DialogHeader>
          <SignUp onSuccess={handleSignUpSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginButton;
