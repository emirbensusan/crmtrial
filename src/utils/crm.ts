// CRM-Specific Business Logic
export interface LeadConversionResult {
  success: boolean;
  customerId?: string;
  contactId?: string;
  errors: string[];
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  allowedTransitions: string[];
}

export interface ForecastData {
  totalValue: number;
  weightedValue: number;
  dealCount: number;
  averageDealSize: number;
  conversionRate: number;
}

export class CRMBusinessLogic {
  // Lead to Customer conversion
  async convertLeadToCustomer(leadId: string): Promise<LeadConversionResult> {
    try {
      // Validate lead exists and is qualified
      const lead = await this.getLeadById(leadId);
      if (!lead) {
        return { success: false, errors: ['Lead bulunamadı'] };
      }

      if (lead.status !== 'qualified') {
        return { success: false, errors: ['Sadece nitelikli potansiyeller dönüştürülebilir'] };
      }

      // Create customer record
      const customerData = {
        lead_id: leadId,
        company_name: lead.company_name,
        company_country: lead.company_country,
        company_address: lead.company_address,
        poc_name: lead.poc_name,
        poc_title: lead.poc_title,
        poc_email: lead.poc_email,
        poc_phone: lead.poc_phone,
        status: 'active',
        conversion_date: new Date().toISOString().split('T')[0],
        first_deal_value: lead.estimated_value,
        sales_cycle_length_days: this.calculateSalesCycleDays(lead.created_at)
      };

      // In real implementation, use Supabase
      const customerId = `customer_${Date.now()}`;
      console.log('Creating customer:', customerData);

      // Create primary contact
      const contactData = {
        customer_id: customerId,
        full_name: lead.poc_name,
        title: lead.poc_title,
        email: lead.poc_email,
        phone: lead.poc_phone,
        is_primary: true,
        is_decision_maker: true
      };

      const contactId = `contact_${Date.now()}`;
      console.log('Creating contact:', contactData);

      // Update lead status
      await this.updateLeadStatus(leadId, 'closed-won');

      return {
        success: true,
        customerId,
        contactId,
        errors: []
      };

    } catch (error) {
      return {
        success: false,
        errors: [`Dönüştürme hatası: ${error.message}`]
      };
    }
  }

  private async getLeadById(leadId: string): Promise<any> {
    // Mock implementation
    return {
      id: leadId,
      company_name: 'Test Company',
      status: 'qualified',
      created_at: '2024-01-01T00:00:00Z',
      estimated_value: 50000
    };
  }

  private async updateLeadStatus(leadId: string, status: string): Promise<void> {
    console.log(`Updating lead ${leadId} status to ${status}`);
  }

