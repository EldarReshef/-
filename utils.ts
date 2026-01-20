import { Beneficiary, FamilyRelation } from './types';
import { CHILD_OCCUPATION_DETAILS } from './constants';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const validateBirthDate = (dateStr: string): string | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  // Reset time to ignore time of day differences
  now.setHours(0, 0, 0, 0);
  
  if (isNaN(date.getTime())) return 'תאריך לא תקין';
  if (date > now) return 'תאריך לא יכול להיות בעתיד';
  if (date.getFullYear() < 1900) return 'שנה לא תקינה';
  
  return null;
};

export const calculateAge = (birthDate: string): number => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Calculates the CURRENT monthly National Insurance Survivor Benefit (2025 rates).
 * This is a snapshot for the current date.
 */
export const calculateMonthlyNIPayment = (beneficiaries: Beneficiary[]): number => {
  const spouse = beneficiaries.find(b => b.relation === FamilyRelation.SPOUSE);
  if (!spouse || !spouse.birthDate) return 0;

  const now = new Date();
  const spouseAge = calculateAge(spouse.birthDate);
  const children = beneficiaries.filter(b => b.relation === FamilyRelation.CHILD);
  
  let eligibleChildrenCount = 0;

  children.forEach(child => {
    if (child.birthDate) {
      const childAge = calculateAge(child.birthDate);
      const maxAge = child.occupation 
        ? CHILD_OCCUPATION_DETAILS[child.occupation].maxAge 
        : 24; 

      // Child is eligible if their current age is less than the max age for their status
      if (childAge < maxAge) {
        eligibleChildrenCount++;
      }
    }
  });

  // Determine Monthly Allowance Base (2025 Rates)
  if (eligibleChildrenCount > 0) {
    // Rates with children
    if (eligibleChildrenCount === 1) {
      return 2637;
    } else if (eligibleChildrenCount === 2) {
      return 3479;
    } else {
      // 2 children base + 842 for each additional
      return 3479 + (eligibleChildrenCount - 2) * 842;
    }
  } else {
    // Widow/er with NO children (eligible by age)
    if (spouseAge >= 80) {
      return 1896;
    } else if (spouseAge >= 50) {
      return 1795;
    } else if (spouseAge >= 40) {
      return 1348;
    } else {
      // Under 40, no children. 
      return 0;
    }
  }
};

/**
 * Calculates the Capitalized Value (PV - Present Value) of the National Insurance Survivor Benefit
 * based on 2025 rates and rules:
 * 
 * Spouse Base Rates (Monthly):
 * - Age 40-50, No Kids: 1,348 NIS
 * - Age 50-80, No Kids: 1,795 NIS (Assuming 50+ rate applies until 80)
 * - Age 80+, No Kids: 1,896 NIS
 * 
 * Spouse with Children Rates:
 * - With 1 Child: 2,637 NIS
 * - With 2 Children: 3,479 NIS
 * - Each additional child: +842 NIS
 * 
 * Child Eligibility determined by 'occupation' field (18, 20, 21, or 24).
 */
export const calculateNationalInsuranceCapital = (beneficiaries: Beneficiary[]): number => {
  const spouse = beneficiaries.find(b => b.relation === FamilyRelation.SPOUSE);
  // If no spouse, we assume no survivor benefit for spouse (children get orphan pension directly, but this calc focuses on household income replacement via spouse)
  if (!spouse || !spouse.birthDate) return 0;

  const children = beneficiaries.filter(b => b.relation === FamilyRelation.CHILD);

  const spouseDob = new Date(spouse.birthDate);
  const now = new Date();
  
  // Interest rate per month for discounting (approx 3% yearly)
  const monthlyInterestRate = Math.pow(1.03, 1/12) - 1; 
  
  let totalPresentValue = 0;
  // Simulation runs until spouse reaches 87 (approx life expectancy)
  const maxSpouseAge = 87;
  const startSpouseAge = calculateAge(spouse.birthDate);
  
  if (startSpouseAge >= maxSpouseAge) return 0;

  // Iterate month by month from now until spouse reaches max age
  const totalMonths = (maxSpouseAge - startSpouseAge) * 12;

  for (let month = 0; month < totalMonths; month++) {
    // Calculate current simulation date
    const currentSimulationDate = new Date(now.getFullYear(), now.getMonth() + month, 1);
    
    // Calculate Spouse Age in this simulation month
    const simSpouseAge = (currentSimulationDate.getFullYear() - spouseDob.getFullYear()) + 
                         ((currentSimulationDate.getMonth() - spouseDob.getMonth()) / 12);
    
    // Count eligible children for this specific month based on their individual max age (occupation)
    let eligibleChildrenCount = 0;
    
    children.forEach(child => {
      if (child.birthDate) {
        const childDob = new Date(child.birthDate);
        // Calculate precise child age in years for this month
        const childAgeInMonths = (currentSimulationDate.getFullYear() - childDob.getFullYear()) * 12 + 
                                 (currentSimulationDate.getMonth() - childDob.getMonth());
        const childAge = childAgeInMonths / 12;

        // Determine max age for this specific child
        const maxAge = child.occupation 
          ? CHILD_OCCUPATION_DETAILS[child.occupation].maxAge 
          : 24; // Default to 24 (soldier/student) if not specified, usually safer for planning

        if (childAge < maxAge) {
          eligibleChildrenCount++;
        }
      }
    });

    // Determine Monthly Allowance Base (2025 Rates)
    let monthlyAllowance = 0;

    if (eligibleChildrenCount > 0) {
      // Rates with children
      if (eligibleChildrenCount === 1) {
        monthlyAllowance = 2637;
      } else if (eligibleChildrenCount === 2) {
        monthlyAllowance = 3479;
      } else {
        // 2 children base + 842 for each additional
        monthlyAllowance = 3479 + (eligibleChildrenCount - 2) * 842;
      }
    } else {
      // Widow/er with NO children (eligible by age)
      if (simSpouseAge >= 80) {
        monthlyAllowance = 1896;
      } else if (simSpouseAge >= 50) {
        monthlyAllowance = 1795;
      } else if (simSpouseAge >= 40) {
        monthlyAllowance = 1348;
      } else {
        // Under 40, no children. 
        monthlyAllowance = 0;
      }
    }

    // Discount to Present Value (Hivun)
    // PV = FV / (1 + r)^n
    const discountFactor = 1 / Math.pow(1 + monthlyInterestRate, month);
    totalPresentValue += monthlyAllowance * discountFactor;
  }

  return Math.round(totalPresentValue);
};