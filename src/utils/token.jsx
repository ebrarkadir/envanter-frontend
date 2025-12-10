export const saveToken = (token) => {
  localStorage.setItem("accessToken", token);
};

export const saveRefreshToken = (refreshToken) => {
  localStorage.setItem("refreshToken", refreshToken);
};