  private calculateSalesCycleDays(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Pipeline stage validation
  validateStageTransition(currentStage: string, newStage: string, stages: PipelineStage[]): boolean {
    const current = stages.find(s => s.id === currentStage);
    if (!current) return false;

    return current.allowedTransitions.includes(newStage);
  }

  // Forecast calculation
  calculateForecast(deals: any[]): ForecastData {
    const activeDeals = deals.filter(d => d.status === 'open');
    
    const totalValue = activeDeals.reduce((sum, deal) => sum + deal.value, 0);
    
    const weightedValue = activeDeals.reduce((sum, deal) => {
      const probability = this.getProbabilityValue(deal.close_probability);
      return sum + (deal.value * probability / 100);
    }, 0);

    const dealCount = activeDeals.length;
    const averageDealSize = dealCount > 0 ? totalValue / dealCount : 0;
    
    // Calculate conversion rate from historical data
    const closedDeals = deals.filter(d => ['won', 'lost'].includes(d.status));
    const wonDeals = deals.filter(d => d.status === 'won');
    const conversionRate = closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0;

    return {
      totalValue,
      weightedValue,
      dealCount,
      averageDealSize,
      conversionRate
    };
  }

  private getProbabilityValue(probability: string): number {
    switch (probability) {
      case 'low': return 25;
      case 'medium': return 50;
      case 'high': return 75;
      default: return 50;
    }
  }

  // Multi-currency support
  convertCurrency(amount: number, fromCurrency: string, toCurrency: string, exchangeRates: Record<string, number>): number {
    if (fromCurrency === toCurrency) return amount;
    
    // Convert to base currency (USD) first, then to target
    const baseAmount = fromCurrency === 'USD' ? amount : amount / exchangeRates[fromCurrency];
    return toCurrency === 'USD' ? baseAmount : baseAmount * exchangeRates[toCurrency];
  }

  // Overdue detection (14 days rule)
  findOverdueRecords(records: any[]): any[] {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    return records.filter(record => {
      const lastActivity = new Date(record.updated_at || record.created_at);
      return lastActivity < fourteenDaysAgo && ['new', 'contacted', 'qualified'].includes(record.status);
    });
  }

  // Duplicate detection
  findDuplicates(records: any[], fields: string[] = ['email', 'phone']): Array<{ original: any; duplicates: any[] }> {
    const duplicateGroups: Array<{ original: any; duplicates: any[] }> = [];
    const processed = new Set();

    records.forEach(record => {
      if (processed.has(record.id)) return;

      const duplicates = records.filter(other => {
        if (other.id === record.id || processed.has(other.id)) return false;
        
        return fields.some(field => {
          const value1 = record[field]?.toLowerCase().trim();
          const value2 = other[field]?.toLowerCase().trim();
          return value1 && value2 && value1 === value2;
        });
      });

      if (duplicates.length > 0) {
        duplicateGroups.push({ original: record, duplicates });
        processed.add(record.id);
        duplicates.forEach(dup => processed.add(dup.id));
      }
    });

    return duplicateGroups;
  }

  // Activity KPI calculation
  calculateActivityKPIs(activities: any[], userId?: string): {
    daily: number;
    weekly: number;
    monthly: number;
    byType: Record<string, number>;
  } {
    const userActivities = userId 
      ? activities.filter(a => a.owner_id === userId)
      : activities;

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const daily = userActivities.filter(a => new Date(a.created_at) > oneDayAgo).length;
    const weekly = userActivities.filter(a => new Date(a.created_at) > oneWeekAgo).length;
    const monthly = userActivities.filter(a => new Date(a.created_at) > oneMonthAgo).length;

    const byType: Record<string, number> = {};
    userActivities.forEach(activity => {
      const type = activity.activity_type?.name || 'Other';
      byType[type] = (byType[type] || 0) + 1;
    });

    return { daily, weekly, monthly, byType };
  }
}

// AI Integration Helper
export class AIIntegration {
  private useAI: boolean = true;
  private tokenLimit: number = 1000;
  private tokensUsed: number = 0;

  constructor(useAI: boolean = true, tokenLimit: number = 1000) {
    this.useAI = useAI;
    this.tokenLimit = tokenLimit;
  }

  canUseAI(): boolean {
    return this.useAI && this.tokensUsed < this.tokenLimit;
  }

  async generateSummary(text: string): Promise<string | null> {
    if (!this.canUseAI()) {
      return null;
    }

    // Simulate AI API call
    this.tokensUsed += Math.floor(text.length / 4); // Rough token estimation
    
    // Mock AI summary
    const summaries = [
      'Müşteri ile yapılan görüşmede ürün özellikleri detaylandırıldı. Fiyat konusunda anlaşmaya varıldı.',
      'Teknik demo başarılı geçti. Müşteri entegrasyon süreci hakkında sorular sordu.',
      'Karar verme süreci 2 hafta sürecek. Rakip teklifler değerlendiriliyor.'
    ];

    return summaries[Math.floor(Math.random() * summaries.length)];
  }

  async generateActionItems(text: string): Promise<Array<{ task: string; priority: string }> | null> {
    if (!this.canUseAI()) {
      return null;
    }

    this.tokensUsed += Math.floor(text.length / 4);

    // Mock AI action items
    const actionItems = [
      { task: 'Teknik ekiple entegrasyon planı hazırla', priority: 'High' },
      { task: 'Fiyat teklifi güncelle', priority: 'Medium' },
      { task: 'Referans müşteri listesi gönder', priority: 'Low' }
    ];

    return actionItems.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  getRemainingTokens(): number {
    return Math.max(0, this.tokenLimit - this.tokensUsed);
  }

  resetTokens(): void {
    this.tokensUsed = 0;
  }
}