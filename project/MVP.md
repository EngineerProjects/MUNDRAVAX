# Mundravax — Technical Foundation

## 1. Objectif initial

La première base de Mundravax n'est pas un jeu complet.

Elle est un **framework permettant de construire des environnements informatiques virtuels interactifs**.

Ce framework doit permettre de créer :

- un bureau ;
- des fenêtres ;
- des applications ;
- des fichiers ;
- des notifications ;
- des utilisateurs ;
- des permissions ;
- des événements ;
- des services internes ;
- des communications entre applications.

L'objectif est qu'un scénario puisse ensuite définir son propre environnement.

Exemples :

### Entrepreneur

- Mail
- Bank
- Accounting
- CRM
- Browser
- Calendar
- Meetings

### Police

- Mail
- Cases
- Evidence
- Database
- Browser
- Maps
- Suspects

### Data Engineer

- Mail
- Terminal
- IDE
- SQL Client
- Monitoring
- Data Warehouse
- Tickets

### Executive

- Mail
- Calendar
- Meetings
- Analytics
- Finance
- HR
- CRM

Toutes ces expériences utilisent le même framework.

---

# 2. Principe architectural

Mundravax ne doit pas coder chaque ordinateur séparément.

Il doit fournir :

```text
Mundravax Runtime
        │
        ├── Desktop
        ├── Window Manager
        ├── Application Runtime
        ├── Virtual File System
        ├── Event Bus
        ├── Permissions
        ├── Notifications
        ├── User Sessions
        ├── Persistence
        └── Networking
                 │
                 ↓
            Applications
```

Un scénario compose ensuite l'environnement dont il a besoin.

---

# 3. Un ordinateur est un profil

Un ordinateur Mundravax pourrait être décrit par une configuration.

```rust
pub struct ComputerProfile {
    pub id: ComputerProfileId,
    pub name: String,
    pub installed_apps: Vec<AppId>,
    pub permissions: PermissionSet,
    pub filesystem_template: FileSystemTemplate,
    pub wallpaper: AssetId,
    pub capabilities: Vec<Capability>,
}
```

Exemple :

```text
POLICE_WORKSTATION

Apps:
- mail
- cases
- evidence
- database
- browser
- maps

Permissions:
- police_records.read
- citizen_database.read
- evidence.write
```

Un autre profil :

```text
STARTUP_CEO_LAPTOP

Apps:
- mail
- bank
- accounting
- crm
- analytics
- browser
- meetings
```

Ainsi :

> **ordinateur différent ≠ moteur différent**

C'est simplement une autre configuration du même système.

---

# 4. Workspace

Le frontend forké (voir §17) devient la racine du dépôt, suivant la convention Tauri (frontend au niveau racine, `src-tauri/` pour le backend Rust) :

```text
mundravax/                    (racine = ex ProzillaOS)
│
├── packages/
│   ├── core/                 (shell OS : window manager, desktop — hérité de ProzillaOS)
│   ├── apps/
│   │   ├── file-explorer/    (hérité)
│   │   ├── terminal/         (hérité)
│   │   ├── settings/         (hérité)
│   │   ├── browser/          (hérité)
│   │   ├── mail/             (à créer)
│   │   ├── bank/             (à créer)
│   │   ├── accounting/       (à créer)
│   │   └── crm/              (à créer)
│   └── prozilla-os/          (package racine, à rebrander mundravax-os)
│
├── demo/                     (point d'entrée — deviendra le shell Mundravax)
│
├── src-tauri/                 (Rust — bridge + moteur)
│   ├── Cargo.toml            (workspace Cargo)
│   ├── src/                  (main.rs, commands Tauri)
│   └── crates/
│       ├── mvx-core/
│       ├── mvx-runtime/
│       ├── mvx-desktop/
│       ├── mvx-windowing/    (état logique des fenêtres)
│       ├── mvx-app-sdk/
│       ├── mvx-events/
│       ├── mvx-vfs/
│       ├── mvx-permissions/
│       ├── mvx-persistence/
│       ├── mvx-network/
│       └── mvx-bridge/       (commands/events Tauri exposés au frontend)
│
├── scenarios/
│
├── project/                  (documents de design Mundravax)
│
└── helps/                    (clones de référence : daedalOS, Win11React, ProzillaOS original)
```

