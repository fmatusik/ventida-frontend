import { X, Check, AlertCircle, Loader, Upload } from 'lucide-react';
import {useEffect, useState} from 'react';
import {AccountDetailDto} from "@/models/user/AccountDetailDto";
import api from '@/lib/api';

type EditProfileModalProps = {
    onClose: () => void;
    userId: string | null;
};

export default function EditProfileModal({ onClose, userId }: EditProfileModalProps) {
    const [formData, setFormData] = useState<AccountDetailDto | null>(null);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;

        api.get(`/user/${userId}`)
            .then(res => {
                setFormData(res.data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                setError("Nie udało się pobrać danych użytkownika");
                setIsLoading(false);
            });
    }, [userId]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !formData) return;
        
        setIsUploading(true);
        const file = e.target.files[0];
        const uploadData = new FormData();
        uploadData.append("file", file);
        
        try {
            const res = await api.post("/upload", uploadData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data.success) {
                setFormData({ ...formData, pictureUrl: res.data.url });
            }
        } catch (err) {
            console.error("Upload error", err);
            setError("Błąd przy przesyłaniu zdjęcia");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData || !userId) return;
        
        setIsSaving(true);
        setError(null);
        try {
            await api.put(`/user/${userId}`, formData);
            onClose();
            window.location.reload(); // Refresh to see changes
        } catch (err: any) {
            setError(err?.response?.data?.message || "Błąd przy zapisywaniu zmian");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            setError("Hasła nie są identyczne");
            return;
        }

        setIsSaving(true);
        try {
            await api.put(`/user/${userId}/password`, {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            setShowPasswordChange(false);
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            alert("Hasło zostało zmienione");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Błąd przy zmianie hasła");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            setTimeout(() => setDeleteConfirm(false), 3000);
            return;
        }

        try {
            await api.delete(`/user/${userId}`);
            localStorage.removeItem("accessToken");
            window.location.href = "/";
        } catch (err: any) {
            setError("Błąd przy usuwaniu konta");
        }
    };

    // Loading state
    if (isLoading || !formData) {
        return (
            <div
                className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
                onClick={onClose}
            >
                <div className="w-full max-w-2xl bg-white rounded-sm shadow-xl p-16 text-center">
                    <div className="animate-pulse">
                        <div className="h-8 bg-neutral-200 rounded w-1/3 mx-auto mb-4"></div>
                        <div className="h-4 bg-neutral-100 rounded w-1/2 mx-auto"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl bg-white rounded-sm shadow-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Sticky */}
                <div className="sticky top-0 bg-white border-b border-neutral-200 p-8 pb-6 z-10">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-neutral-400 hover:text-black transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-light mb-2">Edit Profile</h2>
                    <p className="text-sm text-neutral-600">
                        Update your personal information
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center pb-6 border-b border-neutral-100">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-neutral-100 border-2 border-neutral-200">
                                {formData.pictureUrl ? (
                                    <img 
                                        src={formData.pictureUrl.startsWith('http') ? formData.pictureUrl : (process.env.NEXT_PUBLIC_SERVER_URL + formData.pictureUrl)} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl text-neutral-400">
                                        {formData.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                        <Loader className="w-6 h-6 animate-spin text-black" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full cursor-pointer hover:bg-neutral-800 transition-colors shadow-lg">
                                <Upload className="w-4 h-4" />
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                            </label>
                        </div>
                        <p className="mt-3 text-xs text-neutral-500 font-medium">Click the icon to change your profile picture</p>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={formData.username || ''}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.surname || ''}
                                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                                    className="w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={formData.city || ''}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Country Code
                                </label>
                                <input
                                    type="text"
                                    value={formData.countryCode || ''}
                                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                                    placeholder="PL"
                                    className="w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="pt-6 border-t border-neutral-200 space-y-6">
                        <h3 className="text-lg font-light">Contact Information</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone_number || ''}
                                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    className="w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="pt-6 border-t border-neutral-200 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-light">Password</h3>
                            <button
                                type="button"
                                onClick={() => setShowPasswordChange(!showPasswordChange)}
                                className="px-4 py-2 text-sm border border-neutral-300 hover:bg-neutral-50 transition-colors"
                            >
                                {showPasswordChange ? 'Cancel' : 'Change Password'}
                            </button>
                        </div>

                        {showPasswordChange && (
                            <div className="space-y-4 bg-neutral-50 p-6 border border-neutral-200">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.oldPassword}
                                        onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                        className="w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:border-neutral-400 transition-colors"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handlePasswordChange}
                                    className="w-full px-6 py-3 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
                                >
                                    Update Password
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 border-t border-neutral-200 space-y-4">
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border border-neutral-300 text-sm font-medium hover:bg-neutral-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>

                        {/* Delete Account */}
                        <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className={`w-full px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                deleteConfirm
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'border border-red-300 text-red-600 hover:bg-red-50'
                            }`}
                        >
                            {deleteConfirm ? (
                                <>
                                    <AlertCircle className="w-4 h-4" />
                                    Click Again to Confirm Delete
                                </>
                            ) : (
                                'Delete Account'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}