export const apiUrl =
  process.env.NODE_ENV === "production" || process.env.REACT_APP_USE_PROD
    ? process.env.REACT_APP_API_URL
    : "";
