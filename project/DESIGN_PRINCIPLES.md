# Mundravax — Design Principles

> **Document:** Core Design Principles  
> **Status:** Foundational  
> **Project:** Mundravax  
> **Purpose:** Define the rules that should guide every major product, gameplay and technical decision.

---

# 1. Pourquoi ce document existe

Mundravax possède une vision volontairement très large.

À terme, le monde pourrait contenir :

- entreprises ;
- métiers ;
- banques ;
- immobilier ;
- villes ;
- institutions ;
- écoles ;
- Internet interne ;
- programmation ;
- enquêtes ;
- agents IA ;
- économie persistante ;
- contenus communautaires.

Cette ambition crée un risque :

> **ajouter énormément de fonctionnalités sans construire un bon jeu.**

`DESIGN_PRINCIPLES.md` définit donc les règles fondamentales permettant de décider ce qui appartient réellement à Mundravax.

Une fonctionnalité techniquement impressionnante peut être refusée si elle affaiblit ces principes.

---

# 2. Principe n°1 — Fun First

> **Mundravax est un jeu avant d'être un outil éducatif.**

Le joueur doit revenir parce qu'il veut savoir :

- si son entreprise survivra ;
- si son investissement fonctionnera ;
- s'il réussira sa négociation ;
- ce qui s'est passé pendant son absence ;
- comment résoudre une enquête ;
- si son équipe remportera un challenge ;
- comment le monde évolue.

Il ne doit pas revenir principalement parce que :

> « Je dois terminer ma leçon quotidienne. »

L'apprentissage doit émerger naturellement du gameplay.

---

# 3. Ne jamais gamifier un cours

Mundravax ne doit pas devenir :

```text
Watch Lesson
    ↓
Answer Quiz
    ↓
+50 XP
    ↓
Unlock Lesson 2
```

Ajouter :

- XP ;
- niveaux ;
- badges ;
- animations ;
- récompenses ;

à une formation classique ne suffit pas à créer un jeu.

Mundravax doit partir d'un **problème intéressant**.

```text
Problem
    ↓
Need to understand
    ↓
Experiment
    ↓
Decision
    ↓
Consequence
    ↓
Learning
```

---

# 4. Créer le besoin avant d'apporter la connaissance

Une notion doit idéalement apparaître lorsque le joueur en ressent le besoin.

Exemple :

Ne pas commencer par :

> « Le BFR correspond à... »

Créer d'abord la situation :

> Votre entreprise est rentable mais ne possède plus suffisamment de trésorerie pour payer ses salariés.

Le joueur se demande :

> Pourquoi ?

À cet instant, apprendre le BFR devient utile.

---

# 5. Les connaissances sont des outils

Dans Mundravax :

> **SQL n'est pas un exercice.**

SQL permet de résoudre une enquête.

> **Python n'est pas un exercice.**

Python permet d'analyser un problème.

> **La comptabilité n'est pas un exercice.**

Elle permet de comprendre pourquoi l'entreprise perd de l'argent.

> **La négociation n'est pas un exercice.**

Elle permet d'obtenir un meilleur contrat.

La connaissance doit donner du **pouvoir d'action**.

---

# 6. Les problèmes avant les solutions

Lorsque cela est raisonnable, Mundravax ne doit pas immédiatement expliquer quoi faire.

Le joueur doit pouvoir :

1. observer ;
2. formuler une hypothèse ;
3. rechercher ;
4. tester ;
5. échouer ;
6. corriger ;
7. comprendre.

Un mentor IA peut aider.

Mais il ne doit pas systématiquement transformer chaque problème en tutoriel guidé.

---

# 7. L'échec fait partie du gameplay

Échouer ne signifie pas nécessairement perdre.

Une entreprise peut faire faillite.

Une négociation peut échouer.

Un investissement peut perdre de l'argent.

Une analyse peut être incorrecte.

Une équipe peut prendre une mauvaise décision.

Mundravax doit aider le joueur à comprendre :

> **Pourquoi ?**

---

# 8. Expliquer les conséquences

Lorsque le joueur échoue, Mundravax doit autant que possible pouvoir reconstruire la chaîne causale.

Exemple :

```text
Rapid Growth
    ↓
Inventory Increase
    ↓
Cash Requirement
    ↓
Customer Payment Delay
    ↓
Short-Term Borrowing
    ↓
Interest Increase
    ↓
Liquidity Crisis
    ↓
Bankruptcy
```

L'objectif n'est pas simplement :

