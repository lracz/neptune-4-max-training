# Neptune 4 Max - 3D Printing Education Application 🚀

Egy interaktív, gamifikált oktatóalkalmazás, amely lépésről lépésre vezeti végig a felhasználókat az **Elegoo Neptune 4 Max** 3D nyomtató használatának alapjain. A projekt célja, hogy a laboratóriumi környezetben a hallgatók önállóan, mégis biztonságosan sajátíthassák el a gép kezelését.

![App Screenshot](https://placehold.co/1200x600/1e293b/white?text=Neptune+4+Max+Training+App)

## 🌟 Főbb Jellemzők

- **Gamifikált Tanulás:** Tapasztalati pontok (XP), szintek és gyűjthető jelvények motiválják a felhasználót.
- **Interaktív Modulok:** Valósághű szimulációk a szoftveres és hardveres lépésekhez.
- **Biztonság az Első:** Kiemelt figyelmeztetések és kötelező biztonsági csekklisták.
- **Mobil-barát:** Reszponzív kialakítás, hogy a nyomtató mellett állva is kényelmesen használható legyen.

## 📚 Oktatási Modulok

1.  **Összeszerelés & Csatlakozás:** Szalagkábel bekötése és hálózati (WiFi/LAN) konfiguráció.
2.  **Fluidd UI Felfedezése:** Ismerkedés a Klipper-alapú webes felülettel és a makrókkal.
3.  **Hibrid Asztalszintezés:** Előmelegítés, Automatikus Szintezés (ABL) és a precíz Z-Offset beállítása.
4.  **Filament Betöltés:** A szál befűzése és a betöltési folyamat ellenőrzése.
5.  **Szeletelés (Slicer):** STL modellek letöltése és G-Code generálása (Cura/OrcaSlicer útmutató).
6.  **Első Nyomtatás & Baby-stepping:** A nyomtatás elindítása és az első réteg menet közbeni korrekciója.
7.  **Levétel & Biztonság:** A kész munkadarab eltávolítása a PEI lapról és az asztal tisztítása.

## 🛠️ Technológiai Stack

- **Framework:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Stílus:** [Tailwind CSS](https://tailwindcss.com/)
- **Animációk:** [Framer Motion](https://www.framer.com/motion/)
- **Ikonok:** [Lucide React](https://lucide.dev/)
- **Állapotkezelés:** [Zustand](https://docs.pmnd.rs/zustand/)

## 🚀 Telepítés és Futtatás

### Helyi futtatás:
1. Klónozd a repozitóriót:
   ```bash
   git clone https://github.com/lracz/neptune-4-max-training.git
   ```
2. Telepítsd a függőségeket:
   ```bash
   npm install
   ```
3. Indítsd el a fejlesztői szervert:
   ```bash
   npm run dev
   ```

### Élesítés (Deployment):
A projekt optimalizálva van **Vercel** vagy bármilyen statikus tárhelyre történő feltöltésre. A `dist` mappa tartalma bárhová másolható.

## 📖 Felhasználás a laborban
A nyomtatókra érdemes **QR kódot** ragasztani, amely a következő paraméterrel nyitja meg az appot:
`https://linked-app.com/?printer_id=GEP-01`

---
*Készült a modern 3D nyomtatási oktatás segítésére.*
