import React, { createContext, useContext, ReactNode } from "react";
import { useTransport } from "./TransportContext";
import { useInventory } from "./InventoryContext";

export interface ReportFilter {
  dateFrom?: string;
  dateTo?: string;
  truckId?: string;
  status?: string;
}

export interface TransportReport {
  totalTrips: number;
  completedTrips: number;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  averageProfitPerTrip: number;
  topPerformingTrucks: Array<{
    truckId: string;
    trips: number;
    profit: number;
  }>;
  monthlyData: Array<{
    month: string;
    trips: number;
    revenue: number;
    profit: number;
  }>;
  expenseBreakdown: {
    diesel: number;
    toll: number;
    driver: number;
    other: number;
  };
}

export interface InventoryReport {
  totalTrucks: number;
  soldTrucks: number;
  availableTrucks: number;
  totalInvestment: number;
  totalSalesRevenue: number;
  totalProfit: number;
  averageProfitPerTruck: number;
  pendingNOCs: number;
  topSellingModels: Array<{
    model: string;
    count: number;
    profit: number;
  }>;
  monthlyPurchases: Array<{
    month: string;
    purchases: number;
    investment: number;
  }>;
  monthlySales: Array<{
    month: string;
    sales: number;
    revenue: number;
    profit: number;
  }>;
  expenseBreakdown: {
    transportation: number;
    bodyWork: number;
    kamaniWork: number;
    tyre: number;
    paint: number;
    insurance: number;
    other: number;
  };
}

export interface DashboardMetrics {
  transportMetrics: {
    totalTrips: number;
    activeTrips: number;
    monthlyProfit: number;
    totalRevenue: number;
  };
  inventoryMetrics: {
    totalTrucks: number;
    soldTrucks: number;
    pendingNOCs: number;
    totalProfit: number;
  };
  overallMetrics: {
    totalProfit: number;
    totalRevenue: number;
    totalInvestment: number;
    roi: number;
  };
}

interface ReportsContextType {
  generateTransportReport: (filter?: ReportFilter) => TransportReport;
  generateInventoryReport: (filter?: ReportFilter) => InventoryReport;
  getDashboardMetrics: () => DashboardMetrics;
  exportToPDF: (reportType: "transport" | "inventory", data: any) => void;
  exportToCSV: (reportType: "transport" | "inventory", data: any) => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const { trips } = useTransport();
  const { trucks } = useInventory();

