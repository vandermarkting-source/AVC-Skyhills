'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Transaction {
  id: string;
  type: 'bet' | 'win' | 'loss' | 'admin';
  description: string;
  amount: number;
  balance: number;
  timestamp: string;
  details?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'bet' | 'win' | 'loss' | 'admin'>('all');

  const filteredTransactions =
    filter === 'all' ? transactions : transactions.filter((t) => t.type === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bet':
        return 'ArrowDownIcon';
      case 'win':
        return 'ArrowUpIcon';
      case 'loss':
        return 'MinusIcon';
      case 'admin':
        return 'Cog6ToothIcon';
      default:
        return 'BanknotesIcon';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bet':
        return 'text-warning';
      case 'win':
        return 'text-success';
      case 'loss':
        return 'text-error';
      case 'admin':
        return 'text-accent';
      default:
        return 'text-text-secondary';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bet':
        return 'Weddenschap';
      case 'win':
        return 'Winst';
      case 'loss':
        return 'Verlies';
      case 'admin':
        return 'Admin';
      default:
        return 'Transactie';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-text-primary">Transactiegeschiedenis</h2>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'bet', 'win', 'loss', 'admin'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-micro ${
                filter === filterType
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-text-secondary hover:bg-border'
              }`}
            >
              {filterType === 'all' ? 'Alle' : getTypeLabel(filterType)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="InboxIcon" size={48} className="text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary">Geen transacties gevonden</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border border-border rounded-lg overflow-hidden hover:shadow-card transition-micro"
            >
              <button
                onClick={() => setExpandedId(expandedId === transaction.id ? null : transaction.id)}
                className="w-full p-4 flex items-center gap-4 hover:bg-muted transition-micro"
              >
                <div
                  className={`w-10 h-10 rounded-md bg-muted flex items-center justify-center ${getTypeColor(transaction.type)}`}
                >
                  <Icon name={getTypeIcon(transaction.type) as any} size={20} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-text-primary">{transaction.description}</p>
                  <p className="text-sm text-text-secondary">{transaction.timestamp}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-data font-bold ${transaction.amount >= 0 ? 'text-success' : 'text-error'}`}
                  >
                    {transaction.amount >= 0 ? '+' : ''}
                    {transaction.amount}
                  </p>
                  <p className="text-sm text-text-secondary">Saldo: {transaction.balance}</p>
                </div>
                <Icon
                  name="ChevronDownIcon"
                  size={20}
                  className={`text-text-secondary transition-transform ${expandedId === transaction.id ? 'rotate-180' : ''}`}
                />
              </button>
              {expandedId === transaction.id && transaction.details && (
                <div className="px-4 pb-4 pt-2 bg-muted border-t border-border">
                  <p className="text-sm text-text-secondary">{transaction.details}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
