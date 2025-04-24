import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFiles } from '@/context/FileContext';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, FileIcon, UserIcon, MailIcon, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

const Profile: React.FC = () => {
  const { user, logout, history, getHistory } = useFiles();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || '');
  const [lastName, setLastName] = useState(user?.user_metadata?.last_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/auth');
      return;
    }

    // Load history
    setLoading(true);
    getHistory()
      .finally(() => setLoading(false));
  }, [user, navigate, getHistory]);

  useEffect(() => {
    // Update state when user changes
    setFirstName(user?.user_metadata?.first_name || '');
    setLastName(user?.user_metadata?.last_name || '');
    setAvatarUrl(user?.user_metadata?.avatar_url || '');
  }, [user]);

  const handleHistoryItemClick = (historyId: string) => {
    navigate(`/history/${historyId}`);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
        },
      });

      if (error) throw error;

      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      toast.success('Password reset link sent', {
        description: 'Check your email to reset your password',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send password reset link');
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 pb-20">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-semibold mb-2">My Profile</h2>
          <p className="text-muted-foreground">
            View and manage your account settings
          </p>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-8 animate-slide-up">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="history">Story History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View and update your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar Display */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} />
                    <AvatarFallback>{(firstName || user?.email)?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {firstName} {lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} className="text-primary" />
                      <span className="text-sm font-medium">First Name</span>
                    </div>
                    {editMode ? (
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                      />
                    ) : (
                      <div className="bg-secondary/50 p-3 rounded-md">
                        {firstName || 'Not set'}
                      </div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <UserIcon size={16} className="text-primary" />
                      <span className="text-sm font-medium">Last Name</span>
                    </div>
                    {editMode ? (
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                      />
                    ) : (
                      <div className="bg-secondary/50 p-3 rounded-md">
                        {lastName || 'Not set'}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MailIcon size={16} className="text-primary" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-md">
                      {user?.email}
                    </div>
                  </div>

                  {/* Account Created */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} className="text-primary" />
                      <span className="text-sm font-medium">Account Created</span>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-md">
                      {user?.created_at ? format(new Date(user.created_at), 'PPpp') : 'N/A'}
                    </div>
                  </div>

                  {/* Avatar URL (Editable) */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon size={16} className="text-primary" />
                      <span className="text-sm font-medium">Avatar URL</span>
                    </div>
                    {editMode ? (
                      <Input
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="Enter your avatar URL"
                      />
                    ) : (
                      <div className="bg-secondary/50 p-3 rounded-md truncate">
                        {avatarUrl || 'Not set'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex flex-wrap justify-end gap-3">
                  {editMode ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditMode(false);
                          // Reset fields to original values
                          setFirstName(user?.user_metadata?.first_name || '');
                          setLastName(user?.user_metadata?.last_name || '');
                          setAvatarUrl(user?.user_metadata?.avatar_url || '');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateProfile}
                        isLoading={isUpdating}
                      >
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setEditMode(true)}>
                      Edit Profile
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleChangePassword}>
                    Change Password
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      logout()
                        .then(() => {
                          toast.success('Logged out successfully');
                          navigate('/');
                        });
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Story Generation History</CardTitle>
                <CardDescription>
                  View and access your previously generated user stories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8">
                    <FileIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">No history found</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate some user stories to see them appear here
                    </p>
                    <Button onClick={() => navigate('/')}>Create Stories</Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {history.map((item) => (
                      <div 
                        key={item.id} 
                        className="py-4 cursor-pointer hover:bg-secondary/30 -mx-3 px-3 rounded-md transition-colors"
                        onClick={() => handleHistoryItemClick(item.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">
                              {format(new Date(item.timestamp), 'PPP')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(item.timestamp), 'p')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                              {item.stories.length} stories
                            </span>
                            <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                              {item.settings.criteriaCount} criteria/story
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.stories[0]?.title || 'Untitled story'}
                          {item.stories.length > 1 ? ` + ${item.stories.length - 1} more` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default Profile;
