import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  plan: "free" | "premium";
  createdAt: string;
  lastLoginAt: string;
}

const NewAdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Delete user handler
  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to delete user");
      await fetchUsers();
    } catch (err) {
      setError("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  // Update user role handler
  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      await fetchUsers();
    } catch (err) {
      setError("Failed to update user role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 dark:bg-background">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <span className="text-muted-foreground">Welcome, Admin</span>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Management */}
        <Card className="rounded-2xl shadow-lg p-6 border border-muted-foreground/10 bg-background/80">
          <h2 className="text-xl font-semibold mb-4 text-foreground">User Management</h2>
          {loading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left">Name</th>
                    <th className="px-2 py-1 text-left">Email</th>
                    <th className="px-2 py-1 text-left">Role</th>
                    <th className="px-2 py-1 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-muted-foreground/10">
                      <td className="px-2 py-1 text-foreground">{user.name}</td>
                      <td className="px-2 py-1 text-muted-foreground">{user.email}</td>
                      <td className="px-2 py-1">
                        {user.role === "admin" ? (
                          <span className="font-bold text-blue-600 dark:text-blue-400">Admin</span>
                        ) : (
                          <span>User</span>
                        )}
                        <select
                          className="ml-2 border rounded px-1 py-0.5 bg-background text-foreground"
                          value={user.role}
                          onChange={e => handleRoleChange(user.id, e.target.value as "user" | "admin")}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-2 py-1">
                        <button
                          className="text-red-600 dark:text-red-400 hover:underline"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        {/* Analytics */}
        <Card className="rounded-2xl shadow-lg p-6 border border-muted-foreground/10 bg-background/80">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Analytics</h2>
          <p className="text-muted-foreground">View platform statistics and analytics.</p>
        </Card>
        {/* Logs */}
        <Card className="rounded-2xl shadow-lg p-6 border border-muted-foreground/10 bg-background/80">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Logs</h2>
          <p className="text-muted-foreground">Review system and user activity logs.</p>
        </Card>
        {/* Settings */}
        <Card className="rounded-2xl shadow-lg p-6 border border-muted-foreground/10 bg-background/80">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Settings</h2>
          <p className="text-muted-foreground">Configure admin and platform settings.</p>
        </Card>
      </main>
    </div>
  );
};

export default NewAdminDashboard; 