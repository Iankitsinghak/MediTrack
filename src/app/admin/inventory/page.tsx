
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { Package, Archive, DollarSign, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";


const inventoryStats = [
    { title: "Total Item Types", value: "350", icon: Archive },
    { title: "Total Inventory Value", value: "$850,230", icon: DollarSign },
    { title: "Items Low on Stock", value: "18", icon: AlertCircle, changeType: "increase" },
];

const inventoryData = [
    { id: 'INV-001', name: 'Surgical Masks', category: 'PPE', stock: 10500, status: 'In Stock', capacity: 20000 },
    { id: 'INV-002', name: 'IV Drip Bags (500ml)', category: 'Medical Supplies', stock: 850, status: 'In Stock', capacity: 1500 },
    { id: 'INV-003', name: 'Syringes (10ml)', category: 'Medical Supplies', stock: 450, status: 'Low Stock', capacity: 5000 },
    { id: 'INV-004', name: 'Bed Linens', category: 'General Supplies', stock: 250, status: 'In Stock', capacity: 400 },
    { id: 'INV-005', name: 'Defibrillator Pads', category: 'Equipment', stock: 35, status: 'Reorder', capacity: 100 },
    { id: 'INV-006', name: 'Office Paper (A4)', category: 'Admin', stock: 50, status: 'In Stock', capacity: 100 },
];

export default function InventoryPage() {
    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Hospital Inventory</h1>
             <div className="grid gap-4 md:grid-cols-3">
                {inventoryStats.map(stat => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Inventory Details</CardTitle>
                    <CardDescription>Manage and monitor all hospital-wide inventory items.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Stock Level</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventoryData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <span>{item.stock} / {item.capacity}</span>
                                                <Progress value={(item.stock / item.capacity) * 100} className="w-24 h-2" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                item.status === 'Reorder' ? 'destructive' :
                                                item.status === 'Low Stock' ? 'default' : 'secondary'
                                            }>
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
