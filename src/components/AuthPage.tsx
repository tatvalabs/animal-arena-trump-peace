import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login Error",
            description: error.message || "Failed to sign in. Please check your credentials.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome back! 🎉",
            description: "You're successfully logged in."
          });
        }
      } else {
        const { error } = await signUp(email, password, username);
        if (error) {
          toast({
            title: "Sign Up Error",
            description: error.message || "Failed to create account. Please try again.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Account Created! 🎉",
            description: "You can now sign in with your credentials."
          });
          // Switch to login mode after successful signup
          setIsLogin(true);
          setPassword('');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-green-800">Ceasefire</h1>
          </div>
          <CardTitle className="text-xl">
            {isLogin ? 'Welcome Back' : 'Join Ceasefire'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter your email"
              />
            </div>
            
            {!isLogin && (
              <div>
                <Label htmlFor="username">Username (Optional)</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1"
                  placeholder="Choose a username"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter your password"
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword('');
              }}
              className="text-green-600 hover:underline"
              type="button"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;