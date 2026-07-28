import React, { useState, useRef, useEffect } from 'react';

// Define the shape of a single dropdown option
export interface Option {
  label: string;
  value: string | number;
}

// Define the expected props for the component
interface SelectBoxProps {
  options: Option[];
  value: string | number | null;
  onChange: (value: string | number) => void;
  placeholder?: string;
}

const SelectBox: React.FC<SelectBoxProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option..." 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  // Type the ref as an HTMLDivElement so TypeScript knows what DOM node to expect
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Type the event as a standard DOM MouseEvent
    const handleOutsideClick = (e: MouseEvent) => {
      // Cast e.target to Node to satisfy TypeScript's DOM typing for .contains()
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={containerRef} style={styles.container}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        style={styles.trigger}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span style={{ fontSize: '12px' }}>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <ul style={styles.dropdown}>
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              style={styles.option}
              // use currentTarget instead of target for better TS event typing
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Strongly type the styles object using React.CSSProperties
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    width: '250px',
    fontFamily: 'sans-serif',
    userSelect: 'none',
  },
  trigger: {
    padding: '10px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    margin: '4px 0 0 0',
    padding: 0,
    listStyle: 'none',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  option: {
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
  }
};

export default SelectBox;