> « Mauvaise décision. »

Mais :

> « Voilà comment tes décisions ont progressivement créé cette situation. »

---

# 9. Pas de bonne réponse universelle

Mundravax doit éviter de devenir un jeu où chaque situation possède une solution optimale prédéterminée.

Une décision peut dépendre :

- du contexte ;
- du marché ;
- du moment ;
- des ressources ;
- des concurrents ;
- de la stratégie ;
- du risque accepté.

Deux joueurs peuvent résoudre le même problème différemment.

---

# 10. Les décisions doivent avoir des conséquences

Une décision importante ne doit pas être cosmétique.

Si le joueur :

- baisse ses prix ;
- recrute ;
- emprunte ;
- construit ;
- investit ;
- licencie ;
- négocie ;
- achète une entreprise ;

le monde doit réagir.

Une décision sans conséquence significative perd rapidement son intérêt.

---

# 11. Les conséquences peuvent être différées

Toutes les conséquences ne doivent pas apparaître immédiatement.

Une décision peut sembler excellente aujourd'hui et devenir problématique plus tard.

Exemple :

```text
Cheap Loan
   ↓
Fast Expansion
   ↓
Higher Fixed Costs
   ↓
Economic Downturn
   ↓
Debt Problem
```

Cela permet de créer de véritables histoires.

---

# 12. Le monde est la source des histoires

Mundravax ne doit pas dépendre uniquement de scénaristes.

Les systèmes doivent pouvoir produire des situations émergentes.

```text
Systems
   +
Players
   +
Agents
   +
Time
   ↓
Stories
```

---

# 13. Un événement, plusieurs gameplays

Un événement important devrait idéalement affecter plusieurs professions.

Exemple :

## Faillite d'une grande entreprise

**Banquier**

Perte sur les crédits.

**Investisseur**

Perte de capital.

**Consultant**

Mission de restructuration.

**Journaliste**

Enquête.

**Police**

Suspicion de fraude.

**Concurrent**

Opportunité d'acquisition.

**Employé**

Recherche d'un nouvel emploi.

**Gouvernement**

Hausse du chômage.

Un monde interconnecté produit naturellement du contenu.

---

# 14. Les systèmes doivent communiquer

Les fonctionnalités de Mundravax ne doivent pas devenir des mini-jeux indépendants.

```text
Website
   ↓
Sales
   ↓
Inventory
   ↓
Accounting
   ↓
Bank
   ↓
Taxes
```

Chaque système doit, lorsque cela a du sens, produire ou consommer des informations provenant des autres.

---

# 15. La simulation est la source de vérité

C'est l'un des principes techniques les plus importants.

> **Le LLM n'est jamais la base de données du monde.**

Le moteur de simulation connaît :

- argent ;
- entreprises ;
- propriétés ;
- stocks ;
- contrats ;
- employés ;
- transactions ;
- territoires ;
- événements.

Un agent IA ne peut pas décider arbitrairement :

> « Votre entreprise possède maintenant 3 millions. »

---

# 16. L'IA interprète, elle ne réécrit pas la réalité

Architecture conceptuelle :

```text
World State
    ↓
Agent Context
    ↓
AI Reasoning
    ↓
Proposed Action
    ↓
Rules Engine
    ↓
Validated Action
    ↓
New World State
```

L'IA peut proposer.

Le moteur valide.

---

# 17. Les agents doivent avoir des limites

Un agent ne doit pas être omniscient.

Un banquier connaît ce qu'un banquier pourrait raisonnablement connaître.

Un salarié possède certaines informations.

Un journaliste doit enquêter.

Un investisseur peut se tromper.

Un maire possède des objectifs et contraintes.

Cela permet :

- incertitude ;
- asymétrie d'information ;
- négociation ;
- enquête ;
- stratégie.

---

# 18. Les agents doivent pouvoir se tromper

L'IA ne doit pas représenter une intelligence parfaite.

Les agents peuvent :

- mal interpréter ;
- hésiter ;
- prendre de mauvaises décisions ;
- être trop prudents ;
- être trop optimistes.

Dans les limites nécessaires au gameplay et à la cohérence.

---

# 19. Les agents ont des intérêts

Un personnage ne doit pas simplement attendre que le joueur lui parle.

Il peut posséder :

- objectifs ;
- ressources ;
- contraintes ;
- relations ;
- préférences ;
- tolérance au risque.

Une négociation devient intéressante lorsque les deux parties veulent quelque chose.

---

