import React from 'react';
import { Briefcase, Wallet, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { FinancialAssets, InsurancePolicy } from '../types';
import { generateId, formatCurrency } from '../utils';

interface AssetsSectionProps {
  assets: FinancialAssets;
  policies: InsurancePolicy[];
  onAssetsChange: (assets: FinancialAssets) => void;
  onPoliciesChange: (policies: InsurancePolicy[]) => void;
}

const AssetsSection: React.FC<AssetsSectionProps> = ({ 
  assets, 
  policies, 
  onAssetsChange, 
  onPoliciesChange 
}) => {
  
  const handleAssetChange = (field: keyof FinancialAssets, value: number) => {
    // Prevent negative numbers
    if (value < 0) return;
    onAssetsChange({ ...assets, [field]: value });
  };

  const addPolicy = () => {
    onPoliciesChange([...policies, { id: generateId(), name: '', amount: 0 }]);
  };

  const removePolicy = (id: string) => {
    onPoliciesChange(policies.filter(p => p.id !== id));
  };

  const updatePolicy = (id: string, field: keyof InsurancePolicy, value: string | number) => {
    // Prevent negative numbers for amount field
    if (field === 'amount' && typeof value === 'number' && value < 0) return;
    
    onPoliciesChange(policies.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const totalPolicies = policies.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
        <Wallet className="text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-bold">נכסים וביטוחים קיימים</h2>
      </div>

      {/* Financial Assets Grid */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-6 border border-purple-100 dark:border-purple-800/50">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Row 1, Col 1: Pension Fund */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">קרן פנסיה - קצבת שאירים (ערך נוכחי מהוון)</label>
                <input
                    type="number"
                    min="0"
                    value={assets.pensionSurvivor || ''}
                    onChange={(e) => handleAssetChange('pensionSurvivor', Number(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-base md:text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="0"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">הערך הכספי של קצבת השאירים החודשית מהפנסיה</p>
            </div>

            {/* Row 1, Col 2: Managers Insurance */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ביטוח מנהלים (צבירה הונית)</label>
                <input
                    type="number"
                    min="0"
                    value={assets.managersInsurance || ''}
                    onChange={(e) => handleAssetChange('managersInsurance', Number(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-base md:text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="0"
                />
            </div>

            {/* Row 2, Col 1: Study Fund */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">קרן השתלמות</label>
                <input
                    type="number"
                    min="0"
                    value={assets.studyFund || ''}
                    onChange={(e) => handleAssetChange('studyFund', Number(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-base md:text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="0"
                />
            </div>

            {/* Row 2, Col 2: Provident Fund */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">קופת גמל (נזיל)</label>
                <input
                    type="number"
                    min="0"
                    value={assets.providentFund || ''}
                    onChange={(e) => handleAssetChange('providentFund', Number(e.target.value))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-base md:text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="0"
                />
            </div>
         </div>
      </div>

      {/* Existing Policies */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50">
        <div className="flex justify-between items-center mb-3">
             <label className="block text-md font-semibold text-gray-800 dark:text-gray-200">ביטוחי חיים פרטיים קיימים וחסכונות אחרים</label>
             <button onClick={addPolicy} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center gap-1 font-medium">
                <Plus size={16} />
                הוסף ביטוח/חיסכון
             </button>
        </div>
        
        <div className="space-y-3">
            {policies.map((policy) => (
                <div key={policy.id} className="flex gap-3 items-center">
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                            <input
                                type="text"
                                value={policy.name}
                                onChange={(e) => updatePolicy(policy.id, 'name', e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-base md:text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors"
                                placeholder="שם הביטוח/חיסכון"
                            />
                        </div>
                        <div className="sm:col-span-1">
                             <input
                                type="number"
                                min="0"
                                value={policy.amount || ''}
                                onChange={(e) => updatePolicy(policy.id, 'amount', Number(e.target.value))}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-base md:text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white transition-colors"
                                placeholder="סכום"
                            />
                        </div>
                    </div>
                    <button onClick={() => removePolicy(policy.id)} className="text-red-400 hover:text-red-600 p-1 flex-shrink-0">
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            {policies.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">לא הוזנו ביטוחים פרטיים או חסכונות נוספים</p>
            )}
        </div>
        {policies.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">סה"כ ביטוחים וחסכונות:</span>
                <span className="font-bold text-blue-800 dark:text-blue-300">{formatCurrency(totalPolicies)}</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default AssetsSection;