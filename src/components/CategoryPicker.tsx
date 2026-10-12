'use client';
import { useState, useEffect, useMemo } from "react";
import { CategoryDto } from "@/models";
import { ChevronRight, FolderTree, Check, ChevronDown } from "lucide-react";

interface CategoryPickerProps {
    categories: CategoryDto[];
    initialCategoryId?: string;
    onCategoryChange: (categoryId: string) => void;
    label?: string;
}

export default function CategoryPicker({ categories, initialCategoryId, onCategoryChange, label = "Wybierz kategorię" }: CategoryPickerProps) {
    const [path, setPath] = useState<CategoryDto[]>([]);

    // Rekurencyjne budowanie ścieżki od dziecka do rodzica w strukturze zagnieżdżonej
    useEffect(() => {
        if (!initialCategoryId || categories.length === 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- ścieżka kategorii wynika z wybranego id
            if (!initialCategoryId) setPath([]);
            return;
        }

        const findPath = (targetId: string, currentCategories: CategoryDto[], currentPath: CategoryDto[] = []): CategoryDto[] | null => {
            for (const cat of currentCategories) {
                if (cat.id.toString() === targetId) {
                    return [...currentPath, cat];
                }
                if (cat.children && cat.children.length > 0) {
                    const foundPath = findPath(targetId, cat.children, [...currentPath, cat]);
                    if (foundPath) return foundPath;
                }
            }
            return null;
        };

        const fullPath = findPath(initialCategoryId, categories) || [];
        const currentPathIds = path.map(p => p.id).join(',');
        const newPathIds = fullPath.map(p => p.id).join(',');
        if (currentPathIds !== newPathIds) {
            setPath(fullPath);
        }
    }, [initialCategoryId, categories]);

    const handleCategoryClick = (levelIndex: number, category: CategoryDto) => {
        const newPath = [...path.slice(0, levelIndex), category];
        setPath(newPath);
        onCategoryChange(category.id.toString());
    };

    const rootCategories = useMemo(() => 
        [...categories].sort((a, b) => (a.position || 0) - (b.position || 0)),
    [categories]);

    const getChildrenFromPath = (level: number) => {
        if (path[level] && path[level].children) {
            return [...path[level].children].sort((a, b) => (a.position || 0) - (b.position || 0));
        }
        return [];
    };

    return (
        <div className="space-y-6 bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl">
                        <FolderTree className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-tight">{label}</h3>
                        <p className="text-[10px] text-neutral-400 font-medium">Możesz zatrzymać się na dowolnym poziomie</p>
                    </div>
                </div>
                {path.length > 0 && (
                    <button 
                        type="button"
                        onClick={() => { setPath([]); onCategoryChange(""); }}
                        className="text-[10px] font-bold text-primary hover:text-primary-hover uppercase tracking-widest bg-primary-soft px-3 py-1.5 rounded-lg transition-colors"
                    >
                        Resetuj
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-6">
                {/* POZIOM 1: GŁÓWNE */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pl-1">Kategoria Główna</p>
                    <div className="flex flex-wrap gap-2">
                        {rootCategories.map(cat => {
                            const isSelected = path[0]?.id === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategoryClick(0, cat)}
                                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border-2 ${
                                        isSelected 
                                        ? "bg-primary text-white border-primary shadow-lg scale-105" 
                                        : "bg-white text-neutral-600 border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {cat.name}
                                        {isSelected && <Check className="w-3 h-3" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* POZIOM 2: PODKATEGORIE */}
                {path.length > 0 && getChildrenFromPath(0).length > 0 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300 pl-4 border-l-2 border-neutral-100 ml-2">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                            <ChevronDown className="w-3 h-3" />
                            Podkategorie dla: {path[0].name}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {getChildrenFromPath(0).map(cat => {
                                const isSelected = path[1]?.id === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleCategoryClick(1, cat)}
                                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                                            isSelected 
                                            ? "bg-secondary text-white border-secondary shadow-md" 
                                            : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:bg-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {cat.name}
                                            {isSelected && <Check className="w-3 h-3" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* POZIOM 3: SZCZEGÓŁOWE */}
                {path.length > 1 && getChildrenFromPath(1).length > 0 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300 pl-8 border-l-2 border-neutral-50 ml-2">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                            <ChevronDown className="w-3 h-3" />
                            Szczegóły: {path[1].name}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {getChildrenFromPath(1).map(cat => {
                                const isSelected = path[2]?.id === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleCategoryClick(2, cat)}
                                        className={`flex items-center justify-center text-center p-3 rounded-xl text-[11px] font-bold transition-all border ${
                                            isSelected 
                                            ? "bg-primary-soft text-primary border-primary ring-2 ring-primary/10 scale-95" 
                                            : "bg-white text-neutral-500 border-neutral-100 hover:border-neutral-300 hover:text-neutral-800"
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {path.length > 0 && (
                <div className="mt-8 pt-6 border-t border-neutral-100">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Aktualny Wybór</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                        {path.map((c, i) => (
                            <span key={c.id} className="flex items-center gap-2">
                                <span className="text-xs font-bold text-neutral-900">{c.name}</span>
                                {i < path.length - 1 && <ChevronRight className="w-3 h-3 text-neutral-300" />}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
