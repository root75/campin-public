# dns — liste de blocage des labos

`blocklist.txt` est la liste de blocage des labos informatiques, au format AdGuard.
Les deux serveurs AdGuard Home y sont abonnés par cette adresse :

    https://raw.githubusercontent.com/root75/campin-public/main/dns/blocklist.txt

- `||exemple.com^$important` bloque un domaine et ses sous-domaines.
- `@@||exemple.com^$important` l'autorise malgré une autre règle.
- Une ligne qui commence par `!` est un commentaire.

Une modification fusionnée dans `main` est prise en compte par les serveurs à leur
prochaine mise à jour des listes (une heure au plus), ou tout de suite si on la force.
Ce dépôt est public : aucun nom d'élève ni de classe dans les commentaires.
