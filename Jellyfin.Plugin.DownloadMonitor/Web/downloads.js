// Downloads navigation injection
(function() {
    'use strict';

    console.log("========================================");
    console.log("Download Monitor: Plugin script LOADED!");
    console.log("========================================");

    let checkInterval = null;
    let isRunning = false;

    function addDownloadsMenuItem() {
        // Prevent multiple intervals from running simultaneously
        if (isRunning) {
            console.log("[DownloadMonitor] Already running, skipping...");
            return;
        }

        console.log("[DownloadMonitor] Attempting to add menu item...");
        isRunning = true;

        // Wait for the sidebar to be ready
        checkInterval = setInterval(function() {
            console.log("[DownloadMonitor] Checking for drawer...");

            const drawer = document.querySelector('.mainDrawer-scrollContainer');
            console.log("[DownloadMonitor] Drawer found:", !!drawer);

            if (!drawer) return;

            // Check if already added
            if (document.querySelector('#nav-downloads')) {
                console.log("[DownloadMonitor] Menu item already exists, stopping interval");
                clearInterval(checkInterval);
                checkInterval = null;
                isRunning = false;
                return;
            }

            // Find the Media section - try multiple selectors
            console.log("[DownloadMonitor] Looking for Movies link...");

            // Log all navigation items to see what's available
            const allNavItems = drawer.querySelectorAll('[class*="nav"]');
            console.log("[DownloadMonitor] Found nav items count:", allNavItems.length);
            allNavItems.forEach((item, index) => {
                console.log(`  [${index}] Class: ${item.className}, Text: ${item.textContent.trim()}`);
            });

            // Try different selectors for Movies
            const selectors = [
                '.navMenuOption-withIcon',
                '.navMenuOption',
                'a[href*="movies"]',
                'a.lnkMediaFolder',
                '.nav-item'
            ];

            let moviesLink = null;
            for (let selector of selectors) {
                console.log(`[DownloadMonitor] Trying selector: ${selector}`);
                const elements = drawer.querySelectorAll(selector);
                console.log(`  Found ${elements.length} elements`);

                for (let element of elements) {
                    const text = element.textContent.trim().toLowerCase();
                    console.log(`    Text: "${text}"`);
                    if (text === 'movies' || text === 'films' || text.includes('movie')) {
                        moviesLink = element;
                        console.log("[DownloadMonitor] ✓ Found Movies link!");
                        break;
                    }
                }
                if (moviesLink) break;
            }

            if (moviesLink) {
                clearInterval(checkInterval);
                checkInterval = null;
                isRunning = false;
                console.log("[DownloadMonitor] Creating Downloads menu item...");

                // Create the Downloads menu item - match the structure of existing items
                const downloadsLink = document.createElement('a');
                downloadsLink.id = 'nav-downloads';
                downloadsLink.className = moviesLink.className; // Copy the same classes as Movies
                downloadsLink.href = 'configurationpage?name=Downloads';

                // Try to match the icon structure
                const iconHtml = moviesLink.querySelector('[class*="icon"]') ?
                    moviesLink.querySelector('[class*="icon"]').outerHTML.replace(/[a-z_]+/i, 'file_download') :
                    '<span class="material-icons">file_download</span>';

                const textHtml = moviesLink.querySelector('[class*="text"]') ?
                    `<span class="${moviesLink.querySelector('[class*="text"]').className}">Downloads</span>` :
                    '<span>Downloads</span>';

                downloadsLink.innerHTML = iconHtml + textHtml;

                console.log("[DownloadMonitor] Downloads link HTML:", downloadsLink.outerHTML);

                // Insert after Movies
                if (moviesLink.parentNode) {
                    moviesLink.parentNode.insertBefore(downloadsLink, moviesLink.nextSibling);
                    console.log("[DownloadMonitor] ✓✓✓ Navigation item added successfully!");
                } else {
                    console.error("[DownloadMonitor] ✗ Movies link has no parent node");
                }
            } else {
                console.log("[DownloadMonitor] Movies link not found yet, will retry...");
            }
        }, 500);

        // Stop trying after 30 seconds
        setTimeout(function() {
            console.log("[DownloadMonitor] Timeout reached, stopping attempts");
            if (checkInterval) {
                clearInterval(checkInterval);
                checkInterval = null;
            }
            isRunning = false;
        }, 30000);
    }

    // Start when DOM is ready
    console.log("[DownloadMonitor] Document ready state:", document.readyState);
    if (document.readyState === 'loading') {
        console.log("[DownloadMonitor] Waiting for DOMContentLoaded...");
        document.addEventListener('DOMContentLoaded', function() {
            console.log("[DownloadMonitor] DOMContentLoaded fired!");
            addDownloadsMenuItem();
        });
    } else {
        console.log("[DownloadMonitor] DOM already loaded, adding menu immediately");
        addDownloadsMenuItem();
    }

    // Also try when view changes
    document.addEventListener('viewshow', function(e) {
        console.log("[DownloadMonitor] viewshow event fired, view:", e.target.id);
        setTimeout(addDownloadsMenuItem, 100);
    });

    // Try on page change events as well
    document.addEventListener('pageshow', function(e) {
        console.log("[DownloadMonitor] pageshow event fired");
        setTimeout(addDownloadsMenuItem, 100);
    });

    console.log("[DownloadMonitor] Event listeners registered");
})();
