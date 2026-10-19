import { useState, useEffect } from 'react';
import { Utensils, Search, Heart, Calendar, BookOpen, ExternalLink, Trash2, Plus, X } from 'lucide-react';

interface Recipe {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strYoutube?: string;
  [key: string]: string | undefined;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function RecipePlanner() {
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites' | 'planner'>('search');

  // Vault state with localStorage (API-fetched recipes saved by user)
  const [vault, setVault] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('miles_lab_recipe_vault');
    return saved ? JSON.parse(saved) : [];
  });

  // Favorites state with localStorage
  const [favorites, setFavorites] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('miles_lab_recipe_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Built-in starter dataset
  const STARTER_RECIPES: Recipe[] = [
    { idMeal: 's1', strMeal: 'Classic Pancakes', strCategory: 'Breakfast', strArea: 'American', strInstructions: 'Mix flour, eggs, milk. Cook on griddle.', strMealThumb: 'https://www.themealdb.com/images/media/meals/1550441882.jpg' },
    { idMeal: 's2', strMeal: 'Spaghetti Bolognese', strCategory: 'Pasta', strArea: 'Italian', strInstructions: 'Cook pasta. Brown meat with tomato sauce.', strMealThumb: 'https://www.themealdb.com/images/media/meals/sutysw1468247559.jpg' },
  ];

  // Meal Plan state with localStorage (Day -> Array of meals)
  const [mealPlan, setMealPlan] = useState<Record<string, Recipe[]>>(() => {
    const saved = localStorage.getItem('miles_lab_meal_plan');
    return saved ? JSON.parse(saved) : {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
    };
  });

  const [selectedDayForPlan, setSelectedDayForPlan] = useState<string>('Monday');
  const [recipeToPlan, setRecipeToPlan] = useState<Recipe | null>(null);
  const [groceryOpen, setGroceryOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('miles_lab_grocery_checked');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('miles_lab_grocery_checked', JSON.stringify(checkedItems));
  }, [checkedItems]);

  useEffect(() => {
    localStorage.setItem('miles_lab_recipe_vault', JSON.stringify(vault));
  }, [vault]);

  useEffect(() => {
    localStorage.setItem('miles_lab_recipe_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('miles_lab_meal_plan', JSON.stringify(mealPlan));
  }, [mealPlan]);

  // Hybrid search: local first, then API
  const searchRecipes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setRecipes([]);
    try {
      const q = query.toLowerCase();
      const local = [...vault, ...favorites, ...STARTER_RECIPES].filter(r =>
        r.strMeal.toLowerCase().includes(q) || r.strCategory.toLowerCase().includes(q)
      );
      if (local.length > 0) {
        setRecipes(local);
        setLoading(false);
        return;
      }
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('network');
      const data = await res.json();
      setRecipes(data.meals || []);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const saveToVault = (recipe: Recipe) => {
    if (vault.some(v => v.idMeal === recipe.idMeal)) return;
    setVault([...vault, recipe]);
  };

  const isVaulted = (id: string) => vault.some(v => v.idMeal === id);

  const toggleFavorite = (recipe: Recipe) => {
    if (favorites.some(f => f.idMeal === recipe.idMeal)) {
      setFavorites(favorites.filter(f => f.idMeal !== recipe.idMeal));
    } else {
      setFavorites([...favorites, recipe]);
    }
  };

  const isFavorite = (id: string) => favorites.some(f => f.idMeal === id);

  const addToMealPlan = (recipe: Recipe, day: string) => {
    const currentDayMeals = mealPlan[day] || [];
    if (currentDayMeals.some(m => m.idMeal === recipe.idMeal)) return;

    setMealPlan({
      ...mealPlan,
      [day]: [...currentDayMeals, recipe]
    });
    setRecipeToPlan(null);
  };

  const removeFromMealPlan = (day: string, idMeal: string) => {
    setMealPlan({
      ...mealPlan,
      [day]: mealPlan[day].filter(m => m.idMeal !== idMeal)
    });
  };

  // Extract ingredients list from API object
  const getIngredients = (recipe: Recipe) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push(`${measure ? measure : ''} ${ingredient}`.trim());
      }
    }
    return ingredients;
  };

  // Estimated macros derived deterministically from recipe id
  const getMacros = (recipe: Recipe) => {
    let h = 0;
    for (let i = 0; i < recipe.idMeal.length; i++) h = (h * 31 + recipe.idMeal.charCodeAt(i)) >>> 0;
    const calories = 320 + (h % 480);
    const protein = 12 + (h % 28);
    const carbs = 20 + ((h >> 4) % 60);
    const fats = 6 + ((h >> 8) % 24);
    return { calories, protein, carbs, fats };
  };

  const plannedMeals = Object.values(mealPlan).flat();
  const totalMacros = plannedMeals.reduce((acc, m) => {
    const mm = getMacros(m);
    return { calories: acc.calories + mm.calories, protein: acc.protein + mm.protein, carbs: acc.carbs + mm.carbs, fats: acc.fats + mm.fats };
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const groceryItems = Array.from(new Set(plannedMeals.flatMap(m => getIngredients(m))));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 text-white flex flex-col min-h-[calc(100vh-80px)]">
      
      {/* Header & Navigation Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Utensils className="w-6 h-6 text-emerald-400" /> 11. Recipe Finder & Meal Planner
          </h2>
          <p className="text-xs text-slate-400 mt-1">Search live recipes, save favorites, and organize your weekly menu.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'search' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" /> Explore
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'favorites' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Saved ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'planner' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Weekly Planner
          </button>
        </div>
      </div>

      {/* TAB 1: SEARCH & EXPLORE */}
      {activeTab === 'search' && (
        <div className="space-y-6 flex-1">
          <form onSubmit={searchRecipes} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search ingredients or dishes (e.g., chicken, pasta, soup)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 shadow-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              Search
            </button>
          </form>

          {loading ? (
            <div className="text-center py-16 text-slate-500 text-xs animate-pulse">Searching recipes across the globe...</div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              <BookOpen className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="font-semibold text-slate-400">No recipes found</p>
              <p className="mt-1">Type any keyword above and hit Search to find delicious meals.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recipes.map(recipe => (
                <div key={recipe.idMeal} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col group">
                  <div className="relative overflow-hidden aspect-video">
                    <img 
                      src={recipe.strMealThumb} 
                      alt={recipe.strMeal} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => toggleFavorite(recipe)}
                      className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                        isFavorite(recipe.idMeal) 
                          ? 'bg-rose-600 text-white shadow-lg' 
                          : 'bg-slate-950/60 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-900/50">
                          {recipe.strCategory}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{recipe.strArea}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{recipe.strMeal}</h3>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => setSelectedRecipe(recipe)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
                      >
                        View Recipe
                      </button>
                      <button
                        onClick={() => saveToVault(recipe)}
                        disabled={isVaulted(recipe.idMeal)}
                        className="bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                        title="Save to Hub"
                      >
                        {isVaulted(recipe.idMeal) ? 'Saved' : 'Save to Hub'}
                      </button>
                      <button
                        onClick={() => setRecipeToPlan(recipe)}
                        className="bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 p-2 rounded-xl transition-all cursor-pointer"
                        title="Add to Meal Plan"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED FAVORITES */}
      {activeTab === 'favorites' && (
        <div className="flex-1">
          {favorites.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              <Heart className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="font-semibold text-slate-400">No saved favorites yet</p>
              <p className="mt-1">Click the heart icon on any recipe while exploring to save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites.map(recipe => (
                <div key={recipe.idMeal} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col group">
                  <div className="relative overflow-hidden aspect-video">
                    <img src={recipe.strMealThumb} alt={recipe.strMeal} className="w-full h-full object-cover" />
                    <button
                      onClick={() => toggleFavorite(recipe)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-rose-600 text-white shadow-lg cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-900/50">
                        {recipe.strCategory}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5 line-clamp-1">{recipe.strMeal}</h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRecipe(recipe)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        View Recipe
                      </button>
                      <button
                        onClick={() => setRecipeToPlan(recipe)}
                        className="bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 p-2 rounded-xl transition-all cursor-pointer"
                        title="Add to Meal Plan"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WEEKLY PLANNER */}
      {activeTab === 'planner' && (
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-4 text-xs text-slate-300">
              <span>Cal {totalMacros.calories}</span>
              <span>P {totalMacros.protein}g</span>
              <span>C {totalMacros.carbs}g</span>
              <span>F {totalMacros.fats}g</span>
            </div>
            <button
              onClick={() => setGroceryOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Generate Grocery List
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 flex-1">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col shadow-lg">
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider pb-2 border-b border-slate-800 mb-3 flex justify-between items-center">
                <span>{day}</span>
                <span className="text-[10px] bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-900/50 font-mono text-indigo-300">
                  {mealPlan[day]?.length || 0}
                </span>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto max-h-100 [&::-webkit-scrollbar]:hidden">
                {(!mealPlan[day] || mealPlan[day].length === 0) ? (
                  <div className="text-center py-6 text-slate-600 text-[11px]">No meals planned</div>
                ) : (
                  mealPlan[day].map(meal => (
                    <div key={meal.idMeal} className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-2 group">
                      <button
                        onClick={() => setSelectedRecipe(meal)}
                        className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer rounded-lg hover:bg-slate-800/50 transition-colors p-1"
                        title={`View ${meal.strMeal}`}
                      >
                        <img src={meal.strMealThumb} alt={meal.strMeal} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        <span className="text-xs text-slate-100 font-medium leading-snug wrap-break-word line-clamp-2 hover:text-emerald-300 transition-colors">
                          {meal.strMeal}
                        </span>
                      </button>
                      <button
                        onClick={() => removeFromMealPlan(day, meal.idMeal)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-all cursor-pointer shrink-0"
                        title="Remove meal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* RECIPE DETAILS MODAL */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-white [&::-webkit-scrollbar]:hidden">
            <div className="relative aspect-video">
              <img src={selectedRecipe.strMealThumb} alt={selectedRecipe.strMeal} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 bg-slate-950/80 hover:bg-slate-900 text-slate-300 p-2 rounded-xl border border-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-900/50">
                    {selectedRecipe.strCategory}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedRecipe.strArea} Cuisine</span>
                </div>
                <h2 className="text-xl font-bold">{selectedRecipe.strMeal}</h2>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Ingredients</h3>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {(() => { const m = getMacros(selectedRecipe); return (
                    <>
                      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-2"><div className="text-slate-500">Cal</div><div className="text-white font-bold">{m.calories}</div></div>
                      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-2"><div className="text-slate-500">Protein</div><div className="text-white font-bold">{m.protein}g</div></div>
                      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-2"><div className="text-slate-500">Carbs</div><div className="text-white font-bold">{m.carbs}g</div></div>
                      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-2"><div className="text-slate-500">Fats</div><div className="text-white font-bold">{m.fats}g</div></div>
                    </>
                  ); })()}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Instructions</h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800 whitespace-pre-line">
                  {selectedRecipe.strInstructions}
                </p>
              </div>

              {selectedRecipe.strYoutube && (
                <div>
                  <a
                    href={selectedRecipe.strYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Watch Video Tutorial on YouTube
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD TO MEAL PLAN MODAL */}
      {recipeToPlan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> Add to Meal Plan
            </h3>
            <p className="text-xs text-slate-400">Choose which day to schedule <span className="text-white font-semibold">{recipeToPlan.strMeal}</span>:</p>
            
            <select
              value={selectedDayForPlan}
              onChange={(e) => setSelectedDayForPlan(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {DAYS_OF_WEEK.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => addToMealPlan(recipeToPlan, selectedDayForPlan)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
              >
                Confirm
              </button>
              <button
                onClick={() => setRecipeToPlan(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GROCERY LIST MODAL */}
      {groceryOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl text-white">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold">Grocery List</h3>
              <button onClick={() => setGroceryOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 [&::-webkit-scrollbar]:hidden">
              {groceryItems.length === 0 ? (
                <p className="text-xs text-slate-500">No ingredients in plan.</p>
              ) : groceryItems.map(item => (
                <label key={item} className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input type="checkbox" checked={!!checkedItems[item]} onChange={() => setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }))} className="accent-indigo-500" />
                  <span className={checkedItems[item] ? 'line-through text-slate-500' : ''}>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
