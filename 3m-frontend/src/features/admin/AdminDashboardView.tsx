import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import type { IProduct, ICategory } from '../../types';
import type { IOrder } from '../../services/orderService';
import { Navigate } from 'react-router-dom';
import { ClipboardList, Package, Tag, Users, BarChart3, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CategoryModal } from './components/CategoryModal';
import { CategoriesTab } from './components/CategoriesTab';
import { ProductModal } from './components/ProductModal';
import { ProductsTab } from './components/ProductsTab';
import { OrdersTab } from './components/OrdersTab';
import { UsersTab } from './components/UsersTab';
import { PromosTab } from './components/PromosTab';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SettingsTab } from './components/SettingsTab';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../lib/translations';

export default function AdminDashboardView() {
  const { user, isAuthenticated } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];
  

  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'products' | 'categories' | 'users' | 'promos' | 'settings'>('analytics');
  

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  
 
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  
  const [expandedOrderID, setExpandedOrderID] = useState<string | null>(null);
  
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  
  
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'product' | 'category'; id: string; name: string } | null>(null);

  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await orderService.getAllOrders();
      setOrders(res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      toast.error(t.adminToastOrdersLoadError);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await productService.getProducts({ limit: 100 });
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      toast.error(t.adminToastProductsLoadError);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await productService.getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      toast.error(t.adminToastCategoriesLoadError);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'products') {
      fetchProducts();
      fetchCategories();
    }
    if (activeTab === 'categories') fetchCategories();
  }, [activeTab, isAuthenticated, user]);

  
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(t.adminToastStatusUpdateSuccess);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus as any } : o));
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(t.adminToastStatusUpdateError);
    }
  };

  
  const openProductModal = (product: IProduct | null = null) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  
  const handleProductSubmit = async (
    e: React.FormEvent,
    data: {
      name: string;
      description: string;
      price: string;
      quantity: string;
      categoryID: string;
      coverFile: File | null;
      galleryFiles: FileList | null;
    }
  ) => {
    e.preventDefault();
    if (!data.name || !data.description || !data.price || !data.quantity || !data.categoryID) {
      toast.error(t.adminToastFieldsRequired);
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('quantity', data.quantity);
    formData.append('categoryID', data.categoryID);

    setIsSubmittingProduct(true);
    try {
      if (editingProduct) {
        
        if (data.coverFile) {
          formData.append('image', data.coverFile);
        }
        await productService.updateProduct(editingProduct._id, formData);
        toast.success(t.adminToastProductUpdateSuccess);
      } else {
        
        if (!data.coverFile) {
          toast.error(t.adminToastProductCoverRequired);
          setIsSubmittingProduct(false);
          return;
        }
        formData.append('imageCover', data.coverFile);
        if (data.galleryFiles) {
          for (let i = 0; i < data.galleryFiles.length; i++) {
            formData.append('images', data.galleryFiles[i]);
          }
        }
        await productService.createProduct(formData);
        toast.success(t.adminToastProductSaveSuccess);
      }
      setIsProductModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || t.adminToastProductSaveError);
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  
  const openCategoryModal = (category: ICategory | null = null) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  
  const handleCategorySubmit = async (e: React.FormEvent, name: string, description: string) => {
    e.preventDefault();
    if (!name) {
      toast.error(t.adminToastCategoryNameRequired);
      return;
    }

    setIsSubmittingCategory(true);
    try {
      if (editingCategory) {
        await productService.updateCategory(editingCategory._id, name, description);
        toast.success(t.adminToastCategoryUpdateSuccess);
      } else {
        await productService.createCategory(name, description);
        toast.success(t.adminToastCategorySaveSuccess);
      }
      setIsCategoryModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || t.adminToastCategorySaveError);
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'product') {
        await productService.deleteProduct(deleteTarget.id);
        toast.success(t.adminToastDeleteSuccess);
        fetchProducts();
      } else {
        await productService.deleteCategory(deleteTarget.id);
        toast.success(t.adminToastDeleteSuccess);
        fetchCategories();
      }
      setDeleteTarget(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || t.adminToastDeleteError);
    }
  };

  
  const formatPrice = (price: number) => {
    return `${price} ${t.currency}`;
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={`pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-[85vh] ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      <div className="mb-10 border-b border-neutral-100 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif-en uppercase tracking-widest text-neutral-900 mb-2">
            {t.adminDashboardTitle}
          </h1>
          <p className="text-xs text-neutral-400 uppercase tracking-wider">
            {t.adminDashboardSubtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === 'analytics'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 hover:text-black'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {t.adminTabAnalytics}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === 'orders'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 hover:text-black'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            {t.adminTabOrders}
            {orders.length > 0 && activeTab !== 'orders' && (
              <span className={`${language === 'ar' ? 'mr-auto' : 'ml-auto'} bg-neutral-100 text-neutral-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-serif-en`}>
                {orders.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === 'products'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 hover:text-black'
            }`}
          >
            <Package className="w-4 h-4" />
            {t.adminTabProducts}
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === 'categories'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 hover:text-black'
            }`}
          >
            <Tag className="w-4 h-4" />
            {t.adminTabCategories}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === 'users'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 hover:text-black'
            }`}
          >
            <Users className="w-4 h-4" />
            {t.adminTabUsers}
          </button>

          <button
            onClick={() => setActiveTab('promos')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === 'promos'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 hover:text-black'
            }`}
          >
            <Tag className="w-4 h-4" />
            {t.adminTabPromos}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === 'settings'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-neutral-600 border-neutral-100 hover:bg-neutral-50 hover:text-black'
            }`}
          >
            <Settings className="w-4 h-4" />
            {t.adminTabSettings}
          </button>
        </div>

        <div className="lg:col-span-3">
          
          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              loadingOrders={loadingOrders}
              expandedOrderID={expandedOrderID}
              setExpandedOrderID={setExpandedOrderID}
              handleStatusChange={handleStatusChange}
              formatPrice={formatPrice}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
              products={products}
              loadingProducts={loadingProducts}
              onAddClick={() => openProductModal(null)}
              onEditClick={(product) => openProductModal(product)}
              onDeleteClick={(product) => setDeleteTarget({ type: 'product', id: product._id, name: product.name })}
              formatPrice={formatPrice}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab
              categories={categories}
              loadingCategories={loadingCategories}
              onAddClick={() => openCategoryModal(null)}
              onEditClick={(category) => openCategoryModal(category)}
              onDeleteClick={(category) => setDeleteTarget({ type: 'category', id: category._id, name: category.name })}
            />
          )}

          {activeTab === 'users' && (
            <UsersTab />
          )}

          {activeTab === 'promos' && (
            <PromosTab />
          )}

          {activeTab === 'settings' && (
            <SettingsTab />
          )}

        </div>
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleProductSubmit}
        isSubmitting={isSubmittingProduct}
        editingProduct={editingProduct}
        categories={categories}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCategorySubmit}
        isSubmitting={isSubmittingCategory}
        editingCategory={editingCategory}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        type={deleteTarget?.type || 'product'}
        name={deleteTarget?.name || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

    </div>
  );
}
