export interface FAQ {
  id: string;
  question: string;
  answer: string;
  lastUpdated: string;
  tags: string[];
}

export interface FAQMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  quickActions?: FAQQuickAction[];
  relatedFAQs?: FAQ[];
}

export interface FAQQuickAction {
  label: string;
  icon: any;
  action: string;
}

export interface FAQAssistantProps {
  onClose?: () => void;
  onNavigate?: (path: string) => void;
  currentPage?: string;
}