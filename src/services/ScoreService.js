export const fetchScores = async () => {
  const response = await fetch("http://localhost:8080/api/scores");
  if (!response.ok) {
    throw new Error("Fehler beim Abrufen der Scores");
  }
  return await response.json();
};
