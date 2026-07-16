function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded-lg mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded-lg mb-4"
        />

        <button
  onClick={() => window.location.href="/dashboard"}
  className="w-full bg-blue-600 text-white p-3 rounded-lg"
>
  Login
</button>

        <p className="text-center mt-4">
          Don't have an account?
          <a href="/register" className="text-blue-600 ml-2">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;