import React, { useState } from 'react';
import { Upload, Download, FileText, Users, Building2, DollarSign, Trash2, Edit3, Mail, Phone } from 'lucide-react';

interface BulkOperationsProps {
  module: string;
  selectedItems: any[];
  onBulkAction: (action: string, data?: any) => void;
  onClearSelection: () => void;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({ 
  module, 
  selectedItems, 
  onBulkAction, 
  onClearSelection 
}) => {
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    
    // Simulate CSV import
    setTimeout(() => {
      const sampleData = generateSampleImportData();
      onBulkAction('import', sampleData);
      setImporting(false);
      
      // Reset file input
      event.target.value = '';
    }, 2000);
  };

  const handleExport = () => {
    setExporting(true);
    
    // Simulate CSV export
    setTimeout(() => {
      const csvContent = generateCSVContent();
      downloadCSV(csvContent, `${module}-export-${new Date().toISOString().split('T')[0]}.csv`);
      setExporting(false);
    }, 1000);
  };

  const generateSampleImportData = () => {
    switch (module) {
      case 'leads':
        return [
          {
            company_name: 'TechCorp Solutions',
            company_country: 'United States',
            poc_name: 'John Smith',
            poc_email: 'john@techcorp.com',
            poc_phone: '+1-555-0123',
            status: 'new',
            estimated_value: 25000
          },
          {
            company_name: 'Global Industries',
            company_country: 'Canada',
            poc_name: 'Sarah Johnson',
            poc_email: 'sarah@global.com',
            poc_phone: '+1-555-0456',
            status: 'contacted',
            estimated_value: 50000
          },
          {
            company_name: 'Innovation Labs',
            company_country: 'United Kingdom',
            poc_name: 'Mike Wilson',
            poc_email: 'mike@innovation.co.uk',
            poc_phone: '+44-20-1234-5678',
            status: 'qualified',
            estimated_value: 75000
          }
        ];
      case 'customers':
        return [
          {
            company_name: 'Enterprise Corp',
            company_country: 'United States',
            poc_name: 'Lisa Brown',
            poc_email: 'lisa@enterprise.com',
            status: 'active',
            lifetime_value: 150000
          }
        ];
      default:
        return [];
    }
  };

  const generateCSVContent = () => {
    if (selectedItems.length === 0) return '';

    const headers = Object.keys(selectedItems[0]).filter(key => 
      !key.includes('id') && !key.includes('created_at') && !key.includes('updated_at')
    );

    const csvRows = [
      headers.join(','),
      ...selectedItems.map(item => 
        headers.map(header => {
          const value = item[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value || '';
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBulkActions = () => {
    const commonActions = [
      { id: 'export', label: 'Export Selected', icon: Download, color: 'text-blue-600' },
      { id: 'delete', label: 'Delete Selected', icon: Trash2, color: 'text-red-600' }
    ];

    switch (module) {
      case 'leads':
        return [
          { id: 'convert', label: 'Convert to Customers', icon: Building2, color: 'text-green-600' },
          { id: 'assign', label: 'Assign Owner', icon: Users, color: 'text-purple-600' },
          { id: 'update_status', label: 'Update Status', icon: Edit3, color: 'text-orange-600' },
          { id: 'send_email', label: 'Send Bulk Email', icon: Mail, color: 'text-indigo-600' },
          ...commonActions
        ];
      case 'customers':
        return [
          { id: 'assign', label: 'Assign Owner', icon: Users, color: 'text-purple-600' },
          { id: 'update_status', label: 'Update Status', icon: Edit3, color: 'text-orange-600' },
          { id: 'send_email', label: 'Send Bulk Email', icon: Mail, color: 'text-indigo-600' },
          ...commonActions
        ];
      case 'deals':
        return [
          { id: 'update_stage', label: 'Update Stage', icon: DollarSign, color: 'text-green-600' },
          { id: 'assign', label: 'Assign Owner', icon: Users, color: 'text-purple-600' },
          { id: 'update_probability', label: 'Update Probability', icon: Edit3, color: 'text-orange-600' },
          ...commonActions
        ];
      case 'activities':
        return [
          { id: 'mark_completed', label: 'Mark Completed', icon: Edit3, color: 'text-green-600' },
          { id: 'reschedule', label: 'Reschedule', icon: Edit3, color: 'text-orange-600' },
          { id: 'assign', label: 'Assign Owner', icon: Users, color: 'text-purple-600' },
          ...commonActions
        ];
      default:
        return commonActions;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* Import/Export */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline ml-2">
              {importing ? 'Importing...' : 'Import CSV'}
              </span>
              <span className="sm:hidden ml-2">Import</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
                disabled={importing}
              />
            </label>
            
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline ml-2">
              {exporting ? 'Exporting...' : 'Export All'}
              </span>
              <span className="sm:hidden ml-2">Export</span>
            </button>
          </div>

          {/* Sample Templates */}
          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={() => {
                const template = generateSampleTemplate();
                downloadCSV(template, `${module}-template.csv`);
              }}
              className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Download Template
            </button>
          </div>
        </div>

        {/* Selection Info */}
        {selectedItems.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative">
              <button
                onClick={() => setShowBulkMenu(!showBulkMenu)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Edit3 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline ml-2">Bulk Actions</span>
                <span className="sm:hidden ml-2">Actions</span>
              </button>
              
              {showBulkMenu && (
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {getBulkActions().map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => {
                          onBulkAction(action.id);
                          setShowBulkMenu(false);
                        }}
                        className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-50 transition-colors ${action.color} text-sm`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            <button
              onClick={onClearSelection}
              className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
            >
              <span className="hidden sm:inline">Clear Selection</span>
              <span className="sm:hidden">Clear</span>
            </button>
            </div>
          </div>
        )}
      </div>

      {importing && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-sm text-green-800">
              Importing data... This may take a few moments.
            </span>
          </div>
        </div>
      )}
    </div>
  );

  function generateSampleTemplate() {
    switch (module) {
      case 'leads':
        return 'company_name,company_country,poc_name,poc_email,poc_phone,status,estimated_value\nExample Corp,United States,John Doe,john@example.com,+1-555-0123,new,25000';
      case 'customers':
        return 'company_name,company_country,poc_name,poc_email,poc_phone,status,lifetime_value\nExample Corp,United States,John Doe,john@example.com,+1-555-0123,active,150000';
      case 'deals':
        return 'name,description,value,status,close_probability\nQ1 Software Deal,Enterprise software license,50000,open,high';
      case 'activities':
        return 'subject,description,status,priority,scheduled_at\nFollow-up Call,Discuss proposal details,scheduled,medium,2024-01-15T10:00:00';
      default:
        return '';
    }
  }
};