Chaque appli dans `packages/apps/*` correspond à un couple app Rust (`mvx-app-sdk`) + composant React qui l'affiche — voir §25.

---

# 5. mvx-core

`mvx-core` contient les types fondamentaux.

Il ne doit dépendre :

- d'aucune interface graphique ;
- d'aucun LLM ;
- d'aucun moteur réseau ;
- d'aucun scénario.

Exemples :

```rust
pub struct UserId(Uuid);
pub struct ComputerId(Uuid);
pub struct AppId(String);
pub struct WindowId(Uuid);
pub struct ProcessId(Uuid);
```

Il contient également :

- temps virtuel ;
- identifiants ;
- erreurs communes ;
- commandes ;
- événements fondamentaux.

---

# 6. Application Runtime

Une application Mundravax doit pouvoir être traitée comme un module.

Conceptuellement :

```rust
pub trait MundravaxApp {
    fn manifest(&self) -> AppManifest;

    fn on_start(&mut self, ctx: &mut AppContext);

    fn on_event(
        &mut self,
        event: &SystemEvent,
        ctx: &mut AppContext,
    );

    fn update(
        &mut self,
        ctx: &mut AppContext,
    );
}
```

Une application possède :

```rust
pub struct AppManifest {
    pub id: AppId,
    pub name: String,
    pub version: Version,
    pub permissions: Vec<Permission>,
    pub capabilities: Vec<Capability>,
}
```

Exemple :

```text
Mail

permissions:
- messages.read
- messages.write
- contacts.read

capabilities:
- notifications
- attachments
```

---

# 7. Le système d'applications

Les applications officielles de base pourraient être extrêmement petites au début :

```text
mail
files
settings
notepad
browser
```

Puis progressivement :

```text
calendar
bank
accounting
crm
meetings
terminal
analytics
```

Chaque application doit être indépendante autant que possible.

---

# 8. Window Manager

Le framework doit disposer de son propre gestionnaire de fenêtres virtuel.

Une fenêtre possède :

```rust
pub struct WindowState {
    pub id: WindowId,
    pub app: AppId,

    pub position: Vec2,
    pub size: Vec2,

    pub minimized: bool,
    pub maximized: bool,
    pub focused: bool,

    pub z_index: u32,
}
```

Fonctions :

- ouvrir ;
- fermer ;
- déplacer ;
- redimensionner ;
- minimiser ;
- maximiser ;
- focus ;
- multi-fenêtres ;
- overlays ;
- dialogs.

L'objectif est de retrouver cette sensation :

```text
┌──────────────┐
│ Mail         │
│              │
└──────────────┘

       ┌──────────────────┐
       │ Browser          │
       │                  │
       └──────────────────┘

 ┌───────────────┐
 │ Notes         │
 └───────────────┘
```

et non une succession d'écrans plein écran.

---

# 9. Desktop

Le Desktop gère :

- fond d'écran ;
- icônes ;
- dock/barre des tâches ;
- menu des applications ;
- notifications ;
- horloge ;
- applications actives ;
- session utilisateur.

Il doit être personnalisable selon le contexte.

Un ordinateur de police ne devrait pas nécessairement ressembler au laptop personnel d'un entrepreneur.

---

# 10. Event Bus

C'est probablement l'une des briques les plus importantes.

Les applications ne doivent pas être fortement couplées.

Elles communiquent à travers des événements.

Exemple :

```text
Bank
 ↓
TransactionCompleted
 ↓
Event Bus
 ├── Accounting
 ├── Notifications
 └── Analytics
```

En Rust :

```rust
pub enum SystemEvent {
    AppOpened(AppId),
    AppClosed(AppId),

    FileCreated(FileId),

    MessageReceived(MessageId),

    NotificationCreated(NotificationId),

    Custom(CustomEvent),
}
```

Plus tard :

```text
InvoicePaid
ContractSigned
EmployeeHired
MeetingScheduled
OrderReceived
```

---

