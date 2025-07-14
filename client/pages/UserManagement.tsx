import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Plus,
  Users,
  Shield,
  UserCheck,
  Settings,
  Lock,
  Activity,
  Crown,
} from "lucide-react";

export default function UserManagement() {
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
        <Button className="admin-action-btn group">
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
