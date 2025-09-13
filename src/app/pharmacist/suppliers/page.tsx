"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { getSuppliers, addSupplier } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UserPlus } from "lucide-react"

const supplierSchema = z.object({
  name: z.string().min(2, "Supplier name must be at least 2 characters."),
  contactPerson: z.string().min(2, "Contact person must be at least 2 characters."),
  phone: z.string().min(10, "Phone number must be at least 10 characters."),
});

export default function SuppliersPage() {
    const { toast } = useToast();
    const [suppliers, setSuppliers] = useState(getSuppliers());

    const form = useForm<z.infer<typeof supplierSchema>>({
        resolver: zodResolver(supplierSchema),
        defaultValues: { name: "", contactPerson: "", phone: "" }
    });

    function onSubmit(values: z.infer<typeof supplierSchema>) {
        addSupplier(values);
        toast({
            title: "Supplier Added",
            description: `${values.name} has been added to the suppliers list.`,
        });
        setSuppliers([...getSuppliers()]);
        form.reset();
    }

    return (
        <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Suppliers</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Add New Supplier</CardTitle>
                    <CardDescription>Fill the form to add a new medication supplier.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Supplier Name</FormLabel>
                                            <FormControl><Input placeholder="e.g., Pharma Inc." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contactPerson"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contact Person</FormLabel>
                                            <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl><Input placeholder="e.g., 123-456-7890" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit"><UserPlus className="mr-2 h-4 w-4" />Add Supplier</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            
            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Supplier List</CardTitle>
                    <CardDescription>List of all approved medication suppliers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Supplier Name</TableHead>
                                    <TableHead>Contact Person</TableHead>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead>Supplier ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suppliers.map((supplier) => (
                                    <TableRow key={supplier.id}>
                                        <TableCell className="font-medium">{supplier.name}</TableCell>
                                        <TableCell>{supplier.contactPerson}</TableCell>
                                        <TableCell>{supplier.phone}</TableCell>
                                        <TableCell>{supplier.id}</TableCell>
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
