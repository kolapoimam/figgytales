import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useFiles } from '@/context/FileContext';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, ArrowLeft, GitHub } from 'lucide-react';
import { cn } from '@/lib/utils';

// Google logo SVG component
const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" className="mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.33 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.01 20.76 7.74 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.74 1 4.01 3.24 2.18 6.07L5.04 8.9c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const Auth: React.FC = () => {
  const { user } = useFiles();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isResetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?reset=true`,
        });
        if (error) throw error;
        toast.success('Password reset link sent', {
          description: 'Check your email for a link to reset your password'
        });
        setIsResetMode(false);
      } else if (authMode === 'sign-in') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success('Signed in successfully');
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: `${window.location.origin}/auth?verification=true`,
          }
        });
        if (error) throw error;
        toast.success('Registration successful', {
          description: 'Please check your email to verify your account'
        });
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      redirectTo: `${window.location.origin}/auth?google=true`,
    });
    if (error) {
      toast.error(error.message || 'Google login failed');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('reset') === 'true') {
      toast.info('You can now reset your password');
    }
    if (params.get('verification') === 'true') {
      toast.info('Email verification successful', {
        description: 'You can now sign in with your account'
      });
    }
    if (params.get('google') === 'true') {
      toast.success('Google authentication successful, you can now sign in');
    }
  }, [location]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-md w-full mx-auto px-4 md:px-6 py-12">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {isResetMode ? 'Reset Password' : authMode === 'sign-in' ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-center">
              {isResetMode 
                ? 'Enter your email to receive a password reset link' 
                : authMode === 'sign-in' 
                  ? 'Sign in to your account to access your stories'
                  : 'Create a new account to save and share your stories'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isResetMode ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Send Reset Link
                </Button>
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    type="button" 
                    className="text-sm"
                    onClick={() => setIsResetMode(false)}
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Sign In
                  </Button>
                </div>
              </form>
            ) : (
              <Tabs
                value={authMode}
                onValueChange={(value) => setAuthMode(value as 'sign-in' | 'sign-up')}
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                  <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
                </TabsList>
                <TabsContent value="sign-in" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sign-in-email">Email</Label>
                      <Input
                        id="sign-in-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="sign-in-password">Password</Label>
                      </div>
                      <div className="relative">
                        <Input
                          id="sign-in-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={togglePasswordVisibility}
                          className="absolute right-0 top-0 h-full"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" isLoading={isLoading}>
                      Sign In
                    </Button>
                    <div className="text-center">
                      <Button 
                        variant="ghost" 
                        type="button" 
                        className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsResetMode(true)}
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  </form>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="w-full flex justify-center items-center"
                      onClick={handleGoogleSignIn}
                    >
                      <GoogleLogo />
                      Sign In with Google
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="sign-up" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sign-up-email">Email</Label>
                      <Input
                        id="sign-up-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} // Fixed typo: setEmail to setUsername
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sign-up-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="sign-up-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={togglePasswordVisibility}
                          className="absolute right-0 top-0 h-full"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" isLoading={isLoading}>
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Auth;
