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
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { language } = useLanguageStore();
  const t = translations[language];

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
    setEditName(user.name);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditName('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) {
      toast.error(t.adminToastUserNameRequired);
      return;
    }
    setIsUpdating(true);
    try {
      await userService.updateUser(id, editName);
      toast.success(t.adminToastUserUpdateSuccess);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, name: editName } : u));
      setEditingUserId(null);
    } catch (err) {
      console.error('Failed to update user:', err);
      toast.error(t.adminToastUserUpdateError);
    } finally {
      setIsUpdating(false);
    }
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
                const isEditing = editingUserId === u._id;
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
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className={`border border-neutral-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-black ${language === 'ar' ? 'text-right' : 'text-left'}`}
                                disabled={isUpdating}
                              />
                              <button
                                onClick={() => handleSaveEdit(u._id)}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold px-2 py-1 bg-emerald-50 rounded-md border border-emerald-100 cursor-pointer flex-shrink-0"
                                disabled={isUpdating}
                              >
                                {isUpdating ? (language === 'ar' ? 'حفظ...' : 'Saving...') : t.adminUserSaveBtn}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-xs text-neutral-400 hover:text-neutral-500 font-bold px-2 py-1 bg-neutral-100 rounded-md cursor-pointer flex-shrink-0"
                                disabled={isUpdating}
                              >
                                {t.adminUserCancelBtn}
                              </button>
                            </div>
                          ) : (
                            <span className="font-bold text-neutral-900 block">{u.name}</span>
                          )}
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
                        {!isEditing && (
                          <button
                            onClick={() => handleStartEdit(u)}
                            className="p-1.5 hover:bg-neutral-50 text-neutral-400 hover:text-black rounded-lg transition-colors cursor-pointer border border-neutral-100 bg-white"
                            title={t.adminUserEditTooltip}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
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
    </div>
  );
}
