"use client"

import { useState, useMemo } from "react"
import { getMedicines, getSuppliers } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

export default function InventoryPage() {
    const allMedicines = getMedicines();
    const allSuppliers = getSuppliers();
    const [searchTerm, setSearchTerm] = useState("");

    const getSupplierName = (supplierId: string) => {
        return allSuppliers.find(s => s.id === supplierId)?.name || "Unknown";
    }

    const filteredMedicines = useMemo(() => {
        if (!searchTerm) return allMedicines;
        return allMedicines.filter(med => 
            med.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allMedicines]);

    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Medication Inventory</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Stock</CardTitle>
                    <CardDescription>View and manage medication inventory levels. Found {filteredMedicines.length} items.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="mb-4 relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by medicine name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Medicine</TableHead>
                                    <TableHead>Stock Quantity</TableHead>
                                    <TableHead>Low Stock At</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Supplier</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMedicines.length > 0 ? (
                                    filteredMedicines.map((medicine) => (
                                        <TableRow key={medicine.id} className={medicine.stock <= medicine.lowStockThreshold ? 'bg-destructive/10' : ''}>
                                            <TableCell className="font-medium">{medicine.name}</TableCell>
                                            <TableCell>{medicine.stock}</TableCell>
                                            <TableCell>{medicine.lowStockThreshold}</TableCell>
                                            <TableCell>
                                                {medicine.stock <= medicine.lowStockThreshold ? (
                                                <Badge variant="destructive">Low Stock</Badge>
                                                ) : (
                                                <Badge variant="secondary">In Stock</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{getSupplierName(medicine.supplierId)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No medicines found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
