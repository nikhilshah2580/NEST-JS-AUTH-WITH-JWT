import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiClient } from "../api/apiClient";

const AuthContext = createContext(null);
let sessionRestorePromise;

function restoreSession() {
  if (!sessionRestorePromise) {
    sessionRestorePromise = apiClient
      .refreshSession()
      .then(async (tokens) => ({
        accessToken: tokens.accessToken,
        user: await apiClient.getProfile(tokens.accessToken),
      }))
      .finally(() => {
        sessionRestorePromise = null;
      });
  }
  return sessionRestorePromise;
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  const [initializationError, setInitializationError] = useState(null);

  useEffect(() => {
    let mounted = true;

    restoreSession()
      .then((session) => {
        if (!mounted) return;
        setAccessToken(session.accessToken);
        setUser(session.user);
        setStatus("authenticated");
      })
      .catch((error) => {
        if (!mounted) return;
        if (error.status !== 401) setInitializationError(error.message);
        setStatus("anonymous");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const signup = useCallback((details) => apiClient.signup(details), []);

  const signin = useCallback(async (credentials) => {
    const tokens = await apiClient.signin(credentials);
    const profile = await apiClient.getProfile(tokens.accessToken);
    setAccessToken(tokens.accessToken);
    setUser(profile);
    setStatus("authenticated");
    setInitializationError(null);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    let logoutError = null;
    try {
      await apiClient.logout();
    } catch (error) {
      logoutError = error;
    } finally {
      setAccessToken(null);
      setUser(null);
      setStatus("anonymous");
    }
    return logoutError;
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      status,
      initializationError,
      signup,
      signin,
      logout,
    }),
    [user, accessToken, status, initializationError, signup, signin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
