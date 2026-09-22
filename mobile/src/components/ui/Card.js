import React from 'react';
import { View } from 'react-native';

/** The elevated white surface every section of the details screen sits on. */
export const Card = ({ children, className = '', ...rest }) => (
  <View
    className={`bg-surface rounded-card border border-ink-line/60 ${className}`}
    style={{
      shadowColor: '#0F172A',
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    }}
    {...rest}
  >
    {children}
  </View>
);
