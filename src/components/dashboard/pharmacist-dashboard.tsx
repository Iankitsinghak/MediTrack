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

const pharmacistStats: StatCardData[] = [
  {
    title: "Medicine Types",
    value: "452",
    icon: Pill,
  },
  {
    title: "Low Stock Alerts",
    value: "12",
    icon: AlertTriangle,
    change: "3 new today",
    changeType: "increase",
  },
  {
    title: "Prescriptions Filled Today",
    value: "218",
    icon: Package,
  },
  {
    title: "Suppliers",
    value: "15",
    icon: Truck,
  },
]

const medicines: Medicine[] = [
  { id: "MED001", name: "Paracetamol 500mg", stock: 1500, lowStockThreshold: 500, supplier: "Pharma Inc." },
  { id: "MED002", name: "Amoxicillin 250mg", stock: 45, lowStockThreshold: 50, supplier: "MediSource" },
  { id: "MED003", name: "Ibuprofen 200mg", stock: 800, lowStockThreshold: 200, supplier: "HealthWell" },
  { id: "MED004", name: "Ciprofloxacin 500mg", stock: 15, lowStockThreshold: 20, supplier: "Global Meds" },
  { id: "MED005", name: "Metformin 1000mg", stock: 350, lowStockThreshold: 100, supplier: "Pharma Inc." },
  { id: "MED006", name: "Aspirin 81mg", stock: 2500, lowStockThreshold: 1000, supplier: "HealthWell" },
];


export function PharmacistDashboard() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {pharmacistStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Medication Stock Management</CardTitle>
          <CardDescription>Live overview of medicine inventory levels.</CardDescription>
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
              {medicines.map((medicine) => (
                <TableRow key={medicine.id} className={medicine.stock <= medicine.lowStockThreshold ? 'bg-destructive/10' : ''}>
                  <TableCell className="font-medium">{medicine.name}</TableCell>
                  <TableCell className="text-right">{medicine.stock}</TableCell>
                  <TableCell>
                    {medicine.stock <= medicine.lowStockThreshold ? (
                      <Badge variant="destructive">Low Stock</Badge>
                    ) : (
                      <Badge variant="secondary">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>{medicine.supplier}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
