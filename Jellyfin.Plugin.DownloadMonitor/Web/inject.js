(function () {
    'use strict';

    let retryCount = 0;
    const MAX_RETRIES = 30;

    // --- HELPER 1: Sluit het menu ---
    function closeDrawer() {
        const backdrop = document.querySelector('.mainDrawer-backdrop');
        if (backdrop) {
            backdrop.click();
        }

        document.body.classList.remove('mainDrawer-open');
        const drawer = document.querySelector('.mainDrawer');
        if (drawer) {
            drawer.classList.remove('mainDrawer-open');
        }
    }

    // --- HELPER 2: Herstel de andere pagina's (GECORRIGEERD) ---
    function restoreJellyfinViews() {
        const viewContainer = document.querySelector('.mainAnimatedPages');
        if (!viewContainer) return;

        const pages = viewContainer.querySelectorAll('.mainAnimatedPage');
        pages.forEach(p => {
            if (p.id !== 'downloadMonitorPage') {
                // VERWIJDERD: p.classList.remove('hide');
                // We halen alleen onze geforceerde style weg.
                // Jellyfin bepaalt zelf wel of er een 'hide' class op moet blijven staan.
                p.style.display = '';
                p.removeAttribute('aria-hidden');
            }
        });
    }

    function loadDownloadsPage() {
        closeDrawer();

        const viewContainer = document.querySelector('.mainAnimatedPages');
        if (!viewContainer) return;

        // 1. Verberg huidige pagina's (Override Jellyfin)
        const pages = viewContainer.querySelectorAll('.mainAnimatedPage');
        pages.forEach(p => {
            // We forceren ze onzichtbaar zolang WIJ actief zijn
            p.style.display = 'none';
            p.setAttribute('aria-hidden', 'true');
        });

        // 2. Check of pagina al bestaat
        const existingPage = document.getElementById('downloadMonitorPage');
        if (existingPage) {
            existingPage.style.display = 'block';
            existingPage.removeAttribute('aria-hidden');
            return;
        }

        // 3. Pagina bouwen
        fetch('/Plugins/DownloadMonitor/Page')
            .then(response => response.text())
            .then(html => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const newPage = tempDiv.querySelector('[data-role="page"]');

                if (newPage) {
                    newPage.id = 'downloadMonitorPage';
                    newPage.classList.add('mainAnimatedPage', 'libraryPage', 'page', 'type-interior');
                    newPage.style.display = 'block';

                    viewContainer.appendChild(newPage);

                    const scripts = newPage.querySelectorAll('script');
                    scripts.forEach(oldScript => {
                        const newScript = document.createElement('script');
                        newScript.textContent = oldScript.textContent;
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });
                }
            })
            .catch(err => console.error('Failed to load downloads page:', err));
    }

    function addDownloadsMenuItem() {
        const drawerScroll = document.querySelector('.mainDrawer-scrollContainer');
        if (!drawerScroll) {
            if (++retryCount < MAX_RETRIES) setTimeout(addDownloadsMenuItem, 500);
            return;
        }

        if (document.querySelector('#nav-downloadmonitor')) return;

        const allLinks = drawerScroll.querySelectorAll('a');
        let anchorLink = null;

        for (let i = 0; i < allLinks.length; i++) {
            const text = (allLinks[i].textContent || '').trim().toLowerCase();
            if (text.includes('movie') || text.includes('film') || text.includes('lib')) {
                anchorLink = allLinks[i];
            }
        }

        const navItem = document.createElement('a');
        navItem.id = 'nav-downloadmonitor';
        navItem.href = '#';
        navItem.className = anchorLink ? anchorLink.className : 'navMenuOption navMenuOption-withIcon';

        navItem.addEventListener('click', function(e) {
            e.preventDefault();
            loadDownloadsPage();
        });

        navItem.innerHTML = `
            <span class="material-icons navMenuOption-icon">download</span>
            <span class="navMenuOptionText">Downloads</span>
        `;

        if (anchorLink) {
            anchorLink.insertAdjacentElement('afterend', navItem);
        } else {
            const parent = drawerScroll.querySelector('.navMenuOptions') || drawerScroll;
            parent.appendChild(navItem);
        }
    }

    // --- EVENT LISTENERS ---

    document.addEventListener('viewshow', function(e) {
        const target = e.target;
        if (target && target.id !== 'downloadMonitorPage') {
            const myPage = document.getElementById('downloadMonitorPage');
            if (myPage) myPage.style.display = 'none';

            // Dit repareert nu de 'dubbele' weergave
            restoreJellyfinViews();
        }
        setTimeout(addDownloadsMenuItem, 200);
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addDownloadsMenuItem);
    } else {
        addDownloadsMenuItem();
    }
})();
