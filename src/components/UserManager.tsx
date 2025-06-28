import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: 'mine-operator' | 'regulator' | 'admin';
  mineId?: string;
  organization: string;
}

const UserManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = () => {
    setIsLoading(true);
    const stored = localStorage.getItem('coalmine_mock_users');
    if (stored) {
      const parsedUsers = JSON.parse(stored);
      // Remove password from display
      const safeUsers = parsedUsers.map((user: any) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mineId: user.mineId,
        organization: user.organization
      }));
      setUsers(safeUsers);
    }
    setIsLoading(false);
  };

  const clearAllUsers = () => {
    if (confirm('Are you sure you want to clear all users? This will reset to default users.')) {
      localStorage.removeItem('coalmine_mock_users');
      loadUsers();
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'mine-operator': { color: 'bg-blue-100 text-blue-800', icon: '⛏️' },
      'regulator': { color: 'bg-purple-100 text-purple-800', icon: '🏛️' },
      'admin': { color: 'bg-red-100 text-red-800', icon: '👨‍💼' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { color: 'bg-gray-100 text-gray-800', icon: '❓' };
    
    return (
      <Badge className={config.color}>
        <span className="mr-1">{config.icon}</span>
        {role.replace('-', ' ')}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">User Management</CardTitle>
              <CardDescription>
                View and manage registered users in the system
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={loadUsers}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="destructive" 
                onClick={clearAllUsers}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset Users
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No users found. Try refreshing or creating a new account.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Total Users: <span className="font-semibold">{users.length}</span>
              </div>
              
              {users.map((user, index) => (
                <div key={user.id}>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Email:</span> {user.email}</p>
                        <p><span className="font-medium">Organization:</span> {user.organization}</p>
                        {user.mineId && (
                          <p><span className="font-medium">Mine ID:</span> {user.mineId}</p>
                        )}
                        <p><span className="font-medium">User ID:</span> {user.id}</p>
                      </div>
                    </div>
                  </div>
                  {index < users.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManager; 