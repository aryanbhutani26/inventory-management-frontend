import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Trip {
  id: string;
  truckRegistration: string;
  source: string;
  destination: string;
  startDate: string;
  returnDate: string;
  distance: number;
  expenses: {
    diesel: number;
    toll: number;
    driver: number;
    other: number;
  };
  revenue: number;
  profit: number;
  status: "planned" | "in-transit" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

interface TransportContextType {
  trips: Trip[];
  trucks: string[];
  addTrip: (
    trip: Omit<Trip, "id" | "profit" | "createdAt" | "updatedAt">,
  ) => void;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  getTrip: (id: string) => Trip | undefined;
}

const TransportContext = createContext<TransportContextType | undefined>(
  undefined,
);

// Mock data for demonstration
const mockTrips: Trip[] = [
  {
    id: "TRP001",
    truckRegistration: "MH-12-AB-1234",
    source: "Mumbai",
    destination: "Delhi",
    startDate: "2024-01-15",
    returnDate: "2024-01-17",
    distance: 1400,
    expenses: { diesel: 8500, toll: 2200, driver: 3000, other: 500 },
    revenue: 25000,
    profit: 10800,
    status: "completed",
    createdAt: "2024-01-14T10:00:00Z",
    updatedAt: "2024-01-17T18:00:00Z",
  },
  {
    id: "TRP002",
    truckRegistration: "GJ-05-CD-5678",
    source: "Ahmedabad",
    destination: "Bangalore",
    startDate: "2024-01-14",
    returnDate: "2024-01-16",
    distance: 1200,
    expenses: { diesel: 7200, toll: 1800, driver: 2800, other: 400 },
    revenue: 22000,
    profit: 9800,
    status: "completed",
    createdAt: "2024-01-13T09:00:00Z",
    updatedAt: "2024-01-16T20:00:00Z",
  },
  {
    id: "TRP003",
    truckRegistration: "KA-03-EF-9012",
    source: "Bangalore",
    destination: "Chennai",
    startDate: "2024-01-18",
    returnDate: "2024-01-19",
    distance: 350,
    expenses: { diesel: 2800, toll: 600, driver: 1500, other: 200 },
    revenue: 8000,
    profit: 2900,
    status: "in-transit",
    createdAt: "2024-01-17T14:00:00Z",
    updatedAt: "2024-01-18T08:00:00Z",
  },
  {
    id: "TRP004",
    truckRegistration: "TN-09-GH-3456",
    source: "Chennai",
    destination: "Hyderabad",
    startDate: "2024-01-20",
    returnDate: "2024-01-21",
    distance: 630,
    expenses: { diesel: 4200, toll: 900, driver: 2000, other: 300 },
    revenue: 12000,
    profit: 4600,
    status: "planned",
    createdAt: "2024-01-19T11:00:00Z",
    updatedAt: "2024-01-19T11:00:00Z",
  },
  {
    id: "TRP005",
    truckRegistration: "MH-12-AB-1234",
    source: "Delhi",
    destination: "Kolkata",
    startDate: "2024-01-22",
    returnDate: "2024-01-24",
    distance: 1500,
    expenses: { diesel: 9000, toll: 2400, driver: 3200, other: 600 },
    revenue: 28000,
    profit: 12800,
    status: "planned",
    createdAt: "2024-01-20T16:00:00Z",
    updatedAt: "2024-01-20T16:00:00Z",
  },
];

const mockTrucks = [
  "MH-12-AB-1234",
  "GJ-05-CD-5678",
  "KA-03-EF-9012",
  "TN-09-GH-3456",
  "RJ-14-XY-7890",
  "UP-32-PQ-5432",
  "HR-26-LM-8765",
  "PB-65-ST-2109",
];

export function TransportProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [trucks] = useState<string[]>(mockTrucks);

  const calculateProfit = (
    expenses: Trip["expenses"],
    revenue: number,
  ): number => {
    const totalExpenses =
      expenses.diesel + expenses.toll + expenses.driver + expenses.other;
    return revenue - totalExpenses;
  };

  const addTrip = (
    tripData: Omit<Trip, "id" | "profit" | "createdAt" | "updatedAt">,
  ) => {
    const newTrip: Trip = {
      ...tripData,
      id: `TRP${(trips.length + 1).toString().padStart(3, "0")}`,
      profit: calculateProfit(tripData.expenses, tripData.revenue),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTrips((prev) => [...prev, newTrip]);
  };

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    setTrips((prev) =>
      prev.map((trip) => {
        if (trip.id === id) {
          const updatedTrip = { ...trip, ...updates };
          if (updates.expenses || updates.revenue) {
            updatedTrip.profit = calculateProfit(
              updatedTrip.expenses,
              updatedTrip.revenue,
            );
          }
          updatedTrip.updatedAt = new Date().toISOString();
          return updatedTrip;
        }
        return trip;
      }),
    );
  };

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((trip) => trip.id !== id));
  };

  const getTrip = (id: string) => {
    return trips.find((trip) => trip.id === id);
  };

  const value = {
    trips,
    trucks,
    addTrip,
    updateTrip,
    deleteTrip,
    getTrip,
  };

  return (
    <TransportContext.Provider value={value}>
      {children}
    </TransportContext.Provider>
  );
}

export function useTransport() {
  const context = useContext(TransportContext);
  if (context === undefined) {
    throw new Error("useTransport must be used within a TransportProvider");
  }
  return context;
}
