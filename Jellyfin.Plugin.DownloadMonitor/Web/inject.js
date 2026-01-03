(function () {
    'use strict';

    console.log("[DownloadMonitor] Inject script loaded! ✓");

    let retryCount = 0;
    const MAX_RETRIES = 30;

    function addDownloadsMenuItem() {
        console.log("[DownloadMonitor] Attempting to add menu item (attempt " + (retryCount + 1) + ")");
        
        const drawer = document.querySelector('.mainDrawer-scrollContainer');
        
        if (!drawer) {
            retryCount++;
            if (retryCount < MAX_RETRIES) {
                setTimeout(addDownloadsMenuItem, 500);
            } else {
                console.error("[DownloadMonitor] Could not find sidebar after 15 seconds");
            }
            return;
        }
        
        if (document.querySelector('#nav-downloadmonitor')) {
            console.log("[DownloadMonitor] Menu item already exists");
            return;
        }

        console.log("[DownloadMonitor] Sidebar found, adding menu item...");
        
        // Log the sidebar structure to help debug
        console.log("[DownloadMonitor] Sidebar HTML structure:");
        const sections = drawer.querySelectorAll('.sidebarHeader, .navMenuOption, a');
        sections.forEach(function(el, i) {
            console.log("[DownloadMonitor] " + i + ": " + el.tagName + " class=" + el.className + " text=" + (el.textContent || '').trim().substring(0, 20));
        });
        
        // Find the Movies link and its parent container
        const allLinks = drawer.querySelectorAll('a');
        let moviesLink = null;
        
        for (let i = 0; i < allLinks.length; i++) {
            const text = (allLinks[i].textContent || '').trim().toLowerCase();
            
            // Find Movies link by text content
            if (text === 'movies' || text === 'films') {
                moviesLink = allLinks[i];
                console.log("[DownloadMonitor] Found Movies link! Parent: " + moviesLink.parentNode.className);
                break;
            }
        }
        
        // Create Downloads menu item from scratch (don't clone to avoid duplicate icons)
        const navItem = document.createElement('a');
        navItem.id = 'nav-downloadmonitor';
        navItem.href = '#!/configurationpage?name=Downloads';
        
        // Copy class from Movies link if found
        if (moviesLink) {
            navItem.className = moviesLink.className;
        } else {
            navItem.className = 'navMenuOption navMenuOption-withIcon';
        }
        
        // Create icon element
        const icon = document.createElement('span');
        icon.className = 'material-icons navMenuOption-icon';
        icon.textContent = 'download';
        icon.style.marginRight = '1em';
        
        // Create text element  
        const textSpan = document.createElement('span');
        textSpan.className = 'navMenuOptionText';
        textSpan.textContent = 'Downloads';
        
        navItem.appendChild(icon);
        navItem.appendChild(textSpan);
        
        // Insert after Movies - use insertAdjacentElement for better placement
        if (moviesLink) {
            moviesLink.insertAdjacentElement('afterend', navItem);
            console.log("[DownloadMonitor] ✓ Menu item added after Movies!");
        } else {
            // Fallback: find the libraryMenuOptions div or sidebarLinks
            const libraryMenu = drawer.querySelector('.libraryMenuOptions, .sidebarLinks, div[class*="library"]');
            if (libraryMenu) {
                libraryMenu.appendChild(navItem);
                console.log("[DownloadMonitor] ✓ Menu item added to library section");
            } else {
                drawer.appendChild(navItem);
                console.log("[DownloadMonitor] ✓ Menu item appended (Movies not found)");
            }
        }
    }

    // Start injection when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addDownloadsMenuItem);
    } else {
        addDownloadsMenuItem();
    }
    
    // Also try on page load
    window.addEventListener('load', function() {
        setTimeout(addDownloadsMenuItem, 1000);
    });
    
    // Watch for navigation changes (Jellyfin SPA)
    document.addEventListener('viewshow', function() {
        setTimeout(addDownloadsMenuItem, 100);
    });
    
    console.log("[DownloadMonitor] Inject script initialized ✓");
})();
