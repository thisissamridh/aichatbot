import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { IconButton } from '@mui/joy';
import React from 'react';

export default function ColorSchemeToggle() {
  return (
    <IconButton
      id="toggle-mode"
      size="sm"
      variant="outlined"
      color="primary"
    >
      <LightModeRoundedIcon />
    </IconButton>
  );
}
