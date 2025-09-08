'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { FcGoogle } from 'react-icons/fc';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { login, register, loginWithGoogle } = useAuth(); 
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

  const handleAuthAction = async (e: React.FormEvent, action: 'login' | 'register') => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (action === 'login') {
        await login(loginData.email, loginData.password);
        toast({ title: "Welcome back 👋", description: "Logged in successfully!" });
      } else {
        if (registerData.password !== registerData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await register(registerData.email, registerData.password);
        toast({ title: "Success ✅", description: "Account created successfully!" });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      onOpenChange(false);
      toast({ title: "Welcome 🚀", description: "Signed in with Google successfully!" });
    } catch (error: any) {
      toast({ title: "Google Sign-In Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const commonButtonClasses = "w-full transition-transform transform active:scale-95";
  const inputWrapperClasses = "relative";
  const inputClasses = "bg-slate-800/50 border-slate-700 h-12 pl-12 text-base focus:border-blue-500 focus:ring-blue-500";
  const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-[95vw] p-0 bg-slate-900 border-slate-800 rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        
        {/* Kolom Kiri: Branding & Visual */}
        <div className="hidden md:flex flex-col justify-center items-center p-12 bg-slate-800/50 border-r border-slate-800">
          <h1 className="text-4xl font-bold text-white mb-4">
            Study <span className="text-blue-400">War!</span>
          </h1>
          <p className="text-slate-400 text-center max-w-xs">
            Unlock your potential. Track your progress, stay focused, and conquer your goals.
          </p>
          
        </div>

        {/* Kolom Kanan: Form Login/Register */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto">
            <h2 className="text-3xl font-bold text-white mb-2">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 mb-8">
              {activeTab === 'login' ? 'Please enter your details to sign in.' : 'Let\'s get you started!'}
            </p>

            {activeTab === 'login' ? (
              // FORM LOGIN
              <form onSubmit={(e) => handleAuthAction(e, 'login')} className="space-y-6">
                <div className={inputWrapperClasses}>
                  <Mail className={iconClasses} />
                  <Input id="login-email" type="email" placeholder="Email" value={loginData.email} onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))} className={inputClasses} required />
                </div>
                <div className={inputWrapperClasses}>
                  <Lock className={iconClasses} />
                  <Input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={loginData.password} onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))} className={inputClasses} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <Button type="submit" className={`${commonButtonClasses} bg-blue-600 hover:bg-blue-700 h-12 text-base`} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            ) : (
              // FORM REGISTER
              <form onSubmit={(e) => handleAuthAction(e, 'register')} className="space-y-6">
                <div className={inputWrapperClasses}>
                  <Mail className={iconClasses} />
                  <Input id="register-email" type="email" placeholder="Email" value={registerData.email} onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))} className={inputClasses} required />
                </div>
                <div className={inputWrapperClasses}>
                  <Lock className={iconClasses} />
                  <Input id="register-password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={registerData.password} onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))} className={inputClasses} required />
                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className={inputWrapperClasses}>
                  <Lock className={iconClasses} />
                  <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={registerData.confirmPassword} onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))} className={inputClasses} required />
                   <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <Button type="submit" className={`${commonButtonClasses} bg-blue-600 hover:bg-blue-700 h-12 text-base`} disabled={isLoading}>
                   {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-700" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500">Or continue with</span></div>
            </div>

            <Button onClick={handleGoogleLogin} variant="outline" className={`${commonButtonClasses} border-slate-700 hover:bg-slate-800 h-12 text-base`} disabled={isLoading}>
              <FcGoogle className="mr-3 text-2xl" />
              Sign in with Google
            </Button>

            <p className="mt-8 text-center text-sm text-slate-400">
              {activeTab === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')} className="font-semibold text-blue-400 hover:underline ml-2">
                {activeTab === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}