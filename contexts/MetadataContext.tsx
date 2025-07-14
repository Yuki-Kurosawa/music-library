import { Metadata } from '@/types/database';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface MetadataContextType {
  selectedMetadata: Metadata | null;
  setSelectedMetadata: (metadata: Metadata | null) => void;
  clearSelectedMetadata: () => void;
}

const MetadataContext = createContext<MetadataContextType | undefined>(undefined);

export const MetadataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedMetadata, setSelectedMetadata] = useState<Metadata | null>(null);

  const clearSelectedMetadata = () => {
    setSelectedMetadata(null);
  };

  return (
    <MetadataContext.Provider value={{
      selectedMetadata,
      setSelectedMetadata,
      clearSelectedMetadata
    }}>
      {children}
    </MetadataContext.Provider>
  );
};

export const useMetadata = () => {
  const context = useContext(MetadataContext);
  if (context === undefined) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }
  return context;
};