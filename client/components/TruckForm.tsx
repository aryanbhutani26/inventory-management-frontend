import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useInventory,
  TruckInventory,
  PaymentEntry,
  PaymentMode,
} from "../contexts/InventoryContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
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
} from "./ui/alert-dialog";
import {
  Package,
  User,
  IndianRupee,
  Calendar,
  Plus,
  Trash2,
  Calculator,
  Shield,
  FileText,
} from "lucide-react";

interface TruckFormProps {
  truckId?: string;
  mode: "create" | "edit";
}

export default function TruckForm({ truckId, mode }: TruckFormProps) {
  const navigate = useNavigate();
  const { truckModels, addTruck, updateTruck, getTruck } = useInventory();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("purchase");

  const [formData, setFormData] = useState({
    registrationNumber: "",
    model: "",
    initialModelYear: new Date().getFullYear(),
    purchaseDate: "",
    sellerDetails: {
      name: "",
      address: "",
      phoneNumber: "",
      aadhaarNumber: "",
      emailId: "",
    },
    nocApplied: false,
    nocAppliedDate: "",
    nocReceivedDate: "",
    newRegistrationNumber: "",
    insuranceDetails: {
      company: "",
      idv: "",
      annualPremium: "",
      fitnessExpiry: "",
      taxDueDate: "",
      taxDueAmount: "",
    },
    fullPurchaseAmount: "",
    expenses: {
      transportation: "",
      driver: "",
      diesel: "",
      toll: "",
      bodyWork: "",
      kamaniWork: "",
      tyre: "",
      paint: "",
      floor: "",
      fatta: "",
      builty: "",
      insurance: "",
    },
    saleDetails: {
      buyerDetails: {
        name: "",
        address: "",
        aadhaarNumber: "",
        phoneNumber: "",
        emailId: "",
      },
      saleAmount: "",
      saleDate: "",
      commissionDealerName: "",
      commissionAmount: "",
    },
    status: "available" as TruckInventory["status"],
  });

  const [paymentModes, setPaymentModes] = useState<PaymentEntry[]>([]);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    if (mode === "edit" && truckId) {
      const truck = getTruck(truckId);
      if (truck) {
        setFormData({
          registrationNumber: truck.registrationNumber,
          model: truck.model,
          initialModelYear: truck.initialModelYear,
          purchaseDate: truck.purchaseDate,
          sellerDetails: truck.sellerDetails,
          nocApplied: truck.nocApplied,
          nocAppliedDate: truck.nocAppliedDate || "",
          nocReceivedDate: truck.nocReceivedDate || "",
          newRegistrationNumber: truck.newRegistrationNumber || "",
          insuranceDetails: {
            company: truck.insuranceDetails.company,
            idv: truck.insuranceDetails.idv.toString(),
            annualPremium: truck.insuranceDetails.annualPremium.toString(),
            fitnessExpiry: truck.insuranceDetails.fitnessExpiry,
            taxDueDate: truck.insuranceDetails.taxDueDate,
            taxDueAmount: truck.insuranceDetails.taxDueAmount.toString(),
          },
          fullPurchaseAmount: truck.fullPurchaseAmount.toString(),
          expenses: {
            transportation: truck.expenses.transportation.toString(),
            driver: truck.expenses.driver.toString(),
            diesel: truck.expenses.diesel.toString(),
            toll: truck.expenses.toll.toString(),
            bodyWork: truck.expenses.bodyWork.toString(),
            kamaniWork: truck.expenses.kamaniWork.toString(),
            tyre: truck.expenses.tyre.toString(),
            paint: truck.expenses.paint.toString(),
            floor: truck.expenses.floor.toString(),
            fatta: truck.expenses.fatta.toString(),
            builty: truck.expenses.builty.toString(),
            insurance: truck.expenses.insurance.toString(),
          },
          saleDetails: truck.saleDetails
            ? {
                buyerDetails: truck.saleDetails.buyerDetails,
                saleAmount: truck.saleDetails.saleAmount.toString(),
                saleDate: truck.saleDetails.saleDate,
                commissionDealerName: truck.saleDetails.commissionDealerName,
                commissionAmount: truck.saleDetails.commissionAmount.toString(),
              }
            : {
                buyerDetails: {
                  name: "",
                  address: "",
                  aadhaarNumber: "",
                  phoneNumber: "",
                  emailId: "",
                },
                saleAmount: "",
                saleDate: "",
                commissionDealerName: "",
                commissionAmount: "",
              },
          status: truck.status,
        });
        setPaymentModes(truck.paymentModes);
      }
    }
  }, [mode, truckId, getTruck]);

  useEffect(() => {
    calculateProfit();
  }, [formData.expenses, formData.fullPurchaseAmount, formData.saleDetails]);

  const calculateProfit = () => {
    const totalExpenses = Object.values(formData.expenses).reduce(
      (sum, expense) => sum + (parseFloat(expense) || 0),
      0,
    );
    const purchaseAmount = parseFloat(formData.fullPurchaseAmount) || 0;
    const saleAmount = parseFloat(formData.saleDetails.saleAmount) || 0;
    const commissionAmount =
      parseFloat(formData.saleDetails.commissionAmount) || 0;

    const totalCost = purchaseAmount + totalExpenses;
    const netSaleAmount = saleAmount - commissionAmount;
    setProfit(netSaleAmount - totalCost);
  };

  const addPaymentMode = () => {
    const newPayment: PaymentEntry = {
      id: Date.now().toString(),
      mode: "Cash",
      amount: 0,
      date: "",
      percentage: 0,
    };
    setPaymentModes([...paymentModes, newPayment]);
  };

  const updatePaymentMode = (id: string, updates: Partial<PaymentEntry>) => {
    setPaymentModes(
      paymentModes.map((payment) =>
        payment.id === id ? { ...payment, ...updates } : payment,
      ),
    );
  };

  const removePaymentMode = (id: string) => {
    setPaymentModes(paymentModes.filter((payment) => payment.id !== id));
  };

  const updateFormData = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const truckData = {
        registrationNumber: formData.registrationNumber,
        model: formData.model,
        initialModelYear: formData.initialModelYear,
        purchaseDate: formData.purchaseDate,
        sellerDetails: formData.sellerDetails,
        nocApplied: formData.nocApplied,
        nocAppliedDate: formData.nocAppliedDate || undefined,
        nocReceivedDate: formData.nocReceivedDate || undefined,
        newRegistrationNumber: formData.newRegistrationNumber || undefined,
        insuranceDetails: {
          company: formData.insuranceDetails.company,
          idv: parseFloat(formData.insuranceDetails.idv) || 0,
          annualPremium:
            parseFloat(formData.insuranceDetails.annualPremium) || 0,
          fitnessExpiry: formData.insuranceDetails.fitnessExpiry,
          taxDueDate: formData.insuranceDetails.taxDueDate,
          taxDueAmount: parseFloat(formData.insuranceDetails.taxDueAmount) || 0,
        },
        fullPurchaseAmount: parseFloat(formData.fullPurchaseAmount) || 0,
        paymentModes,
        expenses: {
          transportation: parseFloat(formData.expenses.transportation) || 0,
          driver: parseFloat(formData.expenses.driver) || 0,
          diesel: parseFloat(formData.expenses.diesel) || 0,
          toll: parseFloat(formData.expenses.toll) || 0,
          bodyWork: parseFloat(formData.expenses.bodyWork) || 0,
          kamaniWork: parseFloat(formData.expenses.kamaniWork) || 0,
          tyre: parseFloat(formData.expenses.tyre) || 0,
          paint: parseFloat(formData.expenses.paint) || 0,
          floor: parseFloat(formData.expenses.floor) || 0,
          fatta: parseFloat(formData.expenses.fatta) || 0,
          builty: parseFloat(formData.expenses.builty) || 0,
          insurance: parseFloat(formData.expenses.insurance) || 0,
        },
        saleDetails:
          formData.saleDetails.saleAmount &&
          parseFloat(formData.saleDetails.saleAmount) > 0
            ? {
                buyerDetails: formData.saleDetails.buyerDetails,
                saleAmount: parseFloat(formData.saleDetails.saleAmount),
                saleDate: formData.saleDetails.saleDate,
                commissionDealerName: formData.saleDetails.commissionDealerName,
                commissionAmount:
                  parseFloat(formData.saleDetails.commissionAmount) || 0,
              }
            : undefined,
        status: formData.status,
      };

      if (mode === "create") {
        addTruck(truckData);
      } else if (mode === "edit" && truckId) {
        updateTruck(truckId, truckData);
      }

      navigate("/inventory");
    } catch (error) {
      console.error("Error saving truck:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 1980; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse();
  };

  const paymentModeOptions: PaymentMode[] = [
    "Cash",
    "RTGS",
    "GPay",
    "Paytm",
    "PhonePe",
    "Cheque",
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {mode === "create" ? "Add New Truck" : "Edit Truck"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "Enter truck purchase details and manage inventory."
              : `Editing truck ${truckId}`}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/inventory")}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="purchase" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Purchase Details
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="sale" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Sale Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchase" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Truck Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Truck Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">
                      Registration Number *
                    </Label>
                    <Input
                      id="registrationNumber"
                      placeholder="e.g., MH-12-AB-1234"
                      value={formData.registrationNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registrationNumber: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="model">Truck Model *</Label>
                      <Select
                        value={formData.model}
                        onValueChange={(value) =>
                          setFormData({ ...formData, model: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {truckModels.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Model Year *</Label>
                      <Select
                        value={formData.initialModelYear.toString()}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            initialModelYear: parseInt(value),
                          })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getYearOptions().map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Purchase Date *</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchaseDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchaseAmount">Purchase Amount *</Label>
                    <Input
                      id="purchaseAmount"
                      type="number"
                      placeholder="Enter purchase amount"
                      value={formData.fullPurchaseAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fullPurchaseAmount: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Seller Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Seller Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sellerName">Seller Name *</Label>
                    <Input
                      id="sellerName"
                      placeholder="Enter seller name"
                      value={formData.sellerDetails.name}
                      onChange={(e) =>
                        updateFormData("sellerDetails", "name", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sellerAddress">Address *</Label>
                    <Textarea
                      id="sellerAddress"
                      placeholder="Enter complete address"
                      value={formData.sellerDetails.address}
                      onChange={(e) =>
                        updateFormData(
                          "sellerDetails",
                          "address",
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sellerPhone">Phone Number *</Label>
                      <Input
                        id="sellerPhone"
                        placeholder="10-digit mobile number"
                        value={formData.sellerDetails.phoneNumber}
                        onChange={(e) =>
                          updateFormData(
                            "sellerDetails",
                            "phoneNumber",
                            e.target.value,
                          )
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sellerAadhaar">Aadhaar Number *</Label>
                      <Input
                        id="sellerAadhaar"
                        placeholder="12-digit Aadhaar number"
                        value={formData.sellerDetails.aadhaarNumber}
                        onChange={(e) =>
                          updateFormData(
                            "sellerDetails",
                            "aadhaarNumber",
                            e.target.value,
                          )
                        }
                        maxLength={12}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sellerEmail">Email ID</Label>
                    <Input
                      id="sellerEmail"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.sellerDetails.emailId}
                      onChange={(e) =>
                        updateFormData(
                          "sellerDetails",
                          "emailId",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Modes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5" />
                    Payment Modes
                  </CardTitle>
                  <Button
                    type="button"
                    onClick={addPaymentMode}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentModes.map((payment, index) => (
                  <div
                    key={payment.id}
                    className="border border-border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Payment {index + 1}</h4>
                      <Button
                        type="button"
                        onClick={() => removePaymentMode(payment.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Payment Mode</Label>
                        <Select
                          value={payment.mode}
                          onValueChange={(value) =>
                            updatePaymentMode(payment.id, {
                              mode: value as PaymentMode,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentModeOptions.map((mode) => (
                              <SelectItem key={mode} value={mode}>
                                {mode}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={payment.amount}
                          onChange={(e) =>
                            updatePaymentMode(payment.id, {
                              amount: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={payment.date}
                          onChange={(e) =>
                            updatePaymentMode(payment.id, {
                              date: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Percentage</Label>
                        <Input
                          type="number"
                          placeholder="Percentage"
                          value={payment.percentage}
                          onChange={(e) =>
                            updatePaymentMode(payment.id, {
                              percentage: parseFloat(e.target.value) || 0,
                            })
                          }
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                    </div>

                    {(payment.mode === "RTGS" ||
                      payment.mode === "GPay" ||
                      payment.mode === "Paytm" ||
                      payment.mode === "PhonePe") && (
                      <div className="space-y-2">
                        <Label>Transaction ID</Label>
                        <Input
                          placeholder="Enter transaction ID"
                          value={payment.transactionId || ""}
                          onChange={(e) =>
                            updatePaymentMode(payment.id, {
                              transactionId: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}

                    {payment.mode === "Cheque" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Cheque Number</Label>
                          <Input
                            placeholder="Enter cheque number"
                            value={payment.chequeNumber || ""}
                            onChange={(e) =>
                              updatePaymentMode(payment.id, {
                                chequeNumber: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bank Name</Label>
                          <Input
                            placeholder="Enter bank name"
                            value={payment.bankName || ""}
                            onChange={(e) =>
                              updatePaymentMode(payment.id, {
                                bankName: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  Total Expenditure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries({
                    transportation: "Transportation",
                    driver: "Driver Charges",
                    diesel: "Diesel",
                    toll: "Toll Charges",
                    bodyWork: "Body Work",
                    kamaniWork: "Kamani Work",
                    tyre: "Tyre Charges",
                    paint: "Paint Expenses",
                    floor: "Floor Expenses",
                    fatta: "Fatta Expenses",
                    builty: "Builty Expenses",
                    insurance: "Insurance Expenses",
                  }).map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{label}</Label>
                      <Input
                        id={key}
                        type="number"
                        placeholder="0"
                        value={
                          formData.expenses[
                            key as keyof typeof formData.expenses
                          ]
                        }
                        onChange={(e) =>
                          updateFormData("expenses", key, e.target.value)
                        }
                        min="0"
                        step="0.01"
                      />
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Expenses:</span>
                    <span className="text-xl font-bold">
                      ₹
                      {Object.values(formData.expenses)
                        .reduce(
                          (sum, expense) => sum + (parseFloat(expense) || 0),
                          0,
                        )
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sale" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Sale Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="buyerName">Buyer Name</Label>
                      <Input
                        id="buyerName"
                        placeholder="Enter buyer name"
                        value={formData.saleDetails.buyerDetails.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            saleDetails: {
                              ...formData.saleDetails,
                              buyerDetails: {
                                ...formData.saleDetails.buyerDetails,
                                name: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buyerPhone">Phone Number</Label>
                      <Input
                        id="buyerPhone"
                        placeholder="10-digit mobile number"
                        value={formData.saleDetails.buyerDetails.phoneNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            saleDetails: {
                              ...formData.saleDetails,
                              buyerDetails: {
                                ...formData.saleDetails.buyerDetails,
                                phoneNumber: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buyerAddress">Address</Label>
                    <Textarea
                      id="buyerAddress"
                      placeholder="Enter complete address"
                      value={formData.saleDetails.buyerDetails.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          saleDetails: {
                            ...formData.saleDetails,
                            buyerDetails: {
                              ...formData.saleDetails.buyerDetails,
                              address: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="buyerAadhaar">Aadhaar Number</Label>
                      <Input
                        id="buyerAadhaar"
                        placeholder="12-digit Aadhaar number"
                        value={formData.saleDetails.buyerDetails.aadhaarNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            saleDetails: {
                              ...formData.saleDetails,
                              buyerDetails: {
                                ...formData.saleDetails.buyerDetails,
                                aadhaarNumber: e.target.value,
                              },
                            },
                          })
                        }
                        maxLength={12}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buyerEmail">Email ID</Label>
                      <Input
                        id="buyerEmail"
                        type="email"
                        placeholder="Enter email address"
                        value={formData.saleDetails.buyerDetails.emailId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            saleDetails: {
                              ...formData.saleDetails,
                              buyerDetails: {
                                ...formData.saleDetails.buyerDetails,
                                emailId: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="saleAmount">Sale Amount</Label>
                      <Input
                        id="saleAmount"
                        type="number"
                        placeholder="Enter sale amount"
                        value={formData.saleDetails.saleAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            saleDetails: {
                              ...formData.saleDetails,
                              saleAmount: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="saleDate">Sale Date</Label>
                      <Input
                        id="saleDate"
                        type="date"
                        value={formData.saleDetails.saleDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            saleDetails: {
                              ...formData.saleDetails,
                              saleDate: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dealerName">Commission Dealer Name</Label>
                      <Input
                        id="dealerName"
                        placeholder="Enter dealer name"
                        value={formData.saleDetails.commissionDealerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            saleDetails: {
                              ...formData.saleDetails,
                              commissionDealerName: e.target.value,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commissionAmount">
                        Commission Amount
                      </Label>
                      <Input
                        id="commissionAmount"
                        type="number"
                        placeholder="Enter commission amount"
                        value={formData.saleDetails.commissionAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            saleDetails: {
                              ...formData.saleDetails,
                              commissionAmount: e.target.value,
                            },
                          })
                        }
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
                        className={`text-2xl font-bold ${
                          profit >= 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        ₹{profit.toLocaleString()}
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Purchase Amount:</span>
                        <span className="font-medium">
                          ₹
                          {(
                            parseFloat(formData.fullPurchaseAmount) || 0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Expenses:</span>
                        <span className="font-medium">
                          ₹
                          {Object.values(formData.expenses)
                            .reduce(
                              (sum, expense) =>
                                sum + (parseFloat(expense) || 0),
                              0,
                            )
                            .toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Sale Amount:</span>
                        <span className="font-medium">
                          ₹
                          {(
                            parseFloat(formData.saleDetails.saleAmount) || 0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Commission:</span>
                        <span className="font-medium">
                          ₹
                          {(
                            parseFloat(formData.saleDetails.commissionAmount) ||
                            0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm font-medium">
                        <span>Net Profit:</span>
                        <span
                          className={
                            profit >= 0 ? "text-success" : "text-destructive"
                          }
                        >
                          ₹{profit.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/inventory")}
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
                ? "Add Truck"
                : "Update Truck"}
          </Button>
        </div>
      </form>
    </div>
  );
}
