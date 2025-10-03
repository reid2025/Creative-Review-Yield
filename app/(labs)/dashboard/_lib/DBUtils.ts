/**
 * Dashboard utility functions and formulas
 */

export const calculateCPL = (spend: number, leads: number): number => 
  leads > 0 ? spend / leads : 0;

export const calculateCTR = (clicks: number, impressions: number): number => 
  impressions > 0 ? (clicks / impressions) * 100 : 0;

export const calculateCVR = (leads: number, clicks: number): number => 
  clicks > 0 ? (leads / clicks) * 100 : 0;

export const calculateDelta = (current: number, previous: number): number => 
  previous > 0 ? ((current - previous) / previous) * 100 : 0;

export const formatCurrency = (amount: number): string => 
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);

export const formatPercent = (value: number, decimals = 1): string => 
  `${value.toFixed(decimals)}%`;

export const formatNumber = (value: number): string => 
  new Intl.NumberFormat('en-US').format(value);

export const formatCompactNumber = (value: number): string => 
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);

export const formatDelta = (delta: number): { 
  text: string; 
  className: string; 
  icon: string; 
} => {
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  
  return {
    text: `${isPositive ? '+' : ''}${delta.toFixed(1)}%`,
    className: isPositive 
      ? 'text-green-600' 
      : isNegative 
        ? 'text-red-600' 
        : 'text-gray-500',
    icon: isPositive 
      ? '↗' 
      : isNegative 
        ? '↘' 
        : '→'
  };
};

export const generateDateRange = (days: number): { start: string; end: string } => {
  const end = new Date();
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

export const formatRelativeTime = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return past.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

export const generateSparklineData = (points: number, trend: 'up' | 'down' | 'flat' = 'flat'): number[] => {
  const data: number[] = [];
  let value = 100;
  
  for (let i = 0; i < points; i++) {
    const variation = (Math.random() - 0.5) * 20;
    
    if (trend === 'up') {
      value += Math.random() * 5 + variation;
    } else if (trend === 'down') {
      value -= Math.random() * 5 + variation;
    } else {
      value += variation;
    }
    
    data.push(Math.max(0, value));
  }
  
  return data;
};