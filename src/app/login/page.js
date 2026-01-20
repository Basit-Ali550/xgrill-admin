"use client";
import { useState, useTransition } from "react";
import { loginAction } from "@/app/actions/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Create FormData object from the form
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await loginAction(null, formData);
      
      if (result?.error) {
        toast.error(result.error);
        setError(result.error);
      } else if (result?.success) {
        // Manually update localStorage for AuthContext compatibility
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        
        toast.success("Login successful! Redirecting...");
        
        // Use hard redirect to force full page reload so AuthContext re-reads localStorage
        setTimeout(() => {
            window.location.href = "/dashboard";
        }, 500);
      }
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'linear-gradient(135deg, #f97316, #dc2626)', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <span style={{ fontSize: '24px' }}>🔥</span>
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0 }}>Grill-X</h1>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div style={{ 
          background: 'rgba(31, 41, 55, 0.7)', 
          backdropFilter: 'blur(12px)', 
          borderRadius: '16px', 
          border: '1px solid rgba(75, 85, 99, 0.5)',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Welcome Back</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Sign in to access the admin panel</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ 
                padding: '12px', 
                borderRadius: '8px', 
                background: 'rgba(239, 68, 68, 0.2)', 
                border: '1px solid rgba(239, 68, 68, 0.3)', 
                color: '#f87171', 
                fontSize: '14px',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '14px', marginBottom: '8px' }}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="admin@grillx.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#1f2937',
                  border: '1px solid #4b5563',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '14px', marginBottom: '8px' }}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#1f2937',
                  border: '1px solid #4b5563',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              style={{
                width: '100%',
                padding: '14px',
                background: '#f97316',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isPending ? (
                <>
                  <span style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid white', 
                    borderTopColor: 'transparent', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite' 
                  }} />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', marginTop: '24px' }}>
          Demo: admin@grillx.com / admin123
        </p>
      </div>
      
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
