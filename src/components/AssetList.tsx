export function AssetList() {
  const assets = [
    {
      id: 1,
      symbol: 'SOL',
      name: 'Solana',
      balance: '12.345',
      value: '$1,234.56',
    },
    {
      id: 2,
      symbol: 'USDC',
      name: 'USD Coin',
      balance: '1,234.56',
      value: '$1,234.56',
    },
    {
      id: 3,
      symbol: 'RAY',
      name: 'Raydium',
      balance: '123.45',
      value: '$234.56',
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-4 pl-4">Asset</th>
            <th className="pb-4">Balance</th>
            <th className="pb-4 pr-4">Value</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id} className="border-b">
              <td className="py-4 pl-4">
                <div>
                  <div className="font-medium">{asset.symbol}</div>
                  <div className="text-sm text-muted-foreground">{asset.name}</div>
                </div>
              </td>
              <td className="py-4">{asset.balance}</td>
              <td className="py-4 pr-4">{asset.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
