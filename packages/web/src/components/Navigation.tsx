import React from 'react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'transactions', label: '💳 Transactions', icon: '💳' },
    { id: 'accounts', label: '🏦 Accounts', icon: '🏦' },
    { id: 'categories', label: '📂 Categories', icon: '📂' },
    { id: 'subscriptions', label: '🔄 Subscriptions', icon: '🔄' }
  ];

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem 0',
      marginBottom: '2rem',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <h1 style={{ 
          color: 'white', 
          margin: '0 0 1rem 0', 
          fontSize: '2rem',
          fontWeight: '700',
          textAlign: 'center'
        }}>
          💰 Finance Tracker
        </h1>
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: 'white',
                border: activeTab === tab.id ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                padding: '0.75rem 1.5rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};