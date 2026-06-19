import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config/api";

function Login({ setUser }) {
  const googleBtnRef = useRef(null);
  const [ready, setReady] = useState(false);

  const handleCredentialResponse = useCallback(
    (response) => {
      fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      })
        .then(async (res) => {
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Error al iniciar sesión");
          }

          if (!data.token) {
            throw new Error("No se recibió token");
          }

          localStorage.setItem("authToken", data.token);
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        })
        .catch((err) => console.error(err));
    },
    [setUser]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id:
            "669527047269-lgca3sopn9gq72b41m7emeh3j8lk8a26.apps.googleusercontent.com",
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 260,
        });

        setReady(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [handleCredentialResponse]);

  return (
    <div className="login-card">
      {!ready && <p>Cargando Google…</p>}
      <div ref={googleBtnRef} />
    </div>
  );
}

export default Login;
