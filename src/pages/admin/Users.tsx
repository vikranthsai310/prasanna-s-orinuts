
import { useState } from 'react';
import { Search, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock users data
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    joinDate: '2024-01-15',
    totalOrders: 5,
    totalSpent: 6499,
    lastOrder: '2024-01-25'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+91 9876543211',
    joinDate: '2024-01-10',
    totalOrders: 3,
    totalSpent: 3299,
    lastOrder: '2024-01-23'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+91 9876543212',
    joinDate: '2024-01-08',
    totalOrders: 8,
    totalSpent: 12999,
    lastOrder: '2024-01-26'
  }
];

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users] = useState(mockUsers);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-playfair text-3xl font-bold mb-8">Manage Users</h1>
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
      </div>
      
      {/* Users Table */}
      <div className="card-premium overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4">User</th>
              <th className="text-left py-3 px-4">Contact</th>
              <th className="text-left py-3 px-4">Join Date</th>
              <th className="text-left py-3 px-4">Orders</th>
              <th className="text-left py-3 px-4">Total Spent</th>
              <th className="text-left py-3 px-4">Last Order</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-border">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-secondary-foreground font-semibold">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="text-sm">{user.email}</p>
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm">{new Date(user.joinDate).toLocaleDateString()}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold">{user.totalOrders}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-secondary">₹{user.totalSpent.toLocaleString()}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm">{new Date(user.lastOrder).toLocaleDateString()}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
