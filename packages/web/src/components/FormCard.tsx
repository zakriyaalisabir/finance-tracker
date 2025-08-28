import React from 'react';

interface FormCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

export const FormCard: React.FC<FormCardProps> = ({ title, icon, children }) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #f0f0f0',
      marginBottom: '2rem'
    }}>
      <h2 style={{ 
        margin: '0 0 1.5rem 0', 
        color: '#333', 
        fontSize: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
};

interface FormInputProps {
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  children?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({ 
  name, 
  type = 'text', 
  placeholder, 
  required = false, 
  defaultValue,
  children 
}) => {
  const baseStyle = {
    padding: '0.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    minWidth: '200px'
  };

  if (children) {
    return (
      <select 
        name={name} 
        required={required}
        style={{
          ...baseStyle,
          background: 'white',
          cursor: 'pointer'
        }}
        onFocus={(e) => e.target.style.borderColor = '#667eea'}
        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
      >
        {children}
      </select>
    );
  }

  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      defaultValue={defaultValue}
      style={baseStyle}
      onFocus={(e) => e.target.style.borderColor = '#667eea'}
      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
    />
  );
};

export const FormButton: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <button
      type="submit"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 2rem',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
      }}
    >
      {children}
    </button>
  );
};