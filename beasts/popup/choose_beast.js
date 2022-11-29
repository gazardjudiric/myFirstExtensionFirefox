// on masque tout les éléments sur la page sauf ceux avec la classe beastify-image

const hidePage = `body > :not(.beastity-image) {
    display: none;
}`;

// On écoute les clicls sur les boutons et on envoie un message au script de contenu

function listenForClicks() {
    document.addEventListener("click", (e) => {

        // selon le nom de l'animal on finit l'url adéquat pour l'image correspondante

        function beastNameToURL(beastName) {
            switch (beastName) {
                case "Grenouille":
                    return browser.runtime.getURL("beasts/frog.jpg");

                case "Serpent": 
                    return browser.runtime.getURL("beasts/snake.jpg");
                    

                case "Tortue": 
                    return browser.runtime.getURL("beasts/turtle.jpg")
        
            }
        }

        //  On insère le CSS qui masque le contenu de la page dans l'onglet actif puis on récupère l'URL de la bête avant d'envoyer un message "beastify" au script de contenu dans l'onglet actif.

        function beastify(tabs) {
            browser.tabs.insertCSS({code: hidePage}).then(() => {
                let url = beastNameToURL(e.target.textContent);
                browser.tabs.sendMessage(tabs[0].id, {
                    command: "beastify",
                    beastURL: url
                });
            });
        }


        // On retire le CSS qui masque le contenu de l'onglet actif et on envoie un message "reset" au script de contenu dans l'onglet actif.

        function reset(tabs) {
            browser.tabs.removeCSS({code: hidePage}).then(() => {
                
                browser.tabs.sendMessage(tabs[0].id, {
                    command: "reset",
                });
            });
        }

        // On affiche l'erreur dans la console.

        function reportError(error) {
            console.error(`Beastify imposible : ${error}`);
        }

        //  On obtient l'onglet actif et on appelle "beastify()" ou "reset()" lorsque c'est pertinent.

        if (e.target.classList.contains("beast")) {
            browser.tabs.query({active: true, currentWindow: true})

            .then(beastify)
            .catch(reportError);
        }
        else if (e.target.classList.contains("reset")) {
            browser.tabs.query({active: true, currentWindow: true})

            .then(reset)
            .catch(reportError);
        }
    });
}

//  Lors d'une erreur d'exécution du script, on affiche le message d'erreur dans la popup et on masque l'interfaceutilisateur normale.

function reportExecuteScriptError(error) {
    document.querySelector("#popup-content").classList.add("hidden");

    document.querySelector("#error-content").classList.remove("hidden");

    console.error(`Erreur d'éxécution du script de contenu beastify: ${error.message}`);
}

// Lorsque le popup se charge, injectez un script de contenu dans l'onglet actif, et ajoutez un gestionnaire de clic. Si nous n'avons pas pu injecter le script, gérez l'erreur.

browser.tabs.executeScript({file: "../content_scripts/beastify.js"})
.then(listenForClicks)
.catch(reportExecuteScriptError);