// Global auth utility to access current user's authentication
let globalAuth = null;

export const setGlobalAuth = (auth) => {
  globalAuth = auth;
};

export const getGlobalAuth = () => {
  return globalAuth;
};

export const getCurrentUser = () => {
  return globalAuth?.currentUser;
};

export const getIdToken = async () => {
  if (!globalAuth?.currentUser) {
    throw new Error("User not authenticated");
  }
  return await globalAuth.currentUser.getIdToken();
};