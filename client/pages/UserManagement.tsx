import React, { useState, useMemo } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { useUser, User } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import { useToast } from "../components/ui/use-toast";
import {
  Plus,
  Users,
  Shield,
  UserCheck,
  Settings,
  Lock,
  Activity,
  Crown,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  UserX,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import UserForm from "../components/UserForm";

const ITEMS_PER_PAGE = 10;

export default function UserManagement() {
  const { users, deleteUser, toggleUserStatus, resetUserPassword } = useUser();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Determine view based on URL path or search params
  const isNewRoute = location.pathname === "/users/new";
  const view = isNewRoute ? "create" : searchParams.get("view") || "list";
  const editUserId = searchParams.get("edit");

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const adminUsers = users.filter((user) => user.role === "admin").length;
    const staffUsers = users.filter((user) => user.role === "staff").length;
    const activeUsers = users.filter((user) => user.status === "active").length;
    const inactiveUsers = users.filter(
      (user) => user.status !== "active",
    ).length;

    return {
      totalUsers,
      adminUsers,
      staffUsers,
      activeUsers,
      inactiveUsers,
    };
  }, [users]);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(lowercaseSearch) ||
          user.email.toLowerCase().includes(lowercaseSearch) ||
          user.fullName.toLowerCase().includes(lowercaseSearch) ||
          user.department?.toLowerCase().includes(lowercaseSearch),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    return filtered;
  }, [users, searchTerm, statusFilter, roleFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      const success = await deleteUser(userId);
      if (success) {
        toast({
          title: "User Deleted",
          description: "The user has been successfully deleted.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user. Cannot delete the last admin.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the user.",
        variant: "destructive",
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const success = await toggleUserStatus(userId);
      if (success) {
        toast({
          title: "Status Updated",
          description: "User status has been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const success = await resetUserPassword(userId);
      if (success) {
        toast({
          title: "Password Reset",
          description: "Password reset email has been sent to the user.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success hover:bg-success/90">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge className="bg-accent hover:bg-accent/90">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="outline">
        <Users className="w-3 h-3 mr-1" />
        Staff
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return "Never";
    return new Date(lastLogin).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (view === "create") {
    return <UserForm mode="create" />;
  }

  if (view === "edit" && editUserId) {
    return <UserForm mode="edit" userId={editUserId} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              User Management
            </h1>
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Manage user accounts and permissions (Admin only).
          </p>
        </div>
        <Button
          className="admin-action-btn group"
          onClick={() => setSearchParams({ view: "create" })}
        >
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="metric-card admin-metric-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              8
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="w-3 h-3" />
              System users
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card admin-metric-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
              2
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Admin users
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card admin-metric-card group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-success to-success/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <UserCheck className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent">
              6
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              Staff users
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="admin-feature-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            Access Control
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-center py-12">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-border/30">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                <Settings
                  className="w-3 h-3 text-white animate-spin"
                  style={{ animationDuration: "3s" }}
                />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              User Management Module
            </h3>
            <p className="text-muted-foreground mb-8">
              Complete user management system with role-based access control and
              security features.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="admin-feature-item">
                <Plus className="w-4 h-4 text-primary" />
                <span>Create and manage user accounts</span>
              </div>
              <div className="admin-feature-item">
                <Shield className="w-4 h-4 text-accent" />
                <span>Role-based permissions (Admin/Staff)</span>
              </div>
              <div className="admin-feature-item">
                <Activity className="w-4 h-4 text-success" />
                <span>User activity tracking</span>
              </div>
              <div className="admin-feature-item">
                <Lock className="w-4 h-4 text-warning" />
                <span>Password management</span>
              </div>
              <div className="admin-feature-item col-span-1 sm:col-span-2">
                <Settings className="w-4 h-4 text-primary" />
                <span>Security audit logs</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
