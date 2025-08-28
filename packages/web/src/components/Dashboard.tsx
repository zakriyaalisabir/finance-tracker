import React from 'react';

interface Summary {
  inflow: number;
  outflow: number;
  net: number;
  byCcy: Record<string, { inflow: number; outflow: number }>;
}

interface DashboardProps {
  summary: Summary | null;
  loading: boolean;
  onLoadSummary: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ summary, loading, onLoadSummary }) => {
  React.useEffect(() => {
    onLoadSummary();
  }, [onLoadSummary]);

  const formatCurrency = (amount: number, currency = 'THB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '2rem',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', opacity: 0.9 }}>💰 Total Inflow</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
            {summary ? formatCurrency(summary.inflow) : '฿0.00'}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          padding: '2rem',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', opacity: 0.9 }}>💸 Total Outflow</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
            {summary ? formatCurrency(Math.abs(summary.outflow)) : '฿0.00'}
          </p>
        </div>

        <div style={{
          background: summary && summary.net >= 0 
            ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
            : 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
          padding: '2rem',
          borderRadius: '16px',
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', opacity: 0.9 }}>
            {summary && summary.net >= 0 ? '📈 Net Profit' : '📉 Net Loss'}
          </h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
            {summary ? formatCurrency(summary.net) : '฿0.00'}
          </p>
        </div>
      </div>

      {summary && Object.keys(summary.byCcy).length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#333', fontSize: '1.25rem' }}>💱 By Currency</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#666', fontWeight: '600' }}>Currency</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#666', fontWeight: '600' }}>Inflow</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#666', fontWeight: '600' }}>Outflow</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#666', fontWeight: '600' }}>Net</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary.byCcy).map(([currency, data]) => (
                  <tr key={currency} style={{ borderBottom: '1px solid #f8f8f8' }}>
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#333' }}>{currency}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#10b981' }}>
                      {formatCurrency(data.inflow, currency)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#ef4444' }}>
                      {formatCurrency(Math.abs(data.outflow), currency)}
                    </td>
                    <td style={{ 
                      padding: '1rem', 
                      textAlign: 'right', 
                      fontWeight: '600',
                      color: (data.inflow + data.outflow) >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {formatCurrency(data.inflow + data.outflow, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          Loading financial data...
        </div>
      )}
    </div>
  );
};