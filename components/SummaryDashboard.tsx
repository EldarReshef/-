import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { AppState, FamilyRelation } from '../types';
import { calculateAge, formatCurrency, calculateNationalInsuranceCapital } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SummaryDashboardProps {
  state: AppState;
}

const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ state }) => {
  
  // 1. Calculate Gross Needs
  let grossNeeds = 0;
  
  state.beneficiaries.forEach(b => {
    const age = calculateAge(b.birthDate);
    const safeAge = age < 0 ? 0 : age;
    
    if (b.includeSupport) {
        const yearsLeft = Math.max(0, b.supportUntilAge - safeAge);
        const monthlyAmount = (state.personal.netSalary * b.supportPercent) / 100;
        const totalMonthlySupport = monthlyAmount * 12 * yearsLeft;
        grossNeeds += totalMonthlySupport;
    }
    
    if (b.includeLumpSum) {
        grossNeeds += b.lumpSum;
    }
  });

  // 2. Calculate National Insurance Coverage (Capitalized)
  const niCoverage = calculateNationalInsuranceCapital(state.beneficiaries);
  
  // 3. Determine Logic based on Spouse Selection
  // User Requirement: "National Insurance survivor benefit should reduce the actual monthly allowance amount of the spouse, 
  // OR be considered as an additional sum in case only lump sum capital grant is selected for the spouse"
  const spouse = state.beneficiaries.find(b => b.relation === FamilyRelation.SPOUSE);
  const spouseHasMonthlySupport = spouse ? spouse.includeSupport : false;

  let displayNeeds = grossNeeds;
  let niAsResource = false;
  let niDeductedFromNeeds = 0;

  if (spouseHasMonthlySupport) {
    // Logic A: Deduct NI from Needs (reduce the monthly amount needed)
    // If NI > Gross Needs, the remainder becomes a resource
    if (niCoverage > grossNeeds) {
        niDeductedFromNeeds = grossNeeds;
        // The surplus remains as a resource, but effectively needs are 0
        displayNeeds = 0;
    } else {
        niDeductedFromNeeds = niCoverage;
        displayNeeds = grossNeeds - niCoverage;
    }
  } else {
    // Logic B: Spouse only wants Lump Sum (or no spouse), treat NI as an additional financial resource
    niAsResource = true;
  }
  
  // 4. Calculate Other Resources
  const liquidAssets = 
    state.financial.managersInsurance + 
    state.financial.providentFund + 
    state.financial.studyFund + 
    state.financial.otherSavings;

  const pensionAssets = state.financial.pensionSurvivor;
  
  const existingInsurance = state.policies.reduce((acc, p) => acc + p.amount, 0);
  
  // Total Resources for Gap Calculation
  let totalResources = liquidAssets + pensionAssets + existingInsurance;
  
  if (niAsResource) {
    totalResources += niCoverage;
  } else {
    // If NI was deducted from needs, check if there was a surplus (NI > GrossNeeds)
    if (niCoverage > grossNeeds) {
        totalResources += (niCoverage - grossNeeds);
    }
  }
  
  const gap = displayNeeds - totalResources;
  const isSurplus = gap < 0;
  const displayAmount = Math.abs(gap);

  // Chart Data
  const data = [
    { name: 'צרכי המשפחה', value: displayNeeds, color: '#ef4444' },
    { name: 'משאבים קיימים', value: totalResources, color: '#10b981' },
  ];

  // --- AI Analysis Logic ---
  const getAIAnalysis = () => {
    const messages: string[] = [];
    const policies = state.policies;
    
    // 1. Gap Analysis
    const coverageRatio = displayNeeds > 0 ? (totalResources / displayNeeds) * 100 : 100;
    if (grossNeeds === 0 && totalResources === 0) {
        return "אנא הזינו נתונים כדי לקבל ניתוח חכם.";
    }

    if (gap > 0) {
      messages.push(`⚠️ **זוהה חוסר ביטוחי של ${formatCurrency(displayAmount)}**.`);
      messages.push(`המקורות הקיימים מכסים כ-${Math.round(coverageRatio)}% בלבד מהצרכים הנותרים. מומלץ לרכוש ביטוח חיים (ריסק) להשלמת הפער.`);
    } else {
      messages.push(`✅ **מצב מצוין!** קיים עודף ביטוחי של ${formatCurrency(displayAmount)}. ניתן לשקול הקטנת סכומי ביטוח קיימים לחיסכון בעלויות.`);
    }

    // 2. NI Impact
    if (!niAsResource && niDeductedFromNeeds > 0) {
        const niShareOfGross = grossNeeds > 0 ? (niDeductedFromNeeds / grossNeeds) * 100 : 0;
        messages.push(`ℹ️ **ביטוח לאומי:** קצבת השאירים קוזזה מצרכי המשפחה (בשווי ${formatCurrency(niDeductedFromNeeds)}), והיא מכסה כ-${Math.round(niShareOfGross)}% מהצרכים הכוללים.`);
    }

    // 3. Pension Adequacy
    if (state.financial.pensionSurvivor === 0) {
        messages.push(`📉 **פנסיה:** לא הוזן ערך לפנסיית שאירים. ודאו כי בקרן הפנסיה שלכם קיים מסלול ביטוחי הכולל קצבת שאירים נאותה. זהו רכיב קריטי בתיק הביטוחי.`);
    } else {
        // Analyze pension against the *Remaining* Needs (Display Needs + Pension itself to see share of financial burden)
        // Denominator: Needs + Pension (since pension is currently on the resources side)
        const burden = displayNeeds > 0 ? displayNeeds : (totalResources - gap); 
        const pensionShare = burden > 0 ? (state.financial.pensionSurvivor / (burden + state.financial.pensionSurvivor)) * 100 : 0;
        
        if (pensionShare < 20) {
            messages.push(`🔸 **פנסיה:** רכיב הפנסיה נמוך יחסית ומכסה חלק קטן מהצרכים. עליכם להסתמך במידה רבה על ביטוחים פרטיים או חסכונות.`);
        } else if (pensionShare > 50) {
            messages.push(`🔹 **פנסיה:** רכיב הפנסיה משמעותי ומהווה עוגן יציב בתיק הביטוחי שלכם.`);
        }
    }

    // 4. Private Insurance Adequacy
    if (existingInsurance > 0) {
         const insuranceShare = displayNeeds > 0 ? (existingInsurance / displayNeeds) * 100 : 0;
         if (gap > 0) {
             messages.push(`🛡️ **ביטוחים פרטיים:** הביטוחים הקיימים (${formatCurrency(existingInsurance)}) אינם מספיקים. נדרשת הגדלה של סכום הביטוח.`);
         } else {
             messages.push(`🛡️ **ביטוחים פרטיים:** יש לכם ביטוחים פרטיים בסך ${formatCurrency(existingInsurance)}. בהתחשב בעודף, בידקו אם ניתן להוזיל עלויות.`);
         }
    } else if (gap > 0) {
        messages.push(`🛡️ **ביטוחים פרטיים:** לא הוזנו ביטוחים פרטיים. במצב של חוסר ביטוחי, רכישת ביטוח חיים ("ריסק") היא הפתרון הזול והיעיל ביותר.`);
    }

    // 5. Check for Specific Coverages (Keywords)
    const hasDisability = policies.some(p => p.name.includes('נכות') || p.name.includes('אובדן כושר') || p.name.includes('א.כ.ע'));
    const hasCriticalIllness = policies.some(p => p.name.includes('מחלות קשות') || p.name.includes('בריאות'));
    
    if (!hasDisability) {
        messages.push(`🚑 **שימו לב:** לא זוהה כיסוי ל**אובדן כושר עבודה** או **נכות**. סטטיסטית, הסיכון לאובדן כושר עבודה גבוה מהסיכון למוות בגילאים צעירים.`);
    }
    
    if (!hasCriticalIllness) {
        messages.push(`❤️ **המלצה:** מומלץ לבדוק קיום כיסוי ל**מחלות קשות**. כיסוי זה מעניק סכום כסף מיידי ("צ'ק") להתמודדות עם הוצאות רפואיות והסתגלות.`);
    }

    return messages.join('\n\n');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 sticky top-6 transition-colors duration-300">
      <div className={`text-center p-4 rounded-t-lg ${isSurplus ? 'bg-green-600 dark:bg-green-700' : 'bg-red-600 dark:bg-red-700'} text-white mb-0 transition-colors`}>
        <h2 className="text-lg font-semibold opacity-90 mb-1">
          {isSurplus ? 'עודף כיסוי (ניתן להפחית ביטוח)' : 'חוסר ביטוחי (נדרש כיסוי נוסף)'}
        </h2>
        <div className="text-4xl font-bold dir-ltr">
          {formatCurrency(displayAmount)}
        </div>
        <p className="text-xs mt-2 opacity-80">הנכסים והכיסויים הקיימים {isSurplus ? 'עולים על' : 'נמוכים מ'} צרכי המשפחה</p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-b-lg border-x border-b border-gray-200 dark:border-gray-700 space-y-4">
        
        {/* Needs Row */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-2">
            <div className="flex flex-col">
                <span className="font-bold text-gray-800 dark:text-gray-200">סה"כ צרכי המשפחה</span>
                {!niAsResource && niDeductedFromNeeds > 0 && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">(לאחר קיזוז קצבת ביטוח לאומי)</span>
                )}
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(displayNeeds)}</span>
        </div>

        {/* NI Row - Show only if treated as Resource OR if there's a surplus spillover */}
        {(niAsResource || (niCoverage > grossNeeds)) && (
            <div className="flex justify-between items-center text-sm">
                <div className="flex flex-col">
                    <span className="text-orange-600 dark:text-orange-400 font-medium">כיסוי ביטוח לאומי (שאירים)</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">מחושב לפי זכאות 2025 וגילאי הילדים</span>
                </div>
                <span className="font-medium text-orange-600 dark:text-orange-400 dir-ltr">
                - {formatCurrency(niAsResource ? niCoverage : (niCoverage - grossNeeds))}
                </span>
            </div>
        )}

        {/* Pension */}
        <div className="flex justify-between items-center text-sm">
            <span className="text-purple-600 dark:text-purple-400">פנסיית שאירים (ערך מהוון)</span>
            <span className="font-medium text-purple-600 dark:text-purple-400 dir-ltr">
               - {formatCurrency(pensionAssets)}
            </span>
        </div>

        {/* Liquid Assets */}
        <div className="flex justify-between items-center text-sm">
            <span className="text-green-600 dark:text-green-400">נכסים נזילים</span>
            <span className="font-medium text-green-600 dark:text-green-400 dir-ltr">
               - {formatCurrency(liquidAssets)}
            </span>
        </div>

         {/* Existing Insurance */}
         <div className="flex justify-between items-center text-sm border-b border-gray-200 dark:border-gray-600 pb-2">
            <span className="text-blue-600 dark:text-blue-400">ביטוחי חיים וחסכונות אחרים</span>
            <span className="font-medium text-blue-600 dark:text-blue-400 dir-ltr">
               - {formatCurrency(existingInsurance)}
            </span>
        </div>

        {/* Total Resources Summary */}
         <div className="flex justify-between items-center text-sm font-semibold pt-1">
            <span className="text-gray-500 dark:text-gray-400">סה"כ מקורות קיימים</span>
            <span className="text-gray-500 dark:text-gray-400">{formatCurrency(totalResources)}</span>
        </div>

        {/* Visualization */}
        <div className="h-48 w-full mt-6 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))} 
                    contentStyle={{ backgroundColor: '#1f2937', color: '#fff', border: 'none' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className={`text-xs font-bold ${isSurplus ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                     {displayNeeds > 0 ? Math.round((totalResources / displayNeeds) * 100) : (totalResources > 0 ? 100 : 0)}%
                </span>
             </div>
             <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-1">יחס כיסוי</div>
        </div>

        {/* AI Analysis Section */}
        <div className="mt-4 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/30 dark:to-gray-800 border border-indigo-100 dark:border-indigo-800/50 rounded-lg p-4 shadow-sm relative overflow-hidden transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400 dark:bg-indigo-500"></div>
            <div className="flex items-center gap-2 mb-3 border-b border-indigo-100 dark:border-indigo-800/50 pb-2">
                <Sparkles className="text-indigo-600 dark:text-indigo-400" size={18} />
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">ניתוח AI חכם</h3>
            </div>
            <div className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed text-right whitespace-pre-line">
                {getAIAnalysis()}
            </div>
        </div>

      </div>
    </div>
  );
};

export default SummaryDashboard;