function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Register
        </h1>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-3 rounded-lg mb-4"
        />

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

        <button className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700">
          Register
        </button>

        <p className="text-center mt-4">
          Already have an account?
          <a href="/login" className="text-blue-600 ml-2">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;