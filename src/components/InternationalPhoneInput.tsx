import React from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface InternationalPhoneInputProps {
  value: string;
  onChange: (value: string | undefined) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export const InternationalPhoneInput: React.FC<InternationalPhoneInputProps> = ({
  value,
  onChange,
  className = "",
  placeholder = "Enter phone number",
  required = false
}) => {
  const formattedValue = typeof value === 'string' ? value.replace(/\s+/g, '') : value;

  return (
    <div className={`international-phone-input ${className}`}>
      <PhoneInput
        international
        defaultCountry="IN"
        value={formattedValue}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full text-xs py-2 pl-3 pr-3 rounded-xl border border-border-primary bg-bg-secondary/50 dark:border-border-primary dark:bg-bg-card dark:text-white outline-none focus-within:border-primary transition-colors flex items-center"
      />
    </div>
  );
};
