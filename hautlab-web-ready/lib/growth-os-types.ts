export type GrowthCampaignRow = {
  campaign: string;
  leads: number;
  confirmed: number;
};

export type GrowthOsSnapshot = {
  days: number;
  generatedAt: string;
  adSpendConnected: boolean;
  adSpendMxn: number | null;
  roas: number | null;
  touchpoints: number;
  matchedTouchpoints: number;
  leads: number;
  responded: number;
  appointmentRequested: number;
  appointmentConfirmed: number;
  attributedLeads: number;
  pausedLeads: number;
  conversionEvents: number;
  pendingExports: number;
  exportedEvents: number;
  googleClickConversions: number;
  metaClickConversions: number;
  recordedRevenueMxn: number;
  conversationAttributedRevenueMxn: number;
  marketingAttributedRevenueMxn: number;
  campaigns: GrowthCampaignRow[];
};