  const generateTransportReport = (filter?: ReportFilter): TransportReport => {
    let filteredTrips = trips;

    if (filter) {
      filteredTrips = trips.filter((trip) => {
        const matchesDate =
          (!filter.dateFrom ||
            new Date(trip.startDate) >= new Date(filter.dateFrom)) &&
          (!filter.dateTo ||
            new Date(trip.startDate) <= new Date(filter.dateTo));
        const matchesTruck =
          !filter.truckId || trip.truckRegistration === filter.truckId;
        const matchesStatus = !filter.status || trip.status === filter.status;
        return matchesDate && matchesTruck && matchesStatus;
      });
    }

    const totalTrips = filteredTrips.length;
    const completedTrips = filteredTrips.filter(
      (trip) => trip.status === "completed",
    ).length;
    const totalRevenue = filteredTrips.reduce(
      (sum, trip) => sum + trip.revenue,
      0,
    );
    const totalExpenses = filteredTrips.reduce(
      (sum, trip) =>
        sum +
        trip.expenses.diesel +
        trip.expenses.toll +
        trip.expenses.driver +
        trip.expenses.other,
      0,
    );
    const totalProfit = filteredTrips.reduce(
      (sum, trip) => sum + trip.profit,
      0,
    );
    const averageProfitPerTrip = totalTrips > 0 ? totalProfit / totalTrips : 0;

    // Top performing trucks
    const truckPerformance = new Map<
      string,
      { trips: number; profit: number }
    >();
    filteredTrips.forEach((trip) => {
      const current = truckPerformance.get(trip.truckRegistration) || {
        trips: 0,
        profit: 0,
      };
      truckPerformance.set(trip.truckRegistration, {
        trips: current.trips + 1,
        profit: current.profit + trip.profit,
      });
    });

    const topPerformingTrucks = Array.from(truckPerformance.entries())
      .map(([truckId, data]) => ({ truckId, ...data }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    // Monthly data
    const monthlyData = new Map<
      string,
      { trips: number; revenue: number; profit: number }
    >();
    filteredTrips.forEach((trip) => {
      const month = new Date(trip.startDate).toISOString().substring(0, 7);
      const current = monthlyData.get(month) || {
        trips: 0,
        revenue: 0,
        profit: 0,
      };
      monthlyData.set(month, {
        trips: current.trips + 1,
        revenue: current.revenue + trip.revenue,
        profit: current.profit + trip.profit,
      });
    });

    const monthlyDataArray = Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Expense breakdown
    const expenseBreakdown = filteredTrips.reduce(
      (acc, trip) => ({
        diesel: acc.diesel + trip.expenses.diesel,
        toll: acc.toll + trip.expenses.toll,
        driver: acc.driver + trip.expenses.driver,
        other: acc.other + trip.expenses.other,
      }),
      { diesel: 0, toll: 0, driver: 0, other: 0 },
    );

    return {
      totalTrips,
      completedTrips,
      totalRevenue,
      totalExpenses,
      totalProfit,
      averageProfitPerTrip,
      topPerformingTrucks,
      monthlyData: monthlyDataArray,
      expenseBreakdown,
    };
  };

  const generateInventoryReport = (filter?: ReportFilter): InventoryReport => {
    let filteredTrucks = trucks;

    if (filter) {
      filteredTrucks = trucks.filter((truck) => {
        const matchesDate =
          (!filter.dateFrom ||
            new Date(truck.purchaseDate) >= new Date(filter.dateFrom)) &&
          (!filter.dateTo ||
            new Date(truck.purchaseDate) <= new Date(filter.dateTo));
        const matchesStatus = !filter.status || truck.status === filter.status;
        return matchesDate && matchesStatus;
      });
    }

    const totalTrucks = filteredTrucks.length;
    const soldTrucks = filteredTrucks.filter(
      (truck) => truck.status === "sold",
    ).length;
    const availableTrucks = filteredTrucks.filter(
      (truck) => truck.status === "available",
    ).length;
    const pendingNOCs = filteredTrucks.filter(
      (truck) => truck.nocApplied && !truck.nocReceivedDate,
    ).length;

    const totalInvestment = filteredTrucks.reduce((sum, truck) => {
      const expenses = Object.values(truck.expenses).reduce(
        (expSum, exp) => expSum + exp,
        0,
      );
      return sum + truck.fullPurchaseAmount + expenses;
    }, 0);

    const soldTrucksList = filteredTrucks.filter(
      (truck) => truck.status === "sold" && truck.saleDetails,
    );
    const totalSalesRevenue = soldTrucksList.reduce(
      (sum, truck) => sum + (truck.saleDetails?.saleAmount || 0),
      0,
    );
    const totalProfit = soldTrucksList.reduce(
      (sum, truck) => sum + (truck.profit || 0),
      0,
    );
    const averageProfitPerTruck = soldTrucks > 0 ? totalProfit / soldTrucks : 0;

    // Top selling models
    const modelPerformance = new Map<
      string,
      { count: number; profit: number }
    >();
    soldTrucksList.forEach((truck) => {
      const current = modelPerformance.get(truck.model) || {
        count: 0,
        profit: 0,
      };
      modelPerformance.set(truck.model, {
        count: current.count + 1,
        profit: current.profit + (truck.profit || 0),
      });
    });

    const topSellingModels = Array.from(modelPerformance.entries())
      .map(([model, data]) => ({ model, ...data }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    // Monthly purchases
    const monthlyPurchases = new Map<
      string,
      { purchases: number; investment: number }
    >();
    filteredTrucks.forEach((truck) => {
      const month = new Date(truck.purchaseDate).toISOString().substring(0, 7);
      const current = monthlyPurchases.get(month) || {
        purchases: 0,
        investment: 0,
      };
      const expenses = Object.values(truck.expenses).reduce(
        (sum, exp) => sum + exp,
        0,
      );
      monthlyPurchases.set(month, {
        purchases: current.purchases + 1,
        investment: current.investment + truck.fullPurchaseAmount + expenses,
      });
    });

    const monthlyPurchasesArray = Array.from(monthlyPurchases.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Monthly sales
    const monthlySales = new Map<
      string,
      { sales: number; revenue: number; profit: number }
    >();
    soldTrucksList.forEach((truck) => {
      if (truck.saleDetails) {
        const month = new Date(truck.saleDetails.saleDate)
          .toISOString()
          .substring(0, 7);
        const current = monthlySales.get(month) || {
          sales: 0,
          revenue: 0,
          profit: 0,
        };
        monthlySales.set(month, {
          sales: current.sales + 1,
          revenue: current.revenue + truck.saleDetails.saleAmount,
          profit: current.profit + (truck.profit || 0),
        });
      }
    });

    const monthlySalesArray = Array.from(monthlySales.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Expense breakdown
    const expenseBreakdown = filteredTrucks.reduce(
      (acc, truck) => ({
        transportation: acc.transportation + truck.expenses.transportation,
        bodyWork: acc.bodyWork + truck.expenses.bodyWork,
        kamaniWork: acc.kamaniWork + truck.expenses.kamaniWork,
        tyre: acc.tyre + truck.expenses.tyre,
        paint: acc.paint + truck.expenses.paint,
        insurance: acc.insurance + truck.expenses.insurance,
        other:
          acc.other +
          truck.expenses.driver +
          truck.expenses.diesel +
          truck.expenses.toll +
          truck.expenses.floor +
          truck.expenses.fatta +
          truck.expenses.builty,
      }),
      {
        transportation: 0,
        bodyWork: 0,
        kamaniWork: 0,
        tyre: 0,
        paint: 0,
        insurance: 0,
        other: 0,
      },
    );

    return {
      totalTrucks,
      soldTrucks,
      availableTrucks,
      totalInvestment,
      totalSalesRevenue,
      totalProfit,
      averageProfitPerTruck,
      pendingNOCs,
      topSellingModels,
      monthlyPurchases: monthlyPurchasesArray,
      monthlySales: monthlySalesArray,
      expenseBreakdown,
    };
  };

  const getDashboardMetrics = (): DashboardMetrics => {
    const transportReport = generateTransportReport();
    const inventoryReport = generateInventoryReport();

    const totalRevenue =
      transportReport.totalRevenue + inventoryReport.totalSalesRevenue;
    const totalProfit =
      transportReport.totalProfit + inventoryReport.totalProfit;
    const roi =
      inventoryReport.totalInvestment > 0
        ? (totalProfit / inventoryReport.totalInvestment) * 100
        : 0;

    return {
      transportMetrics: {
        totalTrips: transportReport.totalTrips,
        activeTrips: trips.filter(
          (trip) => trip.status === "in-transit" || trip.status === "planned",
        ).length,
        monthlyProfit: transportReport.monthlyData
          .filter(
            (data) => data.month === new Date().toISOString().substring(0, 7),
          )
          .reduce((sum, data) => sum + data.profit, 0),
        totalRevenue: transportReport.totalRevenue,
      },
      inventoryMetrics: {
        totalTrucks: inventoryReport.totalTrucks,
        soldTrucks: inventoryReport.soldTrucks,
        pendingNOCs: inventoryReport.pendingNOCs,
        totalProfit: inventoryReport.totalProfit,
      },
      overallMetrics: {
        totalProfit,
        totalRevenue,
        totalInvestment: inventoryReport.totalInvestment,
        roi,
      },
    };
  };

  const exportToPDF = (reportType: "transport" | "inventory", data: any) => {
    // Mock PDF export - in real implementation, use libraries like jsPDF
    console.log(`Exporting ${reportType} report to PDF:`, data);
    alert(
      `PDF export feature will be implemented. Report data logged to console.`,
    );
  };

  const exportToCSV = (reportType: "transport" | "inventory", data: any) => {
    // Mock CSV export - in real implementation, convert data to CSV format
    console.log(`Exporting ${reportType} report to CSV:`, data);

    let csvContent = "";

    if (reportType === "transport") {
      csvContent =
        "Trip ID,Truck,Source,Destination,Start Date,Revenue,Profit,Status\n";
      trips.forEach((trip) => {
        csvContent += `${trip.id},${trip.truckRegistration},${trip.source},${trip.destination},${trip.startDate},${trip.revenue},${trip.profit},${trip.status}\n`;
      });
    } else {
      csvContent =
        "Truck ID,Registration,Model,Purchase Date,Purchase Amount,Status,Profit\n";
      trucks.forEach((truck) => {
        csvContent += `${truck.id},${truck.registrationNumber},${truck.model},${truck.purchaseDate},${truck.fullPurchaseAmount},${truck.status},${truck.profit || 0}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportType}_report.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const value = {
    generateTransportReport,
    generateInventoryReport,
    getDashboardMetrics,
    exportToPDF,
    exportToCSV,
  };

  return (
    <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider");
  }
  return context;
}
