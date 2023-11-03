import colors from '@mui/joy/colors';
import { extendTheme as extendJoyTheme } from '@mui/joy/styles';
import type { TypeBackground } from '@mui/material';
import {
  experimental_extendTheme as extendMuiTheme,
  PaletteColor,
} from '@mui/material/styles';
import type {} from '@mui/material/themeCssVarsAugmentation';
import { deepmerge } from '@mui/utils';
import * as React from 'react';

const blue = {
  50: '#e8f5e9',
  100: '#c8e6c9',
  200: '#a5d6a7',
  300: '#81c784',
  400: '#66bb6a',
  500: '#4caf50',
  600: '#43a047',
  700: '#388e3c',
  800: '#2e7d32',
  900: '#1b5e20',
};

const muiTheme = extendMuiTheme({
  cssVarPrefix: 'joy',
  colorSchemes: {
    light: {
      palette: {
        primary: {
          ...blue,
        },
        grey: colors.grey,
        common: {
          white: '#FFF',
          black: '#000000',
        },
        divider: colors.grey[200],
        text: {
          primary: colors.grey[800],
          secondary: colors.grey[600],
        },
      },
    },
  },
});

const joyTheme = extendJoyTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          ...blue,
        },
      },
    },
  },
  fontFamily: {
    body: 'Arial, sans-serif',
    display: 'Arial, sans-serif',
  },
  typography: {
    display1: {
      fontSize: '57px',
      lineHeight: '64px',
      letterSpacing: '-0.25px',
    },
    kbd: {
      padding: '0.125em 0.375em',
    },
  },
  fontSize: {
    xl6: '3.75rem',
    xl5: '3rem',
    xs2: '0.625rem',
    xs3: '0.5rem',
  },
  fontWeight: {
    xs: 200,
    xl2: 800,
    xl3: 900,
  },
});

const mergedTheme = {
  ...muiTheme,
  ...joyTheme,
  colorSchemes: deepmerge(muiTheme.colorSchemes, joyTheme.colorSchemes),
  typography: {
    ...muiTheme.typography,
    ...joyTheme.typography,
  },
} as unknown as ReturnType<typeof extendJoyTheme>;

mergedTheme.generateCssVars = (colorScheme) => ({
  css: {
    ...muiTheme.generateCssVars(colorScheme).css,
    ...joyTheme.generateCssVars(colorScheme).css,
  },
  vars: deepmerge(
    muiTheme.generateCssVars(colorScheme).vars,
    joyTheme.generateCssVars(colorScheme).vars
  ) as unknown as ReturnType<typeof extendJoyTheme>['vars'],
});
mergedTheme.unstable_sxConfig = {
  ...muiTheme.unstable_sxConfig,
  ...joyTheme.unstable_sxConfig,
};

export default mergedTheme;
