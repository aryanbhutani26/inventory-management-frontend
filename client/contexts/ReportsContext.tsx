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
    const completedTrips = filteredTrips.filter(\n      (trip) => trip.status === \"completed\",\n    ).length;\n    const totalRevenue = filteredTrips.reduce(\n      (sum, trip) => sum + trip.revenue,\n      0,\n    );\n    const totalExpenses = filteredTrips.reduce(\n      (sum, trip) =>\n        sum +\n        trip.expenses.diesel +\n        trip.expenses.toll +\n        trip.expenses.driver +\n        trip.expenses.other,\n      0,\n    );\n    const totalProfit = filteredTrips.reduce(\n      (sum, trip) => sum + trip.profit,\n      0,\n    );\n    const averageProfitPerTrip = totalTrips > 0 ? totalProfit / totalTrips : 0;\n\n    // Top performing trucks\n    const truckPerformance = new Map<string, { trips: number; profit: number }>();\n    filteredTrips.forEach((trip) => {\n      const current = truckPerformance.get(trip.truckRegistration) || {\n        trips: 0,\n        profit: 0,\n      };\n      truckPerformance.set(trip.truckRegistration, {\n        trips: current.trips + 1,\n        profit: current.profit + trip.profit,\n      });\n    });\n\n    const topPerformingTrucks = Array.from(truckPerformance.entries())\n      .map(([truckId, data]) => ({ truckId, ...data }))\n      .sort((a, b) => b.profit - a.profit)\n      .slice(0, 5);\n\n    // Monthly data\n    const monthlyData = new Map<string, { trips: number; revenue: number; profit: number }>();\n    filteredTrips.forEach((trip) => {\n      const month = new Date(trip.startDate).toISOString().substring(0, 7);\n      const current = monthlyData.get(month) || { trips: 0, revenue: 0, profit: 0 };\n      monthlyData.set(month, {\n        trips: current.trips + 1,\n        revenue: current.revenue + trip.revenue,\n        profit: current.profit + trip.profit,\n      });\n    });\n\n    const monthlyDataArray = Array.from(monthlyData.entries())\n      .map(([month, data]) => ({ month, ...data }))\n      .sort((a, b) => a.month.localeCompare(b.month));\n\n    // Expense breakdown\n    const expenseBreakdown = filteredTrips.reduce(\n      (acc, trip) => ({\n        diesel: acc.diesel + trip.expenses.diesel,\n        toll: acc.toll + trip.expenses.toll,\n        driver: acc.driver + trip.expenses.driver,\n        other: acc.other + trip.expenses.other,\n      }),\n      { diesel: 0, toll: 0, driver: 0, other: 0 },\n    );\n\n    return {\n      totalTrips,\n      completedTrips,\n      totalRevenue,\n      totalExpenses,\n      totalProfit,\n      averageProfitPerTrip,\n      topPerformingTrucks,\n      monthlyData: monthlyDataArray,\n      expenseBreakdown,\n    };\n  };\n\n  const generateInventoryReport = (filter?: ReportFilter): InventoryReport => {\n    let filteredTrucks = trucks;\n\n    if (filter) {\n      filteredTrucks = trucks.filter((truck) => {\n        const matchesDate =\n          (!filter.dateFrom ||\n            new Date(truck.purchaseDate) >= new Date(filter.dateFrom)) &&\n          (!filter.dateTo ||\n            new Date(truck.purchaseDate) <= new Date(filter.dateTo));\n        const matchesStatus = !filter.status || truck.status === filter.status;\n        return matchesDate && matchesStatus;\n      });\n    }\n\n    const totalTrucks = filteredTrucks.length;\n    const soldTrucks = filteredTrucks.filter(\n      (truck) => truck.status === \"sold\",\n    ).length;\n    const availableTrucks = filteredTrucks.filter(\n      (truck) => truck.status === \"available\",\n    ).length;\n    const pendingNOCs = filteredTrucks.filter(\n      (truck) => truck.nocApplied && !truck.nocReceivedDate,\n    ).length;\n\n    const totalInvestment = filteredTrucks.reduce((sum, truck) => {\n      const expenses = Object.values(truck.expenses).reduce(\n        (expSum, exp) => expSum + exp,\n        0,\n      );\n      return sum + truck.fullPurchaseAmount + expenses;\n    }, 0);\n\n    const soldTrucksList = filteredTrucks.filter(\n      (truck) => truck.status === \"sold\" && truck.saleDetails,\n    );\n    const totalSalesRevenue = soldTrucksList.reduce(\n      (sum, truck) => sum + (truck.saleDetails?.saleAmount || 0),\n      0,\n    );\n    const totalProfit = soldTrucksList.reduce(\n      (sum, truck) => sum + (truck.profit || 0),\n      0,\n    );\n    const averageProfitPerTruck =\n      soldTrucks > 0 ? totalProfit / soldTrucks : 0;\n\n    // Top selling models\n    const modelPerformance = new Map<string, { count: number; profit: number }>();\n    soldTrucksList.forEach((truck) => {\n      const current = modelPerformance.get(truck.model) || {\n        count: 0,\n        profit: 0,\n      };\n      modelPerformance.set(truck.model, {\n        count: current.count + 1,\n        profit: current.profit + (truck.profit || 0),\n      });\n    });\n\n    const topSellingModels = Array.from(modelPerformance.entries())\n      .map(([model, data]) => ({ model, ...data }))\n      .sort((a, b) => b.profit - a.profit)\n      .slice(0, 5);\n\n    // Monthly purchases\n    const monthlyPurchases = new Map<string, { purchases: number; investment: number }>();\n    filteredTrucks.forEach((truck) => {\n      const month = new Date(truck.purchaseDate).toISOString().substring(0, 7);\n      const current = monthlyPurchases.get(month) || {\n        purchases: 0,\n        investment: 0,\n      };\n      const expenses = Object.values(truck.expenses).reduce(\n        (sum, exp) => sum + exp,\n        0,\n      );\n      monthlyPurchases.set(month, {\n        purchases: current.purchases + 1,\n        investment: current.investment + truck.fullPurchaseAmount + expenses,\n      });\n    });\n\n    const monthlyPurchasesArray = Array.from(monthlyPurchases.entries())\n      .map(([month, data]) => ({ month, ...data }))\n      .sort((a, b) => a.month.localeCompare(b.month));\n\n    // Monthly sales\n    const monthlySales = new Map<\n      string,\n      { sales: number; revenue: number; profit: number }\n    >();\n    soldTrucksList.forEach((truck) => {\n      if (truck.saleDetails) {\n        const month = new Date(truck.saleDetails.saleDate)\n          .toISOString()\n          .substring(0, 7);\n        const current = monthlySales.get(month) || {\n          sales: 0,\n          revenue: 0,\n          profit: 0,\n        };\n        monthlySales.set(month, {\n          sales: current.sales + 1,\n          revenue: current.revenue + truck.saleDetails.saleAmount,\n          profit: current.profit + (truck.profit || 0),\n        });\n      }\n    });\n\n    const monthlySalesArray = Array.from(monthlySales.entries())\n      .map(([month, data]) => ({ month, ...data }))\n      .sort((a, b) => a.month.localeCompare(b.month));\n\n    // Expense breakdown\n    const expenseBreakdown = filteredTrucks.reduce(\n      (acc, truck) => ({\n        transportation: acc.transportation + truck.expenses.transportation,\n        bodyWork: acc.bodyWork + truck.expenses.bodyWork,\n        kamaniWork: acc.kamaniWork + truck.expenses.kamaniWork,\n        tyre: acc.tyre + truck.expenses.tyre,\n        paint: acc.paint + truck.expenses.paint,\n        insurance: acc.insurance + truck.expenses.insurance,\n        other:\n          acc.other +\n          truck.expenses.driver +\n          truck.expenses.diesel +\n          truck.expenses.toll +\n          truck.expenses.floor +\n          truck.expenses.fatta +\n          truck.expenses.builty,\n      }),\n      {\n        transportation: 0,\n        bodyWork: 0,\n        kamaniWork: 0,\n        tyre: 0,\n        paint: 0,\n        insurance: 0,\n        other: 0,\n      },\n    );\n\n    return {\n      totalTrucks,\n      soldTrucks,\n      availableTrucks,\n      totalInvestment,\n      totalSalesRevenue,\n      totalProfit,\n      averageProfitPerTruck,\n      pendingNOCs,\n      topSellingModels,\n      monthlyPurchases: monthlyPurchasesArray,\n      monthlySales: monthlySalesArray,\n      expenseBreakdown,\n    };\n  };\n\n  const getDashboardMetrics = (): DashboardMetrics => {\n    const transportReport = generateTransportReport();\n    const inventoryReport = generateInventoryReport();\n\n    const totalRevenue = transportReport.totalRevenue + inventoryReport.totalSalesRevenue;\n    const totalProfit = transportReport.totalProfit + inventoryReport.totalProfit;\n    const roi = inventoryReport.totalInvestment > 0 \n      ? (totalProfit / inventoryReport.totalInvestment) * 100 \n      : 0;\n\n    return {\n      transportMetrics: {\n        totalTrips: transportReport.totalTrips,\n        activeTrips: trips.filter(\n          (trip) => trip.status === \"in-transit\" || trip.status === \"planned\",\n        ).length,\n        monthlyProfit: transportReport.monthlyData\n          .filter(\n            (data) =>\n              data.month ===\n              new Date().toISOString().substring(0, 7),\n          )\n          .reduce((sum, data) => sum + data.profit, 0),\n        totalRevenue: transportReport.totalRevenue,\n      },\n      inventoryMetrics: {\n        totalTrucks: inventoryReport.totalTrucks,\n        soldTrucks: inventoryReport.soldTrucks,\n        pendingNOCs: inventoryReport.pendingNOCs,\n        totalProfit: inventoryReport.totalProfit,\n      },\n      overallMetrics: {\n        totalProfit,\n        totalRevenue,\n        totalInvestment: inventoryReport.totalInvestment,\n        roi,\n      },\n    };\n  };\n\n  const exportToPDF = (reportType: \"transport\" | \"inventory\", data: any) => {\n    // Mock PDF export - in real implementation, use libraries like jsPDF\n    console.log(`Exporting ${reportType} report to PDF:`, data);\n    alert(`PDF export feature will be implemented. Report data logged to console.`);\n  };\n\n  const exportToCSV = (reportType: \"transport\" | \"inventory\", data: any) => {\n    // Mock CSV export - in real implementation, convert data to CSV format\n    console.log(`Exporting ${reportType} report to CSV:`, data);\n    \n    let csvContent = \"\";\n    \n    if (reportType === \"transport\") {\n      csvContent = \"Trip ID,Truck,Source,Destination,Start Date,Revenue,Profit,Status\\n\";\n      trips.forEach((trip) => {\n        csvContent += `${trip.id},${trip.truckRegistration},${trip.source},${trip.destination},${trip.startDate},${trip.revenue},${trip.profit},${trip.status}\\n`;\n      });\n    } else {\n      csvContent = \"Truck ID,Registration,Model,Purchase Date,Purchase Amount,Status,Profit\\n\";\n      trucks.forEach((truck) => {\n        csvContent += `${truck.id},${truck.registrationNumber},${truck.model},${truck.purchaseDate},${truck.fullPurchaseAmount},${truck.status},${truck.profit || 0}\\n`;\n      });\n    }\n    \n    const blob = new Blob([csvContent], { type: \"text/csv;charset=utf-8;\" });\n    const link = document.createElement(\"a\");\n    const url = URL.createObjectURL(blob);\n    link.setAttribute(\"href\", url);\n    link.setAttribute(\"download\", `${reportType}_report.csv`);\n    link.style.visibility = \"hidden\";\n    document.body.appendChild(link);\n    link.click();\n    document.body.removeChild(link);\n  };\n\n  const value = {\n    generateTransportReport,\n    generateInventoryReport,\n    getDashboardMetrics,\n    exportToPDF,\n    exportToCSV,\n  };\n\n  return (\n    <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>\n  );\n}\n\nexport function useReports() {\n  const context = useContext(ReportsContext);\n  if (context === undefined) {\n    throw new Error(\"useReports must be used within a ReportsProvider\");\n  }\n  return context;\n}\n