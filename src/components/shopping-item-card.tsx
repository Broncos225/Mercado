"use client";

import { useState, useEffect, useRef } from "react";
import type { ShoppingItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Label } from "./ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ShoppingItemCardProps = {
  item: ShoppingItem;
  onToggle: (itemId: string, purchased: boolean, actualValue?: number) => void;
  onUpdate: (itemId: string, updates: Partial<ShoppingItem>) => void;
  onDelete: (itemId: string) => void;
};

export default function ShoppingItemCard({ item, onToggle, onUpdate, onDelete }: ShoppingItemCardProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [actualValue, setActualValue] = useState(item.actualValue);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalActualValue, setModalActualValue] = useState(item.plannedValue);
  const checkboxRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setQuantity(item.quantity);
    setActualValue(item.actualValue);
  }, [item]);

  const handleBlur = (field: 'quantity' | 'actualValue') => {
    const updates: Partial<ShoppingItem> = {};
    if (field === 'quantity' && quantity !== item.quantity) {
      updates.quantity = isNaN(quantity) || quantity < 1 ? 1 : quantity;
    }
    if (field === 'actualValue' && actualValue !== item.actualValue) {
        updates.actualValue = isNaN(actualValue) || actualValue < 0 ? 0 : actualValue;
    }
    
    if (Object.keys(updates).length > 0) {
      onUpdate(item.id, updates);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      setModalActualValue(item.plannedValue);
      setIsModalOpen(true);
    } else {
      onToggle(item.id, false);
    }
  };

  const handleConfirmPurchase = () => {
    onToggle(item.id, true, modalActualValue);
    setIsModalOpen(false);
  };
  
  const handleCancelPurchase = () => {
    setIsModalOpen(false);
    // Uncheck the checkbox visually
    if (checkboxRef.current) {
        checkboxRef.current.dataset.state = 'unchecked';
    }
  };

  return (
    <>
    <Card className="transition-all duration-300 data-[purchased=true]:bg-secondary data-[purchased=true]:opacity-70 hover:shadow-md" data-purchased={item.purchased}>
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Checkbox
            ref={checkboxRef}
            id={`item-${item.id}`}
            checked={item.purchased}
            onCheckedChange={(checked) => handleCheckboxChange(!!checked)}
            aria-label={`Marcar ${item.name} como comprado`}
          />
          <div className="grid gap-1 flex-1">
            <label
              htmlFor={`item-${item.id}`}
              className={`font-medium text-lg transition-all ${item.purchased ? "line-through text-muted-foreground" : ""}`}
            >
              {item.name}
            </label>
            <div className="text-sm text-muted-foreground">
                <span>Planeado: {formatCurrency(item.plannedValue)}</span>
                {item.purchased && (
                    <>
                     &bull;{" "}
                    <span>Real: {formatCurrency(item.actualValue)}</span>
                    </>
                )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
                <Label htmlFor={`quantity-${item.id}`} className="text-xs absolute -top-4 left-0 text-muted-foreground">Cantidad</Label>
                <Input
                  id={`quantity-${item.id}`}
                  type="number"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                  onBlur={() => handleBlur('quantity')}
                  className="w-20"
                  aria-label="Cantidad"
                />
            </div>

            {item.purchased && (
            <div className="relative">
                <Label htmlFor={`actualValue-${item.id}`} className="text-xs absolute -top-4 left-0 text-muted-foreground">Valor Real</Label>
                <Input
                  id={`actualValue-${item.id}`}
                  type="number"
                  step="1"
                  value={actualValue}
                  onChange={(e) => setActualValue(parseInt(e.target.value, 10))}
                  onBlur={() => handleBlur('actualValue')}
                  className="w-28"
                  aria-label="Valor Real"
                />
              </div>
            )}
          
          <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} aria-label={`Eliminar ${item.name}`}>
            <Trash2 className="h-5 w-5 text-destructive/80 hover:text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>

    <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar valor de compra</AlertDialogTitle>
            <AlertDialogDescription>
              Artículo: <span className="font-semibold">{item.name}</span>. Por favor, confirma o ajusta el valor real por el que se compró este artículo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col space-y-4 my-4">
            <div>
              <Label htmlFor="planned-value">Valor Planeado</Label>
              <Input id="planned-value" value={formatCurrency(item.plannedValue)} readOnly disabled />
            </div>
            <div>
              <Label htmlFor="real-value">Valor Real (COP)</Label>
               <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="real-value"
                  type="number"
                  step="1"
                  value={modalActualValue}
                  onChange={(e) => setModalActualValue(parseFloat(e.target.value))}
                  className="pl-6"
                  placeholder="Valor Real"
                />
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelPurchase}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPurchase}>Confirmar Compra</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
