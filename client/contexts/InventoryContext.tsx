import React, { createContext, useContext, useState, ReactNode } from "react";

export type PaymentMode =
  | "Cash"
  | "RTGS"
  | "GPay"
  | "Paytm"
  | "PhonePe"
  | "Cheque";
export type TruckStatus = "available" | "sold" | "maintenance" | "noc-pending";

export interface PaymentEntry {
  id: string;
  mode: PaymentMode;
  amount: number;
  date: string;
  percentage: number;
  transactionId?: string;
  chequeNumber?: string;
  bankName?: string;
}

export interface SellerDetails {
  name: string;
  address: string;
  phoneNumber: string;
  aadhaarNumber: string;
  emailId: string;
}

export interface BuyerDetails {
  name: string;
  address: string;
  aadhaarNumber: string;
  phoneNumber: string;
  emailId: string;
}

export interface InsuranceDetails {
  company: string;
  idv: number;
  annualPremium: number;
  fitnessExpiry: string;
  taxDueDate: string;
  taxDueAmount: number;
}

export interface TruckExpenses {
  transportation: number;
  driver: number;
  diesel: number;
  toll: number;
  bodyWork: number;
  kamaniWork: number;
  tyre: number;
  paint: number;
  floor: number;
  fatta: number;
  builty: number;
  insurance: number;
}

export interface SaleDetails {
  buyerDetails: BuyerDetails;
  saleAmount: number;
  saleDate: string;
  commissionDealerName: string;
  commissionAmount: number;
}

export interface TruckInventory {
  id: string;
  registrationNumber: string;
  model: string;
  initialModelYear: number;
  purchaseDate: string;
  sellerDetails: SellerDetails;
  nocApplied: boolean;
  nocAppliedDate?: string;
  nocReceivedDate?: string;
  newRegistrationNumber?: string;
  insuranceDetails: InsuranceDetails;
  fullPurchaseAmount: number;
  paymentModes: PaymentEntry[];
  expenses: TruckExpenses;
  saleDetails?: SaleDetails;
  status: TruckStatus;
  profit?: number;
  createdAt: string;
  updatedAt: string;
}

interface InventoryContextType {
  trucks: TruckInventory[];
  truckModels: string[];
  addTruck: (
    truck: Omit<TruckInventory, "id" | "profit" | "createdAt" | "updatedAt">,
  ) => void;
  updateTruck: (id: string, truck: Partial<TruckInventory>) => void;
  deleteTruck: (id: string) => void;
  getTruck: (id: string) => TruckInventory | undefined;
  sellTruck: (id: string, saleDetails: SaleDetails) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined,
);

// Mock data for demonstration
const mockTruckModels = [
  "Tata 407",
  "Tata LPT 709",
  "Tata LPT 1109",
  "Ashok Leyland Dost",
  "Ashok Leyland Partner",
  "Eicher Pro 1049",
  "Eicher Pro 1110",
  "Mahindra Bolero Pickup",
  "Mahindra Jeeto",
  "Force Traveller",
];

