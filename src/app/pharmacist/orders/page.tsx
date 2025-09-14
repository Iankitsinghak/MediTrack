"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { getMedicationOrders, getMedicines, getSuppliers, createMedicationOrder } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { PlusCircle } from "lucide-react"

const orderSchema = z.object({
  medicineName: z.string({ required_error: "Please select a medicine." }),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  supplierName: z.string({ required_error: "Please select a supplier." }),
});

export default function OrdersPage() {
    const { toast } = useToast();
    const [orders, setOrders] = useState(getMedicationOrders());
    const allMedicines = getMedicines();
    const allSuppliers = getSuppliers();

    const form = useForm<z.infer<typeof orderSchema>>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            quantity: 100,
        }
    });

    function onSubmit(values: z.infer<typeof orderSchema>) {
        createMedicationOrder({
            medicineName: values.medicineName,
            quantity: values.quantity,
            supplierName: values.supplierName,
        });
        toast({
            title: "Order Created",
            description: `A new order for ${values.quantity}x ${values.medicineName} has been placed.`,
        });
        setOrders([...getMedicationOrders()]);
        form.reset();
    }

    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Medication Orders</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>New Medication Order</CardTitle>
                    <CardDescription>Fill the form to order new medication stock.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="medicineName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Medicine</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a medicine" /></SelectTrigger></FormControl>
                                                <SelectContent>{allMedicines.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="supplierName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Supplier</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a supplier" /></SelectTrigger></FormControl>
                                                <SelectContent>{allSuppliers.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity</FormLabel>
                                            <FormControl><Input type="number" placeholder="100" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit"><PlusCircle className="mr-2 h-4 w-4" />Create Order</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            
            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>View and track past and pending medication orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order Date</TableHead>
                                    <TableHead>Medicine</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.sort((a,b) => b.orderDate.getTime() - a.orderDate.getTime()).map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{format(order.orderDate, "PPP")}</TableCell>
                                        <TableCell className="font-medium">{order.medicineName}</TableCell>
                                        <TableCell>{order.quantity}</TableCell>
                                        <TableCell>{order.supplierName}</TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === 'Pending' ? 'outline' : 'secondary'}>{order.status}</Badge>
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
