const apiUrl = process.env.REACT_APP_BACKEND_URL;

export const fetchScores = async () => {
  const response = await fetch(apiUrl + "/api/scores");
  if (!response.ok) {
    throw new Error("Fehler beim Abrufen der Scores");
  }
  return await response.json();
};
