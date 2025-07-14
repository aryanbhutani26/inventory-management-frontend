import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  TrendingUp,
  Truck,
  Package,
  AlertCircle,
  Plus,
  DollarSign,
  BarChart3,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for demonstration
const metrics = {
  totalTransportProfit: 145250,
  totalTrucks: 24,
  pendingNOCs: 3,
  recentTrips: 12,
  monthlyProfit: 89500,
  trucksSold: 8,
};

const recentTrips = [
  {
    id: "TRP001",
    truck: "MH-12-AB-1234",
    route: "Mumbai → Delhi",
    profit: 15500,
    date: "2024-01-15",
    status: "completed",
  },
  {
    id: "TRP002",
    truck: "GJ-05-CD-5678",
    route: "Ahmedabad → Bangalore",
    profit: 18200,
    date: "2024-01-14",
    status: "completed",
  },
  {
    id: "TRP003",
    truck: "KA-03-EF-9012",
    route: "Bangalore → Chennai",
    profit: 12800,
    date: "2024-01-13",
    status: "in-transit",
  },
  {
    id: "TRP004",
    truck: "TN-09-GH-3456",
    route: "Chennai → Hyderabad",
    profit: 14100,
    date: "2024-01-12",
    status: "completed",
  },
];

const truckInventory = [
  {
    id: "TRK001",
    registration: "MH-12-AB-1234",
    model: "Tata 407",
    status: "available",
    lastTrip: "2024-01-15",
  },
  {
    id: "TRK002",
    registration: "GJ-05-CD-5678",
    model: "Ashok Leyland",
    status: "in-transit",
    lastTrip: "2024-01-14",
  },
  {
    id: "TRK003",
    registration: "KA-03-EF-9012",
    model: "Eicher Pro",
    status: "maintenance",
    lastTrip: "2024-01-10",
  },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your transport management overview.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/transportation/new">
              <Plus className="w-4 h-4 mr-2" />
              New Trip
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/inventory/new">
              <Package className="w-4 h-4 mr-2" />
              Add Truck
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transport Profit
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ₹{metrics.totalTransportProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Trucks in Fleet
            </CardTitle>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrucks}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.trucksSold} sold this month
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending NOCs</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {metrics.pendingNOCs}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Profit
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              ₹{metrics.monthlyProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current month earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trips */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Recent Trips
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link to="/transportation">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{trip.id}</span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          trip.status === "completed"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {trip.truck} • {trip.route}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(trip.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success">
                      +₹{trip.profit.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Truck Inventory Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Fleet Status
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link to="/inventory">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {truckInventory.map((truck) => (
                <div
                  key={truck.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {truck.registration}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          truck.status === "available"
                            ? "bg-success/10 text-success"
                            : truck.status === "in-transit"
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {truck.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {truck.model}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last trip: {new Date(truck.lastTrip).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Truck className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
