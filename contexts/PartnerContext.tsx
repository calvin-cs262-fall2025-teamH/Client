import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PartnerContextType {
  partnerCode: string;
  setPartnerCode: (code: string) => void;
}

const PartnerContext = createContext<PartnerContextType>({
  partnerCode: '',
  setPartnerCode: () => {},
});

export const PartnerProvider = ({ children }: { children: ReactNode }) => {
  const [partnerCode, setPartnerCode] = useState('');

  return (
    <PartnerContext.Provider value={{ partnerCode, setPartnerCode }}>
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => useContext(PartnerContext);
