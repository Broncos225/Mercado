"use client";

import { useMemo } from "react";
import type { ShoppingItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, TrendingUp, TrendingDown, Banknote } from "lucide-react";

type SummaryCardsProps = {
  items: ShoppingItem[];
};

export default function SummaryCards({ items }: SummaryCardsProps) {
  const { totalPlanned, totalActual } = useMemo(() => {
    let planned = 0;
    let actual = 0;
    items.forEach(item => {
      planned += item.plannedValue * item.quantity;
      if (item.purchased) {
        actual += item.actualValue * item.quantity;
      }
    });
    return { totalPlanned: planned, totalActual: actual };
  }, [items]);

  const difference = totalPlanned - totalActual;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="shadow-md transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Planeado</CardTitle>
          <ListChecks className="h-4 w-4 text-muted-foreground" style={{color: '#A7D1AB'}}/>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalPlanned)}</div>
          <p className="text-xs text-muted-foreground">
            Costo planeado para {items.length} artículo(s)
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow-md transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Real</CardTitle>
          <Banknote className="h-4 w-4 text-muted-foreground" style={{color: '#F28482'}} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalActual)}</div>
          <p className="text-xs text-muted-foreground">
            Costo real de los artículos comprados
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Diferencia</CardTitle>
          {difference >= 0 ? 
            <TrendingDown className="h-4 w-4 text-green-500" /> :
            <TrendingUp className="h-4 w-4 text-red-500" />
          }
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(difference)}
          </div>
           <p className="text-xs text-muted-foreground">
            {difference >= 0 ? 'Por debajo del presupuesto' : 'Por encima del presupuesto'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