# 20. Pas de bouton magique de persuasion

Mundravax doit limiter les mécaniques du type :

```text
[Persuade +20]
```

Lorsque la communication constitue le cœur de la situation, le joueur doit réellement formuler son argument.

Le système peut analyser :

- proposition ;
- pertinence ;
- données utilisées ;
- concessions ;
- crédibilité ;
- intérêt économique.

---

# 21. La communication est une compétence

Le joueur doit pouvoir progresser naturellement en :

- argumentation ;
- négociation ;
- présentation ;
- synthèse ;
- leadership ;
- communication professionnelle.

Ces compétences doivent avoir une utilité concrète dans le monde.

---

# 22. Information imparfaite

Le joueur ne doit pas toujours disposer de toutes les informations.

Il peut devoir :

- rechercher ;
- demander ;
- analyser ;
- enquêter ;
- acheter une étude ;
- consulter un expert.

L'information elle-même peut avoir de la valeur.

---

# 23. Le monde doit pouvoir surprendre

Un monde totalement prévisible devient rapidement un tableur.

Mundravax doit contenir :

- incertitude ;
- changements ;
- réactions ;
- événements ;
- comportements émergents.

Mais :

> **imprévisible ne signifie pas arbitraire.**

Les événements doivent rester compréhensibles dans les règles du monde.

---

# 24. Réalisme fonctionnel plutôt que réalisme absolu

Mundravax ne cherche pas à reproduire chaque détail du monde réel.

Le réalisme est utile lorsqu'il améliore :

- les décisions ;
- les conséquences ;
- l'immersion ;
- l'apprentissage.

Il devient nuisible lorsqu'il produit uniquement de la complexité administrative.

---

# 25. Simplifier sans mentir

Une mécanique peut être simplifiée.

Mais sa logique fondamentale doit rester correcte.

Par exemple, une comptabilité simplifiée peut être acceptable.

Une comptabilité qui apprend volontairement un principe faux ne l'est pas.

---

# 26. Complexité progressive

Le joueur ne doit pas commencer avec :

- 80 indicateurs ;
- 14 logiciels ;
- fiscalité internationale ;
- consolidation ;
- gestion de change ;
- 300 salariés.

La complexité doit apparaître progressivement.

```text
Small Business
    ↓
Employees
    ↓
Accounting
    ↓
Financing
    ↓
Expansion
    ↓
International
    ↓
Group
```

La croissance du joueur crée naturellement le besoin de nouveaux outils.

---

# 27. Les outils sont aussi une récompense

Débloquer un nouveau logiciel peut être plus intéressant que recevoir simplement +500 XP.

Exemple :

> Votre entreprise grandit suffisamment pour nécessiter un CRM.

Le joueur découvre alors un nouvel outil.

La progression ouvre de nouvelles possibilités.

---

# 28. Pas de grind artificiel

Mundravax ne doit pas forcer :

> « Effectuez 200 ventes identiques pour atteindre le niveau suivant. »

La répétition n'est acceptable que lorsqu'elle crée :

- maîtrise ;
- optimisation ;
- stratégie ;
- automatisation.

Sinon elle doit être réduite.

---

# 29. Automatiser ce que le joueur maîtrise

Une mécanique intéressante au début peut devenir répétitive plus tard.

Le joueur doit pouvoir progressivement :

- déléguer ;
- recruter ;
- automatiser ;
- acheter un logiciel ;
- utiliser un agent.

La progression permet de passer :

> faire → comprendre → optimiser → déléguer.

---

# 30. L'économie doit avoir des causes

L'argent ne doit pas apparaître sans raison.

Une entreprise gagne de l'argent parce que :

- quelqu'un achète ;
- un contrat est exécuté ;
- un actif produit une valeur ;
- un investissement rapporte.

L'économie doit autant que possible conserver une logique de flux.

---

# 31. La richesse doit créer des possibilités, pas terminer le jeu

Devenir riche ne doit pas supprimer le gameplay.

La richesse ouvre :

- acquisitions ;
- immobilier ;
- investissement ;
- banques ;
- infrastructures ;
- développement territorial ;
- influence ;
- philanthropie ;
- projets gigantesques.

L'endgame doit devenir différent, pas simplement plus facile.

---

# 32. Le pouvoir doit créer des responsabilités

Plus un joueur contrôle :

- capital ;
- entreprises ;
- emplois ;
- infrastructures ;

plus ses décisions peuvent avoir des conséquences importantes.

