document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('gallery-grid');
    const countEl = document.getElementById('count'); // opcional
    
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    const closeBtn = document.querySelector('.close');

    let allImages = [];
    let displayed = 0;
    const itemsPerLoad = 12;   // Puedes cambiar a 8, 16, 20, etc.

    // ==================== CARGAR JSON ====================
    try {
        const response = await fetch('data/images.json');   // ← CORREGIDO

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        allImages = await response.json();

        // Actualizar contador si existe el elemento
        if (countEl) {
            countEl.textContent = `(${allImages.length})`;
        }

        console.log(`✅ ${allImages.length} imágenes cargadas correctamente`);

        // Cargar la primera tanda de imágenes
        loadMoreImages();

    } catch (error) {
        console.error('Error cargando JSON:', error);
        grid.innerHTML = `
            <p style="color:#ff5555; text-align:center; grid-column:1/-1; padding: 4rem;">
                ⚠️ Error al cargar las imágenes.<br>
                Revisa que <strong>data/images.json</strong> exista y esté bien formado.
            </p>`;
        return;
    }

    // ==================== CREAR TARJETA ====================
    function createCard(imgData) {
        const card = document.createElement('div');
        card.className = 'card';
        
        card.dataset.src = imgData.src;
        card.dataset.title = imgData.title || 'Sin título';
        card.dataset.desc = imgData.description || '';

        card.innerHTML = `
            <img src="${imgData.src}" 
                 alt="${imgData.title || 'Imagen'}" 
                 loading="lazy">
            <div class="card-overlay">
                <h3>${imgData.title || 'Imagen sin título'}</h3>
            </div>
        `;

        // Abrir modal al hacer clic
        card.addEventListener('click', () => {
            modalImg.src = card.dataset.src;
            modalTitle.textContent = card.dataset.title;
            modalDesc.textContent = card.dataset.desc;
            modal.style.display = 'flex';
        });

        return card;
    }

    // ==================== CARGAR MÁS IMÁGENES ====================
    function loadMoreImages() {
        const toLoad = Math.min(itemsPerLoad, allImages.length - displayed);
        
        if (toLoad <= 0) return;

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < toLoad; i++) {
            const card = createCard(allImages[displayed]);
            fragment.appendChild(card);
            displayed++;
        }

        grid.appendChild(fragment);

        // Si ya mostramos todas las imágenes, podemos ocultar botón si existiera
    }

    // ==================== INFINITE SCROLL ====================
    let isLoading = false;

    window.addEventListener('scroll', () => {
        if (isLoading || displayed >= allImages.length) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        
        if (scrollTop + clientHeight >= scrollHeight - 400) {   // 400px antes del final
            isLoading = true;
            loadMoreImages();
            setTimeout(() => { isLoading = false; }, 250);
        }
    });

    // ==================== MODAL ====================
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });

    // Prevenir scroll del body cuando el modal está abierto (opcional pero recomendado)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});