import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

const Settings = () => {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    fullName: "Rajesh Kumar",
    email: "rajesh.kumar@scl.gov.in",
    phone: "+91 9876543210",
    designation: "Mine Manager",
    organization: "Singareni Collieries Company Ltd",
    location: "Hyderabad, Telangana"
  });

  const [mineProfile, setMineProfile] = useState({
    mineName: "Singareni Main Pit",
    mineType: "Surface Mining",
    capacity: "2.5 MT/year",
    established: "1945",
    employees: "1250",
    area: "2,450 hectares",
    coordinates: "17.3850° N, 78.4867° E",
    environmentalClearance: "EC/2020/0123"
  });

  const [notifications, setNotifications] = useState({
    emailReports: true,
    smsAlerts: false,
    complianceReminders: true,
    achievementNotifications: true,
    weeklyDigest: true,
    emergencyAlerts: true
  });

  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSaveMineProfile = () => {
    toast({
      title: "Mine Profile Updated",
      description: "Mine information has been updated successfully.",
    });
  };

  const handleLanguageChange = (language: string) => {
    toast({
      title: "Language Changed",
      description: `Interface language changed to ${language}`,
    });
  };

  const languages = [
    { code: "en", name: "English", native: "English" },
    { code: "hi", name: "Hindi", native: "हिन्दी" },
    { code: "ta", name: "Tamil", native: "தமிழ்" },
    { code: "te", name: "Telugu", native: "తెలుగు" },
    { code: "bn", name: "Bengali", native: "বাংলা" },
    { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
    { code: "mr", name: "Marathi", native: "मराठी" },
    { code: "od", name: "Odia", native: "ଓଡ଼ିଆ" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account, mine profile, and preferences</p>
      </div>

      <Tabs defaultValue={tabParam || "profile"} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="mine">Mine Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="language">Language & Region</TabsTrigger>
          <TabsTrigger value="help">Help & Support</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={profileData.designation}
                      onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={profileData.organization}
                    onChange={(e) => setProfileData({ ...profileData, organization: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  />
                </div>

                <Separator />

                <div className="flex justify-between">
                  <Button variant="outline">Reset Password</Button>
                  <Button onClick={handleSaveProfile} className="sustainability-gradient text-white">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mine" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mine Information</CardTitle>
              <CardDescription>
                Manage your coal mine's profile and operational details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mineName">Mine Name</Label>
                    <Input
                      id="mineName"
                      value={mineProfile.mineName}
                      onChange={(e) => setMineProfile({ ...mineProfile, mineName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mineType">Mine Type</Label>
                    <Select value={mineProfile.mineType} onValueChange={(value) => setMineProfile({ ...mineProfile, mineType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Surface Mining">Surface Mining</SelectItem>
                        <SelectItem value="Underground Mining">Underground Mining</SelectItem>
                        <SelectItem value="Open Pit">Open Pit</SelectItem>
                        <SelectItem value="Strip Mining">Strip Mining</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Annual Capacity</Label>
                    <Input
                      id="capacity"
                      value={mineProfile.capacity}
                      onChange={(e) => setMineProfile({ ...mineProfile, capacity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="established">Year Established</Label>
                    <Input
                      id="established"
                      value={mineProfile.established}
                      onChange={(e) => setMineProfile({ ...mineProfile, established: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employees">Number of Employees</Label>
                    <Input
                      id="employees"
                      value={mineProfile.employees}
                      onChange={(e) => setMineProfile({ ...mineProfile, employees: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Mine Area</Label>
                    <Input
                      id="area"
                      value={mineProfile.area}
                      onChange={(e) => setMineProfile({ ...mineProfile, area: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coordinates">GPS Coordinates</Label>
                  <Input
                    id="coordinates"
                    value={mineProfile.coordinates}
                    onChange={(e) => setMineProfile({ ...mineProfile, coordinates: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="environmentalClearance">Environmental Clearance ID</Label>
                  <Input
                    id="environmentalClearance"
                    value={mineProfile.environmentalClearance}
                    onChange={(e) => setMineProfile({ ...mineProfile, environmentalClearance: e.target.value })}
                  />
                </div>

                <Button onClick={handleSaveMineProfile} className="sustainability-gradient text-white">
                  Update Mine Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Email Reports</Label>
                    <p className="text-sm text-gray-600">Receive monthly emission reports via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailReports}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailReports: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">SMS Alerts</Label>
                    <p className="text-sm text-gray-600">Get critical alerts via SMS</p>
                  </div>
                  <Switch
                    checked={notifications.smsAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, smsAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Compliance Reminders</Label>
                    <p className="text-sm text-gray-600">Reminders for upcoming compliance deadlines</p>
                  </div>
                  <Switch
                    checked={notifications.complianceReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, complianceReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Achievement Notifications</Label>
                    <p className="text-sm text-gray-600">Get notified when you earn badges or achievements</p>
                  </div>
                  <Switch
                    checked={notifications.achievementNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, achievementNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Weekly Digest</Label>
                    <p className="text-sm text-gray-600">Weekly summary of your carbon performance</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyDigest}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyDigest: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Emergency Alerts</Label>
                    <p className="text-sm text-gray-600">Critical system alerts and warnings</p>
                  </div>
                  <Switch
                    checked={notifications.emergencyAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emergencyAlerts: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Language & Regional Settings</CardTitle>
              <CardDescription>
                Choose your preferred language and regional format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Interface Language</Label>
                <Select defaultValue="en" onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center space-x-2">
                          <span>{lang.name}</span>
                          <span className="text-gray-500">({lang.native})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select defaultValue="dd-mm-yyyy">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd-mm-yyyy">DD-MM-YYYY (Indian)</SelectItem>
                    <SelectItem value="mm-dd-yyyy">MM-DD-YYYY (US)</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (ISO)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number Format</Label>
                <Select defaultValue="indian">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indian">Indian (12,34,567)</SelectItem>
                    <SelectItem value="international">International (1,234,567)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select defaultValue="inr">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                    <SelectItem value="usd">US Dollar ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Learn how to use the NextCoal Initiative platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  📚 User Guide & Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🎯 Interactive Tutorial
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📹 Video Training Series
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  ❓ Frequently Asked Questions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support & Feedback</CardTitle>
                <CardDescription>
                  Get help or share your feedback with us
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  💬 Live Chat Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📞 Call Support (1800-123-4567)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📧 Email Support Team
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📝 Submit Feedback
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Version:</strong> v2.1.0
                </div>
                <div>
                  <strong>Last Updated:</strong> January 2024
                </div>
                <div>
                  <strong>Status:</strong> <Badge className="bg-green-100 text-green-800">Operational</Badge>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="text-center text-sm text-gray-600">
                <p>🇮🇳 Developed for India's Coal Mining Industry</p>
                <p className="mt-1">Supporting the Net Zero Mission 2070</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
