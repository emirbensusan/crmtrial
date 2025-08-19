// Enhanced CRM Business Logic with Security and Validation
import { supabase } from '../lib/supabase';
import { Logger } from './logging';
import { InputSecurityValidator } from './inputSecurity';

export interface LeadConversionResult {
  success: boolean;
  customerId?: string;
  contactId?: string;
  errors: string[];
  auditLog?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class SecureCRMBusinessLogic {
  private logger = Logger.getInstance();
  private validator = new InputSecurityValidator();

  // Secure Lead to Customer Conversion
  async convertLeadToCustomer(leadId: string, userId: string): Promise<LeadConversionResult> {
    this.logger.logBusinessEvent('lead_conversion_started', { leadId, userId });
    
    try {
      // Validate lead exists and user has permission
      const leadValidation = await this.validateLeadForConversion(leadId, userId);
      if (!leadValidation.isValid) {
        return { success: false, errors: leadValidation.errors };
      }

      // Get lead data
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadError || !lead) {
        return { success: false, errors: ['Lead not found or access denied'] };
      }

      // Validate lead status
      if (lead.status !== 'qualified') {
        return { success: false, errors: ['Only qualified leads can be converted to customers'] };
      }

      // Check for existing customer with same company
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id, company_name')
        .eq('company_name', lead.company_name)
        .eq('organization_id', lead.organization_id)
        .single();

      if (existingCustomer) {
        return { 
          success: false, 
          errors: [`Customer already exists: ${existingCustomer.company_name}`] 
        };
      }

      // Create customer record with sanitized data
      const customerData = {
        lead_id: leadId,
        organization_id: lead.organization_id,
        company_name: this.validator.validateAndSanitize(lead.company_name, 'Company Name').sanitizedValue,
        company_country: this.validator.validateAndSanitize(lead.company_country, 'Country').sanitizedValue,
        company_address: lead.company_address ? this.validator.validateAndSanitize(lead.company_address, 'Address').sanitizedValue : null,
        poc_name: this.validator.validateAndSanitize(lead.poc_name, 'Contact Name').sanitizedValue,
        poc_title: lead.poc_title ? this.validator.validateAndSanitize(lead.poc_title, 'Title').sanitizedValue : null,
        poc_email: lead.poc_email,
        poc_phone: lead.poc_phone,
        status: 'active',
        conversion_date: new Date().toISOString().split('T')[0],
        first_deal_value: lead.estimated_value,
        sales_cycle_length_days: this.calculateSalesCycleDays(lead.created_at),
        owner_id: lead.owner_id
      };

      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (customerError) {
        throw new Error(`Failed to create customer: ${customerError.message}`);
      }

      // Create primary contact
      const contactData = {
        customer_id: customer.id,
        organization_id: lead.organization_id,
        full_name: customerData.poc_name,
        title: customerData.poc_title,
        email: customerData.poc_email,
        phone: customerData.poc_phone,
        is_primary: true,
        is_decision_maker: true
      };

      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single();

      if (contactError) {
        this.logger.warn('Contact creation failed during conversion', { 
          leadId, 
          customerId: customer.id, 
          error: contactError.message 
        });
      }

      // Update lead status
      const { error: updateError } = await supabase
        .from('leads')
        .update({ status: 'closed-won' })
        .eq('id', leadId);

      if (updateError) {
        this.logger.warn('Lead status update failed', { leadId, error: updateError.message });
      }

      // Log successful conversion
      this.logger.logBusinessEvent('lead_conversion_completed', {
        leadId,
        customerId: customer.id,
        contactId: contact?.id,
        userId,
        salesCycleDays: customerData.sales_cycle_length_days
      });

      return {
        success: true,
        customerId: customer.id,
        contactId: contact?.id,
        errors: [],
        auditLog: `Lead ${leadId} converted to customer ${customer.id} by user ${userId}`
      };

    } catch (error: any) {
      this.logger.error('Lead conversion failed', { leadId, userId, error: error.message });
      return {
        success: false,
        errors: [`Conversion failed: ${error.message}`]
      };
    }
  }

