"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { ShoppingItem } from "@/lib/types";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusCircle, ScanLine } from "lucide-react";
import BarcodeScanner from "./barcode-scanner";

const formSchema = z.object({
  name: z.string().min(1, "El nombre del artículo es requerido."),
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1."),
  plannedValue: z.coerce.number().min(0, "El valor planeado no puede ser negativo."),
});

type AddItemFormProps = {
  onAddItem: (item: Omit<ShoppingItem, "id" | "purchased" | "actualValue" | "createdAt">) => void;
};

export default function AddItemForm({ onAddItem }: AddItemFormProps) {
  const [isScannerOpen, setScannerOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      plannedValue: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddItem(values);
    form.reset();
  }

  const handleBarcodeScanned = (code: string) => {
    form.setValue("name", code);
    setScannerOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-4 md:items-end">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="md:col-span-5">
              <FormLabel>Nombre del Artículo</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                <Input placeholder="Ej: Manzanas" {...field} />
                <Dialog open={isScannerOpen} onOpenChange={setScannerOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Escanear código de barras">
                      <ScanLine className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Escáner de Productos</DialogTitle>
                    </DialogHeader>
                    <BarcodeScanner onScan={handleBarcodeScanned} />
                  </DialogContent>
                </Dialog>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Cantidad</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="plannedValue"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel>Valor Planeado (COP)</FormLabel>
              <FormControl>
                <Input type="number" step="1" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="md:col-span-2">
          <Button type="submit" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar
          </Button>
        </div>
      </form>
    </Form>
  );
}
