import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { setAccessToken, setSessionExpiredHandler } from "../api/apiClient";
import * as authApi from "../api/authApi";

const AuthContext = createContext(null);
let sessionRestorePromise;

function restoreSession() {
  if (!sessionRestorePromise) {
    sessionRestorePromise = authApi
      .refreshSession()
      .then(async (tokens) => {
        setAccessToken(tokens.accessToken);
        return { user: await authApi.getProfile() };
      })
      .finally(() => {
        sessionRestorePromise = null;
      });
  }
  return sessionRestorePromise;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  const [initializationError, setInitializationError] = useState(null);

  useEffect(() => {
    let mounted = true;

    restoreSession()
      .then((session) => {
        if (!mounted) return;
        setUser(session.user);
        setStatus("authenticated");
      })
      .catch((error) => {
        if (!mounted) return;
        setAccessToken(null);
        if (error.status !== 401) setInitializationError(error.message);
        setStatus("anonymous");
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      setStatus("anonymous");
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const signup = useCallback((details) => authApi.signup(details), []);

  const signin = useCallback(async (credentials) => {
    const tokens = await authApi.signin(credentials);
    setAccessToken(tokens.accessToken);
    let profile;
    try {
      profile = await authApi.getProfile();
    } catch (error) {
      setAccessToken(null);
      throw error;
    }
    setUser(profile);
    setStatus("authenticated");
    setInitializationError(null);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    let logoutError = null;
    try {
      await authApi.logout();
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
      status,
      initializationError,
      signup,
      signin,
      logout,
    }),
    [user, status, initializationError, signup, signin, logout],
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
