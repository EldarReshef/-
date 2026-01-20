import React from 'react';
import { User, Calendar, Banknote } from 'lucide-react';
import { PersonalDetails } from '../types';
import { validateBirthDate } from '../utils';

interface PersonalSectionProps {
  data: PersonalDetails;
  onChange: (data: PersonalDetails) => void;
}

const PersonalSection: React.FC<PersonalSectionProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof PersonalDetails, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  const dateError = validateBirthDate(data.birthDate);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 transition-colors duration-300">
      <div className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
        <User className="text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-bold">פרטים אישיים</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">שם מלא</label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-base md:text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors"
            placeholder="ישראל ישראלי"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            תאריך לידה <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={data.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              className={`w-full border ${dateError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'} rounded-md p-2 pl-10 text-base md:text-sm focus:ring-2 outline-none bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 [color-scheme:light] dark:[color-scheme:dark] transition-colors`}
            />
            <Calendar className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-300" size={18} />
          </div>
          {dateError && <p className="text-xs text-red-500 mt-1">{dateError}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">שכר נטו (חודשי)</label>
          <div className="relative">
            <input
              type="number"
              value={data.netSalary}
              onChange={(e) => handleChange('netSalary', Number(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 pl-10 text-base md:text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-white transition-colors"
            />
            <Banknote className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-300" size={18} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">משמש לחישוב קצבת שאירים נדרשת</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalSection;