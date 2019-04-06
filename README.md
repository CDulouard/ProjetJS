# TP SevenWonder

Ce TP a pour but la création d'une classe de gestion d'une cité, et de son fichier de test associé.

## City.js
### Initialisation

Ce fichier gère la cité et ses habitants. Il requiert une classe divinity et un émetteur d'événements, importés dans l'en-tête du fichier.
```js
const EventEmitter = require('events');
const {Divinity} = require('./divinity');
```

Le constructeur prend en paramètre 3 valeurs :
  - le nom de la cité *name*
  - le nom de la divinité associée *associatedDivinity*
  - le facteur de temps (optionnel) *timeFactor*, initialisé à 10 par défaut
```js
constructor(name, associatedDivinity, timeFactor){
  ...
}
```
Une cité est initialisée avec les paramètres suivants :
  - 10 de population
  - 100 de blé (Corn)
  - 100 d'or (Gold)
  - un facteur de croissnce *growthFactor* = 1 (qui ne peut évoluer pour le moment)
  - 15 points de bonheur
  - 10 points de science
  - 10 points d'économie
  - 1 scientifique
  - 1 marchand
  - 0 troupes (3 soldats)
  - quelques ressources supplémentqires
  - un Dieu avec un facteur de temps 100 fois supérieur
```js
this.name_ = name || 'Farmer Village';
this.timeFactor_ = timeFactor || 10;

this.population_ = 10;
this.gold_ = 100;
this.corn_ = 100;
this.growthFactor_ = 1;
this.hapiness_ = 15;
this.science_ = 10;
this.business_ = 10;
this.soldiers_ = [];
this.scientist_ = 1;
this.merchant_ = 1;
this.localRessources_ = {
  diamond: [0, 0],
  iron: [0, 2],
  lapis: [0, 0],
  horses: [0, 1]
};

this.god_ = new Divinity(
  associatedDivinity || this.name_ + ' divinity',
  this.timeFactor_ * 100
);

this.worldEvents = new EventEmitter();
```
### Mutateurs
Ce fichier contient trois mutateurs :
  - Mutateur d'or
  - Mutateur de blé
  - Mutateur de population
  
Ces mutateurs prennent en paramètre une valeur numérique qui peut être négative. Si la valeur est négative et supérieure à la quantité actuelle de ressource, ladite ressource est  bloquée à 0.
*Exemple avec le mutateur d'or*
```js
addGold(qt) {
  return new Promise((resolve, reject) => {
    if (typeof qt === 'number') {
      if (this.gold_ + qt > 0) {
        this.gold_ += qt;
      } else {                      //If qt is too big and negative
        this.gold_ = 0;
      }

      resolve();
    } else {
      reject(new Error('Wrong parameter type'));
    }
  });
}
```
Une particularité concerne le mutateur de population : le nombre de rôles (soldat, scientifique, marchand) ne peut dépasser le nombre d'habitants. Si cela arrive, des rôles sont supprimés aléatoirement jusqu'à ce que tout rentre dans l'ordre.
```js
while (
  this.population_ <
  this.scientist_ + this.merchant_ + 3 * this.soldiers_.length
) {
  // Random kills if too many
  if (Math.random() < 0.7 && this.soldiers_.length > 0) {
    clearTimeout(this.soldiers_[this.soldiers_.length - 1]);
    this.soldiers_.pop();
  } else if (Math.random() > 0.5 && this.merchant_ > 0) {
    this.merchant_--;
    this.business_--;
  } else if (this.scientist_ > 0) {
    this.science_--;
    this.scientist_--;
  }
}
```
### Accesseurs
Les valeurs suivantes peuvent être accédées :
  - Population
  - Or
  - Blé
  - Nombre de marchands
  - Nombre de scientifiques
  - Soldats (renvoie un tableau de setTimeout, cf section fonctions d'enrôlement)
  - Dieu (renvoie le nom de la divinité associée)
### Fonctions d'enrôlement
Les fonctions d'enrolement permettent de convertir des citoyens à un rôle spécifique : marchand, scientifique ou soldat (groupes de 3). Chaque rôle a un coût :
  - Les scientifiques coûtent 40 de blé
  - Les marchands coûtent 40 d'or
  - Une garnison de 3 soldats coûte 30 de blé et 30 d'or.

Chaque enrôleur vérifie au préalable que le nombre de ressources nécessaire est disponible, et renvoie un message d'erreur sinon, en indiquant les ressources disponibles comparées aux ressources nécessaires.
```js
convertToScientist() {
  return new Promise((resolve, reject) => {
    //If enough ressources
    if (
      this.population_ >
        this.scientist_ + this.soldiers_.length * 3 + this.merchant_ &&
      this.corn_ > 40
    ) {
      this.scientist_++;
      this.science_++;
      this.corn_ -= 40;
      resolve();
    } else {
      reject(
        new Error(
          `Not enough ressources. You need 1 population and 40 corn. Current population available : ${
            this.population_
          }. Current corn : ${this.corn_}.`
        )
      );
    }
  });
}
```
Une troupe de soldats rendand l'âme passés quelques années (cycles de jeu), la création d'une nouvelle troupe ajoutera un *setTimeout* à un tableau spécifique, qui s'autodétruira passé le délai. Une fonction encore non implémentée doit permettre, en cas de guerre par exemple, de tuer une troupe spécifique via la méthode *clearTimeout*, et *splice* (suppression d'une cellule intermédiaire d'un tableau).
*Ajout d'un nouveau soldat*
```js
// Set death after certain time (only 4 cycles here to avoid timeout in tests)
this.soldiers_.push(
  setTimeout(() => {
    this.soldiers_.splice(pos, 1);
    this.worldEvents.emit('soldierDeath', {
      soldiers: this.soldiers_.length
    });
  }, this.timeFactor_ * 4)
);
```
### Commerce
La fonction commerce permet d'envoyer un marchand disponible dans la nature, pendant 4 cycles, chargé de victuailles.
Cette fonction prend en paramètre un objet, similaire à celui instancié dans le paramètre *localRessources* (cf constructeur).
Par exemple, pour envoyer un marchand avec un cheval et un item de fer :
```js
g = new City(...);
...
const items = {
  iron: 1,
  horses: 1
};
g.commerceWithOther(items);
```
Ainsi, si la cité possède la quantité de ressource à envoyer, elle sera retirée de ses possession, mais augmentera ses chances de voir le marchand revenir les mains pleines. Chaque ressource envoyer augmentera une variable *increase*, qui diminuera le seuil aléatoire à partir duquel le marchand peut espérer recevoir quelque chose en retour.
*Vérifie que l'objet est possédé en quantités suffisantes et le retire de la liste des possessions de la ville*
```js
let increase = 0;
const props = Object.getOwnPropertyNames(items);

// The more you give the more you get
for (const item in props) {
  if (
    Object.prototype.hasOwnProperty.call(
      this.localRessources_,
      props[item]
    ) &&
    this.localRessources_[item] >= items[item]
  ) {
    this.localRessources_[item] -= items[item];
    increase += items[item];
  }
}
```
*Algorithme aléatoire déterminant ce que la cité recevra en retour de son don*
*On reçoit soit 3, soit 2, soit 1, soit rien du tout de la ressource prop*
```js
const chances = Math.random();
if (chances > 0.9 - increase / 10) {
  this.localRessources_[prop][0] += 3;
} else if (chances > 0.8 - increase / 10) {
  this.localRessources_[prop][0] += 2;
} else if (chances > 0.7 - increase / 10) {
  this.localRessources_[prop][0] += 1;
}
```
Un marchand peut mourir. Dans ce cas, la population diminue d'un membre, perd un point d'économie et voit son bonheur diminuer d'un point.
*Note : le marchand est supprimé le temps de son voyage, mais compte toujours dans la population.*
```js
this.population_--;
this.business_--;
this.hapiness_--;
alive = false;
```
À son départ, un marchand émet un événement *commerceEngaged*, et un événement *hasCommerce* à son retour.
```js
// Merchant left
this.worldEvents.emit('commerceEngaged', {
  population: this.population_,
  merchant: this.merchant_
});
```
```js
this.worldEvents.emit('hasCommerce', {
  alive: alive,
  population: this.population_,
  merchant: this.merchant_
});
```
## Licence
[MIT](https://choosealicense.com/licenses/mit/)
