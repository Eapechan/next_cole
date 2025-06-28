import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Leaf, Loader2, Sun, Wind } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.email || !formData.password || !formData.role) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const success = await login(formData.email, formData.password, formData.role);
      if (success) {
        navigate("/");
      } else {
        setError("Invalid credentials. Please check your email, password, and role.");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center animated-bg p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 opacity-20">
          <Leaf className="w-16 h-16 text-green-600 float-animation" style={{ animationDelay: '0s' }} />
        </div>
        <div className="absolute top-40 right-20 opacity-20">
          <Sun className="w-20 h-20 text-yellow-500 float-animation" style={{ animationDelay: '2s' }} />
        </div>
        <div className="absolute bottom-32 left-1/4 opacity-20">
          <Wind className="w-12 h-12 text-blue-500 float-animation" style={{ animationDelay: '4s' }} />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <Leaf className="w-14 h-14 text-green-500 float-animation" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Illustration/Info */}
        <div className="hidden lg:block animate-slide-left">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-32 h-32 mx-auto rounded-full sustainability-gradient flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-4xl">🌱</span>
              </div>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-pulse-green"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full animate-pulse-green" style={{ animationDelay: '1s' }}></div>
            </div>
            <h1 className="heading-lg text-white drop-shadow-lg">
              Welcome to NextCoal Initiative
            </h1>
            <p className="text-lg text-green-100 max-w-md mx-auto leading-relaxed">
              India's premier carbon neutrality platform for coal mines. 
              Track emissions, manage offsets, and achieve net-zero goals with AI-powered insights.
            </p>
            <div className="flex justify-center space-x-8 mt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-sm text-green-100">Real-time Tracking</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">🌳</span>
                </div>
                <p className="text-sm text-green-100">Carbon Offsets</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">🏆</span>
                </div>
                <p className="text-sm text-green-100">AI Strategies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="animate-slide-right">
          <Card className="eco-card shadow-2xl border-0 max-w-md mx-auto">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full sustainability-gradient flex items-center justify-center lg:hidden">
                <span className="text-white font-bold text-2xl">🌱</span>
              </div>
              <CardTitle className="heading-md text-gray-900">
                Sign In to Your Account
              </CardTitle>
              <CardDescription className="text-gray-600">
                Access your carbon management dashboard
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50 animate-scale-in">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@nextcoal-initiative.gov.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
                    className="focus-ring transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    className="focus-ring transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                    Role
                  </Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="focus-ring transition-all duration-200">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mine-operator">
                        <div className="flex items-center space-x-2">
                          <span>⛏️</span>
                          <span>Mine Operator</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="regulator">
                        <div className="flex items-center space-x-2">
                          <span>🏛️</span>
                          <span>Government Regulator</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center space-x-2">
                          <span>👨‍💼</span>
                          <span>System Administrator</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full sustainability-gradient text-white ripple focus-ring"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🚀</span>
                      Sign In
                    </>
                  )}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 eco-gradient border border-green-200 rounded-lg animate-fade-in">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                  <span className="mr-2">🔑</span>
                  Demo Credentials
                </h4>
                <div className="text-sm text-green-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Mine Operator:</span>
                    <span className="text-xs">operator@nextcoal-initiative.gov.in</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Regulator:</span>
                    <span className="text-xs">regulator@nextcoal-initiative.gov.in</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Admin:</span>
                    <span className="text-xs">admin@nextcoal-initiative.gov.in</span>
                  </div>
                  <p className="text-xs text-green-600 mt-2 text-center">
                    Password: <code className="bg-green-100 px-1 rounded">password123</code>
                  </p>
                </div>
              </div>
            </CardContent>

            <Separator />

            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-green-600 hover:text-green-700 font-medium transition-colors">
                  Sign up here
                </Link>
              </div>
              
              <div className="text-center text-xs text-gray-500 space-y-1">
                <p className="flex items-center justify-center">
                  <span className="mr-1">🇮🇳</span>
                  Supporting India's Net Zero Mission 2070
                </p>
                <p className="text-green-600 font-medium">
                  Empowering Coal Mines for Carbon Neutrality
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;