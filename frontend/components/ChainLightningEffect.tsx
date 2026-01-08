import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight, XCircle, AlertTriangle } from 'lucide-react';
import { Student } from '../types';

interface ChainStep {
    student: Student;
    status: 'hit' | 'miss';
}

interface ChainLightningEffectProps {
    chainPath: ChainStep[];
    onComplete: () => void;
}

export default function ChainLightningEffect({ chainPath, onComplete }: ChainLightningEffectProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [showSummary, setShowSummary] = useState(false);

    useEffect(() => {
        if (currentStepIndex < chainPath.length) {
            const stepDuration = 2000; // 2 seconds per bounce
            const timer = setTimeout(() => {
                if (chainPath[currentStepIndex].status === 'miss') {
                    setCurrentStepIndex(prev => prev + 1);
                } else {
                    // Hit! Show summary after delay
                    setTimeout(() => setShowSummary(true), 1500);
                }
            }, stepDuration);
            return () => clearTimeout(timer);
        } else {
            // End of chain (all misses?), show summary
            setTimeout(() => setShowSummary(true), 1000);
        }
    }, [currentStepIndex, chainPath]);

    useEffect(() => {
        if (showSummary) {
            const timer = setTimeout(() => {
                onComplete();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSummary, onComplete]);

    const currentStep = chainPath[currentStepIndex];

    if (!currentStep && !showSummary) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/95 animate-in fade-in duration-300">

            {/* Background Storm */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 w-full h-full bg-[linear-gradient(to_bottom,rgba(59,130,246,0.1),transparent)]"></div>
                {/* Random Litghtning Flashes could go here */}
            </div>

            <div className="relative z-20 w-full max-w-2xl flex flex-col items-center p-8">

                {/* Header */}
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-blue-500 mb-12 flex items-center gap-4 animate-pulse">
                    <Zap size={48} className="text-yellow-400 fill-yellow-400" />
                    连锁闪电
                    <Zap size={48} className="text-yellow-400 fill-yellow-400" />
                </h2>

                {!showSummary && currentStep && (
                    <div key={currentStep.student.id} className="flex flex-col items-center animate-in zoom-in slide-in-from-bottom-10 duration-500">
                        <div className="text-xl text-slate-400 mb-2">
                            目标 #{currentStepIndex + 1}
                        </div>

                        {/* Avatar / Card */}
                        <div className="relative mb-6">
                            <div className={`w-32 h-32 rounded-xl flex items-center justify-center border-4 ${currentStep.status === 'hit' ? 'bg-red-900/50 border-red-500' : 'bg-slate-800 border-slate-600'}`}>
                                <span className="text-4xl font-bold text-white">{currentStep.student.name}</span>
                            </div>
                            {/* Status Overlay */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                {currentStep.status === 'hit' ? (
                                    <div className="bg-red-600 text-white px-4 py-1 rounded-full font-bold shadow-lg animate-bounce flex items-center gap-2">
                                        <Zap size={16} fill="white" /> 命中! -2★
                                    </div>
                                ) : (
                                    <div className="bg-slate-600 text-slate-300 px-4 py-1 rounded-full font-bold shadow-lg flex items-center gap-2">
                                        <ArrowRight size={16} /> 未命中...跳跃
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Connection Line */}
                        {currentStep.status === 'miss' && (
                            <div className="h-20 w-1 bg-gradient-to-b from-slate-600 to-transparent my-4"></div>
                        )}
                    </div>
                )}

                {showSummary && (
                    <div className="w-full bg-slate-800/80 p-6 rounded-xl border border-slate-700 animate-in fade-in zoom-in">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-yellow-500" />
                            结算报告
                        </h3>
                        <div className="space-y-3">
                            {chainPath.map((step, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-3 rounded">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-500 font-mono">#{idx + 1}</span>
                                        <span className={step.status === 'hit' ? 'text-red-400 font-bold' : 'text-slate-400'}>
                                            {step.student.name}
                                        </span>
                                    </div>
                                    <div>
                                        {step.status === 'hit' ? (
                                            <span className="text-red-500 font-bold flex items-center gap-1">
                                                <Zap size={14} /> -2 星
                                            </span>
                                        ) : (
                                            <span className="text-slate-600 text-sm">幸免</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
