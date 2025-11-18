import type { ShoppingItem } from "@/lib/types";
import ShoppingItemCard from "./shopping-item-card";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ListX } from "lucide-react";

type ShoppingListProps = {
  items: ShoppingItem[];
  onToggleItem: (itemId: string, purchased: boolean, actualValue?: number) => void;
  onUpdateItem: (itemId: string, updates: Partial<ShoppingItem>) => void;
  onDeleteItem: (itemId:string) => void;
};

export default function ShoppingList({ items, onToggleItem, onUpdateItem, onDeleteItem }: ShoppingListProps) {
  const purchasedItems = items.filter(item => item.purchased).sort((a,b) => a.name.localeCompare(b.name));
  const pendingItems = items.filter(item => !item.purchased).sort((a,b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">Lista de Compras ({pendingItems.length})</h2>
        {pendingItems.length > 0 ? (
          <div className="grid gap-4">
            {pendingItems.map((item) => (
              <ShoppingItemCard
                key={item.id}
                item={item}
                onToggle={onToggleItem}
                onUpdate={onUpdateItem}
                onDelete={onDeleteItem}
              />
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-8 border-dashed">
            <ListX className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Tu lista de compras está vacía.</p>
            <p className="text-sm text-muted-foreground">¡Agrega artículos usando el formulario de arriba para comenzar!</p>
          </Card>
        )}
      </section>
      
      {purchasedItems.length > 0 && (
        <section>
          <h2 className="text-2xl font-headline font-semibold mb-4">Comprados ({purchasedItems.length})</h2>
          <div className="grid gap-4">
            {purchasedItems.map((item) => (
              <ShoppingItemCard
                key={item.id}
                item={item}
                onToggle={onToggleItem}
                onUpdate={onUpdateItem}
                onDelete={onDeleteItem}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}