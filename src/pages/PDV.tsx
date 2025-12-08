import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockProducts, mockSales } from '@/data/mockData';
import { Product, PaymentMethod, Sale } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  ShoppingCart,
  Percent,
  Check,
  Printer,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function PDV() {
  const { user } = useAuth();
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    totalDiscount,
    total,
    globalDiscount,
    setGlobalDiscount,
  } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [discountInput, setDiscountInput] = useState('');
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const filteredProducts = mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm)
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleAddProduct = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('Produto sem estoque!');
      return;
    }
    addItem(product);
    toast.success(`${product.name} adicionado!`);
  };

  const handleApplyDiscount = () => {
    const discount = parseFloat(discountInput);
    if (!isNaN(discount) && discount >= 0) {
      setGlobalDiscount(discount);
      setDiscountInput('');
      toast.success('Desconto aplicado!');
    }
  };

  const handleFinalizeSale = () => {
    if (items.length === 0) {
      toast.error('Adicione itens ao carrinho!');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedPayment) {
      toast.error('Selecione uma forma de pagamento!');
      return;
    }

    const sale: Sale = {
      id: `V${String(mockSales.length + 1).padStart(3, '0')}`,
      items: [...items],
      subtotal,
      discount: totalDiscount,
      total,
      paymentMethod: selectedPayment,
      cashierId: user?.id || '',
      cashierName: user?.name || '',
      createdAt: new Date(),
    };

    setLastSale(sale);
    mockSales.unshift(sale);
    clearCart();
    setShowPaymentModal(false);
    setSelectedPayment(null);
    setShowReceiptModal(true);
    toast.success('Venda finalizada com sucesso!');
  };

  const paymentMethods = [
    { id: 'cash' as PaymentMethod, label: 'Dinheiro', icon: Banknote, color: 'bg-success' },
    { id: 'debit' as PaymentMethod, label: 'Débito', icon: CreditCard, color: 'bg-primary' },
    { id: 'credit' as PaymentMethod, label: 'Crédito', icon: CreditCard, color: 'bg-chart-4' },
    { id: 'pix' as PaymentMethod, label: 'Pix', icon: Smartphone, color: 'bg-accent' },
  ];

  return (
    <MainLayout>
      <div className="h-[calc(100vh-5rem)] flex gap-6 animate-fade-in">
        {/* Products Panel */}
        <div className="flex-1 flex flex-col">
          <Card className="glass-card flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, código ou código de barras..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-pdv pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto scrollbar-thin pb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    className={cn(
                      'p-4 rounded-xl border border-border bg-card hover:border-primary hover:shadow-lg transition-all duration-200 text-left group',
                      product.stock <= 0 && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={product.stock <= 0}
                  >
                    <div className="h-20 w-full rounded-lg bg-muted mb-3 flex items-center justify-center overflow-hidden">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{product.code}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary">
                        {formatCurrency(product.salePrice)}
                      </span>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          product.stock > 10
                            ? 'bg-success/10 text-success'
                            : product.stock > 0
                            ? 'bg-warning/10 text-warning'
                            : 'bg-destructive/10 text-destructive'
                        )}
                      >
                        {product.stock} un
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Panel */}
        <div className="w-96 flex flex-col">
          <Card className="glass-card flex-1 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Carrinho
                {items.length > 0 && (
                  <span className="ml-auto text-sm font-normal text-muted-foreground">
                    {items.reduce((sum, item) => sum + item.quantity, 0)} itens
                  </span>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto scrollbar-thin p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ShoppingCart className="h-16 w-16 mb-4 opacity-30" />
                  <p>Carrinho vazio</p>
                  <p className="text-sm">Adicione produtos para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.product.salePrice)} cada
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-bold">
                          {formatCurrency(item.product.salePrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            {/* Discount */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Desconto (R$)"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" onClick={handleApplyDiscount}>
                  Aplicar
                </Button>
              </div>
            </div>

            {/* Totals */}
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Desconto</span>
                    <span>-{formatCurrency(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-border space-y-2">
              <Button
                onClick={handleFinalizeSale}
                className="w-full pdv-button gradient-primary"
                disabled={items.length === 0}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Finalizar Venda
              </Button>
              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full h-12"
                disabled={items.length === 0}
              >
                <X className="mr-2 h-4 w-4" />
                Limpar Carrinho
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={cn(
                    'p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3',
                    selectedPayment === method.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className={cn('h-12 w-12 rounded-full flex items-center justify-center text-white', method.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-medium">{method.label}</span>
                </button>
              );
            })}
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex justify-between text-2xl font-bold">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmPayment} className="gradient-primary">
              <Check className="mr-2 h-4 w-4" />
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <Check className="h-5 w-5" />
              Venda Finalizada!
            </DialogTitle>
          </DialogHeader>
          {lastSale && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted font-mono text-sm">
                <div className="text-center border-b border-dashed border-border pb-2 mb-2">
                  <p className="font-bold">MEGAPDV</p>
                  <p className="text-xs text-muted-foreground">Sistema de Vendas</p>
                </div>
                <div className="space-y-1">
                  <p>Venda: {lastSale.id}</p>
                  <p>Data: {lastSale.createdAt.toLocaleString('pt-BR')}</p>
                  <p>Operador: {lastSale.cashierName}</p>
                </div>
                <div className="border-t border-dashed border-border my-2 pt-2">
                  {lastSale.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span>{item.quantity}x {item.product.name}</span>
                      <span>{formatCurrency(item.product.salePrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed border-border pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(lastSale.subtotal)}</span>
                  </div>
                  {lastSale.discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Desconto:</span>
                      <span>-{formatCurrency(lastSale.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(lastSale.total)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pagamento: {paymentMethods.find(m => m.id === lastSale.paymentMethod)?.label}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiptModal(false)}>
              Fechar
            </Button>
            <Button className="gradient-primary">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
