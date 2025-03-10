const gallery = document.getElementById("photo-gallery");
const input = document.querySelector("input");
const button = document.querySelector("button");
const showMoreBtn = document.createElement("button");
showMoreBtn.classList.add("show-more");
showMoreBtn.textContent = "Show More";
showMoreBtn.style.display = "none"; // Initially hidden
document.body.appendChild(showMoreBtn);

const apiKey = "c1wZCrJDSvEX42nc1lKKNsoHLkFWbiwz0X3aDWsDsnMkRr7DdVyDyN10";
let page = 1;
let searchQuery = "nature";

// Load favorites from local storage
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// Fetch images from Pexels API
async function fetchPhotos(query, pageNumber = 1) {
    try {
        const response = await fetch(
            `https://api.pexels.com/v1/search?query=${query}&per_page=9&page=${pageNumber}`, 
            {
                headers: { Authorization: apiKey }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        displayPhotos(data.photos);

        // Show 'Show More' button if more results exist
        if (data.photos.length > 0) {
            showMoreBtn.style.display = "block";
        } else {
            showMoreBtn.style.display = "none";
        }
    } catch (error) {
        console.error("Error fetching photos:", error);
    }
}

// Display images
function displayPhotos(photos) {
    const fragment = document.createDocumentFragment();
    
    photos.forEach(photo => {
        const container = document.createElement("div");
        container.classList.add("image-container");

        // Create loader (spinner)
        const loader = document.createElement("div");
        loader.classList.add("loader");

        const imgElement = document.createElement("img");
        imgElement.src = photo.src.medium;
        imgElement.alt = photo.photographer;
        imgElement.classList.add("gallery-image");
        imgElement.style.display = "none"; // Hide image initially

        // Ensure loader is visible and then remove it once the image is loaded
        imgElement.onload = () => {
            loader.remove();  // Remove loader
            imgElement.style.display = "block"; // Show image
        };

        imgElement.onerror = () => {
            loader.remove(); // Hide loader if the image fails to load
        };

        imgElement.addEventListener("click", () => openLightbox(photo.src.large2x));

        const caption = document.createElement("p");
        caption.textContent = `📸 ${photo.photographer}`;
        caption.classList.add("image-caption");

        const favoriteBtn = document.createElement("button");
        favoriteBtn.textContent = favorites.includes(photo.src.medium) ? "❤️ Saved" : "🤍 Save";
        favoriteBtn.classList.add("favorite-btn");

        favoriteBtn.addEventListener("click", () => toggleFavorite(photo.src.medium, favoriteBtn));

        // Append loader first, then image (loader disappears when image loads)
        container.append(loader, imgElement, caption, favoriteBtn);
        fragment.appendChild(container);
    });

    gallery.append(fragment);
}



// Toggle favorite images
function toggleFavorite(imageUrl, button) {
    if (favorites.includes(imageUrl)) {
        favorites = favorites.filter(img => img !== imageUrl);
        button.textContent = "🤍 Save";
    } else {
        favorites.push(imageUrl);
        button.textContent = "❤️ Saved";
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Open lightbox/modal
function openLightbox(imageUrl) {
    const lightbox = document.createElement("div");
    lightbox.classList.add("lightbox");

    const img = document.createElement("img");
    img.src = imageUrl;
    img.classList.add("lightbox-img");

    const closeBtn = document.createElement("span");
    closeBtn.textContent = "✖";
    closeBtn.classList.add("close-btn");
    closeBtn.addEventListener("click", () => document.body.removeChild(lightbox));

    lightbox.append(img, closeBtn);
    document.body.appendChild(lightbox);
}

// Search button functionality
button.addEventListener("click", (e) => {
    e.preventDefault();
    searchQuery = input.value.trim();
    if (searchQuery) {
        gallery.innerHTML = ""; // Clear gallery
        page = 1; // Reset page
        fetchPhotos(searchQuery, page);
    }
});

// Load more images on "Show More" click
showMoreBtn.addEventListener("click", () => {
    page++;
    fetchPhotos(searchQuery, page);
});

// Initial fetch on page load
document.addEventListener("DOMContentLoaded", () => fetchPhotos(searchQuery));
