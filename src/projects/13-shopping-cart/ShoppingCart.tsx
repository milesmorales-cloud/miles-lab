import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, Tag, CheckCircle2, ArrowRight, Filter, Settings, Store, PlusCircle } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Mechanical Keyboard', price: 129.99, category: 'Hardware', image: '⌨️' },
  { id: 2, name: 'Ergonomic Mouse', price: 79.99, category: 'Hardware', image: '🖱️' },
  { id: 3, name: 'UltraWide Monitor', price: 499.99, category: 'Displays', image: '🖥️' },
  { id: 4, name: 'Noise-Cancelling Headphones', price: 249.99, category: 'Audio', image: '🎧' },
  { id: 5, name: 'Wireless Earbuds', price: 159.99, category: 'Audio', image: '🎵' },
  { id: 6, name: '4K Webcam', price: 89.99, category: 'Hardware', image: '📷' },
  { id: 7, name: 'USB-C Docking Station', price: 199.99, category: 'Accessories', image: '🔌' },
  { id: 8, name: 'Smart Fitness Watch', price: 299.99, category: 'Wearables', image: '⌚' },
  { id: 9, name: 'Portable SSD 1TB', price: 119.99, category: 'Hardware', image: '💾' },
  { id: 10, name: 'LED Desk Lamp', price: 49.99, category: 'Accessories', image: '💡' },
];

export default function ShoppingCart() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('miles_lab_shop_categories');
    return saved ? JSON.parse(saved) : ['Hardware', 'Audio', 'Displays', 'Wearables', 'Accessories'];
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [cart, setCart] = useState<CartItem[]>([
    { ...INITIAL_PRODUCTS[0], quantity: 1 },
    { ...INITIAL_PRODUCTS[1], quantity: 2 },
  ]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'store' | 'admin'>('store');
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  useEffect(() => {
    localStorage.setItem('miles_lab_shop_categories', JSON.stringify(categories));
  }, [categories]);

  // New Product Form State (for Supermarket Admin)
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Hardware');
  const [newImage, setNewImage] = useState('🛒');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name || categories.includes(name)) return;
    setCategories([...categories, name]);
    setNewCategoryName('');
  };

  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // Add item to cart or increment quantity
  const addToCart = (product: Product) => {
    setCheckoutComplete(false);
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Update cart item quantity (+ / -)
  const updateQuantity = (id: number, delta: number) => {
    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Remove item from cart
  const removeCartItem = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  // SUPERMARKET ADMIN: Add a new product to inventory
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;

    const createdProduct: Product = {
      id: Date.now(),
      name: newName.trim(),
      price: parseFloat(newPrice),
      category: newCategory,
      image: newImage || '📦',
    };

    setProducts([createdProduct, ...products]);
    setNewName('');
    setNewPrice('');
  };

  // SUPERMARKET ADMIN: Delete a product from inventory
  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    setCart(cart.filter(item => item.id !== id)); // also remove from active cart if present
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 15.00 : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutComplete(true);
    setCart([]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col">
        
        {/* Top Navigation Bar: Switch between Customer Storefront and Supermarket Admin */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold tracking-wider uppercase text-slate-200">
              13. Miles Supermarket Hub
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('store')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'store'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Store className="w-3.5 h-3.5" /> Storefront
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Inventory Admin
            </button>
          </div>
        </div>

        {activeTab === 'store' ? (
          /* ================= STOREFRONT VIEW ================= */
          <div className="flex flex-col md:flex-row flex-1">
            {/* Left Side: Catalog & Categories */}
            <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Product Catalog</span>
                <span className="text-xs text-indigo-300 font-mono bg-indigo-950/40 px-3 py-1 rounded-lg border border-indigo-900/50">
                  {filteredProducts.length} Items Available
                </span>
              </div>

              {/* Category Filter Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar border-b border-slate-800/80">
                <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
                {['All', ...categories].map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-110 overflow-y-auto pr-1">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                    <div>
                      <div className="text-3xl mb-2">{product.image}</div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-slate-900 text-indigo-400 rounded-md border border-slate-800">
                        {product.category}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-2 mb-1">{product.name}</h3>
                      <p className="text-indigo-300 font-mono text-sm font-semibold">${product.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="mt-4 w-full bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Cart Summary & Checkout */}
            <div className="w-full md:w-96 p-6 bg-slate-950/50 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-cyan-400" /> Your Shopping Cart
                </h3>

                {checkoutComplete && (
                  <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-center gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Order placed successfully! Thank you.</span>
                  </div>
                )}

                {cart.length === 0 && !checkoutComplete ? (
                  <div className="py-12 text-center text-slate-600 text-sm italic">
                    Your cart is empty
                  </div>
                ) : (
                  <div className="space-y-3 max-h-52 overflow-y-auto pr-1 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                        <div className="min-w-0 mr-2">
                          <div className="text-xs font-bold text-white truncate">{item.name}</div>
                          <div className="text-xs font-mono text-indigo-400">${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-white">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button onClick={() => removeCartItem(item.id)} className="text-slate-600 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer" title="Remove">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing Calculations */}
              <div className="border-t border-slate-800 pt-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-200">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Shipping</span>
                  <span className="font-mono text-slate-200">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800/80">
                  <span>Total</span>
                  <span className="font-mono text-indigo-400">${total.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 text-xs uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed"
                >
                  Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= SUPERMARKET ADMIN VIEW ================= */
          <div className="p-6 flex flex-col md:flex-row gap-6">
            {/* Add New Item Form */}
            <div className="w-full md:w-80 bg-slate-950 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" /> Add New Inventory Item
              </h3>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Product Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Organic Milk"
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="4.99"
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Create Category</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Groceries"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button type="button" onClick={handleAddCategory} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-semibold">Add</button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-lg text-slate-200 text-center"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer uppercase tracking-wider"
                >
                  Save Product to Store
                </button>
              </form>
            </div>

            {/* Inventory Listing & Removal Table */}
            <div className="flex-1 bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-400" /> Active Supermarket Inventory ({products.length} Items)
              </h3>

              <div className="space-y-2 flex-1 max-h-950 overflow-y-auto pr-1">
                {products.map(prod => (
                  <div key={prod.id} className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{prod.image}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{prod.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">{prod.category}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-semibold text-indigo-300">${prod.price.toFixed(2)}</span>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}