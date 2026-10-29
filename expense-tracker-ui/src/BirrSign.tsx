import React from 'react';

interface BirrSignProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Ethiopian Birr currency symbol (ብር)
 *
 * Modeled from the official proposal for the Ethiopian Birr currency sign
 * based on the Ge'ez script character 'ብ' (bə) with two horizontal crossbars,
 * documented on Wikimedia Commons:
 * https://commons.wikimedia.org/wiki/File:Ethiopian_Birr(%E1%89%A5%E1%88%AD)_currency_sign_.jpg
 */
export const BirrSign: React.FC<BirrSignProps> = ({
  className = 'h-[0.9em] w-auto inline-block',
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 567 586"
      fill="currentColor"
      aria-label="Ethiopian Birr (ብር)"
      role="img"
      className={`shrink-0 align-middle ${className}`}
      {...props}
    >
      <title>Ethiopian Birr (ብር)</title>
      {/* Arch with left & right legs + two horizontal crossbars on the left leg */}
      <path d="M 76 586 L 76 245 A 245 245 0 0 1 566 245 L 566 586 L 489 586 L 489 245 A 168 168 0 0 0 153 245 L 153 586 Z M 0 293 H 229 V 369 H 0 Z M 0 420 H 229 V 496 H 0 Z" />
    </svg>
  );
};

export default BirrSign;

