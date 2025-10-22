document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profile-form');
    const linksContainer = document.getElementById('links-container');
    const addLinkBtn = document.getElementById('add-link');
    const resultDiv = document.getElementById('result');
    const profileLink = document.getElementById('profile-link');
    const templateGrid = document.getElementById('template-grid');
    const selectedTemplateInput = document.getElementById('selected-template');

    // Fetch and display templates
    async function loadTemplates() {
        const response = await fetch('/api/templates');
        const templates = await response.json();

        templates.forEach(template => {
            const thumb = document.createElement('div');
            thumb.classList.add('template-thumbnail');
            thumb.dataset.templateId = template.id;
            thumb.innerHTML = `
                <img src="${template.background}" alt="${template.name}">
                <div class="name">${template.name}</div>
            `;
            templateGrid.appendChild(thumb);
        });

        // Set default selection
        const firstThumb = templateGrid.querySelector('.template-thumbnail');
        if (firstThumb) {
            firstThumb.classList.add('selected');
        }
    }

    templateGrid.addEventListener('click', (e) => {
        const thumb = e.target.closest('.template-thumbnail');
        if (thumb) {
            // Remove selection from others
            templateGrid.querySelectorAll('.template-thumbnail').forEach(t => t.classList.remove('selected'));
            // Add selection to clicked one
            thumb.classList.add('selected');
            // Update hidden input
            selectedTemplateInput.value = thumb.dataset.templateId;
        }
    });

    addLinkBtn.addEventListener('click', () => {
        const newLinkItem = document.createElement('div');
        newLinkItem.classList.add('link-item');
        newLinkItem.innerHTML = `
            <input type="text" name="linkTitle[]" placeholder="Link Title" required>
            <input type="url" name="linkUrl[]" placeholder="https://example.com" required>
        `;
        linksContainer.appendChild(newLinkItem);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            theme: formData.get('theme'), // Fallback theme
            template: formData.get('template'),
            zodiac: formData.get('zodiac'),
            links: []
        };

        const linkTitles = formData.getAll('linkTitle[]');
        const linkUrls = formData.getAll('linkUrl[]');

        for (let i = 0; i < linkTitles.length; i++) {
            data.links.push({
                title: linkTitles[i],
                url: linkUrls[i]
            });
        }

        const response = await fetch('/api/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const { id } = await response.json();
            const link = `${window.location.origin}/profile/${id}`;
            profileLink.href = link;
            profileLink.textContent = link;
            resultDiv.style.display = 'block';
            form.reset();
        } else {
            alert('Failed to create profile. Please try again.');
        }
    });

    loadTemplates();
});
