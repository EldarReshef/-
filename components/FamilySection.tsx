import React from 'react';
import { Users, Plus, Trash2, Baby, Info } from 'lucide-react';
import { Beneficiary, FamilyRelation, ChildOccupation } from '../types';
import { generateId, calculateAge, formatCurrency, calculateMonthlyNIPayment, validateBirthDate } from '../utils';
import { RELATION_OPTIONS, CHILD_OCCUPATION_DETAILS } from '../constants';

interface FamilySectionProps {
  beneficiaries: Beneficiary[];
  onChange: (beneficiaries: Beneficiary[]) => void;
  netSalary: number;
}

const FamilySection: React.FC<FamilySectionProps> = ({ beneficiaries, onChange, netSalary }) => {
  
  const currentSpouseMonthlyNI = calculateMonthlyNIPayment(beneficiaries);

  const addBeneficiary = () => {
    onChange([
      ...beneficiaries,
      {
        id: generateId(),
        name: '',
        relation: FamilyRelation.CHILD,
        birthDate: '',
        occupation: 'regular', // Default to regular (No framework/Not Eligible based on age)
        supportPercent: 20,
        supportUntilAge: 21,
        lumpSum: 100000,
        includeSupport: true,
        includeLumpSum: true
      }
    ]);
  };

  const removeBeneficiary = (id: string) => {
    onChange(beneficiaries.filter(b => b.id !== id));
  };

  const updateBeneficiary = (id: string, field: keyof Beneficiary, value: any) => {
    // Validate numeric fields to ensure non-negative values
    if (typeof value === 'number' && value < 0) return;

    onChange(beneficiaries.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
        <div className="flex items-center gap-2">
             <Users className="text-blue-600 dark:text-blue-400" />
             <h2 className="text-xl font-bold">בני משפחה (מוטבים)</h2>
        </div>
        <button 
            onClick={addBeneficiary}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1 rounded-full text-sm font-medium transition-colors"
        >
            <Plus size={16} />
            הוסף מוטב
        </button>
      </div>

      <div className="space-y-4">
        {beneficiaries.map((b, index) => {
            const age = calculateAge(b.birthDate);
            const monthlyAmount = (netSalary * b.supportPercent) / 100;
            const yearsOfSupport = Math.max(0, b.supportUntilAge - age);
            // Only show years calculation if birthdate is valid
            const showCalc = b.birthDate && age >= 0;
            const dateError = validateBirthDate(b.birthDate);

            return (
                <div key={b.id} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-600 relative group transition-colors">
                    <div className="absolute top-4 left-4 z-10">
                         <button 
                            onClick={() => removeBeneficiary(b.id)}
                            className="text-gray-400 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-gray-50 dark:bg-gray-700 md:bg-transparent rounded-full p-1"
                            title="מחק מוטב"
                         >
                            <Trash2 size={18} />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                         <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {index + 1}
                         </div>
                         <div className="font-bold text-gray-700 dark:text-gray-200">
                             {b.relation}
                             {showCalc && <span className="font-normal text-gray-500 dark:text-gray-400 text-sm mr-2">(גיל: {age})</span>}
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                         <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">שם מלא</label>
                            <input
                                type="text"
                                value={b.name}
                                onChange={(e) => updateBeneficiary(b.id, 'name', e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-1.5 text-base md:text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white transition-colors"
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">קרבה</label>
                            <select
                                value={b.relation}
                                onChange={(e) => updateBeneficiary(b.id, 'relation', e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-1.5 text-base md:text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white transition-colors"
                            >
                                {RELATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              תאריך לידה <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={b.birthDate}
                                onChange={(e) => updateBeneficiary(b.id, 'birthDate', e.target.value)}
                                className={`w-full border ${dateError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'} rounded-md p-1.5 text-base md:text-sm focus:ring-1 outline-none bg-white dark:bg-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark] transition-colors`}
                            />
                            {dateError && <p className="text-xs text-red-500 mt-0.5">{dateError}</p>}
                         </div>
                    </div>

                    {/* Spouse: Show NI Calculation */}
                    {b.relation === FamilyRelation.SPOUSE && (
                      <div className="mb-4 bg-orange-50 dark:bg-orange-900/20 p-3 rounded border border-orange-100 dark:border-orange-800/30 flex items-center gap-3">
                         <Info className="text-orange-500 flex-shrink-0" size={20} />
                         <div>
                             <p className="text-xs text-orange-800 dark:text-orange-300 font-bold mb-0.5">קצבת שאירים (ביטוח לאומי)</p>
                             <p className="text-sm text-orange-700 dark:text-orange-400">
                                צפי לקצבה חודשית: <span className="font-bold">{formatCurrency(currentSpouseMonthlyNI)}</span>
                             </p>
                         </div>
                      </div>
                    )}

                    {/* Child Occupation Selection for NI Calculation */}
                    {b.relation === FamilyRelation.CHILD && (
                        <div className="mb-4 bg-orange-50 dark:bg-orange-900/20 p-3 rounded border border-orange-100 dark:border-orange-800/30">
                            <label className="block text-xs font-medium text-orange-800 dark:text-orange-300 mb-1">סטטוס לביטוח לאומי (קצבת שאירים)</label>
                            {age < 24 ? (
                                <select
                                    value={b.occupation || 'regular'}
                                    onChange={(e) => updateBeneficiary(b.id, 'occupation', e.target.value)}
                                    className="w-full border border-orange-200 dark:border-orange-700 rounded-md p-1.5 text-base md:text-sm focus:ring-1 focus:ring-orange-500 outline-none bg-white dark:bg-gray-700 dark:text-white transition-colors"
                                >
                                    {Object.entries(CHILD_OCCUPATION_DETAILS)
                                        .filter(([key, details]) => details.maxAge > age || key === 'not_eligible') // Only show relevant options based on age, but allow not_eligible
                                        .map(([key, details]) => (
                                        <option key={key} value={key}>{details.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">גיל הילד מעל 24 - אינו זכאי לתוספת שאירים</p>
                            )}
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800/50 p-3 rounded border border-gray-100 dark:border-gray-600 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="border-l-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-600 pl-0 md:pl-4 pt-4 md:pt-0">
                             <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox"
                                        checked={b.includeSupport}
                                        onChange={(e) => updateBeneficiary(b.id, 'includeSupport', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-500"
                                    />
                                    <label 
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                                        onClick={() => updateBeneficiary(b.id, 'includeSupport', !b.includeSupport)}
                                    >
                                        תמיכה חודשית
                                    </label>
                                </div>
                                {b.includeSupport && (
                                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{formatCurrency(monthlyAmount)}</span>
                                )}
                             </div>
                             <div className={`flex gap-2 items-center mb-2 transition-opacity ${b.includeSupport ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                 <div className="flex-1">
                                     <span className="text-xs text-gray-500 dark:text-gray-400 block">אחוז מהנטו</span>
                                     <input 
                                        type="number" 
                                        min="0"
                                        value={b.supportPercent}
                                        onChange={(e) => updateBeneficiary(b.id, 'supportPercent', Number(e.target.value))}
                                        disabled={!b.includeSupport}
                                        className="w-full border rounded p-1 text-base md:text-sm bg-white dark:bg-gray-700 dark:border-gray-500 dark:text-white"
                                     />
                                 </div>
                                 <div className="flex-1">
                                     <span className="text-xs text-gray-500 dark:text-gray-400 block">עד גיל</span>
                                     <input 
                                        type="number" 
                                        min="0"
                                        value={b.supportUntilAge}
                                        onChange={(e) => updateBeneficiary(b.id, 'supportUntilAge', Number(e.target.value))}
                                        disabled={!b.includeSupport}
                                        className="w-full border rounded p-1 text-base md:text-sm bg-white dark:bg-gray-700 dark:border-gray-500 dark:text-white"
                                     />
                                 </div>
                             </div>
                             {showCalc && b.includeSupport && (
                                 <p className="text-xs text-gray-400 dark:text-gray-500">משך תמיכה: {yearsOfSupport} שנים</p>
                             )}
                         </div>
                         <div className="pt-2 md:pt-0">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox"
                                        checked={b.includeLumpSum}
                                        onChange={(e) => updateBeneficiary(b.id, 'includeLumpSum', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-500"
                                    />
                                    <label 
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                                        onClick={() => updateBeneficiary(b.id, 'includeLumpSum', !b.includeLumpSum)}
                                    >
                                        מענק חד-פעמי
                                    </label>
                                </div>
                             </div>
                             <div className={`transition-opacity ${b.includeLumpSum ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                 <span className="text-xs text-gray-500 dark:text-gray-400 block">סכום (הוני)</span>
                                 <input 
                                    type="number" 
                                    min="0"
                                    value={b.lumpSum}
                                    onChange={(e) => updateBeneficiary(b.id, 'lumpSum', Number(e.target.value))}
                                    disabled={!b.includeLumpSum}
                                    className="w-full border rounded p-1 text-base md:text-sm bg-white dark:bg-gray-700 dark:border-gray-500 dark:text-white"
                                 />
                             </div>
                         </div>
                    </div>
                </div>
            );
        })}
        {beneficiaries.length === 0 && (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <Baby className="mx-auto text-gray-300 dark:text-gray-600 mb-2" size={40} />
                <p className="text-gray-500 dark:text-gray-400">אין מוטבים ברשימה</p>
                <button onClick={addBeneficiary} className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-2">הוסף את בן המשפחה הראשון</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default FamilySection;