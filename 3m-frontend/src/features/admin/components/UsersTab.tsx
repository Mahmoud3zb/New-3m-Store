import { useState, useEffect } from 'react';
import { userService } from '../../../services/userService';
import type { IUser } from '../../../types';
import { User, Trash2, Edit, CheckCircle, XCircle, Calendar, Mail, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../lib/translations';

export function UsersTab() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const { language } = useLanguageStore();
  const t = translations[language];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const AVAILABLE_PERMISSIONS = [
    { id: 'can_add_products', ar: 'إضافة وتعديل المنتجات', en: 'Add/Edit Products' },
    { id: 'can_view_orders', ar: 'استعراض وإدارة الطلبات', en: 'View/Manage Orders' },
    { id: 'can_manage_coupons', ar: 'إدارة الكوبونات والخصومات', en: 'Manage Coupons' },
    { id: 'can_view_analytics', ar: 'استعراض الإحصائيات والتحليلات', en: 'View Analytics' },
  ];

  const handlePermissionToggle = (permId: string) => {
    setNewPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleCloseModal = () => {
    setEditingUserId(null);
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('user');
    setNewPermissions([]);
    setIsAddModalOpen(false);
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    
    if (!editingUserId && !newPassword.trim()) {
      toast.error(language === 'ar' ? 'كلمة المرور مطلوبة للمستخدم الجديد' : 'Password is required for new user');
      return;
    }

    setIsCreating(true);
    try {
      if (editingUserId) {
        const res = await userService.updateUser(editingUserId, {
          name: newName.trim(),
          role: newRole,
          permissions: newRole === 'admin' ? newPermissions : []
        });
        toast.success(language === 'ar' ? 'تم تحديث بيانات المستخدم بنجاح' : 'User updated successfully');
        setUsers(prev => prev.map(u => u._id === editingUserId ? res.data : u));
        handleCloseModal();
      } else {
        const res = await userService.addUser({
          name: newName.trim(),
          email: newEmail.trim(),
          password: newPassword.trim(),
          role: newRole,
          permissions: newRole === 'admin' ? newPermissions : [],
          address: { street: 'Not Specified', city: 'Cairo', country: 'Egypt' }
        });
        toast.success(language === 'ar' ? 'تم إضافة المستخدم بنجاح' : 'User added successfully');
        setUsers(prev => [res.data, ...prev]);
        handleCloseModal();
      }
    } catch (err: any) {
      console.error('Failed to save user:', err);
      toast.error(err.response?.data?.message || (language === 'ar' ? 'فشل حفظ المستخدم' : 'Failed to save user'));
    } finally {
      setIsCreating(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers(1, 100);
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error(t.adminToastUsersLoadError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string, name: string) => {
    const confirmMessage = language === 'ar' 
      ? `هل أنت متأكد من رغبتك في حذف المستخدم "${name}"؟` 
      : `Are you sure you want to delete user "${name}"?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }
    try {
      await userService.deleteUser(id);
      toast.success(t.adminToastUserDeleteSuccess);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error(t.adminToastUserDeleteError);
    }
  };

  const handleStartEdit = (user: IUser) => {
    setEditingUserId(user._id);
    setNewName(user.name);
    setNewEmail(user.email);
    setNewPassword('');
    setNewRole(user.role || 'user');
    setNewPermissions(user.permissions || []);
    setIsAddModalOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-white border border-neutral-100 rounded-3xl p-16 text-center shadow-sm flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-800" />
        <p className="text-xs text-neutral-400 font-bold">{t.adminUserLoadingList}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center border-b border-neutral-50 pb-4">
        <h2 className="text-base font-bold text-neutral-900">{t.adminUsersTitle} ({users.length})</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-black text-white hover:bg-neutral-800 text-[11px] font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
        >
          {language === 'ar' ? '+ إضافة مستخدم / أدمن' : '+ Add User / Admin'}
        </button>
      </div>

      {users.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400 border border-dashed border-neutral-200/80 rounded-2xl">
          {t.adminUserNoUsers}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`w-full border-collapse ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            <thead>
              <tr className="border-b border-neutral-100 text-[11px] text-neutral-400 uppercase tracking-wider font-bold">
                <th className={`pb-3 ${language === 'ar' ? 'pr-2' : 'pl-2'}`}>{t.adminUserThUser}</th>
                <th className="pb-3">{t.adminUserThEmail}</th>
                <th className="pb-3">{t.adminUserThRole}</th>
                <th className="pb-3">{t.adminUserThVerification}</th>
                <th className="pb-3">{t.adminUserThJoinDate}</th>
                <th className={`pb-3 ${language === 'ar' ? 'pl-2 text-left' : 'pr-2 text-right'}`}>{t.adminProductThActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 text-xs">
              {users.map((u) => {
                return (
                  <tr key={u._id} className="hover:bg-neutral-50/30 transition-colors">
                    <td className={`py-4 ${language === 'ar' ? 'pr-2' : 'pl-2'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden border border-neutral-200/50 flex-shrink-0">
                          {u.profileImage ? (
                            <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-neutral-900 block">{u.name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono font-medium block mt-0.5">ID: {u._id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 text-neutral-500 font-medium font-sans">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span>{u.email}</span>
                      </div>
                    </td>

                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.role === 'admin'
                            ? 'bg-red-50 text-red-600 border-red-100/50'
                            : 'bg-neutral-50 text-neutral-600 border-neutral-100/50'
                        }`}
                      >
                        {u.role === 'admin' ? (
                          <>
                            <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                            {t.adminUserRoleAdmin}
                          </>
                        ) : (
                          t.adminUserRoleCustomer
                        )}
                      </span>
                    </td>

                    <td className="py-4">
                      <span className="flex items-center gap-1 text-[11px]">
                        {u.isVerified ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span className="text-emerald-600 font-medium">{t.adminUserVerified}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                            <span className="text-neutral-400">{t.adminUserUnverified}</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-4 text-neutral-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                        <span>
                          {new Date(u.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>

                    <td className={`py-4 ${language === 'ar' ? 'pl-2 text-left' : 'pr-2 text-right'}`}>
                      <div className={`flex items-center gap-2 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                        <button
                          onClick={() => handleStartEdit(u)}
                          className="p-1.5 hover:bg-neutral-50 text-neutral-400 hover:text-black rounded-lg transition-colors cursor-pointer border border-neutral-100 bg-white"
                          title={t.adminUserEditTooltip}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer border border-neutral-100 bg-white"
                          title={t.adminUserDeleteTooltip}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center p-5 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-800">
                {editingUserId
                  ? (language === 'ar' ? 'تعديل بيانات المستخدم / الموظف' : 'Edit User / Employee')
                  : (language === 'ar' ? 'إضافة مستخدم جديد / أدمن' : 'Add New User / Admin')}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-450 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 block uppercase">
                  {language === 'ar' ? 'الاسم' : 'Name'}
                </label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none bg-neutral-50/30 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 block uppercase">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={`w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none bg-neutral-50/30 ${language === 'ar' ? 'text-right' : 'text-left'} disabled:opacity-50 disabled:bg-neutral-100`}
                  required
                  disabled={!!editingUserId}
                />
              </div>

              {!editingUserId && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 block uppercase">
                    {language === 'ar' ? 'كلمة المرور' : 'Password'}
                  </label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none bg-neutral-50/30 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-500 block uppercase">
                  {language === 'ar' ? 'الدور' : 'Role'}
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:border-black outline-none bg-neutral-50/30 cursor-pointer"
                >
                  <option value="user">{language === 'ar' ? 'مشتري / عميل' : 'Customer'}</option>
                  <option value="admin">{language === 'ar' ? 'مسؤول / أدمن' : 'Admin'}</option>
                </select>
              </div>

              {newRole === 'admin' && (
                <div className="space-y-2 border-t border-neutral-100 pt-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 block uppercase">
                      {language === 'ar' ? 'صلاحيات الأدمن الحبيبية' : 'Granular Admin Permissions'}
                    </label>
                    <p className="text-[9px] text-neutral-450 mt-0.5 leading-normal">
                      {language === 'ar' 
                        ? 'ملاحظة: هذه الصلاحيات تمنح الأدمن إمكانية الوصول إلى أقسام ومهام محددة في لوحة التحكم.' 
                        : 'Note: These permissions grant the admin access to specific sections and tasks in the dashboard.'}
                    </p>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <label key={perm.id} className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={newPermissions.includes(perm.id)}
                          onChange={() => handlePermissionToggle(perm.id)}
                          className="w-3.5 h-3.5 border-neutral-300 rounded text-black focus:ring-black cursor-pointer"
                        />
                        <span>{language === 'ar' ? perm.ar : perm.en}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-black text-white hover:bg-neutral-800 text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isCreating 
                  ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                  : (editingUserId 
                      ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                      : (language === 'ar' ? 'حفظ المستخدم' : 'Save User'))}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
