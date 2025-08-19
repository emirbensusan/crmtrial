import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save, Building2, User, Mail, Phone, MapPin, DollarSign, Calendar } from 'lucide-react';

interface CustomerFormProps {
  customer?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ customer, isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Reference data
  const [leads, setLeads] = useState([]);
  const [customerTypes, setCustomerTypes] = useState([]);
  const [productLines, setProductLines] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [relationshipStatuses, setRelationshipStatuses] = useState([]);
  const [users, setUsers] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    lead_id: '',
    company_name: '',
    company_country: '',
    company_address: '',
    poc_name: '',
    poc_title: '',
    poc_email: '',
    poc_phone: '',
    customer_type_id: '',
    product_line_id: '',
    owner_id: '',
    status: 'active',
    payment_terms_effective_id: '',
    payment_currency_id: '',
    lifetime_value: '',
    annual_value: '',
    notes: '',
    relationship_status_id: '',
    next_follow_up_date: '',
    special_requirements: '',
    conversion_date: '',
    first_deal_value: '',
    sales_cycle_length_days: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchReferenceData();
      if (customer) {
        setFormData({
          lead_id: customer.lead_id || '',
          company_name: customer.company_name || '',
          company_country: customer.company_country || '',
          company_address: customer.company_address || '',
          poc_name: customer.poc_name || '',
          poc_title: customer.poc_title || '',
          poc_email: customer.poc_email || '',
          poc_phone: customer.poc_phone || '',
          customer_type_id: customer.customer_type_id || '',
          product_line_id: customer.product_line_id || '',
          owner_id: customer.owner_id || '',
          status: customer.status || 'active',
          payment_terms_effective_id: customer.payment_terms_effective_id || '',
          payment_currency_id: customer.payment_currency_id || '',
          lifetime_value: customer.lifetime_value || '',
          annual_value: customer.annual_value || '',
          notes: customer.notes || '',
          relationship_status_id: customer.relationship_status_id || '',
          next_follow_up_date: customer.next_follow_up_date || '',
          special_requirements: customer.special_requirements || '',
          conversion_date: customer.conversion_date || '',
          first_deal_value: customer.first_deal_value || '',
          sales_cycle_length_days: customer.sales_cycle_length_days || ''
        });
      }
    }
  }, [isOpen, customer]);

  const fetchReferenceData = async () => {
    try {
      const [
        leadsRes,
        customerTypesRes,
        productLinesRes,
        paymentTermsRes,
        currenciesRes,
        relationshipStatusesRes,
        usersRes
      ] = await Promise.all([
        supabase.from('leads').select('id, company_name, unique_code').eq('status', 'qualified'),
        supabase.from('customer_types').select('*').eq('is_active', true),
        supabase.from('product_lines').select('*').eq('is_active', true),
        supabase.from('payment_terms').select('*').eq('is_active', true),
        supabase.from('currencies').select('*').eq('is_active', true),
        supabase.from('relationship_statuses').select('*').eq('is_active', true),
        supabase.from('users').select('id, full_name').eq('is_active', true)
      ]);

      setLeads(leadsRes.data || []);
      setCustomerTypes(customerTypesRes.data || []);
      setProductLines(productLinesRes.data || []);
      setPaymentTerms(paymentTermsRes.data || []);
      setCurrencies(currenciesRes.data || []);
      setRelationshipStatuses(relationshipStatusesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        lifetime_value: formData.lifetime_value ? parseFloat(formData.lifetime_value) : null,
        annual_value: formData.annual_value ? parseFloat(formData.annual_value) : null,
        first_deal_value: formData.first_deal_value ? parseFloat(formData.first_deal_value) : null,
        sales_cycle_length_days: formData.sales_cycle_length_days ? parseInt(formData.sales_cycle_length_days) : null,
        conversion_date: formData.conversion_date || null,
        next_follow_up_date: formData.next_follow_up_date || null
      };

      if (customer) {
        const { error } = await supabase
          .from('customers')
          .update(submitData)
          .eq('id', customer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([submitData]);
        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Lead Conversion */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Lead Conversion
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Converted from Lead
                </label>
                <select
                  value={formData.lead_id}
                  onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select lead...</option>
                  {leads.map((lead: any) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.company_name} ({lead.unique_code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conversion Date
                </label>
                <input
                  type="date"
                  value={formData.conversion_date}
                  onChange={(e) => setFormData({ ...formData, conversion_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-green-600" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company_country}
                  onChange={(e) => setFormData({ ...formData, company_country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.company_address}
                  onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Primary Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.poc_name}
                  onChange={(e) => setFormData({ ...formData, poc_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.poc_title}
                  onChange={(e) => setFormData({ ...formData, poc_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.poc_email}
                  onChange={(e) => setFormData({ ...formData, poc_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.poc_phone}
                  onChange={(e) => setFormData({ ...formData, poc_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
              Business Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Type
                </label>
                <select
                  value={formData.customer_type_id}
                  onChange={(e) => setFormData({ ...formData, customer_type_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select type...</option>
                  {customerTypes.map((type: any) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Line
                </label>
                <select
                  value={formData.product_line_id}
                  onChange={(e) => setFormData({ ...formData, product_line_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select product...</option>
                  {productLines.map((product: any) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Owner
                </label>
                <select
                  value={formData.owner_id}
                  onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select owner...</option>
                  {users.map((user: any) => (
                    <option key={user.id} value={user.id}>{user.full_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lifetime Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lifetime_value}
                  onChange={(e) => setFormData({ ...formData, lifetime_value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.annual_value}
                  onChange={(e) => setFormData({ ...formData, annual_value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Deal Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.first_deal_value}
                  onChange={(e) => setFormData({ ...formData, first_deal_value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.payment_currency_id}
                  onChange={(e) => setFormData({ ...formData, payment_currency_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select currency...</option>
                  {currencies.map((currency: any) => (
                    <option key={currency.id} value={currency.id}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Relationship Management */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="churned">Churned</option>
                  <option value="prospect">Prospect</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship Status
                </label>
                <select
                  value={formData.relationship_status_id}
                  onChange={(e) => setFormData({ ...formData, relationship_status_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select status...</option>
                  {relationshipStatuses.map((status: any) => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Follow-up Date
                </label>
                <input
                  type="date"
                  value={formData.next_follow_up_date}
                  onChange={(e) => setFormData({ ...formData, next_follow_up_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notes and Requirements */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Customer notes and important information..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requirements
              </label>
              <textarea
                value={formData.special_requirements}
                onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special requirements or considerations..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {customer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};