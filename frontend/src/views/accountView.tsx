import { AuthUserState } from "../store/authSlice";

type AccountViewProps = {
    user: AuthUserState;
    onLogout: () => void;
    onDelete: () => void;
};

export function AccountView({ user, onLogout, onDelete }: AccountViewProps) {
    return (
        <div className="flex h-screen w-full items-start justify-center overflow-y-auto bg-slate-50 p-8 pt-20">
            <section className="overlay-panel w-full max-w-lg">
                <h2 className="overlay-panel-title">My Account</h2>

                <div className="flex flex-col items-center py-6 gap-4">
                    {user.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={`${user.displayName || "User"}'s avatar`}
                            className="w-24 h-24 rounded-full shadow-md object-cover"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-3xl shadow-md">
                            {(user.displayName || user.email || "?")[0].toUpperCase()}
                        </div>
                    )}

                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-slate-800">
                            {user.displayName || "User"}
                        </h3>
                        <p className="text-slate-500">{user.email}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-4 border-t border-slate-200 pt-6">
                    <button
                        onClick={onLogout}
                        className="w-full rounded-md bg-white border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Sign Out
                    </button>
                    <button
                        onClick={onDelete}
                        className="w-full rounded-md bg-red-50 border border-red-200 px-4 py-2 font-medium text-red-600 hover:bg-red-100 transition-colors"
                    >
                        Delete Account
                    </button>
                </div>
            </section>
        </div>
    );
}
