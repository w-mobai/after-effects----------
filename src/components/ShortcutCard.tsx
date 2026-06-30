/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shortcut } from '../types';
import { Copy, Check, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface ShortcutCardProps {
  shortcut: Shortcut;
  os: 'win' | 'mac';
  isHighlighted: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

export const ShortcutCard: React.FC<ShortcutCardProps> = ({
  shortcut,
  os,
  isHighlighted,
  onHoverStart,
  onHoverEnd,
}) => {
  const [copied, setCopied] = React.useState(false);
  const keys = os === 'win' ? shortcut.winKeys : shortcut.macKeys;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shortcutStr = keys.join(' + ');
    navigator.clipboard.writeText(shortcutStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to translate modifier keys into clean symbols or standard texts
  const renderKey = (key: string, idx: number) => {
    let keyName = key;
    // Pretty symbols for Mac if desired, but standard letters look great too.
    if (os === 'mac') {
      if (key === 'Cmd') keyName = '⌘ Cmd';
      if (key === 'Option') keyName = '⌥ Option';
      if (key === 'Shift') keyName = '⇧ Shift';
      if (key === 'Ctrl') keyName = '⌃ Ctrl';
    } else {
      if (key === 'Ctrl') keyName = 'Ctrl';
      if (key === 'Alt') keyName = 'Alt';
      if (key === 'Shift') keyName = 'Shift';
    }

    return (
      <React.Fragment key={idx}>
        {idx > 0 && <span className="text-zinc-500 font-medium px-1 text-xs self-center">+</span>}
        <kbd
          id={`kbd-${shortcut.id}-${idx}`}
          className={`kbd-key px-2.5 py-1 text-xs rounded font-mono font-semibold transition-all duration-200 select-none cursor-pointer
            ${isHighlighted 
              ? 'from-indigo-500 to-violet-600 border-indigo-400 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)] border-b-indigo-900' 
              : 'text-zinc-100'
            }`}
          style={{ minWidth: keyName.length > 2 ? '3.5rem' : '2.2rem' }}
        >
          {keyName}
        </kbd>
      </React.Fragment>
    );
  };

  return (
    <motion.div
      id={`shortcut-card-${shortcut.id}`}
      layout="position"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={`p-4 rounded-xl border transition-all duration-300 bg-zinc-900/40 relative overflow-hidden group
        ${isHighlighted
          ? 'border-violet-500/50 bg-zinc-900/90 shadow-[0_4px_20px_rgba(124,58,237,0.15)] scale-[1.01]'
          : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
        }`}
    >
      {/* Glow Effect */}
      <div 
        className={`absolute -right-12 -top-12 w-24 h-24 rounded-full blur-3xl transition-opacity duration-500 pointer-events-none
          ${shortcut.importance === 'high' ? 'bg-violet-600/10' : 'bg-blue-600/5'}
          ${isHighlighted ? 'opacity-100' : 'opacity-40'}
        `} 
      />

      <div className="flex flex-col h-full justify-between gap-3">
        {/* Header Name & Importance */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium text-zinc-100 text-sm group-hover:text-white transition-colors duration-200 flex items-center gap-1.5">
              {shortcut.name}
              {shortcut.importance === 'high' && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  高频
                </span>
              )}
            </h4>
            <p className="text-zinc-400 text-xs mt-1 leading-relaxed line-clamp-2" title={shortcut.description}>
              {shortcut.description}
            </p>
          </div>

          <button
            id={`btn-copy-${shortcut.id}`}
            onClick={handleCopy}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800/80 transition-all opacity-0 group-hover:opacity-100 duration-200 shrink-0 self-start"
            title="复制快捷键组合"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Visual Key Combination */}
        <div className="flex flex-wrap items-center gap-1 mt-1 bg-zinc-950/40 p-2 rounded-lg border border-zinc-800/40">
          {keys.map((key, idx) => renderKey(key, idx))}
        </div>
      </div>
    </motion.div>
  );
};
