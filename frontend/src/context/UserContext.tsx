import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  isLoggedIn: boolean;
  isPremium: boolean;
  searchesRemaining: number;
  interviewPrepsRemaining: number;
  login: () => void;
  logout: () => void;
  upgradeToPremium: () => void;
  decrementSearches: () => void;
  decrementInterviewPreps: () => void;
  resetDailyLimits: () => void;
}

const defaultContextValue: UserContextType = {
  isLoggedIn: false,
  isPremium: false,
  searchesRemaining: 1,
  interviewPrepsRemaining: 1,
  login: () => {},
  logout: () => {},
  upgradeToPremium: () => {},
  decrementSearches: () => {},
  decrementInterviewPreps: () => {},
  resetDailyLimits: () => {}
};

const UserContext = createContext<UserContextType>(defaultContextValue);

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [searchesRemaining, setSearchesRemaining] = useState(1);
  const [interviewPrepsRemaining, setInterviewPrepsRemaining] = useState(1);

  const login = () => {
    setIsLoggedIn(true);
    // In a real app, this would include authentication logic
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsPremium(false);
    resetDailyLimits();
  };

  const upgradeToPremium = () => {
    setIsPremium(true);
    // In a real app, this would include payment processing
  };

  const decrementSearches = () => {
    if (!isPremium && searchesRemaining > 0) {
      setSearchesRemaining(prev => prev - 1);
    }
  };

  const decrementInterviewPreps = () => {
    if (!isPremium && interviewPrepsRemaining > 0) {
      setInterviewPrepsRemaining(prev => prev - 1);
    }
  };

  const resetDailyLimits = () => {
    setSearchesRemaining(1);
    setInterviewPrepsRemaining(1);
  };

  const value = {
    isLoggedIn,
    isPremium,
    searchesRemaining,
    interviewPrepsRemaining,
    login,
    logout,
    upgradeToPremium,
    decrementSearches,
    decrementInterviewPreps,
    resetDailyLimits
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
