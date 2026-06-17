import React from 'react';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_INFO } from '@shared/constants';

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-1.5 font-semibold tracking-tight text-[#0a0a0a] hover:opacity-70 transition-opacity ${className}`}>
      <Zap className="h-4 w-4 fill-[#0a0a0a] stroke-[#0a0a0a]" />
      {APP_INFO.name}
    </Link>
  );
}
