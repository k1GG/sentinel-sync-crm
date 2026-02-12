
export enum RiskLevel {
  STABLE = 'Stable',
  COOLING = 'Cooling',
  CRITICAL = 'Critical'
}

export interface Client {
  id: string;
  name: string;
  company: string;
  mrr: number;
  healthScore: number;
  riskLevel: RiskLevel;
  lastInteraction: string;
  sentimentTrend: 'improving' | 'declining' | 'stable';
  isZombie: boolean;
  industry: string;
}

export interface RegulatorySignal {
  id: string;
  title: string;
  policySource: string;
  impactScore: number;
  affectedSectors: string[];
  summary: string;
  actionRequired: string;
}

export interface MarketSignal {
  title: string;
  snippet: string;
  url: string;
  source: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface SentimentAnalysis {
  healthScore: number;
  riskClassification: RiskLevel;
  silentSignal: string;
  recoveryPlan: string[];
  engagementDraft: string;
  executiveSummary: string;
  industryContextSummary: string;
  marketSignals?: MarketSignal[];
}

export interface LogEntry {
  sender: string;
  timestamp: string;
  message: string;
  source: 'WhatsApp' | 'Email' | 'Voice' | 'VoiceNote';
}

export interface Alert {
  id: string;
  name: string;
  type: 'mrr_threshold' | 'risk_level' | 'regulatory_shock';
  condition: 'below' | 'above' | 'equals' | 'occurs';
  value: number | RiskLevel | string;
  active: boolean;
  clientId?: string;
}
