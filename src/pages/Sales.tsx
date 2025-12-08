import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockSales } from '@/data/mockData';
import { Sale, PaymentMethod } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Eye,
  FileDown,
  Receipt,
  DollarSign,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sales() {
  const [sales] = useState<Sale[]>(mockSales);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.cashierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = paymentFilter === 'all' || sale.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      case 'debit':
      case 'credit':
        return <CreditCard className="h-4 w-4" />;
      case 'pix':
        return <Smartphone className="h-4 w-4" />;
    }
  };

  const getPaymentLabel = (method: PaymentMethod) => {
    const labels: Record<PaymentMethod, string> = {
      cash: 'Dinheiro',
      debit: 'Débito',
      credit: 'Crédito',
      pix: 'Pix',
    };
    return labels[method];
  };

  const getPaymentColor = (method: PaymentMethod) => {
    const colors: Record<PaymentMethod, string> = {
      cash: 'bg-success/10 text-success',
      debit: 'bg-primary/10 text-primary',
      credit: 'bg-chart-4/10 text-chart-4',
      pix: 'bg-accent/10 text-accent',
    };
    return colors[method];
  };

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSales = filteredSales.length;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Vendas</h1>
            <p className="text-muted-foreground">Histórico de vendas realizadas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
            <Button variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="stat-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Vendas</p>
                <p className="text-2xl font-bold">{totalSales}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código da venda ou operador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os pagamentos</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="debit">Débito</SelectItem>
                    <SelectItem value="credit">Crédito</SelectItem>
                    <SelectItem value="pix">Pix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card className="glass-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Desconto</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono font-medium">{sale.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(sale.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>{sale.cashierName}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-muted">
                        {sale.items.reduce((sum, item) => sum + item.quantity, 0)} itens
                      </span>
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
                          getPaymentColor(sale.paymentMethod)
                        )}
                      >
                        {getPaymentIcon(sale.paymentMethod)}
                        {getPaymentLabel(sale.paymentMethod)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {sale.discount > 0 ? (
                        <span className="text-success">-{formatCurrency(sale.discount)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(sale.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedSale(sale)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Sale Details Modal */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda {selectedSale?.id}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Data/Hora</p>
                  <p className="font-medium">{formatDate(selectedSale.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Operador</p>
                  <p className="font-medium">{selectedSale.cashierName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pagamento</p>
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium mt-1',
                      getPaymentColor(selectedSale.paymentMethod)
                    )}
                  >
                    {getPaymentIcon(selectedSale.paymentMethod)}
                    {getPaymentLabel(selectedSale.paymentMethod)}
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-3">Itens</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity}x {formatCurrency(item.product.salePrice)}
                        </p>
                      </div>
                      <p className="font-bold">
                        {formatCurrency(item.product.salePrice * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(selectedSale.subtotal)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Desconto</span>
                    <span>-{formatCurrency(selectedSale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(selectedSale.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