Le pouvoir économique devient ainsi une nouvelle source de gameplay.

---

# 33. Pas de pay-to-win

L'argent réel ne doit pas permettre d'acheter directement :

- domination économique ;
- compétences ;
- victoire ;
- avantages impossibles à obtenir normalement.

Un joueur ne doit jamais pouvoir acheter sa réussite dans Mundravax.

---

# 34. Le sponsoring doit ajouter du gameplay

Une entreprise partenaire ne doit pas interrompre le joueur avec une publicité.

Elle peut financer :

- scénario ;
- challenge ;
- compétition ;
- environnement ;
- contenu pédagogique.

Principe :

> **Sponsor the experience. Don't interrupt it.**

---

# 35. Une marque réelle ne doit jamais dégrader le monde

Un scénario sponsorisé doit être intéressant même si le joueur ne connaît pas l'entreprise.

Le gameplay vient avant le message marketing.

---

# 36. Les opportunités réelles doivent rester optionnelles

Si Mundravax propose un jour :

- recrutement ;
- stages ;
- networking ;
- événements ;

cela doit rester :

- volontaire ;
- transparent ;
- contrôlable par le joueur.

Mundravax ne doit pas devenir une machine de collecte de profils professionnels.

---

# 37. Le jeu ne doit pas devenir LinkedIn

Les relations doivent principalement émerger de l'action.

> « Nous avons construit une entreprise ensemble. »

est plus intéressant que :

> « Nous sommes connectés. »

Les systèmes sociaux doivent favoriser :

- collaboration ;
- projets ;
- équipes ;
- challenges ;
- réalisations communes.

---

# 38. La réputation doit être gagnée

Une réputation pertinente doit provenir d'actions observables.

Pas simplement :

```text
Played 800 hours = Expert
```

Le temps de jeu n'est pas automatiquement une compétence.

---

# 39. Protéger les nouveaux joueurs

Une économie persistante peut naturellement favoriser les anciens joueurs.

Il faudra éviter qu'un nouveau joueur arrive dans un monde où :

> 12 milliardaires possèdent absolument tout.

Des mécanismes devront préserver :

- mobilité économique ;
- nouvelles opportunités ;
- concurrence ;
- innovation ;
- renouvellement.

---

# 40. Éviter la concentration irréversible

Les monopoles peuvent être intéressants comme phénomènes économiques.

Mais ils ne doivent pas détruire définitivement le gameplay.

Le monde peut réagir via :

- concurrence ;
- innovation ;
- réglementation ;
- changements technologiques ;
- crises ;
- nouveaux marchés.

---

# 41. Les joueurs doivent pouvoir créer

La longévité de Mundravax dépendra en partie de la créativité des joueurs.

Ils doivent progressivement pouvoir créer :

- entreprises ;
- services ;
- sites ;
- stratégies ;
- organisations ;
- scénarios ;
- éventuellement applications.

> **Players are not only consumers of content.**

---

# 42. La communauté peut devenir créatrice de contenu

À terme, des outils doivent permettre de produire :

- scénarios ;
- enquêtes ;
- challenges ;
- métiers ;
- extensions.

Cela permet au contenu de croître plus rapidement que l'équipe centrale.

---

# 43. Les créations communautaires doivent rester sûres

L'ouverture nécessite :

- permissions ;
- sandboxing ;
- validation ;
- modération ;
- isolation.

Un scénario communautaire ne doit pas pouvoir compromettre la machine d'un joueur ou le serveur.

---

# 44. Les scénarios et le monde persistant sont complémentaires

Les scénarios permettent :

- narration précise ;
- apprentissage ciblé ;
- challenges ;
- écoles.

Le monde persistant permet :

- émergence ;
- liberté ;
- conséquences ;
- histoire.

Mundravax doit pouvoir utiliser les deux.

---

# 45. Une carrière est un gameplay, pas un skin

Ajouter « Data Engineer » ne signifie pas :

> changer l'icône du joueur.

Cela signifie créer des problèmes spécifiques :

- pipelines ;
- données ;
- incidents ;
- architecture ;
- communication métier.

Même principe pour :

- banquier ;
- journaliste ;
- enquêteur ;
- consultant ;
- développeur.

---

# 46. Chaque métier doit avoir une fantasy claire

Question :

> **Qu'est-ce qui rend ce métier amusant à jouer ?**

Pour un enquêteur :

> découvrir ce que les autres n'ont pas vu.

Pour un entrepreneur :

> transformer une idée en organisation.

