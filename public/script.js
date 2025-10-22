document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profile-form');
    const linksContainer = document.getElementById('links-container');
    const addLinkBtn = document.getElementById('add-link');
    const resultDiv = document.getElementById('result');
    const profileLink = document.getElementById('profile-link');

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
            theme: formData.get('theme'),
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
});
