import { AppState, FamilyRelation, ChildOccupation } from './types';

export const getInitialState = (): AppState => ({
  personal: {
    fullName: '',
    birthDate: '',
    netSalary: 0,
  },
  financial: {
    pensionSurvivor: 0,
    managersInsurance: 0,
    studyFund: 0,
    providentFund: 0,
    otherSavings: 0,
  },
  policies: [],
  beneficiaries: []
});

export const RELATION_OPTIONS = Object.values(FamilyRelation);

export const CHILD_OCCUPATION_DETAILS: Record<ChildOccupation, { label: string; maxAge: number }> = {
  regular: { label: 'ללא מסגרת מזכה (עד גיל 18)', maxAge: 18 },
  high_school: { label: 'תלמיד/שוחר (עד גיל 20)', maxAge: 20 },
  volunteer: { label: 'מתנדב שנת שירות (עד גיל 21)', maxAge: 21 },
  soldier_student: { label: 'חייל/סטודנט/עתודה (עד גיל 24)', maxAge: 24 },
  not_eligible: { label: 'לא זכאי / אחר', maxAge: 0 },
};