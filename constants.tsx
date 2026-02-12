
import React from 'react';
import { Client, RiskLevel, LogEntry } from './types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Anjali Sharma',
    company: 'NextGen EdTech',
    mrr: 125000,
    healthScore: 45,
    riskLevel: RiskLevel.COOLING,
    lastInteraction: '2023-10-25T14:30:00Z',
    sentimentTrend: 'declining',
    isZombie: false,
    industry: 'EdTech'
  },
  {
    id: '2',
    name: 'Rajesh Gupta',
    company: 'AgroFlow Solutions',
    mrr: 45000,
    healthScore: 12,
    riskLevel: RiskLevel.CRITICAL,
    lastInteraction: '2023-09-12T09:15:00Z',
    sentimentTrend: 'declining',
    isZombie: true,
    industry: 'AgriTech'
  },
  {
    id: '3',
    name: 'Vikram Mehta',
    company: 'FinLease India',
    mrr: 350000,
    healthScore: 88,
    riskLevel: RiskLevel.STABLE,
    lastInteraction: '2023-11-01T11:00:00Z',
    sentimentTrend: 'improving',
    isZombie: false,
    industry: 'FinTech'
  },
  {
    id: '4',
    name: 'Saira Banu',
    company: 'CloudLogistics',
    mrr: 82000,
    healthScore: 65,
    riskLevel: RiskLevel.STABLE,
    lastInteraction: '2023-10-28T16:45:00Z',
    sentimentTrend: 'stable',
    isZombie: false,
    industry: 'Logistics'
  }
];

export const MOCK_LOGS: Record<string, LogEntry[]> = {
  '1': [
    { sender: 'Anjali Sharma', timestamp: '2023-10-20T10:00:00Z', message: 'Hello, the dashboard is loading very slowly today. Please check.', source: 'WhatsApp' },
    { sender: 'Sentinel AI', timestamp: '2023-10-20T10:05:00Z', message: 'Checked. It should be fine now.', source: 'WhatsApp' },
    { sender: 'Anjali Sharma', timestamp: '2023-10-25T14:30:00Z', message: 'Arre baba, why is the server down again? This is third time in a month.', source: 'WhatsApp' }
  ],
  '2': [
    { sender: 'Rajesh Gupta', timestamp: '2023-08-15T09:00:00Z', message: 'Great features, very helpful for our farmers.', source: 'Email' },
    { sender: 'Rajesh Gupta', timestamp: '2023-09-12T09:15:00Z', message: 'Okay.', source: 'WhatsApp' }
  ]
};
