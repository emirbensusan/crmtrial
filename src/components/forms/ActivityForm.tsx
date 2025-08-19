import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save, Calendar, Clock, User } from 'lucide-react';

interface ActivityFormProps {
  activity?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({ activity, isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Reference data
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [users, setUsers] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    lead_id: '',
    customer_id: '',
    deal_id: '',
    contact_id: '',
    activity_type_id: '',
    scheduled_at: '',
    duration_minutes: '',
    owner_id: '',
    status: 'scheduled',
    priority: 'medium',
    ai_summary: '',
    ai_action_items: []
  });

  useEffect(() => {
    if (isOpen) {
      fetchReferenceData();
      if (activity) {
        setFormData({
          subject: activity.subject || '',
          description: activity.description || '',
          lead_id: activity.lead_id || '',
          customer_id: activity.customer_id || '',
          deal_id: activity.deal_id || '',
          contact_id: activity.contact_id || '',
          activity_type_id: activity.activity_type_id || '',
          scheduled_at: activity.scheduled_at ? new Date(activity.scheduled_at).toISOString().slice(0, 16) : '',
          duration_minutes: activity.duration_minutes || '',
          owner_id: activity.owner_id || '',
          status: activity.status || 'scheduled',
          priority: activity.priority || 'medium',
          ai_summary: activity.ai_summary || '',
          ai_action_items: activity.ai_action_items || []
        });
      }
    }
  }, [isOpen, activity]);

  const fetchReferenceData = async () => {
    try {
      const [
        leadsRes,
        customersRes,
        dealsRes,
        contactsRes,
        activityTypesRes,
        usersRes
      ] = await Promise.all([
        supabase.from('leads').select('id, company_name, unique_code'),
        supabase.from('customers').select('id, company_name, unique_code'),
        supabase.from('deals').select('id, name'),
        supabase.from('contacts').select('id, full_name'),
        supabase.from('activity_types').select('*').eq('is_active', true),
        supabase.from('users').select('id, full_name').eq('is_active', true)
      ]);

      setLeads(leadsRes.data || []);
      setCustomers(customersRes.data || []);
      setDeals(dealsRes.data || []);
      setContacts(contactsRes.data || []);
      setActivityTypes(activityTypesRes.data || []);
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
        scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        ai_action_items: formData.ai_action_items
      };

      if (activity) {
        const { error } = await supabase
          .from('activities')
          .update(submitData)
          .eq('id', activity.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('activities')
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

  const generateAISummary = () => {
    // Simulate AI summary generation
    const sampleSummaries = [
      "Meeting focused on Q1 budget planning and resource allocation. Client expressed strong interest in our enterprise package. Key decision: Move forward with pilot program starting next month. Client concerns about integration timeline were addressed.",
      "Product demonstration went well. Client was impressed with the analytics dashboard and reporting features. Next steps: Prepare custom proposal with pricing for 500 users. Follow-up scheduled for next week to discuss implementation timeline.",
      "Discovery call revealed client's main pain points: manual processes and lack of real-time visibility. Our solution addresses 80% of their requirements. Client budget confirmed at $50K annually. Decision timeline: End of quarter."
    ];
    
    const randomSummary = sampleSummaries[Math.floor(Math.random() * sampleSummaries.length)];
    setFormData({ ...formData, ai_summary: randomSummary });
  };

  const generateActionItems = () => {
    // Simulate AI action item generation
    const sampleActionItems = [
      { task: "Send follow-up email with meeting recap", priority: "High", completed: false },
      { task: "Prepare custom proposal with pricing breakdown", priority: "High", completed: false },
      { task: "Schedule technical demo for next week", priority: "Medium", completed: false },
      { task: "Connect client with implementation team", priority: "Medium", completed: false },
      { task: "Research client's industry compliance requirements", priority: "Low", completed: false }
    ];
    
    const randomItems = sampleActionItems
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 2);
    
    setFormData({ ...formData, ai_action_items: randomItems });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {activity ? 'Edit Activity' : 'Add New Activity'}
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

          {/* Activity Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Activity Details
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Follow-up call with client"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Activity details and agenda..."
                />
              </div>
            </div>
          </div>

          {/* Scheduling Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-green-600" />
              Scheduling
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Type
                </label>
                <select
                  value={formData.activity_type_id}
                  onChange={(e) => setFormData({ ...formData, activity_type_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select type...</option>
                  {activityTypes.map((type: any) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                />
              </div>
            </div>
          </div>

          {/* Relationships */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Related Records
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Lead
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
                  Related Customer
                </label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select customer...</option>
                  {customers.map((customer: any) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company_name} ({customer.unique_code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Deal
                </label>
                <select
                  value={formData.deal_id}
                  onChange={(e) => setFormData({ ...formData, deal_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select deal...</option>
                  {deals.map((deal: any) => (
                    <option key={deal.id} value={deal.id}>{deal.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person
                </label>
                <select
                  value={formData.contact_id}
                  onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select contact...</option>
                  {contacts.map((contact: any) => (
                    <option key={contact.id} value={contact.id}>{contact.full_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status & Assignment */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Features Section */}
          {formData.status === 'completed' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <div className="w-5 h-5 mr-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                AI-Powered Insights
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Meeting Summary
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.ai_summary}
                      onChange={(e) => setFormData({ ...formData, ai_summary: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-50"
                      placeholder="AI will generate a summary of key discussion points, decisions made, and outcomes..."
                    />
                    <button
                      type="button"
                      onClick={() => generateAISummary()}
                      className="absolute top-2 right-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-md hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      ✨ Generate AI Summary
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Action Items
                  </label>
                  <div className="space-y-2">
                    {formData.ai_action_items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={item.completed || false}
                          onChange={(e) => {
                            const updatedItems = [...formData.ai_action_items];
                            updatedItems[index] = { ...item, completed: e.target.checked };
                            setFormData({ ...formData, ai_action_items: updatedItems });
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {item.task}
                        </span>
                        <span className="text-xs text-gray-500">{item.priority}</span>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => generateActionItems()}
                      className="w-full px-3 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-medium"
                    >
                      ✨ Generate AI Action Items
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {activity ? 'Update Activity' : 'Create Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};