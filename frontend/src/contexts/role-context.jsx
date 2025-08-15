import { useState, useContext, createContext } from 'react';

// ----------------------------------------------------------------------

const RoleContext = createContext(undefined);

export function RoleProvider({ children }) {
  const [previewRole, setPreviewRole] = useState(null);

  const value = {
    previewRole,
    setPreviewRole,
    clearPreviewRole: () => setPreviewRole(null),
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRoleContext() {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error('useRoleContext must be used within a RoleProvider');
  }

  return context;
}