const mockTrucks: TruckInventory[] = [
  {
    id: "TRK001",
    registrationNumber: "MH-12-AB-1234",
    model: "Tata 407",
    initialModelYear: 2018,
    purchaseDate: "2024-01-10",
    sellerDetails: {
      name: "Rajesh Kumar",
      address: "Mumbai, Maharashtra",
      phoneNumber: "9876543210",
      aadhaarNumber: "123456789012",
      emailId: "rajesh@example.com",
    },
    nocApplied: true,
    nocAppliedDate: "2024-01-12",
    nocReceivedDate: "2024-01-20",
    newRegistrationNumber: "MH-12-AB-1234",
    insuranceDetails: {
      company: "ICICI Lombard",
      idv: 450000,
      annualPremium: 18000,
      fitnessExpiry: "2025-01-10",
      taxDueDate: "2024-12-31",
      taxDueAmount: 12000,
    },
    fullPurchaseAmount: 420000,
    paymentModes: [
      {
        id: "1",
        mode: "Cash",
        amount: 50000,
        date: "2024-01-10",
        percentage: 11.9,
      },
      {
        id: "2",
        mode: "RTGS",
        amount: 370000,
        date: "2024-01-10",
        percentage: 88.1,
        transactionId: "RTGS123456",
      },
    ],
    expenses: {
      transportation: 8000,
      driver: 5000,
      diesel: 3000,
      toll: 2000,
      bodyWork: 25000,
      kamaniWork: 15000,
      tyre: 12000,
      paint: 8000,
      floor: 5000,
      fatta: 3000,
      builty: 2000,
      insurance: 18000,
    },
    status: "available",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-20T15:00:00Z",
  },
  {
    id: "TRK002",
    registrationNumber: "GJ-05-CD-5678",
    model: "Ashok Leyland Dost",
    initialModelYear: 2019,
    purchaseDate: "2024-01-05",
    sellerDetails: {
      name: "Priya Sharma",
      address: "Ahmedabad, Gujarat",
      phoneNumber: "9876543211",
      aadhaarNumber: "123456789013",
      emailId: "priya@example.com",
    },
    nocApplied: true,
    nocAppliedDate: "2024-01-07",
    nocReceivedDate: "2024-01-15",
    newRegistrationNumber: "GJ-05-CD-5678",
    insuranceDetails: {
      company: "Bajaj Allianz",
      idv: 380000,
      annualPremium: 15000,
      fitnessExpiry: "2025-01-05",
      taxDueDate: "2024-12-31",
      taxDueAmount: 10000,
    },
    fullPurchaseAmount: 350000,
    paymentModes: [
      {
        id: "3",
        mode: "Cheque",
        amount: 350000,
        date: "2024-01-05",
        percentage: 100,
        chequeNumber: "123456",
        bankName: "SBI",
      },
    ],
    expenses: {
      transportation: 7000,
      driver: 4000,
      diesel: 2500,
      toll: 1500,
      bodyWork: 20000,
      kamaniWork: 12000,
      tyre: 10000,
      paint: 6000,
      floor: 4000,
      fatta: 2500,
      builty: 1500,
      insurance: 15000,
    },
    saleDetails: {
      buyerDetails: {
        name: "Suresh Patel",
        address: "Surat, Gujarat",
        aadhaarNumber: "987654321098",
        phoneNumber: "9876543333",
        emailId: "suresh@example.com",
      },
      saleAmount: 480000,
      saleDate: "2024-01-25",
      commissionDealerName: "Gujarat Motors",
      commissionAmount: 15000,
    },
    status: "sold",
    profit: 79000,
    createdAt: "2024-01-05T09:00:00Z",
    updatedAt: "2024-01-25T16:00:00Z",
  },
  {
    id: "TRK003",
    registrationNumber: "KA-03-EF-9012",
    model: "Eicher Pro 1049",
    initialModelYear: 2020,
    purchaseDate: "2024-01-15",
    sellerDetails: {
      name: "Ramesh Nair",
      address: "Bangalore, Karnataka",
      phoneNumber: "9876543212",
      aadhaarNumber: "123456789014",
      emailId: "ramesh@example.com",
    },
    nocApplied: true,
    nocAppliedDate: "2024-01-17",
    insuranceDetails: {
      company: "New India Assurance",
      idv: 520000,
      annualPremium: 21000,
      fitnessExpiry: "2025-01-15",
      taxDueDate: "2024-12-31",
      taxDueAmount: 15000,
    },
    fullPurchaseAmount: 485000,
    paymentModes: [
      {
        id: "4",
        mode: "Cash",
        amount: 100000,
        date: "2024-01-15",
        percentage: 20.6,
      },
      {
        id: "5",
        mode: "GPay",
        amount: 385000,
        date: "2024-01-15",
        percentage: 79.4,
        transactionId: "GP123456789",
      },
    ],
    expenses: {
      transportation: 10000,
      driver: 6000,
      diesel: 4000,
      toll: 3000,
      bodyWork: 30000,
      kamaniWork: 18000,
      tyre: 15000,
      paint: 10000,
      floor: 6000,
      fatta: 4000,
      builty: 3000,
      insurance: 21000,
    },
    status: "noc-pending",
    createdAt: "2024-01-15T11:00:00Z",
    updatedAt: "2024-01-17T14:00:00Z",
  },
];

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [trucks, setTrucks] = useState<TruckInventory[]>(mockTrucks);
  const [truckModels] = useState<string[]>(mockTruckModels);

  const calculateProfit = (
    truck: TruckInventory,
    saleDetails?: SaleDetails,
  ): number => {
    if (!saleDetails) return 0;

    const totalExpenses = Object.values(truck.expenses).reduce(
      (sum, expense) => sum + expense,
      0,
    );
    const totalCost = truck.fullPurchaseAmount + totalExpenses;
    const netSaleAmount = saleDetails.saleAmount - saleDetails.commissionAmount;

    return netSaleAmount - totalCost;
  };

  const addTruck = (
    truckData: Omit<
      TruckInventory,
      "id" | "profit" | "createdAt" | "updatedAt"
    >,
  ) => {
    const newTruck: TruckInventory = {
      ...truckData,
      id: `TRK${(trucks.length + 1).toString().padStart(3, "0")}`,
      profit: truckData.saleDetails
        ? calculateProfit(truckData as TruckInventory, truckData.saleDetails)
        : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTrucks((prev) => [...prev, newTruck]);
  };

  const updateTruck = (id: string, updates: Partial<TruckInventory>) => {
    setTrucks((prev) =>
      prev.map((truck) => {
        if (truck.id === id) {
          const updatedTruck = { ...truck, ...updates };
          if (updates.saleDetails) {
            updatedTruck.profit = calculateProfit(
              updatedTruck,
              updates.saleDetails,
            );
            updatedTruck.status = "sold";
          }
          updatedTruck.updatedAt = new Date().toISOString();
          return updatedTruck;
        }
        return truck;
      }),
    );
  };

  const deleteTruck = (id: string) => {
    setTrucks((prev) => prev.filter((truck) => truck.id !== id));
  };

  const getTruck = (id: string) => {
    return trucks.find((truck) => truck.id === id);
  };

  const sellTruck = (id: string, saleDetails: SaleDetails) => {
    updateTruck(id, { saleDetails, status: "sold" });
  };

  const value = {
    trucks,
    truckModels,
    addTruck,
    updateTruck,
    deleteTruck,
    getTruck,
    sellTruck,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
