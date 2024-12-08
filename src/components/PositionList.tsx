export function PositionList() {
  const positions = [
    {
      id: 1,
      pool: 'SOL-USDC',
      tokens: {
        token1: { symbol: 'SOL', amount: '1.234' },
        token2: { symbol: 'USDC', amount: '123.45' },
      },
      share: '0.12%',
      value: '$234.56',
    },
    {
      id: 2,
      pool: 'SOL-RAY',
      tokens: {
        token1: { symbol: 'SOL', amount: '2.345' },
        token2: { symbol: 'RAY', amount: '34.56' },
      },
      share: '0.23%',
      value: '$345.67',
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-4 pl-4">Pool</th>
            <th className="pb-4">Your Liquidity</th>
            <th className="pb-4">Share</th>
            <th className="pb-4">Value</th>
            <th className="pb-4 pr-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => (
            <tr key={position.id} className="border-b">
              <td className="py-4 pl-4 font-medium">{position.pool}</td>
              <td className="py-4">
                <div>{position.tokens.token1.amount} {position.tokens.token1.symbol}</div>
                <div>{position.tokens.token2.amount} {position.tokens.token2.symbol}</div>
              </td>
              <td className="py-4">{position.share}</td>
              <td className="py-4">{position.value}</td>
              <td className="py-4 pr-4">
                <button className="rounded bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
