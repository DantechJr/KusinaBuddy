document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generateBtn");
  const weekPlanBtn = document.getElementById("weekBtn");
  const resetBtn = document.getElementById("resetBtn");
  const inputBox = document.getElementById("generateBox");
  const outputArea = document.getElementById("FormControlTextarea1");
  const loading = document.getElementById("loading");

  // Generate Recipe
  generateBtn.addEventListener("click", async () => {
    const query = inputBox.value.trim();
    if (!query) {
      outputArea.value = "⚠️ Please type an ingredient or dish first!";
      return;
    }

    loading.style.display = "flex";

    try {
      const response = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      outputArea.value = data.result;
    } catch (error) {
      outputArea.value = "❌ Error generating recipe. Please try again.";
    } finally {
      loading.style.display = "none";
    }
  });

  // Week Plan (ingredient-based)
  weekPlanBtn.addEventListener("click", async () => {
    const ingredients = inputBox.value.trim();
    if (!ingredients) {
      outputArea.value = "⚠️ Please type some ingredients for the weekly plan!";
      return;
    }

    loading.style.display = "flex";

    try {
      const response = await fetch("/weekplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      const data = await response.json();
      outputArea.value = data.plan;
    } catch (error) {
      outputArea.value = "❌ Error generating week plan. Please try again.";
    } finally {
      loading.style.display = "none";
    }
  });

  // Reset
  resetBtn.addEventListener("click", () => {
    inputBox.value = "";
    outputArea.value = "";
  });
});
