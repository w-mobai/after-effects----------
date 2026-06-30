/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { functionsData } from '../data/functions';
import { ExpressionFunction, FunctionCategory } from '../types';
import { Search, Copy, Check, Filter, Lightbulb, BookOpen, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FunctionReference: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FunctionCategory | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter functions
  const filteredFunctions = useMemo(() => {
    return functionsData.filter((fn) => {
      const matchesSearch =
        fn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fn.signature.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fn.example.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === 'all' || fn.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
          <input
            type="text"
            placeholder="搜索 AE 表达式函数名称、参数、用法描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm text-zinc-100 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-sans placeholder-zinc-500"
          />
        </div>

        {/* Categories scrollable in mobile, tidy in desktop */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            id="btn-func-cat-all"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-violet-600/20 border-violet-500/50 text-violet-300 font-semibold shadow-md'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            全部函数 ({functionsData.length})
          </button>
          {Object.values(FunctionCategory).map((cat) => {
            const count = functionsData.filter((f) => f.category === cat).length;
            return (
              <button
                id={`btn-func-cat-${cat}`}
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-violet-600/20 border-violet-500/50 text-violet-300 font-semibold shadow-md'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main functions output list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredFunctions.length > 0 ? (
            filteredFunctions.map((fn, index) => (
              <motion.div
                id={`func-card-${fn.id}`}
                key={fn.id}
                layout="position"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                className="bg-zinc-900/30 rounded-xl border border-zinc-800 hover:border-zinc-700 p-5 flex flex-col justify-between hover:bg-zinc-900/50 transition-all duration-300 relative group overflow-hidden"
              >
                {/* Visual side accent */}
                <div className="absolute top-0 left-0 w-1 h-12 bg-gradient-to-b from-violet-500 to-indigo-600 rounded-r opacity-50 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Title and Category */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] uppercase font-semibold font-mono tracking-widest text-violet-400 bg-violet-950/30 border border-violet-900/40 px-2 py-0.5 rounded">
                      {fn.category}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 font-medium">
                      返回: <code className="text-zinc-400 font-semibold">{fn.returnValue}</code>
                    </span>
                  </div>

                  {/* Signature Code Box */}
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60 font-mono text-xs text-indigo-300 font-semibold mb-3 select-all select-none overflow-x-auto relative">
                    {fn.signature}
                  </div>

                  {/* Description */}
                  <p className="text-zinc-300 text-xs leading-relaxed mb-4">
                    {fn.description}
                  </p>

                  {/* Custom tip box */}
                  <div className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-900/80 mb-4 flex gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                      <span className="text-amber-300 font-medium font-mono">AE 避坑指南: </span>
                      {fn.tips}
                    </div>
                  </div>
                </div>

                {/* Example section with Copy button */}
                <div className="bg-zinc-950 rounded-lg border border-zinc-800/60 overflow-hidden mt-auto">
                  <div className="flex justify-between items-center bg-zinc-900/60 px-3 py-1.5 border-b border-zinc-800/80">
                    <span className="text-[10px] font-mono font-medium text-zinc-500 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> 经典表达式实例 (Example Code)
                    </span>
                    <button
                      id={`btn-copy-example-${fn.id}`}
                      onClick={() => handleCopy(fn.example, fn.id)}
                      className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-800 transition cursor-pointer"
                      title="复制代码块"
                    >
                      {copiedId === fn.id ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <pre className="p-3 text-[11px] font-mono text-emerald-400/90 overflow-x-auto whitespace-pre-wrap select-text leading-normal">
                    {fn.example}
                  </pre>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-500 gap-3">
              <Layers className="w-8 h-8 text-zinc-600 animate-pulse" />
              <p className="text-sm font-sans">未找到与 &quot;{searchQuery}&quot; 匹配的内置表达式函数</p>
              <button
                id="btn-reset-filters-from-empty"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-violet-400 hover:text-violet-300 underline font-sans cursor-pointer"
              >
                重置检索条件
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
