// Wait until the HTML document is fully loaded
document.addEventListener('DOMContentLoaded', () => {

    const shopContainer = document.getElementById('shop-container');
    const apiKey = '6eb03bd3-7544bcce-13f935eb-5e13821e';
    const apiUrl = 'https://fortniteapi.io/v2/shop?lang=en';

    if (apiKey === 'YOUR_API_KEY_HERE') {
        shopContainer.innerHTML = '<p>Error: Please replace "YOUR_API_KEY_HERE" with your actual API key in the script.js file.</p>';
        return;
    }

    fetch(apiUrl, {
        headers: {
            'Authorization': apiKey
        }
    })
    .then(response => {
        if (response.status === 401) {
            throw new Error('Unauthorized. Is your API key correct?');
        }
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        shopContainer.innerHTML = '';
        const shopItems = data.shop;
        const groupedItems = {};
        const processedItemIds = new Set();
        
        // Pass 1: Identify all main bundles and their associated items
        shopItems.forEach(item => {
            // Group items that are part of a known set or have a common bundle name
            if (item.set?.text) {
                const groupName = item.set.text;
                if (!groupedItems[groupName]) {
                    groupedItems[groupName] = [];
                }
                groupedItems[groupName].push(item);
                processedItemIds.add(item.id);
            } else if (item.bundle?.name) {
                const groupName = item.bundle.name;
                if (!groupedItems[groupName]) {
                    groupedItems[groupName] = [];
                }
                groupedItems[groupName].push(item);
                processedItemIds.add(item.id);
            }
        });

        // Pass 2: Handle any remaining items and group them by their main type
        shopItems.forEach(item => {
            if (!processedItemIds.has(item.id)) {
                const groupName = item.mainType;
                if (!groupedItems[groupName]) {
                    groupedItems[groupName] = [];
                }
                groupedItems[groupName].push(item);
            }
        });

        // --- Rendering Loop ---
        for (const groupName in groupedItems) {
            if (groupedItems.hasOwnProperty(groupName)) {
                const groupTitle = document.createElement('h2');
                groupTitle.textContent = groupName.replace(/([A-Z])/g, ' $1').trim();
                groupTitle.className = 'category-title';
                shopContainer.appendChild(groupTitle);

                const categoryContainer = document.createElement('div');
                categoryContainer.className = 'category-container';
                
                if (groupName.toLowerCase().includes('bundle') || groupName.toLowerCase().includes('set')) {
                    categoryContainer.classList.add('bundle-category');
                }
                shopContainer.appendChild(categoryContainer);

                groupedItems[groupName].forEach(item => {
                    const itemCard = document.createElement('div');
                    itemCard.className = 'item-card';

                    const itemName = document.createElement('h3');
                    itemName.textContent = item.displayName;

                    const itemImage = document.createElement('img');
                    itemImage.src = item.displayAssets[0].url;
                    itemImage.alt = item.displayName;

                    const itemPrice = document.createElement('p');
                    itemPrice.innerHTML = `<img src="https://fortnite-api.com/images/vbuck.png" width='20' class="vbuck-icon"> ${item.price.finalPrice}`;

                    itemCard.appendChild(itemName);
                    itemCard.appendChild(itemImage);
                    itemCard.appendChild(itemPrice);

                    categoryContainer.appendChild(itemCard);
                });
            }
        }
    })
    .catch(error => {
        console.error('Error fetching Fortnite shop:', error);
        shopContainer.innerHTML = `<p>Could not load the shop. ${error.message}</p>`;
    });
});