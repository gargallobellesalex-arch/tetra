# Tetra

Matriu de prioritats 2 × 2 en 23 llengües. HTML, CSS i JavaScript estàtics. No requereix compilació, claus, fonts remotes ni base de dades.

[Obre Tetra](https://gargallobellesalex-arch.github.io/tetra/)

## Publicació

Descomprimeix el paquet i puja els fitxers a l'arrel del repositori mantenint els noms. A GitHub Pages, selecciona «Deploy from a branch», la branca que contingui els fitxers i la carpeta arrel. En altres allotjaments estàtics, publica la carpeta que conté index.html. Les rutes relatives permeten servir Tetra en un subdirectori.

## Idioma i dades

Cada llengua té una pàgina pròpia, com ara `ca.html`, `es.html` o `fr.html`. Els enllaços antics amb `?lang=fr` també funcionen. A la portada, Tetra fa servir la preferència desada o una llengua compatible del navegador. El català és l'última opció de reserva.

Codis: ca, en, es, zh (xinès simplificat), de, fr, it, pt (portuguès del Brasil), pl, ru, ar, hi, ja, ko, bn, id, ur, pcm, arz, mr, te, ha, tr.

Les tasques personals es desen al navegador per origen web. Publicar en un domini diferent crea un espai de desament diferent. El botó central de descàrrega del tauler genera un fitxer de text. Els canvis al tauler d'exemple són temporals.

Les traduccions es troben a locales.js. Per executar la web en local pots servir aquesta carpeta amb qualsevol servidor HTTP estàtic.

Després de modificar les traduccions o la plantilla, executa `node build-search-pages.mjs` per actualitzar les pàgines i `sitemap.xml`. En cas de canvi de domini o subdirectori, passa l’adreça base HTTPS acabada en `/` com a argument i actualitza l’enllaç del projecte.
