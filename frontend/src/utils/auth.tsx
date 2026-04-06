export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (error) {
    return {};
  }
};

export const getToken = () => localStorage.getItem('token');

export const isAuthenticated = () => !!getToken();

export const logout = () => {
  localStorage.clear();
  window.location.href = '/login';
};

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

export const hasRole = (role: string) => {
  return getUserRole() === role;
};
