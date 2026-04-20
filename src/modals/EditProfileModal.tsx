import { X, Check, AlertCircle } from 'lucide-react';
import {useEffect, useState} from 'react';
import {AccountDetailDto} from "@/models/user/AccountDetailDto";

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

    useEffect(() => {

        fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/user/${userId}`)
            .then(response => response.json())
            .then(data => {
                console.log('User data:', data);
                setFormData(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                setIsLoading(false);
            });
    }, [userId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        console.log('Saving...', formData);
    };

    const handlePasswordChange = () => {
        console.log('Changing password...', passwords);
    };

    const handleDeleteAccount = () => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            setTimeout(() => setDeleteConfirm(false), 3000);
            return;
        }
        console.log('Deleting account...');
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