Pour un investisseur :

> identifier ce qui aura de la valeur demain.

Pour un Data Engineer :

> comprendre et réparer des systèmes de données complexes.

La mécanique doit servir cette fantasy.

---

# 47. Le monde physique doit servir le gameplay

Les villes, bâtiments et territoires ne doivent pas être uniquement décoratifs.

Ils permettent :

- immobilier ;
- transport ;
- industrie ;
- commerce ;
- ressources ;
- tourisme ;
- développement.

Chaque élément géographique important doit idéalement avoir une fonction systémique.

---

# 48. Ne pas construire un deuxième jeu inutilement

Mundravax n'a pas besoin de devenir simultanément :

- GTA ;
- Minecraft ;
- SimCity ;
- Civilization ;
- Call of Duty.

Une guerre n'impose pas de développer un FPS.

Un bâtiment n'impose pas de permettre de poser chaque brique.

Une ville n'impose pas un city-builder complet.

Toujours choisir **le niveau d'abstraction qui sert Mundravax**.

---

# 49. Le temps du joueur est précieux

Mundravax doit respecter les joueurs qui disposent de :

- 15 minutes ;
- 1 heure ;
- plusieurs heures.

Le monde persistant ne doit pas transformer l'absence en punition permanente.

---

# 50. Le monde peut évoluer sans détruire le joueur absent

La persistance doit créer :

> « Qu'est-ce qui s'est passé ? »

et non systématiquement :

> « Je n'ai pas joué pendant trois jours, donc tout ce que j'avais construit est détruit. »

---

# 51. L'histoire doit être mémorable

Les événements importants peuvent être archivés.

Les joueurs doivent pouvoir se souvenir :

> « J'étais là pendant cette crise. »

> « Notre groupe a construit cette ville. »

> « Cette entreprise existait avant la grande récession. »

L'histoire donne une identité au monde.

---

# 52. Les actions importantes doivent laisser des traces

Une grande entreprise, une ville ou un événement peut continuer à exister dans :

- archives ;
- journaux ;
- statistiques ;
- bâtiments ;
- institutions ;
- mémoire collective.

Cela donne du sens aux accomplissements.

---

# 53. International dès la conception

Mundravax doit pouvoir représenter différentes réalités économiques et culturelles.

Il ne doit pas supposer qu'une seule économie occidentale représente le monde entier.

Cela concerne notamment :

- marchés ;
- infrastructures ;
- financement ;
- agriculture ;
- urbanisation ;
- commerce ;
- monnaies.

---

# 54. L'Afrique ne doit pas être un DLC exotique

Les économies africaines doivent pouvoir faire partie naturellement du monde et de ses inspirations.

Elles peuvent produire des gameplays extrêmement riches autour de :

- entrepreneuriat ;
- logistique ;
- fintech ;
- agriculture ;
- énergie ;
- urbanisation ;
- commerce régional ;
- industrie.

---

# 55. L'accessibilité avant l'élitisme

Le joueur ne doit pas avoir besoin d'un MBA ou d'un diplôme d'ingénieur pour commencer.

Mundravax doit permettre :

> commencer simplement → rencontrer un problème → apprendre → progresser.

---

# 56. Mais ne pas niveler la profondeur

Accessible ne signifie pas superficiel.

Un joueur expérimenté doit pouvoir progressivement rencontrer des systèmes beaucoup plus complexes.

Le jeu peut être :

> simple à commencer, difficile à maîtriser.

---

# 57. Les données doivent pouvoir être inspectées

Dans un jeu basé sur le raisonnement, le joueur doit pouvoir comprendre suffisamment le monde pour prendre des décisions.

Les informations pertinentes doivent pouvoir être découvertes via :

- dashboards ;
- documents ;
- bases ;
- rapports ;
- conversations ;
- recherches.

Le joueur ne doit pas perdre uniquement parce que le système lui cachait arbitrairement une règle.

---

# 58. L'interface fait partie du monde

Les outils de Mundravax ne sont pas uniquement une couche UI.

Mail, navigateur, banque, terminal ou CRM sont des objets de gameplay.

L'interface doit donner l'impression :

> **d'utiliser les outils nécessaires à son métier.**

---

# 59. La technique doit servir la simulation

Rust, IA, agents, réseau, bases de données ou génération procédurale ne constituent pas le produit.

Une technologie doit être utilisée parce qu'elle permet :

- meilleur gameplay ;
- simulation plus cohérente ;
- meilleure extensibilité ;
- meilleure expérience.

