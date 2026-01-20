import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PersonalSection from './components/PersonalSection';
import AssetsSection from './components/AssetsSection';
import FamilySection from './components/FamilySection';
import SummaryDashboard from './components/SummaryDashboard';
import { AppState, PersonalDetails, FinancialAssets, InsurancePolicy, Beneficiary } from './types';
import { getInitialState } from './constants';

declare var html2pdf: any;

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(getInitialState());
  const [exportMode, setExportMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Manage Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleReset = () => {
    if (window.confirm('האם אתה בטוח שברצונך לאפס את כל הנתונים?')) {
      setState(getInitialState());
    }
  };

  const handleExport = () => {
    // Trigger export mode to restructure DOM
    setExportMode(true);
  };

  // Effect to perform export once layout has updated
  useEffect(() => {
    if (exportMode) {
      // Small delay to ensure DOM is rendered with export layout
      setTimeout(() => {
        const element = document.getElementById('main-content');
        
        // Temporarily remove dark mode for PDF generation if active, 
        // though CSS .pdf-mode should handle overrides, removing class is safer for html2canvas
        const wasDark = document.documentElement.classList.contains('dark');
        if (wasDark) document.documentElement.classList.remove('dark');

        const opt = {
          margin: [10, 10, 10, 10],
          filename: `life-insurance-report-${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true, 
            scrollY: 0,
            // letterRendering: true // Sometimes helps with text spacing
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        if (typeof html2pdf !== 'undefined') {
            html2pdf().set(opt).from(element).save().then(() => {
                setExportMode(false);
                if (wasDark) document.documentElement.classList.add('dark');
            }).catch((err: any) => {
                console.error(err);
                setExportMode(false);
                if (wasDark) document.documentElement.classList.add('dark');
            });
        } else {
            alert('PDF library not loaded correctly');
            setExportMode(false);
            if (wasDark) document.documentElement.classList.add('dark');
        }
      }, 500);
    }
  }, [exportMode]);

  // State update handlers
  const updatePersonal = (personal: PersonalDetails) => setState(prev => ({ ...prev, personal }));
  const updateAssets = (financial: FinancialAssets) => setState(prev => ({ ...prev, financial }));
  const updatePolicies = (policies: InsurancePolicy[]) => setState(prev => ({ ...prev, policies }));
  const updateBeneficiaries = (beneficiaries: Beneficiary[]) => setState(prev => ({ ...prev, beneficiaries }));

  return (
    <div className={`min-h-screen font-sans text-right bg-gray-100 dark:bg-gray-900 ${exportMode ? 'pdf-mode bg-white min-h-0' : ''}`}>
      {/* Hide header during export to keep PDF clean */}
      {!exportMode && (
        <Header 
          onReset={handleReset} 
          onExport={handleExport} 
          isExporting={exportMode}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
      )}
      
      <main className={`container mx-auto ${exportMode ? 'p-0 max-w-none' : 'p-4 md:p-8'}`} id="main-content">
        {/* 
            Layout Logic:
            - Normal Mode: Responsive Flex (Side-by-side on Desktop).
            - Export Mode: Single Column with forced order and page breaks.
        */}
        <div className={`flex flex-col ${exportMode ? '' : 'lg:flex-row'} gap-8`}>
          
          {/* Page 1: Summary Dashboard (and Notes) */}
          <div className={`${exportMode ? 'w-full mb-8' : 'w-full lg:w-1/3'} order-1`}>
            <SummaryDashboard state={state} />
            
            <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              <h3 className="font-bold mb-2 text-gray-700 dark:text-gray-300">הערות לחישוב:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>חישוב קצבת השאירים הנדרשת מבוסס על אחוז מהשכר נטו.</li>
                <li>הערכת ביטוח לאומי הינה כללית בלבד ואינה מחליפה בדיקה פרטנית.</li>
                <li>פנסיית השאירים מחושבת לפי ערך מהוון שהוזן ידנית.</li>
              </ul>
            </div>
          </div>

          {/* Insert Page Break after Page 1 if exporting */}
          {exportMode && <div className="html2pdf__page-break" />}

          {/* Input Sections */}
          <div className={`${exportMode ? 'w-full' : 'w-full lg:w-2/3'} order-2 space-y-6`}>
            
            {/* Page 2 Content: Personal + Assets */}
            <div>
                <PersonalSection 
                  data={state.personal} 
                  onChange={updatePersonal} 
                />
                
                <AssetsSection 
                  assets={state.financial} 
                  policies={state.policies} 
                  onAssetsChange={updateAssets} 
                  onPoliciesChange={updatePolicies} 
                />
            </div>

            {/* Insert Page Break after Page 2 if exporting */}
            {exportMode && <div className="html2pdf__page-break" />}
            
            {/* Page 3 Content: Family */}
            <div>
                <FamilySection 
                  beneficiaries={state.beneficiaries} 
                  onChange={updateBeneficiaries} 
                  netSalary={state.personal.netSalary}
                />
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default App;