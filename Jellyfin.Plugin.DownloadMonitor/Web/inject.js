(function () {
    'use strict';

    let retryCount = 0;
    const MAX_RETRIES = 30;

    function addDownloadsMenuItem() {
        const drawer = document.querySelector('.mainDrawer-scrollContainer');
        if (!drawer) {
            if (++retryCount < MAX_RETRIES) setTimeout(addDownloadsMenuItem, 500);
            return;
        }

        if (document.querySelector('#nav-downloadmonitor')) return;

        const allLinks = drawer.querySelectorAll('a');
        let moviesLink = null;

        for (let i = 0; i < allLinks.length; i++) {
            const text = (allLinks[i].textContent || '').trim().toLowerCase();
            if (text === 'movies' || text === 'films') {
                moviesLink = allLinks[i];
                break;
            }
        }

        const navItem = document.createElement('a');
        navItem.id = 'nav-downloadmonitor';
        navItem.href = '#!/configurationpage?name=Downloads';
        navItem.className = moviesLink ? moviesLink.className : 'navMenuOption navMenuOption-withIcon';

        const icon = document.createElement('span');
        icon.className = 'material-icons navMenuOption-icon';
        icon.textContent = 'download';
        icon.style.marginRight = '1em';

        const textSpan = document.createElement('span');
        textSpan.className = 'navMenuOptionText';
        textSpan.textContent = 'Downloads';

        navItem.appendChild(icon);
        navItem.appendChild(textSpan);

        if (moviesLink) {
            moviesLink.insertAdjacentElement('afterend', navItem);
        } else {
            const libraryMenu = drawer.querySelector('.libraryMenuOptions, .sidebarLinks');
            (libraryMenu || drawer).appendChild(navItem);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addDownloadsMenuItem);
    } else {
        addDownloadsMenuItem();
    }

    document.addEventListener('viewshow', function() {
        setTimeout(addDownloadsMenuItem, 100);
    });
})();