Pas uniquement parce qu'elle est techniquement intéressante.

---

# 60. Construire des systèmes avant de construire une quantité de contenu

Lorsque possible :

> 1 système produisant 100 situations

est préférable à :

> 100 situations entièrement codées séparément.

C'est essentiel pour la capacité de Mundravax à évoluer continuellement.

---

# 61. Construire petit, concevoir grand

La vision peut être immense.

L'implémentation doit rester progressive.

```text
Vision
████████████████████████████████

Current implementation
██
```

Ce n'est pas un problème.

Le premier prototype n'a pas besoin de simuler une civilisation.

Il doit simplement prouver que **le cœur du gameplay est amusant**.

---

# 62. Chaque grande fonctionnalité doit répondre à quatre questions

Avant d'intégrer une fonctionnalité importante :

### 1. Quel problème ou quelle possibilité apporte-t-elle ?

### 2. Quelle décision intéressante crée-t-elle ?

### 3. Avec quels systèmes existants interagit-elle ?

### 4. Pourquoi le joueur aura-t-il envie de l'utiliser ?

Si les réponses sont faibles, la fonctionnalité peut rester dans `IDEAS.md`.

---

# 63. Test de suppression

Pour chaque mécanique :

> **Si nous supprimons cette fonctionnalité, Mundravax devient-il réellement moins intéressant ?**

Si la réponse est non, elle n'est probablement pas prioritaire.

---

# 64. Test Database Detective

Pour les contenus éducatifs, poser la question :

> **Le joueur apprend-il parce qu'il veut résoudre le problème, ou résout-il le problème parce qu'on veut lui apprendre quelque chose ?**

Mundravax doit privilégier la première situation.

---

# 65. Test Minecraft

Pour les systèmes persistants :

> **Cette mécanique produit-elle seulement du contenu, ou permet-elle également aux joueurs de créer leurs propres histoires ?**

Privilégier les systèmes génératifs.

---

# 66. Test Mundravax

Une fonctionnalité est particulièrement intéressante lorsqu'elle réunit plusieurs dimensions :

```text
Gameplay
   +
Decision
   +
Consequence
   +
Interaction
   +
Learning
   +
Emergence
```

Elle n'a pas besoin de toutes les réunir.

Mais plus elle en combine naturellement, plus elle correspond à Mundravax.

---

# 67. Ordre de priorité

Lorsqu'il faut arbitrer :

```text
1. Fun
2. Meaningful decisions
3. Consequences
4. Coherence
5. Emergence
6. Learning
7. Realism
8. Technical sophistication
```

L'apprentissage reste fondamental à la vision.

Mais si Mundravax n'est pas amusant, les joueurs ne resteront pas suffisamment longtemps pour apprendre.

---

# 68. North Star

Mundravax réussit lorsqu'un joueur peut raconter une histoire comme :

> « On avait lancé une petite entreprise avec deux amis. On grandissait très vite, donc on a emprunté pour ouvrir dans une deuxième ville. Quelques mois plus tard, une crise a fait exploser nos coûts. Notre CFO voulait fermer la filiale, mais j'ai refusé. On a essayé de négocier avec la banque, elle n'a accepté de nous refinancer qu'en échange de garanties supplémentaires. Finalement, on a vendu une partie du groupe à un autre joueur et survécu. »

Et qu'en racontant cette histoire, il réalise qu'il a appris :

- finance ;
- stratégie ;
- négociation ;
- leadership ;
- gestion du risque ;
- collaboration.

**Sans jamais avoir eu l'impression de terminer un cours.**

---

# 69. Manifeste de conception

> **Fun before instruction.**

> **Problems before lessons.**

> **Decisions before rewards.**

> **Consequences before scores.**

> **Systems before scripts.**

> **Creation before consumption.**

> **Simulation before AI improvisation.**

> **Collaboration before networking.**

> **Skill before status.**

> **Virtual consequences before real-world risk.**

> **Depth without unnecessary complexity.**

> **A living world, not an endless checklist.**

---

# 70. Règle finale

Lorsqu'une décision de conception devient difficile, revenir à cette question :

> **Est-ce que cela aide Mundravax à devenir un monde dans lequel les joueurs ont réellement envie de vivre des expériences, prendre des décisions, construire des choses et apprendre par leurs conséquences ?**

Si oui, explorons-la.

Si non, même si l'idée est impressionnante :

> **elle n'a probablement pas sa place dans Mundravax.**