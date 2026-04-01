export function LoginView() {
    return (
        <div className="flex h-screen w-full items-start justify-center overflow-y-auto bg-slate-50 p-8 pt-20">
            <section className="overlay-panel w-full max-w-md">
                <h2 className="overlay-panel-title text-center text-2xl mb-6">Sign In</h2>
                <div id="firebaseui-auth-container" className="pt-2 pb-4"></div>
            </section>
        </div>
    );
}
