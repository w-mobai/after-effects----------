/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shortcut } from '../types';

interface KeyboardVisualizerProps {
  hoveredShortcut: Shortcut | null;
  os: 'win' | 'mac';
  selectedKeys: string[];
  onKeyToggle: (key: string) => void;
  onClearKeys: () => void;
}

export const KeyboardVisualizer: React.FC<KeyboardVisualizerProps> = ({
  hoveredShortcut,
  os,
  selectedKeys,
  onKeyToggle,
  onClearKeys,
}) => {
  // Normalize key names for checking active/highlighted state
  const normalizeKey = (k: string): string => {
    const keyLower = k.toLowerCase().trim();
    if (keyLower === 'ctrl' || keyLower === '⌃ ctrl') return 'ctrl';
    if (keyLower === 'alt' || keyLower === 'option' || keyLower === '⌥ option') return 'alt';
    if (keyLower === 'shift' || keyLower === '⇧ shift') return 'shift';
    if (keyLower === 'cmd' || keyLower === '⌘ cmd') return 'cmd';
    if (keyLower === 'space') return 'space';
    if (keyLower === 'page up') return 'pageup';
    if (keyLower === 'page down') return 'pagedown';
    return keyLower;
  };

  // Get active keys from hovered shortcut
  const activeKeys = React.useMemo(() => {
    if (!hoveredShortcut) return [];
    const keys = os === 'win' ? hoveredShortcut.winKeys : hoveredShortcut.macKeys;
    return keys.map(normalizeKey);
  }, [hoveredShortcut, os]);

  const isKeyHighlighted = (keyId: string): boolean => {
    return activeKeys.includes(normalizeKey(keyId));
  };

  const isKeySelected = (keyId: string): boolean => {
    return selectedKeys.includes(normalizeKey(keyId));
  };

  // Render key helper
  const renderKey = (label: string, value: string, widthClass: string = 'flex-1') => {
    const isLit = isKeyHighlighted(value);
    const isSel = isKeySelected(value);
    
    return (
      <button
        id={`keyboard-key-${value}`}
        onClick={() => onKeyToggle(normalizeKey(value))}
        className={`h-9 text-[11px] font-mono font-medium rounded transition-all duration-200 select-none cursor-pointer flex items-center justify-center border-b-2
          ${widthClass}
          ${isLit
            ? 'bg-gradient-to-b from-violet-500 to-indigo-600 border-indigo-400 text-white shadow-[0_0_12px_rgba(139,92,246,0.6)] border-b-indigo-900 translate-y-[1px]'
            : isSel
              ? 'bg-gradient-to-b from-emerald-500 to-teal-600 border-teal-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)] border-b-teal-900 translate-y-[1px]'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 hover:border-zinc-600 border-b-zinc-950 active:translate-y-[1px] active:border-b-zinc-950'
          }`}
        title={isSel ? `点击取消过滤: ${label}` : `点击以过滤包含此按键的快捷键: ${label}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="w-full bg-zinc-950 p-4 rounded-xl border border-zinc-800 shadow-2xl relative overflow-hidden">
      {/* Background neon strip */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-60" />

      {/* Title block */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest font-mono">
            AE 交互虚拟键盘 (Hover 亮起 / Click 过滤)
          </h3>
        </div>

        {selectedKeys.length > 0 && (
          <button
            id="btn-clear-keyboard-filters"
            onClick={onClearKeys}
            className="text-[10px] text-zinc-400 hover:text-emerald-400 font-mono border border-zinc-800 hover:border-emerald-500/30 px-2 py-0.5 rounded bg-zinc-900 transition-all cursor-pointer"
          >
            清除过滤 ({selectedKeys.length} 个按键)
          </button>
        )}
      </div>

      {/* Main Keyboard body */}
      <div className="flex flex-col gap-1.5 w-full max-w-[800px] mx-auto">
        {/* Row 1: Function Keys */}
        <div className="flex gap-1">
          {renderKey('Esc', 'esc', 'w-10')}
          <div className="flex-1" />
          {renderKey('F1', 'f1')}
          {renderKey('F2', 'f2')}
          {renderKey('F3', 'f3')}
          {renderKey('F4', 'f4')}
          <div className="w-2" />
          {renderKey('F5', 'f5')}
          {renderKey('F6', 'f6')}
          {renderKey('F7', 'f7')}
          {renderKey('F8', 'f8')}
          <div className="w-2" />
          {renderKey('F9', 'f9', 'bg-violet-950/20 border-violet-900/60 font-semibold')}
          {renderKey('F10', 'f10')}
          {renderKey('F11', 'f11')}
          {renderKey('F12', 'f12')}
        </div>

        {/* Row 2: Numbers */}
        <div className="flex gap-1">
          {renderKey('~', '~', 'w-9')}
          {renderKey('1', '1')}
          {renderKey('2', '2')}
          {renderKey('3', '3')}
          {renderKey('4', '4')}
          {renderKey('5', '5')}
          {renderKey('6', '6')}
          {renderKey('7', '7')}
          {renderKey('8', '8')}
          {renderKey('9', '9')}
          {renderKey('0', '0')}
          {renderKey('-', '-')}
          {renderKey('=', '=')}
          {renderKey('⌫ Back', 'backspace', 'w-14')}
        </div>

        {/* Row 3: Tab & QWERTY */}
        <div className="flex gap-1">
          {renderKey('Tab', 'tab', 'w-12')}
          {renderKey('Q', 'q')}
          {renderKey('W', 'w')}
          {renderKey('E', 'e')}
          {renderKey('R', 'r')}
          {renderKey('T', 't')}
          {renderKey('Y', 'y')}
          {renderKey('U', 'u')}
          {renderKey('I', 'i')}
          {renderKey('O', 'o')}
          {renderKey('P', 'p')}
          {renderKey('[', '[')}
          {renderKey(']', ']')}
          {renderKey('\\', '\\')}
        </div>

        {/* Row 4: Caps & ASDF */}
        <div className="flex gap-1">
          {renderKey('Caps', 'caps', 'w-14')}
          {renderKey('A', 'a')}
          {renderKey('S', 's')}
          {renderKey('D', 'd')}
          {renderKey('F', 'f')}
          {renderKey('G', 'g')}
          {renderKey('H', 'h')}
          {renderKey('J', 'j')}
          {renderKey('K', 'k')}
          {renderKey('L', 'l')}
          {renderKey(';', ';')}
          {renderKey("'", "'")}
          {renderKey('Enter ↵', 'enter', 'w-16')}
        </div>

        {/* Row 5: Shift & ZXCV */}
        <div className="flex gap-1">
          {renderKey('Shift ⇧', 'shift', 'w-[4.5rem]')}
          {renderKey('Z', 'z')}
          {renderKey('X', 'x')}
          {renderKey('C', 'c')}
          {renderKey('V', 'v')}
          {renderKey('B', 'b')}
          {renderKey('N', 'n')}
          {renderKey('M', 'm')}
          {renderKey(',', ',')}
          {renderKey('.', '.')}
          {renderKey('/', '/')}
          {renderKey('Shift ⇧', 'shift', 'w-[4.5rem]')}
        </div>

        {/* Row 6: Modifier / Space */}
        <div className="flex gap-1">
          {renderKey('Ctrl ⌃', 'ctrl', 'w-12')}
          {renderKey(os === 'mac' ? '⌥ Opt' : 'Alt', 'alt', 'w-12')}
          {renderKey(os === 'mac' ? '⌘ Cmd' : 'Win', 'cmd', 'w-12')}
          {renderKey('Spacebar (播放预览)', 'space', 'flex-[8_8_0%]')}
          {renderKey(os === 'mac' ? '⌘ Cmd' : 'Win', 'cmd', 'w-12')}
          {renderKey(os === 'mac' ? '⌥ Opt' : 'Alt', 'alt', 'w-12')}
          
          {/* Navigation keys that AE actually uses */}
          <div className="flex gap-0.5 ml-1">
            {renderKey('PgUp ⇧', 'pageup', 'w-12')}
            {renderKey('PgDn ⇩', 'pagedown', 'w-12')}
          </div>
        </div>
      </div>
    </div>
  );
};
