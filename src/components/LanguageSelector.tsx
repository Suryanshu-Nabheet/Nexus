import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Language, supportedLanguages } from '../utils/languages';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { theme } = useTheme();

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleLanguageSelect = (language: Language) => {
    onLanguageChange(language);
    closeDropdown();
  };

  React.useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) closeDropdown();
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const dropdownVariants = {
    hidden: { 
      opacity: 0,
      y: -10,
      scale: 0.95
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  return (
    <div className="relative inline-block text-left">
      <motion.button
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown();
        }}
        type="button"
        className={`inline-flex justify-between items-center w-full sm:w-64 px-4 py-2 text-sm font-medium rounded-md 
          ${theme === 'dark' 
            ? 'bg-white/10 hover:bg-white/20 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          } 
          backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 
          ${theme === 'dark' ? 'focus:ring-offset-gray-800 focus:ring-indigo-500' : 'focus:ring-offset-white focus:ring-blue-500'}
          shadow-md transition-all duration-300`}
      >
        <div className="flex items-center">
          <img 
            src={selectedLanguage.logo} 
            alt={selectedLanguage.name} 
            className="w-5 h-5 mr-2"
          />
          {selectedLanguage.name}
          <span className={`ml-2 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
            .{selectedLanguage.extension}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 ml-2" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute left-0 z-10 mt-1 w-full 
              ${theme === 'dark' 
                ? 'bg-gray-800/95 ring-white/10' 
                : 'bg-white/95 ring-gray-200'
              } 
              backdrop-blur-sm shadow-lg rounded-md ring-1 divide-y 
              ${theme === 'dark' ? 'divide-gray-700/50' : 'divide-gray-200/50'} 
              max-h-60 overflow-auto`}
          >
            <div className="py-1" onClick={(e) => e.stopPropagation()}>
              {supportedLanguages.map((language) => (
                <motion.button
                  key={language.id}
                  onClick={() => handleLanguageSelect(language)}
                  whileHover={{ x: 5 }}
                  className={`${
                    selectedLanguage.id === language.id
                      ? theme === 'dark'
                        ? 'bg-indigo-500/20 text-white'
                        : 'bg-blue-50 text-blue-600'
                      : theme === 'dark'
                        ? 'text-gray-200 hover:bg-white/10'
                        : 'text-gray-700 hover:bg-gray-50'
                  } group flex items-center w-full px-4 py-2 text-sm transition-colors duration-200`}
                >
                  <img 
                    src={language.logo} 
                    alt={language.name} 
                    className="w-5 h-5 mr-2"
                  />
                  {language.name}
                  <span className={`ml-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    .{language.extension}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;