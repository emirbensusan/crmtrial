import React, { useState } from 'react';
import { Download, Upload, FileText, AlertCircle, CheckCircle, X, Calendar, Filter } from 'lucide-react';

interface DataExportImportProps {
  module: string;
  data: any[];
  onImport: (data: any[]) => void;
}

export const DataExportImport: React.FC<DataExportImportProps> = ({ module, data, onImport }) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFilters, setExportFilters] = useState({
    dateRange: 'all',
    status: 'all',
    includeNotes: true,
    includeActivities: false
  });
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    errors: string[];
  } | null>(null);

  const handleExport = async () => {
    let filteredData = [...data];

    // Apply filters
    if (exportFilters.dateRange !== 'all') {
      const days = exportFilters.dateRange === '30d' ? 30 : exportFilters.dateRange === '90d' ? 90 : 365;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filteredData = filteredData.filter(item => 
        new Date(item.created_at) >= cutoffDate
      );
    }

    if (exportFilters.status !== 'all') {
      filteredData = filteredData.filter(item => item.status === exportFilters.status);
    }

    // Generate export content
    let content = '';
    let filename = '';

    if (exportFormat === 'csv') {
      content = generateCSV(filteredData);
      filename = `${module}-export-${new Date().toISOString().split('T')[0]}.csv`;
    } else if (exportFormat === 'json') {
      content = JSON.stringify(filteredData, null, 2);
      filename = `${module}-export-${new Date().toISOString().split('T')[0]}.json`;
    } else if (exportFormat === 'excel') {
      // For demo purposes, we'll generate CSV with Excel-friendly format
      content = generateExcelCSV(filteredData);
      filename = `${module}-export-${new Date().toISOString().split('T')[0]}.csv`;
    }

    // Download file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportModal(false);
  };

  const generateCSV = (data: any[]) => {
    if (data.length === 0) return '';

    const headers = getExportHeaders(module);
    const csvRows = [headers.join(',')];

    data.forEach(item => {
      const row = headers.map(header => {
        const value = getFieldValue(item, header);
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value || '';
      });
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  };

  const generateExcelCSV = (data: any[]) => {
    // Add BOM for proper UTF-8 encoding in Excel
    return '\uFEFF' + generateCSV(data);
  };

  const getExportHeaders = (module: string) => {
    switch (module) {
      case 'leads':
        return ['company_name', 'company_country', 'poc_name', 'poc_email', 'poc_phone', 'status', 'estimated_value', 'created_at'];
      case 'customers':
        return ['company_name', 'company_country', 'poc_name', 'poc_email', 'status', 'lifetime_value', 'created_at'];
      case 'deals':
        return ['name', 'value', 'status', 'close_probability', 'expected_close_date', 'created_at'];
      case 'activities':
        return ['subject', 'status', 'priority', 'scheduled_at', 'completed_at', 'created_at'];
      default:
        return ['id', 'name', 'status', 'created_at'];
    }
  };

  const getFieldValue = (item: any, field: string) => {
    switch (field) {
      case 'created_at':
      case 'scheduled_at':
      case 'completed_at':
      case 'expected_close_date':
        return item[field] ? new Date(item[field]).toLocaleDateString('tr-TR') : '';
      case 'estimated_value':
      case 'lifetime_value':
      case 'value':
        return item[field] ? `₺${item[field].toLocaleString()}` : '';
      default:
        return item[field];
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('Dosya en az başlık ve bir veri satırı içermelidir');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const importedData = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const item: any = {};

          headers.forEach((header, index) => {
            item[header] = values[index] || '';
          });

          // Validate required fields
          const validation = validateImportItem(item, module);
          if (validation.isValid) {
            importedData.push(item);
          } else {
            errors.push(`Satır ${i + 1}: ${validation.errors.join(', ')}`);
          }
        } catch (error) {
          errors.push(`Satır ${i + 1}: Geçersiz format`);
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (importedData.length > 0) {
        onImport(importedData);
      }

      setImportResult({
        success: true,
        imported: importedData.length,
        errors
      });

    } catch (error: any) {
      setImportResult({
        success: false,
        imported: 0,
        errors: [error.message]
      });
    } finally {
      setImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  const validateImportItem = (item: any, module: string) => {
    const errors = [];

    switch (module) {
      case 'leads':
        if (!item.company_name) errors.push('Şirket adı gerekli');
        if (!item.company_country) errors.push('Ülke gerekli');
        if (!item.poc_name) errors.push('İletişim kişisi gerekli');
        if (item.poc_email && !isValidEmail(item.poc_email)) errors.push('Geçersiz e-posta');
        break;
      case 'customers':
        if (!item.company_name) errors.push('Şirket adı gerekli');
        if (!item.company_country) errors.push('Ülke gerekli');
        if (!item.poc_name) errors.push('İletişim kişisi gerekli');
        break;
      case 'deals':
        if (!item.name) errors.push('Anlaşma adı gerekli');
        if (!item.value || isNaN(parseFloat(item.value))) errors.push('Geçerli değer gerekli');
        break;
      case 'activities':
        if (!item.subject) errors.push('Konu gerekli');
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getStatusOptions = () => {
    switch (module) {
      case 'leads':
        return [
          { value: 'all', label: 'Tüm Durumlar' },
          { value: 'new', label: 'Yeni' },
          { value: 'qualified', label: 'Nitelikli' },
          { value: 'closed-won', label: 'Kazanılan' }
        ];
      case 'customers':
        return [
          { value: 'all', label: 'Tüm Durumlar' },
          { value: 'active', label: 'Aktif' },
          { value: 'inactive', label: 'Pasif' }
        ];
      case 'deals':
        return [
          { value: 'all', label: 'Tüm Durumlar' },
          { value: 'open', label: 'Açık' },
          { value: 'won', label: 'Kazanılan' },
          { value: 'lost', label: 'Kaybedilen' }
        ];
      default:
        return [{ value: 'all', label: 'Tüm Durumlar' }];
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Export Button */}
      <button
        onClick={() => setShowExportModal(true)}
        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
      >
        <Download className="w-4 h-4 mr-2" />
        Dışa Aktar
      </button>

      {/* Import Button */}
      <button
        onClick={() => setShowImportModal(true)}
        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        <Upload className="w-4 h-4 mr-2" />
        İçe Aktar
      </button>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Veri Dışa Aktarma</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel (CSV)</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tarih Aralığı</label>
                <select
                  value={exportFilters.dateRange}
                  onChange={(e) => setExportFilters({ ...exportFilters, dateRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tüm Zamanlar</option>
                  <option value="30d">Son 30 Gün</option>
                  <option value="90d">Son 90 Gün</option>
                  <option value="365d">Son 1 Yıl</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                <select
                  value={exportFilters.status}
                  onChange={(e) => setExportFilters({ ...exportFilters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {getStatusOptions().map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Additional Options */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportFilters.includeNotes}
                    onChange={(e) => setExportFilters({ ...exportFilters, includeNotes: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Notları dahil et</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportFilters.includeActivities}
                    onChange={(e) => setExportFilters({ ...exportFilters, includeActivities: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Aktiviteleri dahil et</span>
                </label>
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <FileText className="w-4 h-4 inline mr-2" />
                {data.length} kayıt dışa aktarılacak
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Dışa Aktar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Veri İçe Aktarma</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!importResult && (
                <>
                  <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <AlertCircle className="w-4 h-4 inline mr-2 text-yellow-600" />
                    CSV dosyası yükleyin. İlk satır başlık olmalıdır.
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CSV Dosyası Seçin
                    </label>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleImport}
                      disabled={importing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {importing && (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-gray-600">İçe aktarılıyor...</span>
                    </div>
                  )}
                </>
              )}

              {importResult && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border ${
                    importResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center">
                      {importResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      )}
                      <span className={`font-medium ${
                        importResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {importResult.success 
                          ? `${importResult.imported} kayıt başarıyla içe aktarıldı`
                          : 'İçe aktarma başarısız'
                        }
                      </span>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Uyarılar:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li>• ... ve {importResult.errors.length - 5} uyarı daha</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportResult(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {importResult ? 'Kapat' : 'İptal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};