# 11. Commands + Events

Il serait intéressant de distinguer :

## Command

Une intention.

```text
TransferMoney
SendEmail
DeleteFile
```

## Event

Quelque chose qui a réellement eu lieu.

```text
MoneyTransferred
EmailSent
FileDeleted
```

Architecture :

```text
UI
 ↓
Command
 ↓
Runtime / World
 ↓
Validation
 ↓
Event
 ↓
Applications
```

Cette distinction deviendra extrêmement utile lorsque Mundravax deviendra multijoueur.

---

# 12. Virtual File System

Mundravax devrait posséder son propre système de fichiers virtuel.

Pas directement :

```text
C:\Users\...
```

mais :

```text
/home/stephane/
/documents/
/downloads/
/company/
/shared/
```

Le VFS peut contenir :

- fichiers texte ;
- images ;
- contrats ;
- rapports ;
- données ;
- pièces jointes ;
- exécutables virtuels ;
- documents de scénario.

API conceptuelle :

```rust
trait VirtualFileSystem {
    fn read(&self, path: &VirtualPath) -> Result<Vec<u8>>;
    fn write(&mut self, path: &VirtualPath, data: &[u8]) -> Result<()>;
    fn delete(&mut self, path: &VirtualPath) -> Result<()>;
}
```

---

# 13. Permissions

Dès le début, les applications devraient posséder des permissions.

Exemple :

```text
mail.read
mail.send

files.read
files.write

company.finance.read
company.finance.write

police.records.read
```

Pourquoi aussi tôt ?

Parce que plus tard :

- un CFO ;
- un commercial ;
- un policier ;
- un stagiaire ;

ne doivent pas voir exactement les mêmes informations.

---

# 14. Users & Sessions

Le framework devrait comprendre la notion de session.

```rust
pub struct Session {
    pub user_id: UserId,
    pub computer_id: ComputerId,
    pub permissions: PermissionSet,
}
```

Plus tard un joueur peut posséder plusieurs appareils :

```text
Personal Laptop
Company Desktop
Phone
Police Workstation
Server Terminal
```

et ne pas avoir les mêmes droits partout.

---

# 15. Services

Certaines fonctionnalités ne sont pas des applications.

Elles sont des services.

Exemples :

```text
NotificationService
ClockService
FileService
NetworkService
IdentityService
PermissionService
```

Puis plus tard :

```text
MailService
MeetingService
AIService
WorldService
```

---

# 16. Persistence

Le runtime doit pouvoir être sauvegardé/restauré.

Au départ :

```text
SQLite ou fichier local
```

peut suffire.

Plus tard :

```text
client
   ↓
Mundravax Server
   ↓
PostgreSQL
```

Le domaine ne doit pas dépendre directement du moteur de persistence.

---

# 17. UI

## Historique de la décision

La V0 a d'abord été tentée en **Rust natif avec egui/eframe** (desktop plein écran, window manager avec fenêtres flottantes). Ce chemin a été abandonné : obtenir le niveau de finition visuelle voulu (chrome de fenêtres, thème, sensation de vrai OS) en mode immédiat s'est révélé disproportionnellement complexe par rapport à la valeur produite. Le prototype egui a été supprimé du dépôt local.

## Choix retenu

