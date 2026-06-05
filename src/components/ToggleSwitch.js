import React from 'react';

/**
 * Tailwind `peer`-based toggle switch — self-contained, no global CSS.
 * Uncontrolled by default; pass standard <input> props (id, name, aria-label,
 * onChange, checked, etc.) which are forwarded to the checkbox.
 */
function ToggleSwitch({ defaultChecked = false, ...props }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" {...props} />
      <span className="relative h-5 w-10 rounded-full bg-surface-variant transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-5" />
    </label>
  );
}

export default ToggleSwitch;
