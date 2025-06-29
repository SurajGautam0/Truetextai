"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Search, UserPlus, RefreshCw } from "lucide-react"

// Mock user data - in a real app, this would come from your API
const mockUsers = [
  {
    id: "user_1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    plan: "enterprise",
    createdAt: "2023-01-15T10:30:00Z",
    lastActive: "2023-05-08T14:22:00Z",
  },
  {
    id: "user_2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    plan: "pro",
    createdAt: "2023-02-20T08:15:00Z",
    lastActive: "2023-05-07T11:45:00Z",
  },
  {
    id: "user_3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "user",
    plan: "free",
    createdAt: "2023-03-10T15:45:00Z",
    lastActive: "2023-05-05T09:30:00Z",
  },
  {
    id: "user_4",
    name: "Alice Williams",
    email: "alice@example.com",
    role: "user",
    plan: "pro",
    createdAt: "2023-04-05T12:00:00Z",
    lastActive: "2023-05-08T10:15:00Z",
  },
  {
    id: "user_5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "user",
    plan: "free",
    createdAt: "2023-04-22T09:20:00Z",
    lastActive: "2023-05-06T16:40:00Z",
  },
]

type User = (typeof mockUsers)[0]

export default function UserManagement() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Form state for new user
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user",
    plan: "free",
  })

  useEffect(() => {
    // Simulate API call
    const fetchUsers = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/admin/users')
        // const data = await response.json()
        // setUsers(data)

        // Using mock data for now
        setTimeout(() => {
          setUsers(mockUsers)
          setLoading(false)
        }, 1000)
      } catch (error) {
        toast({
          title: "Error fetching users",
          description: "Could not load user data.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddUser = () => {
    // In a real app, this would be an API call
    // const response = await fetch('/api/admin/users', {
    //   method: 'POST',
    //   body: JSON.stringify(newUser),
    // })

    // Simulate adding a user
    const newId = `user_${Date.now()}`
    const createdAt = new Date().toISOString()

    const addedUser = {
      ...newUser,
      id: newId,
      createdAt,
      lastActive: createdAt,
    } as User

    setUsers([...users, addedUser])
    setShowAddUserDialog(false)
    setNewUser({
      name: "",
      email: "",
      role: "user",
      plan: "free",
    })

    toast({
      title: "User added",
      description: `${newUser.name} has been added successfully.`,
    })
  }

  const handleEditUser = () => {
    if (!currentUser) return

    // In a real app, this would be an API call
    // const response = await fetch(`/api/admin/users/${currentUser.id}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(currentUser),
    // })

    // Simulate updating a user
    const updatedUsers = users.map((user) => (user.id === currentUser.id ? currentUser : user))

    setUsers(updatedUsers)
    setShowEditUserDialog(false)
    setCurrentUser(null)

    toast({
      title: "User updated",
      description: `${currentUser.name}'s information has been updated.`,
    })
  }

  const handleDeleteUser = (userId: string) => {
    // In a real app, this would be an API call
    // const response = await fetch(`/api/admin/users/${userId}`, {
    //   method: 'DELETE',
    // })

    // Simulate deleting a user
    const userToDelete = users.find((user) => user.id === userId)
    const updatedUsers = users.filter((user) => user.id !== userId)

    setUsers(updatedUsers)

    toast({
      title: "User deleted",
      description: `${userToDelete?.name} has been removed.`,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">View and manage all users in the system.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account in the system.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({ ...newUser, role: value as "user" | "admin" })}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="plan">Plan</Label>
                    <Select
                      value={newUser.plan}
                      onValueChange={(value) =>
                        setNewUser({ ...newUser, plan: value as "free" | "pro" | "enterprise" })
                      }
                    >
                      <SelectTrigger id="plan">
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeletons
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[180px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.plan === "enterprise"
                          ? "border-primary text-primary"
                          : user.plan === "pro"
                            ? "border-blue-500 text-blue-500"
                            : ""
                      }
                    >
                      {user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{formatDate(user.lastActive)}</TableCell>
                  <TableCell>
                    <Dialog
                      open={showEditUserDialog && currentUser?.id === user.id}
                      onOpenChange={(open) => {
                        setShowEditUserDialog(open)
                        if (!open) setCurrentUser(null)
                      }}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentUser(user)
                              setShowEditUserDialog(true)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit User</DialogTitle>
                          <DialogDescription>Update user information and permissions.</DialogDescription>
                        </DialogHeader>
                        {currentUser && (
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-name">Name</Label>
                              <Input
                                id="edit-name"
                                value={currentUser.name}
                                onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-email">Email</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={currentUser.email}
                                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-role">Role</Label>
                                <Select
                                  value={currentUser.role}
                                  onValueChange={(value) =>
                                    setCurrentUser({ ...currentUser, role: value as "user" | "admin" })
                                  }
                                >
                                  <SelectTrigger id="edit-role">
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-plan">Plan</Label>
                                <Select
                                  value={currentUser.plan}
                                  onValueChange={(value) =>
                                    setCurrentUser({ ...currentUser, plan: value as "free" | "pro" | "enterprise" })
                                  }
                                >
                                  <SelectTrigger id="edit-plan">
                                    <SelectValue placeholder="Select plan" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="pro">Pro</SelectItem>
                                    <SelectItem value="enterprise">Enterprise</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowEditUserDialog(false)
                              setCurrentUser(null)
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleEditUser}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </p>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  )
}
