export enum FamilyRelation {
  SPOUSE = 'בן/בת זוג',
  CHILD = 'ילד/ה',
  PARENT = 'הורה',
  OTHER = 'אחר'
}

export type ChildOccupation = 'regular' | 'high_school' | 'volunteer' | 'soldier_student' | 'not_eligible';

export interface Beneficiary {
  id: string;
  name: string;
  relation: FamilyRelation;
  birthDate: string;
  occupation?: ChildOccupation; // Specific status for children to determine NI eligibility
  supportPercent: number; // Percentage of net salary
  supportUntilAge: number;
  lumpSum: number;
  includeSupport: boolean;
  includeLumpSum: boolean;
}

export interface InsurancePolicy {
  id: string;
  name: string;
  amount: number;
}

export interface FinancialAssets {
  pensionSurvivor: number; // Monthly survivor pension converted to capital or just raw value? Usually capitalized. We will treat as Capital for simplicity or ask user for Capital value. Screenshot implies "Pension Fund - Survivor Allowance" field.
  managersInsurance: number;
  studyFund: number; // Keren Hishtalmut
  providentFund: number; // Kupat Gemel
  otherSavings: number;
}

export interface PersonalDetails {
  fullName: string;
  birthDate: string;
  netSalary: number;
}

export interface AppState {
  personal: PersonalDetails;
  financial: FinancialAssets;
  policies: InsurancePolicy[];
  beneficiaries: Beneficiary[];
}