import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { useInventory, TruckInventory } from "../contexts/InventoryContext";
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
import {
  Plus,
  Package,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  IndianRupee,
  FileCheck,
  Car,
  ShoppingCart,
} from "lucide-react";
import TruckForm from "../components/TruckForm";

const ITEMS_PER_PAGE = 10;

export default function Inventory() {
  const { trucks, truckModels, deleteTruck } = useInventory();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Determine view based on URL path or search params
  const isNewRoute = location.pathname === "/inventory/new";
  const view = isNewRoute ? "create" : searchParams.get("view") || "list";
  const editTruckId = searchParams.get("edit");

  // Auto-redirect to main inventory page after form submission when coming from /new route
  useEffect(() => {
    if (isNewRoute && view !== "create") {
      // This will be handled by TruckForm component navigation
    }
  }, [isNewRoute, view]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalTrucks = trucks.length;
    const pendingNOCs = trucks.filter(
      (truck) => truck.nocApplied && !truck.nocReceivedDate,
    ).length;
    const soldTrucks = trucks.filter((truck) => truck.status === "sold");
    const totalProfit = soldTrucks.reduce(
      (sum, truck) => sum + (truck.profit || 0),
      0,
    );
    const availableTrucks = trucks.filter(
      (truck) => truck.status === "available",
    ).length;
    const totalInvestment = trucks.reduce((sum, truck) => {
      const expenses = Object.values(truck.expenses).reduce(
        (expSum, exp) => expSum + exp,
        0,
      );
      return sum + truck.fullPurchaseAmount + expenses;
    }, 0);

    return {
      totalTrucks,
      pendingNOCs,
      totalProfit,
      availableTrucks,
      soldTrucks: soldTrucks.length,
      totalInvestment,
    };
  }, [trucks]);

  // Filter trucks
  const filteredTrucks = useMemo(() => {
    return trucks.filter((truck) => {
      const matchesSearch =
        searchTerm === "" ||
        truck.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.registrationNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        truck.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.sellerDetails.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || truck.status === statusFilter;

      const matchesModel = modelFilter === "all" || truck.model === modelFilter;

      const matchesDateRange =
        (dateFromFilter === "" ||
          new Date(truck.purchaseDate) >= new Date(dateFromFilter)) &&
        (dateToFilter === "" ||
          new Date(truck.purchaseDate) <= new Date(dateToFilter));

      return matchesSearch && matchesStatus && matchesModel && matchesDateRange;
    });
  }, [
    trucks,
    searchTerm,
    statusFilter,
    modelFilter,
    dateFromFilter,
    dateToFilter,
  ]);

  // Paginate trucks
  const paginatedTrucks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTrucks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTrucks, currentPage]);

  const totalPages = Math.ceil(filteredTrucks.length / ITEMS_PER_PAGE);

  const getStatusColor = (status: TruckInventory["status"]) => {
    switch (status) {
      case "available":
        return "bg-success/10 text-success hover:bg-success/20";
      case "sold":
        return "bg-primary/10 text-primary hover:bg-primary/20";
      case "maintenance":
        return "bg-warning/10 text-warning hover:bg-warning/20";
      case "noc-pending":
        return "bg-destructive/10 text-destructive hover:bg-destructive/20";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  const handleDeleteTruck = (truckId: string) => {
    deleteTruck(truckId);
  };

  if (view === "create") {
    return <TruckForm mode="create" />;
  }

  if (view === "edit" && editTruckId) {
    return <TruckForm mode="edit" truckId={editTruckId} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Truck Inventory
          </h1>
          <p className="text-muted-foreground">
            Manage second-hand truck purchases, sales, and inventory.
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to="/inventory?view=create">
            <Plus className="w-4 h-4 mr-2" />
            Add Truck
          </Link>
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trucks</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrucks}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.soldTrucks} sold, {metrics.availableTrucks} available
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
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Investment
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              ₹{metrics.totalInvestment.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Purchase + expenses</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ₹{metrics.totalProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">From sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search trucks, registration, seller..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="noc-pending">NOC Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="model">Model</Label>
              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {truckModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trucks Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Truck Inventory</CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {paginatedTrucks.length} of {filteredTrucks.length} trucks
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Truck Details</TableHead>
                  <TableHead>Purchase Info</TableHead>
                  <TableHead>NOC Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Investment</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTrucks.map((truck) => (
                  <TableRow key={truck.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{truck.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {truck.registrationNumber}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {truck.model} ({truck.initialModelYear})
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          ₹{truck.fullPurchaseAmount.toLocaleString()}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(truck.purchaseDate).toLocaleDateString()}
                        </div>
                        <div className="text-muted-foreground">
                          {truck.sellerDetails.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {truck.nocApplied ? (
                          truck.nocReceivedDate ? (
                            <Badge
                              variant="secondary"
                              className="bg-success/10 text-success"
                            >
                              <FileCheck className="w-3 h-3 mr-1" />
                              Received
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-warning/10 text-warning"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-muted/10 text-muted-foreground"
                          >
                            Not Applied
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(truck.status)}
                      >
                        {truck.status.replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm">
                        <div className="font-medium">
                          ₹
                          {(
                            truck.fullPurchaseAmount +
                            Object.values(truck.expenses).reduce(
                              (sum, exp) => sum + exp,
                              0,
                            )
                          ).toLocaleString()}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Purchase + Expenses
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {truck.status === "sold" && truck.profit !== undefined ? (
                        <span
                          className={`font-medium ${
                            truck.profit >= 0
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          ₹{truck.profit.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/inventory?view=edit&edit=${truck.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        {user?.role === "admin" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Truck {truck.id}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this truck
                                  record? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTruck(truck.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
