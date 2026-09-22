'use client';

import React from 'react';
import { createTheme, theme, ThemeProvider } from 'flowbite-react';
import { XUIQuery } from '@siku-zangu/react';

/**
 * Every client-side provider the app needs, composed in one place.
 *
 * This exists because the root layout is a Server Component. Next creates a
 * client reference per *export* of a `'use client'` module, so a namespaced
 * export like `XUIQuery.Provider` resolves to `undefined` when a server
 * component reaches through the object — the build fails with "Element type is
 * invalid". Importing it from inside a client component works normally.
 */
const sikuZanguOrgTheme = createTheme({
  ...theme,
  button: {
    base: 'hover:cursor-pointer font-normal rounded-md',
    color: {
      primary: 'bg-primary text-primary-50',
      primaryTonal: 'bg-primary-100 text-primary-400',
      secondary: 'bg-secondary text-secondary-50',
      default: 'text-gray-500 bg-inherit',
      gray: 'text-gray-500 bg-gray-200',
    },
    size: { md: 'py-2 px-4' },
    outlineColor: {
      gray: 'border-gray-300 text-gray-500',
    },
  },
  textInput: {
    addon:
      'bg-inherit flex items-center justify-center pl-2.5 border-r-0 rounded-l-md',
    field: {
      input: {
        withAddon: {
          on: 'border-l-0 rounded-r-md pl-0',
        },
      },
    },
  },
  radio: {
    base: 'size-5 checked:bg-gray-400 checked:bg-dot-icon',
    color: {
      default: 'text-primary-600 focus:ring-primary-600',
    },
  },
  spinner: {
    base: 'inline animate-spin text-gray-200',
    color: {
      default: 'fill-primary-600',
      gray: 'fill-gray-400',
    },
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-10 w-10',
      '2xl': 'size-16',
    },
  },
});

export function WUIAppProviders({ children }: { children: React.ReactNode }) {
  return (
    <XUIQuery.Provider>
      <ThemeProvider theme={sikuZanguOrgTheme}>{children}</ThemeProvider>
    </XUIQuery.Provider>
  );
}
