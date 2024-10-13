'use client'
   import { getLists, createList, deleteList, addItem, updateItem, deleteItem } from '@/lib/api';
import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Bell, Home, User, Plus, Trash2, ArrowLeft, Minus, ShoppingCart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './Dialog'
import { Label } from './label'
import * as AlertDialog from "@radix-ui/react-alert-dialog"

type ShoppingList = {
  id: string
  name: string
  progress: number
  total: number
  email: string
  isComplete: boolean
  items: Item[]
}

type Item = {
  id: string
  name: string
  price: number | null
  checked: boolean
  quantity: number
}

export function ShoppingListAppComponent() {
  const [lists, setLists] = useState<ShoppingList[]>([
    { 
      id: '1', 
      name: 'Setembro 1', 
      progress: 0, // This will be calculated dynamically
      total: 3, // This is now the total number of items
      email: 'usuario@email.com', 
      isComplete: false,
      items: [
        { id: '1', name: 'cha de jasmim', price: 2.50, checked: false, quantity: 1 },
        { id: '2', name: 'cha de capim santo', price: 2.50, checked: false, quantity: 1 },
        { id: '3', name: 'queijo mussarela', price: 5.99, checked: false, quantity: 1 },
      ]
    },
    { 
      id: '2', 
      name: 'Julho/24', 
      progress: 2,
      total: 2,
      email: 'colaborador@email.com',
      isComplete: true,
      items: [
        { id: '4', name: 'ameixa', price: 3.99, checked: true, quantity: 1 },
        { id: '5', name: 'banana prata', price: 2.99, checked: true, quantity: 1 },
      ]
    },
  ])

  const [activeListId, setActiveListId] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState<string>('')
  const [newItemPrice, setNewItemPrice] = useState<string>('')
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [newItemQuantity, setNewItemQuantity] = useState<string>('1')

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !activeListId) {
      return
    }

    const activeList = lists.find(list => list.id === activeListId)
    if (!activeList) {
      return
    }

    const items = Array.from(activeList.items)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setLists(lists.map(list =>
      list.id === activeListId
        ? { ...list, items: items }
        : list
    ))
  }
  
  const addNewList = () => {
    const listName = prompt("Digite o nome da nova lista:");
    if (listName) {
      const newList: ShoppingList = {
        id: Date.now().toString(),
        name: listName,
        progress: 0,
        total: 0,
        email: 'usuario@email.com',
        isComplete: false,
        items: []
      }
      setLists([...lists, newList])
    }
  }

  const deleteList = (id: string) => {
    setLists(lists.filter(list => list.id !== id))
  }

  const addItem = (listId: string, e: React.FormEvent) => {
    e.preventDefault()
    const price = newItemPrice ? parseFloat(newItemPrice) : null
    const newItem: Item = {
      id: Date.now().toString(),
      name: newItemName,
      price: price,
      checked: false,
      quantity: parseInt(newItemQuantity) || 1,
    }
    setLists(lists.map(list => 
      list.id === listId 
        ? { ...list, items: [...list.items, newItem], total: list.items.length + 1 } 
        : list
    ))
    setNewItemName('')
    setNewItemPrice('')
    setNewItemQuantity('1')
  }

  const toggleItem = (listId: string, itemId: string) => {
    setLists(lists.map(list => 
      list.id === listId 
        ? { 
            ...list, 
            items: [
              ...list.items.filter(item => item.id !== itemId && !item.checked),
              ...list.items.filter(item => item.id !== itemId && item.checked),
              { ...list.items.find(item => item.id === itemId)!, checked: !list.items.find(item => item.id === itemId)!.checked }
            ],
            progress: list.items.filter(item => item.id === itemId ? !item.checked : item.checked).length
          } 
        : list
    ))
  }

  const deleteItem = (listId: string, itemId: string) => {
    setLists(lists.map(list => 
      list.id === listId 
        ? { 
            ...list, 
            items: list.items.filter(item => item.id !== itemId),
            total: list.items.length - 1,
            progress: list.items.filter(item => item.checked && item.id !== itemId).length
          } 
        : list
    ))
  }

  const updateItemQuantity = (listId: string, itemId: string, increment: boolean) => {
    setLists(lists.map(list => 
      list.id === listId 
        ? { 
            ...list, 
            items: list.items.map(item => 
              item.id === itemId 
                ? { 
                    ...item, 
                    quantity: increment ? item.quantity + 1 : Math.max(1, item.quantity - 1)
                  } 
                : item
            )
          } 
        : list
    ))
  }

  const openEditModal = (item: Item) => {
    setEditingItem(item)
    setIsItemModalOpen(true)
  }

  const saveItemChanges = () => {
    if (editingItem && activeListId) {
      setLists(lists.map(list => 
        list.id === activeListId 
          ? { 
              ...list, 
              items: list.items.map(item => 
                item.id === editingItem.id ? editingItem : item
              )
            } 
          : list
      ))
      setIsItemModalOpen(false)
      setEditingItem(null)
    }
  }

  const activeList = lists.find(list => list.id === activeListId)

  if (activeList) {
    const totalUnchecked = activeList.items.filter(item => !item.checked).reduce((sum, item) => sum + (item.price !== null ? item.price * item.quantity : 0), 0)
    const totalChecked = activeList.items.filter(item => item.checked).reduce((sum, item) => sum + (item.price !== null ? item.price * item.quantity : 0), 0)
    const total = totalUnchecked + totalChecked

    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <header className="bg-white shadow-sm p-4 flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => setActiveListId(null)}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">{activeList.name}</h1>
          <div className="ml-auto bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center">
            <span className="text-purple-700 font-semibold">L</span>
          </div>
        </header>

        {activeList && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="list">
              {(provided) => (
                <main className="flex-1 overflow-auto p-4" {...provided.droppableProps} ref={provided.innerRef}>
                  {activeList.items.length === 0 ? (
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
                      <p className="text-gray-600">
                        Coloque Nome, Preço e Quantidade e clique em Adicionar.
                      </p>
                    </div>
                  ) : (
                    <>
                      {activeList.items.filter(item => !item.checked).map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="relative flex flex-col bg-white rounded-lg shadow-sm p-3 mb-2"
                              onClick={(e) => {
                                if (!(e.target as HTMLElement).closest('.quantity-button') && 
                                    !(e.target as HTMLElement).closest('.checkbox-container') &&
                                    !(e.target as HTMLElement).closest('.delete-button')) {
                                  openEditModal(item);
                                }
                              }}
                            >
                              <div className="flex items-center mb-2">
                                <div className="checkbox-container mr-2">
                                  <Checkbox
                                    checked={item.checked}
                                    onCheckedChange={() => toggleItem(activeList.id, item.id)}
                                  />
                                </div>
                                <span className={`flex-1 ${item.checked ? 'line-through text-gray-500' : ''}`}>
                                  {item.name}
                                </span>
                                <div className="flex items-center">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8 quantity-button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateItemQuantity(activeList.id, item.id, false);
                                    }}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="mx-2 min-w-[1.5rem] text-center">{item.quantity}</span>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8 quantity-button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateItemQuantity(activeList.id, item.id, true);
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <AlertDialog.Root>
                                  <AlertDialog.Trigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="ml-2 delete-button"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialog.Trigger>
                                  <AlertDialog.Portal>
                                    <AlertDialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0" />
                                    <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                                      <AlertDialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                                        Confirmar exclusão
                                      </AlertDialog.Title>
                                      <AlertDialog.Description className="text-mauve11 mt-4 mb-5 text-[15px] leading-normal">
                                        Tem certeza que deseja apagar este item da lista?
                                      </AlertDialog.Description>
                                      <div className="flex justify-end gap-[25px]">
                                        <AlertDialog.Cancel asChild>
                                          <Button variant="outline" onClick={(e) => e.stopPropagation()}>Cancelar</Button>
                                        </AlertDialog.Cancel>
                                        <AlertDialog.Action asChild>
                                          <Button onClick={(e) => {
                                            e.stopPropagation();
                                            deleteItem(activeList.id, item.id);
                                          }}>
                                            Apagar
                                          </Button>
                                        </AlertDialog.Action>
                                      </div>
                                    </AlertDialog.Content>
                                  </AlertDialog.Portal>
                                </AlertDialog.Root>
                              </div>
                              <span className="text-xs text-gray-500 self-start">
                                {item.quantity} x {item.price !== null ? `R$ ${item.price.toFixed(2)}` : "Ainda sem preço"}
                                {item.price !== null && ` = R$ ${(item.price * item.quantity).toFixed(2)}`}
                              </span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {activeList.items.some(item => item.checked) && (
                        <div className="mt-6 mb-2 flex items-center text-gray-500">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Itens que já estão no carrinho</span>
                          <div className="flex-grow ml-2 border-t border-gray-300"></div>
                        </div>
                      )}
                      {activeList.items.filter(item => item.checked).map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={activeList.items.filter(i => !i.checked).length + index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="relative flex flex-col bg-white rounded-lg shadow-sm p-3 mb-2"
                              onClick={(e) => {
                                if (!(e.target as HTMLElement).closest('.quantity-button') && 
                                    !(e.target as HTMLElement).closest('.checkbox-container') &&
                                    !(e.target as HTMLElement).closest('.delete-button')) {
                                  openEditModal(item);
                                }
                              }}
                            >
                              <div className="flex items-center mb-2">
                                <div className="checkbox-container mr-2">
                                  <Checkbox
                                    checked={item.checked}
                                    onCheckedChange={() => toggleItem(activeList.id, item.id)}
                                  />
                                </div>
                                <span className={`flex-1 ${item.checked ? 'line-through text-gray-500' : ''}`}>
                                  {item.name}
                                </span>
                                <div className="flex items-center">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8 quantity-button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateItemQuantity(activeList.id, item.id, false);
                                    }}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="mx-2 min-w-[1.5rem] text-center">{item.quantity}</span>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="h-8 w-8 quantity-button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateItemQuantity(activeList.id, item.id, true);
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <AlertDialog.Root>
                                  <AlertDialog.Trigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="ml-2 delete-button"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialog.Trigger>
                                  <AlertDialog.Portal>
                                    <AlertDialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0" />
                                    <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                                      <AlertDialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                                        Confirmar exclusão
                                      </AlertDialog.Title>
                                      <AlertDialog.Description className="text-mauve11 mt-4 mb-5 text-[15px] leading-normal">
                                        Tem certeza que deseja apagar este item da lista?
                                      </AlertDialog.Description>
                                      <div className="flex justify-end gap-[25px]">
                                        <AlertDialog.Cancel asChild>
                                          <Button variant="outline" onClick={(e) => e.stopPropagation()}>Cancelar</Button>
                                        </AlertDialog.Cancel>
                                        <AlertDialog.Action asChild>
                                          <Button onClick={(e) => {
                                            e.stopPropagation();
                                            deleteItem(activeList.id, item.id);
                                          }}>
                                            Apagar
                                          </Button>
                                        </AlertDialog.Action>
                                      </div>
                                    </AlertDialog.Content>
                                  </AlertDialog.Portal>
                                </AlertDialog.Root>
                              </div>
                              <span className="text-xs text-gray-500 self-start">
                                {item.quantity} x {item.price !== null ? `R$ ${item.price.toFixed(2)}` : "Ainda sem preço"}
                                {item.price !== null && ` = R$ ${(item.price * item.quantity).toFixed(2)}`}
                              </span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </>
                  )}
                  {provided.placeholder}
                </main>
              )}
            </Droppable>
          </DragDropContext>
        )}

        <footer className="bg-white border-t p-4">
          <div className="flex justify-between mb-2">
            <span>Não marcados</span>
            <span>R${totalUnchecked.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Marcados</span>
            <span>R${totalChecked.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>R${total.toFixed(2)}</span>
          </div>
          <form onSubmit={(e) => addItem(activeList.id, e)} className="mt-4 flex gap-2">
            <Input
              type="text"
              placeholder="Nome"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Preço"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              step="0.01"
              min="0"
            />
            <Input
              type="number"
              placeholder="Quantidade"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              min="1"
              required
            />
            <Button 
              type="submit" 
              className="bg-emerald-500 hover:bg-emerald-600 transition-colors duration-200 w-full animate-check"
              onClick={() => {
                const button = document.activeElement as HTMLButtonElement;
                button.classList.add('animate-check');
                setTimeout(() => button.classList.remove('animate-check'), 500);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </form>
        </footer>

        <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item-name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="item-name"
                  className="col-span-3"
                  type="text"
                  placeholder="Nome do item"
                  value={editingItem?.name ?? ''}
                  onChange={(e) => setEditingItem(prev => prev ? {...prev, name: e.target.value} : null)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item-price" className="text-right">
                  Preço
                </Label>
                <Input
                  id="item-price"
                  className="col-span-3"
                  type="number"
                  placeholder="Preço"
                  value={editingItem?.price?.toString() ?? ''}
                  onChange={(e) => setEditingItem(prev => prev ? {...prev, price: e.target.value ? parseFloat(e.target.value) : null} : null)}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item-quantity" className="text-right">
                  Quantidade
                </Label>
                <Input
                  id="item-quantity"
                  className="col-span-3"
                  type="number"
                  placeholder="Quantidade"
                  value={editingItem?.quantity?.toString() ?? ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEditingItem(prev => {
                      if (!prev) return null;
                      return {...prev, quantity: newValue === '' ? 0 : Math.max(1, parseInt(newValue) || 1)};
                    });
                  }}
                  onBlur={() => {
                    setEditingItem(prev => {
                      if (!prev) return null;
                      return {...prev, quantity: Math.max(0, prev.quantity)};
                    });
                  }}
                  min="1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsItemModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveItemChanges}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-center">Minhas Listas</h1>
      </header>

      <main className="flex-1 overflow-auto p-4">
        {lists.map((list) => {
          const totalValue = list.items.reduce((sum, item) => sum + (item.price !== null ? item.price * item.quantity : 0), 0);
          return (
            <div 
              key={list.id} 
              className="bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer"
              onClick={() => setActiveListId(list.id)}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">{list.name}</h2>
                <AlertDialog.Root>
                  <AlertDialog.Trigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => e.stopPropagation()} // Add this line
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialog.Trigger>
                  <AlertDialog.Portal>
                    <AlertDialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0" />
                    <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                      <AlertDialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
                        Confirmar exclusão
                      </AlertDialog.Title>
                      <AlertDialog.Description className="text-mauve11 mt-4 mb-5 text-[15px] leading-normal">
                        Tem certeza que deseja apagar esta lista?
                      </AlertDialog.Description>
                      <div className="flex justify-end gap-[25px]">
                        <AlertDialog.Cancel asChild>
                          <Button variant="outline">Cancelar</Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                          <Button onClick={() => deleteList(list.id)}>
                            Apagar
                          </Button>
                        </AlertDialog.Action>
                      </div>
                    </AlertDialog.Content>
                  </AlertDialog.Portal>
                </AlertDialog.Root>
              </div>
              <Progress value={(list.progress / list.total) * 100} className="mb-2" />
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>{list.progress}/{list.total}</span>
                <span>R${totalValue.toFixed(2)}</span>
              </div>
              {list.isComplete && (
                <div className="mt-2">
                  <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                    NOVA LISTA
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </main>

      <Button 
        className="fixed bottom-20 right-4 rounded-full shadow-lg"
        size="icon"
        onClick={addNewList}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <nav className="bg-white border-t flex justify-around items-center p-4">
        <Button variant="ghost" size="icon">
          <Home className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon">
          <span className="relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </span>
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-6 w-6" />
        </Button>
      </nav>
    </div>
  )
}