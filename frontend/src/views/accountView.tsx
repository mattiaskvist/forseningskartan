import { AuthUserState } from "../store/authSlice";

type AccountViewProps = {
    user: AuthUserState;
    onLogout: () => void;
    onDelete: () => void;
};

export function AccountView({ user, onLogout, onDelete }: AccountViewProps) {
    return (
        <div className="page-shell pt-20">
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
                        <div className="account-avatar-fallback w-24 h-24 rounded-full flex items-center justify-center font-bold text-3xl shadow-md">
                            {(user.displayName || user.email || "?")[0].toUpperCase()}
                        </div>
                    )}

                    <div className="text-center">
                        <h3 className="text-xl font-semibold">{user.displayName || "User"}</h3>
                        <p className="themed-text-muted">{user.email}</p>
                    </div>
                </div>

                <div className="themed-divider mt-4 flex flex-col gap-3 border-t pt-6">
                    <button onClick={onLogout} className="account-button-secondary">
                        Sign Out
                    </button>
                    <button onClick={onDelete} className="account-button-danger">
                        Delete Account
                    </button>
                </div>
            </section>
        </div>
    );
}
