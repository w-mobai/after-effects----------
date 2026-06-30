/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { shortcutsData } from './data/shortcuts';
import { expressionsData } from './data/expressions';
import { ShortcutCategory, ExpressionCategory, Shortcut, ExpressionItem } from './types';
import { ShortcutCard } from './components/ShortcutCard';
import { KeyboardVisualizer } from './components/KeyboardVisualizer';
import { ExpressionSimulator } from './components/ExpressionSimulator';
import { FunctionReference } from './components/FunctionReference';
import {
  Keyboard,
  Sparkles,
  Search,
  BookOpen,
  Sliders,
  Tv,
  Layers,
  ChevronRight,
  Copy,
  Check,
  Laptop,
  CheckCircle,
  HelpCircle,
  Code,
  Info,
  Compass,
  Volume2
} from 'lucide-react';

export default function App() {
  // Main Tab Navigation: 'shortcuts' | 'expressions'
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'expressions'>('shortcuts');

  // OS selection for shortcuts: 'win' | 'mac'
  const [os, setOs] = useState<'win' | 'mac'>('win');

  // --- SHORTCUTS STATE & LOGIC ---
  const [shortcutSearch, setShortcutSearch] = useState('');
  const [selectedShortcutCategory, setSelectedShortcutCategory] = useState<ShortcutCategory | 'all'>('all');
  const [hoveredShortcut, setHoveredShortcut] = useState<Shortcut | null>(null);
  
  // Interactive keyboard filters
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // Toggle key filter
  const handleKeyToggle = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleClearKeyFilters = () => {
    setSelectedKeys([]);
  };

  // Filter shortcuts
  const filteredShortcuts = useMemo(() => {
    return shortcutsData.filter((sc) => {
      // 1. Search Query Match
      const matchesSearch =
        sc.name.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
        sc.description.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
        sc.winKeys.some(k => k.toLowerCase().includes(shortcutSearch.toLowerCase())) ||
        sc.macKeys.some(k => k.toLowerCase().includes(shortcutSearch.toLowerCase()));

      // 2. Category Filter
      const matchesCategory =
        selectedShortcutCategory === 'all' || sc.category === selectedShortcutCategory;

      // 3. Virtual Keyboard Key Filter
      const keys = os === 'win' ? sc.winKeys : sc.macKeys;
      const normalizedSCKeys = keys.map(k => {
        const lower = k.toLowerCase().trim();
        if (lower === 'ctrl' || lower === '⌃ ctrl') return 'ctrl';
        if (lower === 'alt' || lower === 'option' || lower === '⌥ option') return 'alt';
        if (lower === 'shift' || lower === '⇧ shift') return 'shift';
        if (lower === 'cmd' || lower === '⌘ cmd') return 'cmd';
        if (lower === 'space') return 'space';
        if (lower === 'page up') return 'pageup';
        if (lower === 'page down') return 'pagedown';
        return lower;
      });

      const matchesKeyFilter =
        selectedKeys.length === 0 ||
        selectedKeys.every((selK) => normalizedSCKeys.includes(selK));

      return matchesSearch && matchesCategory && matchesKeyFilter;
    });
  }, [shortcutSearch, selectedShortcutCategory, selectedKeys, os]);


  // --- EXPRESSIONS STATE & LOGIC ---
  const [expressionSubTab, setExpressionSubTab] = useState<'demos' | 'functions'>('demos');
  const [selectedExpressionId, setSelectedExpressionId] = useState<string>('exp-wiggle');
  const [expressionSearch, setExpressionSearch] = useState('');
  const [selectedExpressionCategory, setSelectedExpressionCategory] = useState<ExpressionCategory | 'all'>('all');
  const [copiedExpCode, setCopiedExpCode] = useState(false);

  // Active expression details
  const activeExpression = useMemo(() => {
    return expressionsData.find((exp) => exp.id === selectedExpressionId) || expressionsData[0];
  }, [selectedExpressionId]);

  // Filtered expression list for the sidebar
  const filteredExpressions = useMemo(() => {
    return expressionsData.filter((exp) => {
      const matchesSearch =
        exp.name.toLowerCase().includes(expressionSearch.toLowerCase()) ||
        exp.englishName.toLowerCase().includes(expressionSearch.toLowerCase()) ||
        exp.description.toLowerCase().includes(expressionSearch.toLowerCase());

      const matchesCategory =
        selectedExpressionCategory === 'all' || exp.category === selectedExpressionCategory;

      return matchesSearch && matchesCategory;
    });
  }, [expressionSearch, selectedExpressionCategory]);

  const handleCopyExpression = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedExpCode(true);
    setTimeout(() => setCopiedExpCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex flex-col selection:bg-violet-500/30 selection:text-violet-300">
      
      {/* Dynamic Aesthetic Header */}
      <header className="bg-zinc-950/80 border-b border-zinc-800/80 sticky top-0 z-50 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/20 ring-1 ring-violet-400/20 shrink-0">
              <span className="text-white font-mono font-bold text-lg select-none">Ae</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-bold text-zinc-100 tracking-tight font-sans">
                  After Effects 快捷键与表达式学习助手
                </h1>
                <span className="text-[10px] bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                  PRO
                </span>
              </div>
              <p className="text-zinc-500 text-xs font-sans mt-0.5">
                快速检索分类快捷键、多维表达式动画沙盒演练及内置函数字典
              </p>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 shadow-md">
            <button
              id="tab-btn-shortcuts"
              onClick={() => setActiveTab('shortcuts')}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'shortcuts'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>常用快捷键大全</span>
            </button>
            <button
              id="tab-btn-expressions"
              onClick={() => setActiveTab('expressions')}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'expressions'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>表达式效果演练</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* ========================================================
              SHORTCUTS TAB
              ======================================================== */}
          {activeTab === 'shortcuts' && (
            <motion.div
              key="shortcuts-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 flex-1 flex flex-col"
            >
              {/* Settings Toolbar & Virtual Keyboard Box */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Search & Filters Toolbar */}
                <div className="xl:col-span-4 space-y-4 bg-zinc-900/40 p-5 rounded-xl border border-zinc-800/80 h-full">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Compass className="w-4 h-4 text-violet-400" />
                    <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                      快捷键过滤中心 (Filter Controls)
                    </h3>
                  </div>

                  {/* OS Switcher */}
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 font-mono">系统环境 (OS Layout)</label>
                    <div className="grid grid-cols-2 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                      <button
                        id="btn-os-win"
                        onClick={() => { setOs('win'); handleClearKeyFilters(); }}
                        className={`py-1.5 text-xs font-medium rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          os === 'win'
                            ? 'bg-zinc-800 text-white font-semibold'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        Windows 键位
                      </button>
                      <button
                        id="btn-os-mac"
                        onClick={() => { setOs('mac'); handleClearKeyFilters(); }}
                        className={`py-1.5 text-xs font-medium rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          os === 'mac'
                            ? 'bg-zinc-800 text-white font-semibold'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        macOS 键位
                      </button>
                    </div>
                  </div>

                  {/* Search input */}
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 font-mono">模糊搜索 (Search Name/Keys)</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="输入名字或按键，如 Ctrl, E, 缓动..."
                        value={shortcutSearch}
                        onChange={(e) => setShortcutSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs text-zinc-100 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-violet-500 transition-all font-sans placeholder-zinc-600"
                      />
                    </div>
                  </div>

                  {/* Categories dropdown/selector */}
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1.5 font-mono">分类过滤 (Category)</label>
                    <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto pr-1">
                      <button
                        id="btn-shortcut-cat-all"
                        onClick={() => setSelectedShortcutCategory('all')}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-all cursor-pointer ${
                          selectedShortcutCategory === 'all'
                            ? 'bg-violet-950/40 text-violet-300 border-l-2 border-violet-500 pl-2'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                        }`}
                      >
                        全部快捷键 ({shortcutsData.length})
                      </button>
                      {Object.values(ShortcutCategory).map((cat) => {
                        const count = shortcutsData.filter((sc) => sc.category === cat).length;
                        return (
                          <button
                            id={`btn-shortcut-cat-${cat}`}
                            key={cat}
                            onClick={() => setSelectedShortcutCategory(cat)}
                            className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-all cursor-pointer ${
                              selectedShortcutCategory === cat
                                ? 'bg-violet-950/40 text-violet-300 border-l-2 border-violet-500 pl-2'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                            }`}
                          >
                            {cat} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reset Filters Box */}
                  {(shortcutSearch || selectedShortcutCategory !== 'all' || selectedKeys.length > 0) && (
                    <button
                      id="btn-reset-all-shortcut-filters"
                      onClick={() => {
                        setShortcutSearch('');
                        setSelectedShortcutCategory('all');
                        handleClearKeyFilters();
                      }}
                      className="w-full text-center py-2 text-xs border border-zinc-800 hover:border-violet-500/40 text-zinc-400 hover:text-violet-400 rounded-lg transition-all font-mono cursor-pointer bg-zinc-950/20"
                    >
                      重置所有过滤条件
                    </button>
                  )}
                </div>

                {/* Keyboard Visualizer Section */}
                <div className="xl:col-span-8">
                  <KeyboardVisualizer
                    hoveredShortcut={hoveredShortcut}
                    os={os}
                    selectedKeys={selectedKeys}
                    onKeyToggle={handleKeyToggle}
                    onClearKeys={handleClearKeyFilters}
                  />
                  <div className="flex items-center gap-1.5 mt-2 px-1 text-[10px] text-zinc-500 font-mono">
                    <Info className="w-3.5 h-3.5 text-zinc-600" />
                    <span>提示: 鼠标悬浮于下方卡片上可直接点亮对应物理按键；点击虚拟按键可锁定组合过滤。</span>
                  </div>
                </div>

              </div>

              {/* Grid of Shortcuts */}
              <div className="space-y-6">
                
                {filteredShortcuts.length > 0 ? (
                  // Group by Category for structured rendering if "All" is selected
                  selectedShortcutCategory === 'all' && !shortcutSearch && selectedKeys.length === 0 ? (
                    Object.values(ShortcutCategory).map((cat) => {
                      const catShortcuts = filteredShortcuts.filter((s) => s.category === cat);
                      if (catShortcuts.length === 0) return null;

                      return (
                        <div key={cat} className="space-y-3">
                          <div className="flex items-center gap-2 border-b border-zinc-800 pb-1.5">
                            <span className="w-1.5 h-3 bg-violet-500 rounded-full" />
                            <h3 className="text-sm font-semibold text-zinc-300 font-sans">
                              {cat}
                            </h3>
                            <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-1.5 py-0.2 rounded font-mono">
                              {catShortcuts.length} 个
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {catShortcuts.map((sc) => (
                              <ShortcutCard
                                key={sc.id}
                                shortcut={sc}
                                os={os}
                                isHighlighted={hoveredShortcut?.id === sc.id}
                                onHoverStart={() => setHoveredShortcut(sc)}
                                onHoverEnd={() => setHoveredShortcut(null)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Flat grid for active searches or specific categories
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-1.5">
                        <span className="w-1.5 h-3 bg-violet-500 rounded-full" />
                        <h3 className="text-sm font-semibold text-zinc-300 font-sans">
                          检索过滤结果
                        </h3>
                        <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-1.5 py-0.2 rounded font-mono">
                          共 {filteredShortcuts.length} 项
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredShortcuts.map((sc) => (
                          <ShortcutCard
                            key={sc.id}
                            shortcut={sc}
                            os={os}
                            isHighlighted={hoveredShortcut?.id === sc.id}
                            onHoverStart={() => setHoveredShortcut(sc)}
                            onHoverEnd={() => setHoveredShortcut(null)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="py-16 text-center border border-dashed border-zinc-800 rounded-xl space-y-3">
                    <Keyboard className="w-10 h-10 text-zinc-700 mx-auto animate-pulse" />
                    <p className="text-zinc-500 text-sm font-sans">
                      未找到匹配的 AE 快捷键。请尝试修改或重置过滤条件。
                    </p>
                    <button
                      id="btn-reset-flat-shortcut-filters"
                      onClick={() => {
                        setShortcutSearch('');
                        setSelectedShortcutCategory('all');
                        handleClearKeyFilters();
                      }}
                      className="text-xs text-violet-400 hover:text-violet-300 underline font-semibold font-sans cursor-pointer"
                    >
                      一键清空所有过滤
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          )}

          {/* ========================================================
              EXPRESSIONS TAB
              ======================================================== */}
          {activeTab === 'expressions' && (
            <motion.div
              key="expressions-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 flex-1 flex flex-col"
            >
              
              {/* Expressions Sub-navigation (Demos vs Reference manual) */}
              <div className="flex border-b border-zinc-800 pb-px">
                <button
                  id="sub-tab-btn-demos"
                  onClick={() => setExpressionSubTab('demos')}
                  className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    expressionSubTab === 'demos'
                      ? 'border-violet-500 text-violet-400 font-bold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  <span>20个常用表达式图形演练</span>
                </button>
                <button
                  id="sub-tab-btn-functions"
                  onClick={() => setExpressionSubTab('functions')}
                  className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                    expressionSubTab === 'functions'
                      ? 'border-violet-500 text-violet-400 font-bold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  <span>内置常用函数精讲手册</span>
                </button>
              </div>

              {/* Subtab Renderers */}
              <AnimatePresence mode="wait">
                {expressionSubTab === 'demos' ? (
                  <motion.div
                    key="demos-subtab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
                  >
                    {/* Left Column: Sidebar Selection */}
                    <div className="lg:col-span-4 bg-zinc-900/40 rounded-xl border border-zinc-800/80 p-4 flex flex-col h-[550px] lg:h-[720px]">
                      
                      {/* Sidebar header search */}
                      <div className="space-y-3 mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input
                            type="text"
                            placeholder="查找表达式, 如 wiggle, bounce..."
                            value={expressionSearch}
                            onChange={(e) => setExpressionSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs text-zinc-100 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-violet-500 transition-all font-sans placeholder-zinc-600"
                          />
                        </div>

                        {/* Category filter pills */}
                        <div className="flex flex-wrap gap-1">
                          <button
                            id="btn-exp-cat-all"
                            onClick={() => setSelectedExpressionCategory('all')}
                            className={`px-2 py-1 text-[10px] font-medium rounded-md border transition-all cursor-pointer ${
                              selectedExpressionCategory === 'all'
                                ? 'bg-violet-950/40 border-violet-500 text-violet-300'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            全部 ({expressionsData.length})
                          </button>
                          {Object.values(ExpressionCategory).map((cat) => {
                            const count = expressionsData.filter(e => e.category === cat).length;
                            return (
                              <button
                                id={`btn-exp-cat-${cat}`}
                                key={cat}
                                onClick={() => setSelectedExpressionCategory(cat)}
                                className={`px-2 py-1 text-[10px] font-medium rounded-md border transition-all cursor-pointer ${
                                  selectedExpressionCategory === cat
                                    ? 'bg-violet-950/40 border-violet-500 text-violet-300'
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                {cat} ({count})
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Scrollable list of expressions */}
                      <div className="flex-1 overflow-y-auto space-y-1 pr-1.5 scrollbar-thin">
                        {filteredExpressions.length > 0 ? (
                          filteredExpressions.map((exp) => {
                            const isSelected = selectedExpressionId === exp.id;
                            return (
                              <button
                                id={`btn-select-exp-${exp.id}`}
                                key={exp.id}
                                onClick={() => setSelectedExpressionId(exp.id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between group ${
                                  isSelected
                                    ? 'bg-zinc-950 border-violet-500/70 text-white shadow-inner'
                                    : 'bg-zinc-950/20 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800 hover:bg-zinc-900/30'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      isSelected ? 'bg-violet-400' : 'bg-zinc-700 group-hover:bg-zinc-400'
                                    }`} />
                                    <h4 className="text-xs font-semibold leading-none">
                                      {exp.name}
                                    </h4>
                                  </div>
                                  <span className="text-[10px] font-mono font-medium text-zinc-500 block mt-1.5 pl-3">
                                    {exp.englishName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] uppercase font-semibold font-mono text-zinc-600 bg-zinc-900 px-1 rounded">
                                    {exp.category}
                                  </span>
                                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-transform" />
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="py-12 text-center text-zinc-600 text-xs font-mono">
                            未找到符合的表达式
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Right Column: Active Expression Details & Interactive Simulator */}
                    <div className="lg:col-span-8 space-y-6">
                      
                      {/* Details Box */}
                      <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/80 p-6 space-y-4">
                        
                        {/* Title block */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="text-lg font-bold text-zinc-100 font-sans">
                                {activeExpression.name}
                              </h2>
                              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider font-mono bg-violet-950/40 border border-violet-900/40 text-violet-300">
                                {activeExpression.category}
                              </span>
                            </div>
                            <span className="text-xs font-mono font-medium text-zinc-500 block mt-1">
                              {activeExpression.englishName}
                            </span>
                          </div>

                          {/* Secondary tag/Use case */}
                          <div className="text-right text-[11px] text-zinc-400 bg-zinc-950/60 border border-zinc-800/80 px-3 py-1.5 rounded-lg max-w-sm">
                            <span className="text-violet-400 font-bold font-mono">应用场景:</span> {activeExpression.useCase}
                          </div>
                        </div>

                        {/* Description text */}
                        <p className="text-zinc-300 text-xs leading-relaxed font-sans">
                          {activeExpression.description}
                        </p>

                        {/* Interactive Code Container */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                            <span>💻 表达式代码块 (Expression Code)</span>
                            <button
                              id="btn-copy-main-expression"
                              onClick={() => handleCopyExpression(activeExpression.code)}
                              className="text-zinc-400 hover:text-white flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1 rounded transition-all cursor-pointer"
                            >
                              {copiedExpCode ? (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                                  <span className="text-green-400 font-semibold">已成功复制!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>复制代码</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 font-mono text-sm text-emerald-400 select-all overflow-x-auto leading-relaxed shadow-inner">
                            {activeExpression.code}
                          </pre>
                        </div>

                        {/* Parameters table */}
                        {activeExpression.parameters.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-xs font-mono text-zinc-500 block">⚙️ 参数说明表 (Parameter Guide)</span>
                            <div className="overflow-x-auto rounded-lg border border-zinc-800/60">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-zinc-950 text-zinc-400 font-mono font-medium border-b border-zinc-800/80">
                                    <th className="p-2.5">参数名</th>
                                    <th className="p-2.5">数据类型</th>
                                    <th className="p-2.5">默认值</th>
                                    <th className="p-2.5">详细作用说明</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50 bg-zinc-950/20 font-sans">
                                  {activeExpression.parameters.map((param) => (
                                    <tr key={param.name} className="hover:bg-zinc-900/20 transition-colors">
                                      <td className="p-2.5 font-mono font-semibold text-violet-300">{param.name}</td>
                                      <td className="p-2.5 font-mono text-[10px] text-zinc-500">{param.type}</td>
                                      <td className="p-2.5 font-mono text-zinc-400">{param.defaultValue}</td>
                                      <td className="p-2.5 text-zinc-400 leading-normal">{param.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Interactive Visual Simulator Component */}
                      <ExpressionSimulator expression={activeExpression} />

                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="functions-subtab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Embedded Built-in expression functions reference list */}
                    <div className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-800/80">
                      <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                        <BookOpen className="w-4.5 h-4.5 text-violet-400 animate-pulse" />
                        <div>
                          <h2 className="text-sm font-bold text-zinc-100 font-sans">
                            After Effects 内置常用函数与全局参数查阅手册
                          </h2>
                          <p className="text-xs text-zinc-500 font-sans mt-0.5">
                            深入探索 AE 的数学、插值、随机及图层空间变换函数，配有避坑指南与经典应用实例
                          </p>
                        </div>
                      </div>

                      <FunctionReference />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Aesthetic Footer */}
      <footer className="bg-zinc-950/60 border-t border-zinc-900/60 py-6 px-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600 font-sans">
          <div>
            <span>© After Effects 快捷键与表达式学习助手 · 极致匠心设计</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono">AE Expression v24+ &amp; React 19 Engine</span>
            <span>·</span>
            <span>当前时间 CTI 2026-06-29</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
