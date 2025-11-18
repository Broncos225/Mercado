import { ShoppingCart, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

type HeaderProps = {
  onSignOut: () => void;
  userEmail: string;
  isPurchaseMode: boolean;
  onPurchaseModeChange: (isPurchaseMode: boolean) => void;
};


export default function Header({ onSignOut, userEmail, isPurchaseMode, onPurchaseModeChange }: HeaderProps) {
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';

  return (
    <header className="flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-full" style={{backgroundColor: '#A7D1AB'}}>
          <ShoppingCart className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tight text-gray-800">
            Mercado
          </h1>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="purchase-mode">Modo Compra</Label>
          <Switch 
            id="purchase-mode"
            checked={isPurchaseMode}
            onCheckedChange={onPurchaseModeChange}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Sesión iniciada</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
