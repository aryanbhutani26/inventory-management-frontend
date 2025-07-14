import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTransport, Trip } from "../contexts/TransportContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Calculator, Truck, MapPin, Calendar, IndianRupee } from "lucide-react";

interface TripFormProps {
  tripId?: string;
  mode: "create" | "edit";
}

export default function TripForm({ tripId, mode }: TripFormProps) {
  const navigate = useNavigate();
  const { trucks, addTrip, updateTrip, getTrip } = useTransport();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    truckRegistration: "",
    source: "",
    destination: "",
    startDate: "",
    returnDate: "",
    distance: "",
    expenses: {
      diesel: "",
      toll: "",
      driver: "",
      other: "",
    },
    revenue: "",
    status: "planned" as Trip["status"],
  });

  const [profit, setProfit] = useState(0);

  useEffect(() => {
    if (mode === "edit" && tripId) {
      const trip = getTrip(tripId);
      if (trip) {
        setFormData({
          truckRegistration: trip.truckRegistration,
          source: trip.source,
          destination: trip.destination,
          startDate: trip.startDate,
          returnDate: trip.returnDate,
          distance: trip.distance.toString(),
          expenses: {
            diesel: trip.expenses.diesel.toString(),
            toll: trip.expenses.toll.toString(),
            driver: trip.expenses.driver.toString(),
            other: trip.expenses.other.toString(),
          },
          revenue: trip.revenue.toString(),
          status: trip.status,
        });
      }
    }
  }, [mode, tripId, getTrip]);

  useEffect(() => {
    calculateProfit();
  }, [formData.expenses, formData.revenue]);

  const calculateProfit = () => {
    const expenses = {
      diesel: parseFloat(formData.expenses.diesel) || 0,
      toll: parseFloat(formData.expenses.toll) || 0,
      driver: parseFloat(formData.expenses.driver) || 0,
      other: parseFloat(formData.expenses.other) || 0,
    };
    const revenue = parseFloat(formData.revenue) || 0;
    const totalExpenses =
      expenses.diesel + expenses.toll + expenses.driver + expenses.other;
    setProfit(revenue - totalExpenses);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const tripData = {
        truckRegistration: formData.truckRegistration,
        source: formData.source,
        destination: formData.destination,
        startDate: formData.startDate,
        returnDate: formData.returnDate,
        distance: parseFloat(formData.distance),
        expenses: {
          diesel: parseFloat(formData.expenses.diesel) || 0,
          toll: parseFloat(formData.expenses.toll) || 0,
          driver: parseFloat(formData.expenses.driver) || 0,
          other: parseFloat(formData.expenses.other) || 0,
        },
        revenue: parseFloat(formData.revenue) || 0,
        status: formData.status,
      };

      if (mode === "create") {
        addTrip(tripData);
      } else if (mode === "edit" && tripId) {
        updateTrip(tripId, tripData);
      }

      navigate("/transportation");
    } catch (error) {
      console.error("Error saving trip:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    if (field.startsWith("expenses.")) {
      const expenseField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        expenses: {
          ...prev.expenses,
          [expenseField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {mode === "create" ? "Create New Trip" : "Edit Trip"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "Enter trip details and track expenses for profit calculation."
              : `Editing trip ${tripId}`}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/transportation")}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trip Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="truck">Truck Registration *</Label>
                  <Select
                    value={formData.truckRegistration}
                    onValueChange={(value) =>
                      updateFormData("truckRegistration", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select truck" />
                    </SelectTrigger>
                    <SelectContent>
                      {trucks.map((truck) => (
                        <SelectItem key={truck} value={truck}>
                          {truck}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      updateFormData("status", value as Trip["status"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in-transit">In Transit</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Source Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="source"
                      placeholder="Enter source city"
                      value={formData.source}
                      onChange={(e) => updateFormData("source", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="destination"
                      placeholder="Enter destination city"
                      value={formData.destination}
                      onChange={(e) =>
                        updateFormData("destination", e.target.value)
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        updateFormData("startDate", e.target.value)
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnDate">Return Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="returnDate"
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) =>
                        updateFormData("returnDate", e.target.value)
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="distance">Distance (km) *</Label>
                  <Input
                    id="distance"
                    type="number"
                    placeholder="Enter distance in kilometers"
                    value={formData.distance}
                    onChange={(e) => updateFormData("distance", e.target.value)}
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Profit Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Calculated Profit
                  </p>
                  <p
                    className={`text-2xl font-bold ${profit >= 0 ? "text-success" : "text-destructive"}`}
                  >
                    ₹{profit.toLocaleString()}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Revenue:</span>
                    <span className="font-medium">
                      ₹{(parseFloat(formData.revenue) || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Expenses:</span>
                    <span className="font-medium">
                      ₹
                      {(
                        (parseFloat(formData.expenses.diesel) || 0) +
                        (parseFloat(formData.expenses.toll) || 0) +
                        (parseFloat(formData.expenses.driver) || 0) +
                        (parseFloat(formData.expenses.other) || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-medium">
                    <span>Profit Margin:</span>
                    <span
                      className={
                        profit >= 0 ? "text-success" : "text-destructive"
                      }
                    >
                      {formData.revenue
                        ? (
                            (profit / parseFloat(formData.revenue)) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expenses and Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Trip Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diesel">Diesel Charges</Label>
                  <Input
                    id="diesel"
                    type="number"
                    placeholder="0"
                    value={formData.expenses.diesel}
                    onChange={(e) =>
                      updateFormData("expenses.diesel", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toll">Toll Charges</Label>
                  <Input
                    id="toll"
                    type="number"
                    placeholder="0"
                    value={formData.expenses.toll}
                    onChange={(e) =>
                      updateFormData("expenses.toll", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driver">Driver Charges</Label>
                  <Input
                    id="driver"
                    type="number"
                    placeholder="0"
                    value={formData.expenses.driver}
                    onChange={(e) =>
                      updateFormData("expenses.driver", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="other">Other Expenses</Label>
                  <Input
                    id="other"
                    type="number"
                    placeholder="0"
                    value={formData.expenses.other}
                    onChange={(e) =>
                      updateFormData("expenses.other", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Trip Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="revenue">Revenue Earned *</Label>
                <Input
                  id="revenue"
                  type="number"
                  placeholder="Enter total revenue from trip"
                  value={formData.revenue}
                  onChange={(e) => updateFormData("revenue", e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Total amount earned from transporting goods
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/transportation")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading
              ? "Saving..."
              : mode === "create"
                ? "Create Trip"
                : "Update Trip"}
          </Button>
        </div>
      </form>
    </div>
  );
}
