'use client';

import { useState } from 'react';

interface DCAFormProps {
  selectedPair?: {
    label: string;
    value: string;
    price: string;
  };
}

export function DCAForm({ selectedPair }: DCAFormProps) {
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [duration, setDuration] = useState('1');

  const frequencies = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ];

  const durations = [
    { label: '1 Month', value: '1' },
    { label: '3 Months', value: '3' },
    { label: '6 Months', value: '6' },
    { label: '12 Months', value: '12' },
  ];

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-medium">Dollar Cost Averaging</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Automatically buy {selectedPair?.label.split('/')[0]} at regular intervals
        </p>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Amount per purchase (USDT)
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-3 pr-20 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button className="text-sm text-primary hover:text-primary/80">
                  Max
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {frequencies.map((freq) => (
                <button
                  key={freq.value}
                  onClick={() => setFrequency(freq.value)}
                  className={`rounded-lg border border-border p-2 text-sm font-medium transition-colors ${
                    frequency === freq.value
                      ? 'border-primary bg-primary text-white'
                      : 'hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {durations.map((dur) => (
                <button
                  key={dur.value}
                  onClick={() => setDuration(dur.value)}
                  className={`rounded-lg border border-border p-2 text-sm font-medium transition-colors ${
                    duration === dur.value
                      ? 'border-primary bg-primary text-white'
                      : 'hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-background p-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Total investment</span>
              <span>0.00 USDT</span>
            </div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Number of purchases</span>
              <span>0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Average price</span>
              <span>{selectedPair?.price || '0.00'} USDT</span>
            </div>
          </div>

          <button className="w-full rounded-lg bg-primary py-4 font-semibold text-white hover:bg-primary/90">
            Start DCA
          </button>
        </div>
      </div>
    </div>
  );
}