**Fork de [ProzillaOS](https://github.com/prozilla-os/ProzillaOS) comme frontend, relié au moteur Rust via Tauri.**

```text
Frontend (React / TypeScript / Vite)
     fork de ProzillaOS
            │
            │ Tauri commands / events
            ▼
     Moteur Rust (mvx-*)
     source de vérité
```

daedalOS, ProzillaOS et Win11React ont été clonés dans `helps/` et testés en local (`yarn`/`pnpm dev`) pour comparer. ProzillaOS a été retenu :

- **identité visuelle** jugée meilleure sur inspection directe ;
- **architecture en monorepo** (`packages/apps/*` : file-explorer, terminal, settings, browser...) qui correspond exactement au découpage `apps/` déjà prévu dans ce document — chaque appli est un package indépendant, pas une fonctionnalité enfouie dans un monolithe ;
- guide officiel et boilerplate pour créer une app custom, donc une bonne partie du travail "brancher une nouvelle appli dans le shell" est déjà documentée ;
- **Vite** plutôt que Next.js : s'intègre nativement avec Tauri (template officiel) sans les contorsions du mode `output: export` nécessaires avec Next.js ;
- daedalOS reste plus riche visuellement et en fonctionnalités (émulateurs, jeux, Winamp...) mais ce sont des features hors-sujet pour Mundravax et un monolithe Next.js plus coûteux à découper — il reste comme référence de design dans `helps/`.

Pourquoi Tauri plutôt qu'egui :

- un desktop React déjà construit (window manager, taskbar, file explorer, déplacer/redimensionner/minimiser/maximiser) évite de recoder à la main tout ce qu'egui obligeait à recréer manuellement ;
- React/CSS permet d'atteindre une identité visuelle soignée beaucoup plus vite qu'un mode immédiat comme egui ;
- Tauri est conçu précisément pour ce couplage frontend web / backend Rust, et transforme n'importe quel frontend web en véritable app desktop (fenêtre native, sans chrome de navigateur, `.exe` distribuable) — c'est cette couche qui donne la sensation "vrai ordinateur" façon Database Detective, indépendamment du frontend choisi.

Conséquences concrètes sur l'architecture décrite dans ce document :

- `mvx-ui` n'est plus un moteur de rendu : il devient une couche de **bridge** exposant des commands/events Tauri ;
- le rendu visuel (fenêtres, icônes, taskbar, thèmes) est délégué au frontend forké, pas au moteur Rust ;
- `mvx-windowing` continue d'exister côté Rust, mais comme **état logique** des fenêtres (position, taille, focus, minimisé/maximisé, z-index), persisté et synchronisé vers le frontend — plus comme moteur de rendu de ces fenêtres.

## Ce qui ne change pas

Le principe §19 ("UI ≠ State") reste la règle centrale et devient même plus stricte : frontend et moteur tournent désormais dans des process/langages séparés reliés par Tauri, donc l'état ne peut plus accidentellement vivre dans le code de fenêtre comme cela aurait pu arriver en Rust natif.

---

# 18. Ne pas commencer avec Bevy

Bevy est un moteur de jeu Rust très intéressant et son architecture est centrée sur un ECS. 

Mais pour la première version de Mundravax, je ne l'introduirais probablement pas immédiatement.

Le cœur initial est surtout :

```text
desktop
windows
apps
documents
events
simulation
```

et non :

```text
3D
physics
animation
world rendering
```

Il pourra devenir pertinent plus tard pour :

- carte du monde ;
- visualisation des villes ;
- environnement spatial ;
- scènes plus riches.

Le framework métier ne devrait cependant pas dépendre de Bevy.

---

# 19. Séparer UI et état

Règle importante :

```text
UI ≠ State
```

Par exemple :

```rust
struct BankAccount {
    balance: Money,
}
```

ne doit pas exister uniquement à l'intérieur du code de la fenêtre Bank.

La fenêtre affiche l'état.

Elle ne **possède** pas l'état.

Cela permettra plus tard :

```text
Desktop UI
Mobile UI
Web UI
NPC
Server
```

d'utiliser le même monde.

---

# 20. Architecture cible

```text
                    ┌──────────────┐
                    │     UI       │
                    │ React (fork  │
                    │ ProzillaOS)  │
                    └──────┬───────┘
                           │
                    Tauri commands
                           │
                    ┌──────▼───────┐
                    │   Runtime    │
                    └──────┬───────┘
                           │
                 ┌─────────┼─────────┐
                 │         │         │
               Apps      VFS      Services
                 │         │         │
                 └─────────┼─────────┘
                           │
                        Events
                           │
                    ┌──────▼───────┐
                    │ Persistence  │
                    └──────────────┘
```

Plus tard :

```text
                    Mundravax Server
                           │
                     World Simulation
                           │
                     Persistent World
```

---

# 21. Les scénarios ne modifient pas le moteur

Un scénario doit pouvoir déclarer :

```text
Computer:
    police_workstation

Apps:
    mail
    browser
    database
    cases

Files:
    case_001.pdf
    evidence/photo.png

Permissions:
    police.records.read

Events:
    08:00 → receive email
    08:30 → new evidence
```

sans modifier le code du runtime.

---

# 22. Application SDK

À long terme, la partie la plus importante pourrait devenir le SDK.

Exemple conceptuel :

```rust
pub trait MundravaxApp {
    fn manifest(&self) -> AppManifest;

    fn handle_command(
        &mut self,
        command: AppCommand,
        ctx: &mut AppContext,
    ) -> Result<()>;

    fn handle_event(
        &mut self,
        event: &SystemEvent,
        ctx: &mut AppContext,
    );

    fn render(
        &mut self,
        ui: &mut AppUi,
        ctx: &AppContext,
    );
}
```

Ainsi quelqu'un peut créer :

```text
mundravax-app-bloomberg
mundravax-app-crm
mundravax-app-forensics
```

---

# 23. Applications créées par les joueurs

Très loin dans le futur, cette architecture pourrait permettre aux joueurs de créer de véritables applications internes au monde.

Mais il faudra alors :

```text
sandbox
permissions
resource limits
signing
moderation
network restrictions
```

Un plugin ne doit jamais avoir directement accès à la machine réelle du joueur.

---

# 24. Première milestone

Le premier objectif n'est PAS :

> créer Mundravax.

C'est :

> **créer un ordinateur virtuel agréable à utiliser.**

Milestone :

```text
Mundravax Runtime boots
        ↓
Desktop appears
        ↓
User opens Mail
        ↓
Mail window appears
        ↓
User opens Notepad
        ↓
Both windows coexist
        ↓
User moves/resizes them
        ↓
Mail receives an event
        ↓
Notification appears
        ↓
State is saved
        ↓
Application closes
        ↓
Restart
        ↓
State restored
```

Si ça fonctionne proprement, on possède déjà le noyau.

---

# 25. Première applications

Je ferais exactement :

1. **Settings**
2. **Notepad**
3. **Files**
4. **Mail**

Pas Bank immédiatement.

Ces quatre applications forcent déjà à résoudre :

- fenêtre ;
- état ;
- VFS ;
- événements ;
- persistence ;
- notifications ;
- app runtime.

Ensuite :

5. Browser
6. Calendar
7. Meetings
8. Bank

Chaque application est désormais composée de deux moitiés : la logique et l'état côté Rust (`mvx-app-sdk`), et un composant React côté frontend forké qui l'affiche et envoie des commands via Tauri. Le split reste celui du §19 : le composant React ne fait qu'afficher ce que le moteur lui renvoie.

---

# 26. Définition de la V0.1

Mundravax Framework V0.1 est terminé lorsque :

- le runtime démarre ;
- un utilisateur possède une session ;
- le desktop fonctionne ;
- plusieurs fenêtres peuvent coexister ;
- des apps sont enregistrées dynamiquement ;
- les apps peuvent recevoir des événements ;
- un VFS existe ;
- les permissions existent ;
- les notifications fonctionnent ;
- l'état peut être sauvegardé ;
- un ComputerProfile peut changer les apps disponibles.

Aucune économie n'est encore obligatoire.

Aucun LLM.

Aucun multijoueur.

Aucune ville.

Aucun monde.

**Juste un excellent foundation layer.**

---

# 27. Règle fondamentale

Le framework ne doit jamais connaître :

> « Je suis un jeu de banque. »

ou :

> « Je suis un jeu de police. »

Il doit seulement connaître :

> « Je suis Mundravax Runtime.  
> Voilà un utilisateur.  
> Voilà un ordinateur.  
> Voilà ses applications.  
> Voilà ses permissions.  
> Voilà les événements qu'il reçoit. »

Le scénario et le monde déterminent le reste.
```

Et cette architecture répond justement à ton observation : **tu n’auras pas “un ordinateur Mundravax”**, mais un runtime capable de créer une infinité de postes différents.

Je commencerais très concrètement par cinq crates seulement :

```text
mvx-core
mvx-runtime
mvx-desktop
mvx-app-sdk
mvx-vfs