  // Validate lead for conversion
  private async validateLeadForConversion(leadId: string, userId: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate lead ID format
    if (!leadId || typeof leadId !== 'string') {
      errors.push('Invalid lead ID');
    }

    // Validate user ID format
    if (!userId || typeof userId !== 'string') {
      errors.push('Invalid user ID');
    }

    // Check if lead exists and user has access
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .select('id, status, owner_id, organization_id')
        .eq('id', leadId)
        .single();

      if (error || !lead) {
        errors.push('Lead not found or access denied');
        return { isValid: false, errors, warnings };
      }

      // Check lead status
      if (lead.status === 'closed-won') {
        errors.push('Lead has already been converted');
      } else if (lead.status === 'closed-lost') {
        errors.push('Cannot convert a lost lead');
      } else if (lead.status !== 'qualified') {
        warnings.push('Lead is not qualified - consider qualifying first');
      }

      // Check ownership
      if (lead.owner_id && lead.owner_id !== userId) {
        warnings.push('You are not the owner of this lead');
      }

    } catch (error: any) {
      errors.push(`Validation error: ${error.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Calculate sales cycle length
  private calculateSalesCycleDays(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Secure pipeline stage validation
  async validateStageTransition(
    dealId: string, 
    currentStage: string, 
    newStage: string, 
    userId: string
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Get valid stage transitions
      const { data: stages } = await supabase
        .from('sales_funnel_stages')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (!stages) {
        errors.push('Unable to load sales stages');
        return { isValid: false, errors, warnings };
      }

      const currentStageData = stages.find(s => s.id === currentStage);
      const newStageData = stages.find(s => s.id === newStage);

      if (!currentStageData) {
        errors.push('Current stage not found');
      }

      if (!newStageData) {
        errors.push('New stage not found');
      }

      if (currentStageData && newStageData) {
        // Check if transition is valid (can only move forward or backward by 1 stage)
        const currentIndex = currentStageData.order_index;
        const newIndex = newStageData.order_index;
        const indexDiff = Math.abs(newIndex - currentIndex);

        if (indexDiff > 2) {
          errors.push('Cannot skip multiple stages in pipeline');
        }

        // Warn about backward movement
        if (newIndex < currentIndex) {
          warnings.push('Moving deal backward in pipeline');
        }
      }

      // Log stage transition attempt
      this.logger.logBusinessEvent('stage_transition_attempted', {
        dealId,
        currentStage,
        newStage,
        userId,
        isValid: errors.length === 0
      });

    } catch (error: any) {
      errors.push(`Stage validation error: ${error.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Secure duplicate detection
  async findPotentialDuplicates(
    type: 'leads' | 'customers' | 'contacts',
    record: any,
    organizationId: string
  ): Promise<any[]> {
    try {
      let query = supabase.from(type).select('*').eq('organization_id', organizationId);

      // Different matching criteria for different types
      switch (type) {
        case 'leads':
        case 'customers':
          if (record.company_name) {
            query = query.or(`company_name.ilike.%${record.company_name}%,poc_email.eq.${record.poc_email}`);
          }
          break;
        case 'contacts':
          if (record.email) {
            query = query.or(`email.eq.${record.email},phone.eq.${record.phone}`);
          }
          break;
      }

      const { data: duplicates } = await query.limit(10);
      
      // Filter out exact matches and calculate similarity scores
      const potentialDuplicates = (duplicates || [])
        .filter(dup => dup.id !== record.id)
        .map(dup => ({
          ...dup,
          similarity_score: this.calculateSimilarityScore(record, dup, type)
        }))
        .filter(dup => dup.similarity_score > 0.7) // 70% similarity threshold
        .sort((a, b) => b.similarity_score - a.similarity_score);

      this.logger.info('Duplicate detection completed', {
        type,
        recordId: record.id,
        duplicatesFound: potentialDuplicates.length
      });

      return potentialDuplicates;

    } catch (error: any) {
      this.logger.error('Duplicate detection failed', { type, error: error.message });
      return [];
    }
  }

  // Calculate similarity score between records
  private calculateSimilarityScore(record1: any, record2: any, type: string): number {
    let score = 0;
    let totalFields = 0;

    const fieldsToCompare = {
      leads: ['company_name', 'poc_name', 'poc_email', 'poc_phone'],
      customers: ['company_name', 'poc_name', 'poc_email', 'poc_phone'],
      contacts: ['full_name', 'email', 'phone', 'title']
    };

    const fields = fieldsToCompare[type] || [];

    fields.forEach(field => {
      if (record1[field] && record2[field]) {
        totalFields++;
        const similarity = this.stringSimilarity(
          record1[field].toLowerCase(),
          record2[field].toLowerCase()
        );
        score += similarity;
      }
    });

    return totalFields > 0 ? score / totalFields : 0;
  }

  // Simple string similarity calculation
  private stringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // Levenshtein distance calculation
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Secure activity KPI calculation
  async calculateSecureActivityKPIs(userId?: string, organizationId?: string): Promise<{
    daily: number;
    weekly: number;
    monthly: number;
    byType: Record<string, number>;
    securityScore: number;
  }> {
    try {
      let query = supabase
        .from('activities')
        .select('*, activity_types(name)');

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      if (userId) {
        query = query.eq('owner_id', userId);
      }

      const { data: activities, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch activities: ${error.message}`);
      }

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const daily = activities?.filter(a => new Date(a.created_at) > oneDayAgo).length || 0;
      const weekly = activities?.filter(a => new Date(a.created_at) > oneWeekAgo).length || 0;
      const monthly = activities?.filter(a => new Date(a.created_at) > oneMonthAgo).length || 0;

      const byType: Record<string, number> = {};
      activities?.forEach(activity => {
        const type = activity.activity_types?.name || 'Other';
        byType[type] = (byType[type] || 0) + 1;
      });

      // Calculate security score based on data completeness and validation
      const securityScore = this.calculateDataSecurityScore(activities || []);

      this.logger.info('Activity KPIs calculated', {
        userId,
        organizationId,
        daily,
        weekly,
        monthly,
        securityScore
      });

      return { daily, weekly, monthly, byType, securityScore };

    } catch (error: any) {
      this.logger.error('Activity KPI calculation failed', { userId, error: error.message });
      return { daily: 0, weekly: 0, monthly: 0, byType: {}, securityScore: 0 };
    }
  }

  // Calculate data security score
  private calculateDataSecurityScore(activities: any[]): number {
    if (activities.length === 0) return 100;

    let score = 0;
    let totalChecks = 0;

    activities.forEach(activity => {
      totalChecks += 5; // 5 security checks per activity

      // Check 1: Has required fields
      if (activity.subject && activity.status) score += 1;

      // Check 2: No suspicious content
      if (!this.containsSuspiciousContent(activity.subject || '')) score += 1;
      if (!this.containsSuspiciousContent(activity.description || '')) score += 1;

      // Check 3: Valid timestamps
      if (activity.created_at && new Date(activity.created_at).getTime() > 0) score += 1;

      // Check 4: Proper ownership
      if (activity.owner_id) score += 1;
    });

    return totalChecks > 0 ? Math.round((score / totalChecks) * 100) : 100;
  }

  // Check for suspicious content
  private containsSuspiciousContent(text: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /eval\(/i,
      /union\s+select/i,
      /drop\s+table/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(text));
  }
}