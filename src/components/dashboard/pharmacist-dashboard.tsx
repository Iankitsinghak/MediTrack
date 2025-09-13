"use client"

import { Pill, Package, AlertTriangle, Truck } from "lucide-react"
import { StatCard } from "./stat-card"
import type { StatCardData, Medicine } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getMedicines, getSuppliers, getPrescriptions } from "@/lib/data"

export function PharmacistDashboard() {
  const medicines = getMedicines();
  const suppliers = getSuppliers();
  const prescriptions = getPrescriptions();

  const lowStockCount = medicines.filter(m => m.stock <= m.lowStockThreshold).length;
  const prescriptionsFilledToday = prescriptions.filter(p => p.status === 'Processed').length; // Simplified for demo

  const pharmacistStats: StatCardData[] = [
    {
      title: "Medicine Types",
      value: medicines.length.toString(),
      icon: Pill,
    },
    {
      title: "Low Stock Alerts",
      value: lowStockCount.toString(),
      icon: AlertTriangle,
      changeType: lowStockCount > 10 ? "increase" : undefined,
    },
    {
      title: "Prescriptions Filled",
      value: prescriptionsFilledToday.toString(),
      icon: Package,
    },
    {
      title: "Suppliers",
      value: suppliers.length.toString(),
      icon: Truck,
    },
  ];

  const getSupplierName = (supplierId: string) => {
    return suppliers.find(s => s.id === supplierId)?.name || 'Unknown';
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {pharmacistStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Medications</CardTitle>
          <CardDescription>Medications that are running low and may require re-ordering.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead className="text-right">Stock Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supplier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines
                .filter(m => m.stock <= m.lowStockThreshold)
                .map((medicine) => (
                <TableRow key={medicine.id} className={'bg-destructive/10'}>
                  <TableCell className="font-medium">{medicine.name}</TableCell>
                  <TableCell className="text-right">{medicine.stock}</TableCell>
                  <TableCell>
                      <Badge variant="destructive">Low Stock</Badge>
                  </TableCell>
                  <TableCell>{getSupplierName(medicine.supplierId)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
