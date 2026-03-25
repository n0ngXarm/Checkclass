'use client';
import { forwardRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import th from 'date-fns/locale/th';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

registerLocale('th', th);

const CustomInput = forwardRef(({ value, onClick, className }, ref) => (
  <div className="relative w-full" onClick={onClick} ref={ref}>
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Calendar className="h-5 w-5 text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
    </div>
    <input 
      type="text" 
      value={value} 
      readOnly 
      className={`${className} pl-10 cursor-pointer caret-transparent`}
      placeholder="เลือกวันที่"
    />
  </div>
));
CustomInput.displayName = 'CustomInput';

export default function CustomDatePicker({ dateString, onChange, className }) {
  const selectedDate = dateString ? new Date(dateString) : null;

  const handleChange = (date) => {
    if (date) {
      const d = new Date(date);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      onChange(d.toISOString().split('T')[0]);
    } else {
      onChange('');
    }
  };

  // Convert year to Buddhist Era for display only (adds 543)
  const formatThaiDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  };

  return (
    <div className="w-full relative group">
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        locale="th"
        dateFormat="dd MMMM yyyy"
        customInput={<CustomInput className={className} value={formatThaiDate(selectedDate)} />}
        popperPlacement="bottom-start"
        showYearDropdown
        dropdownMode="select"
        portalId="root-portal"
      />
    </div>
  );
}
