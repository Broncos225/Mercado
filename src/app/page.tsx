'use client';

import { useMemo, useState } from 'react';
import type { ShoppingItem } from '@/lib/types';
import Header from '@/components/header';
import SummaryCards from '@/components/summary-cards';
import AddItemForm from '@/components/add-item-form';
import ShoppingList from '@/components/shopping-list';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import Login from '@/components/login';
import { getAuth, signOut } from 'firebase/auth';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const shoppingListId = 'main'; // Using a single shopping list for now

  const itemsRef = useMemoFirebase(
    () =>
      user
        ? collection(
            firestore,
            'users',
            user.uid,
            'shoppingLists',
            shoppingListId,
            'items'
          )
        : null,
    [firestore, user]
  );

  const { data: items, isLoading: isLoadingItems } = useCollection<ShoppingItem>(
    itemsRef
  );
  
  const [isPurchaseMode, setIsPurchaseMode] = useState(false);

  if (isUserLoading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return <Login />;
  }

  const handleAddItem = async (
    newItemData: Omit<ShoppingItem, 'id' | 'purchased' | 'actualValue' | 'createdAt'>
  ) => {
    if (!itemsRef) return;
    const newItem: Omit<ShoppingItem, 'id' | 'createdAt'> = {
      ...newItemData,
      purchased: false,
      actualValue: 0,
    };
    await addDoc(itemsRef, {
      ...newItem,
      createdAt: serverTimestamp(),
    });
  };

  const handleToggleItem = async (itemId: string, purchased: boolean, actualValue?: number) => {
    if (!user) return;
    const itemRef = doc(
      firestore,
      'users',
      user.uid,
      'shoppingLists',
      shoppingListId,
      'items',
      itemId
    );
    const currentItem = items?.find(i => i.id === itemId);
    if (!currentItem) return;
    
    await updateDoc(itemRef, {
      purchased,
      actualValue: purchased ? (actualValue ?? currentItem.plannedValue) : 0,
    });
  };

  const handleUpdateItem = async (
    itemId: string,
    updates: Partial<ShoppingItem>
  ) => {
    if (!user) return;
    const itemRef = doc(
      firestore,
      'users',
      user.uid,
      'shoppingLists',
      shoppingListId,
      'items',
      itemId
    );
    await updateDoc(itemRef, updates);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user) return;
    const itemRef = doc(
      firestore,
      'users',
      user.uid,
      'shoppingLists',
      shoppingListId,
      'items',
      itemId
    );
    await deleteDoc(itemRef);
  };

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth);
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8 font-body">
      <Header onSignOut={handleSignOut} userEmail={user.email || ''} isPurchaseMode={isPurchaseMode} onPurchaseModeChange={setIsPurchaseMode} />
      <main className="mt-8 space-y-8">
        {!isPurchaseMode && (
          <>
            <SummaryCards items={items || []} />
            <Card className="shadow-md transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">
                  Agregar Nuevo Artículo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddItemForm onAddItem={handleAddItem} />
              </CardContent>
            </Card>
          </>
        )}

        <ShoppingList
          items={items || []}
          onToggleItem={handleToggleItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
        />
      </main>
    </div>
  );
}
