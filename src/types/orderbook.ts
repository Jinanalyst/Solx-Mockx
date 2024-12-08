export interface OrderBookEntry {
  price: number;
  amount: number;
  total?: number;
}

export interface OrderBookData {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
}
