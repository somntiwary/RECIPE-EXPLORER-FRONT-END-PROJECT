const apiKey = 'API_KEY'; // Replace this with your actual Spoonacular API key
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const recipesContainer = document.getElementById('recipes-container');
const recipeTemplate = document.getElementById('recipe-template');
const toggleSwitch = document.getElementById('toggle-dark');

toggleSwitch.addEventListener('change', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    toggleSwitch.checked = true;
  }
});

async function fetchRecipes(query) {
  const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${encodeURIComponent(query)}&number=9`;
  try {
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      recipesContainer.innerHTML = `<p style="font-size:1.2rem; text-align:center;">No recipes found for "${query}". Try another search.</p>`;
      return;
    }

    recipesContainer.innerHTML = '<p style="text-align:center; font-size:1.2rem;">Fetching recipe details...</p>';
    
    const detailedRecipes = await Promise.all(
      data.results.map(recipe =>
        fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey}`)
          .then(res => res.json())
      )
    );

    renderRecipes(detailedRecipes);

  } catch (error) {
    recipesContainer.innerHTML = `<p style="color:red; text-align:center;">Error fetching recipes. Please try again later.</p>`;
    console.error(error);
  }
}

function renderRecipes(recipes) {
  recipesContainer.innerHTML = '';
  recipes.forEach(recipe => {
    const clone = recipeTemplate.content.cloneNode(true);
    clone.querySelector('.recipe-img').src = recipe.image || '';
    clone.querySelector('.recipe-img').alt = recipe.title;
    clone.querySelector('.recipe-title').textContent = recipe.title;

    // Ingredients
    const ingList = clone.querySelector('.ingredients-list');
    ingList.innerHTML = '';
    if (recipe.extendedIngredients && recipe.extendedIngredients.length > 0) {
      recipe.extendedIngredients.forEach(ing => {
        const li = document.createElement('li');
        li.textContent = ing.original;
        ingList.appendChild(li);
      });
    } else {
      ingList.innerHTML = '<li>No ingredients found.</li>';
    }

    // Instructions
    const instructions = clone.querySelector('.instructions');
    if (recipe.instructions) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = recipe.instructions;
      instructions.textContent = tempDiv.textContent;
    } else {
      instructions.textContent = 'No instructions available.';
    }

    recipesContainer.appendChild(clone);
  });
}

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (query.length === 0) return;
  fetchRecipes(query);
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});
