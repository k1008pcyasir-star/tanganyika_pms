import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LockKeyhole, Eye, EyeOff, ShieldCheck } from "lucide-react";
import logo from "../assets/logo.png";
import { loginAdmin, saveAuth } from "../services/authService";

function LoginPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "admin",
    password: "tanganyika",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      alert("Jaza username na password kwanza.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginAdmin({
        username: formData.username,
        password: formData.password,
      });

      saveAuth(data);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(error.message || "Login imeshindikana.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 px-4 py-6 sm:px-6">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-[-60px] top-[-60px] h-40 w-40 rounded-full bg-[#1f2f86]/10 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[430px] rounded-[28px] border border-white/70 bg-white/95 px-6 py-8 shadow-[0_15px_50px_rgba(15,23,42,0.12)] backdrop-blur sm:px-8 sm:py-9">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-3xl bg-slate-50 p-4 shadow-sm">
            <img
              src={logo}
              alt="Police Logo"
              className="h-20 w-20 object-contain sm:h-24 sm:w-24"
            />
          </div>

          <h1 className="mt-5 text-[22px] font-semibold uppercase tracking-wide text-[#1f2f86] sm:text-[28px]">
            Tanganyika PMS
          </h1>

          
          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Mfumo salama wa matumizi ya ndani
          </div>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Username
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#1f2f86]">
                <User className="h-4 w-4" />
              </span>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Andika username"
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-[#1f2f86] outline-none transition placeholder:text-slate-400 focus:border-[#1f2f86] focus:ring-2 focus:ring-[#1f2f86]/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#1f2f86]">
                <LockKeyhole className="h-4 w-4" />
              </span>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Andika password"
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-11 text-sm text-[#1f2f86] outline-none transition placeholder:text-slate-400 focus:border-[#1f2f86] focus:ring-2 focus:ring-[#1f2f86]/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1f2f86]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-2xl bg-[#1f2f86] text-base font-semibold text-white shadow-sm transition hover:bg-[#18256a] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Inaingia..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;