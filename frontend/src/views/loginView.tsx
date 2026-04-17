export function LoginView() {
    return (
        <div className="page-shell pt-20">
            <section className="overlay-panel w-full max-w-md">
                <h2 className="overlay-panel-title text-center text-2xl mb-6">Sign In</h2>
                <div id="firebaseui-auth-container" className="pt-2 pb-4"></div>
            </section>
        </div>
    );
}
