
# Graph Analysis Tool

Graph Analysis Tool to zaawansowane narzędzie do analizy infografik, zbudowane przy użyciu FastAPI (backend) oraz React (frontend). 
Umożliwia użytkownikom generowanie opisów dla infografik oraz walidowanie ich opisów, zamieszonych co przez użytkownika. 

---

## 📂 Struktura projektu

### Backend
```
backend/
├── core/
│   ├── database.py         # Połączenie z bazą danych
│   ├── jwt_auth.py         # Zarządzanie tokenami JWT
│   ├── logging_config.py   # Konfiguracja logów
│   └── openai_client.py    # Integracja z OpenAI API
├── models/
│   ├── uploaded_file.py    # Model plików przesłanych
│   └── user.py             # Model użytkownika
├── routers/
│   ├── analysis.py         # API analizy infografik
│   ├── file_upload.py      # API przesyłania plików
│   └── users.py            # Obsługa użytkowników
├── .env                    # Zmienne środowiskowe
├── app.py                  # Główny plik aplikacji
└── requirements.txt        # Zależności Python
```

### Frontend
TO DO 

---

## 🛠 Technologie

### Backend
- **Python 3.x**
- **FastAPI**
- **SQLAlchemy**: Obsługa bazy danych.
- **JWT**: Tokeny uwierzytelniające.
- **OpenAI API**: Integracja z AI dla zaawansowanych funkcji analizy.

### Frontend
- **React.js**
- **bootstrap**: Komponenty interfejsu użytkownika.
- **React Router**: Nawigacja w aplikacji.

---

## 🚀 Instrukcje uruchomienia

### Wymagania
- **Python 3.x**
- **Node.js** i **npm** (lub yarn)
- **Baza danych**: SQLite.

### Backend

1. Skonfiguruj środowisko wirtualne:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate   # Windows
   ```
2. Zainstaluj zależności:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Ustaw zmienne środowiskowe w `.env`:
   ```env
   DATABASE_URL=sqlite:///./test.db
   SECRET_KEY=twoj_sekret
   OPENAI_API_KEY=twoj_klucz_openai
   ```
4. Uruchom aplikację:
   ```bash
   uvicorn backend.app:app --reload
   ```
5. Backend dostępny na: [http://127.0.0.1:8000](http://127.0.0.1:8000).

### Frontend

1. Przejdź do katalogu frontend:
   ```bash
   cd frontend/
   ```
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Uruchom aplikację:
   ```bash
   npm start
   ```
4. Frontend dostępny na: [http://localhost:3000](http://localhost:3000).

---

## 📊 Dokumentacja API

### Infografiki
- **GET** `/api/user_files` - Zwraca infografiki zautoryzowanego użytkownika
- **GET** `/api/user_files/{file_id}` - Pobiera informacje o danej infografice, tylko jeśli użytwkonik jest zautoryzowany

### Użytkownicy
- **GET** `/api/users/me` -  Zwraca obecnie zautoryzowanego użytkownika
- **POST** `/api/login` - Logowanie użytkownika
- **POST** `/api/register` - Rejestracja użytkownika

###  Analiza Infografik
- **POST** `/api/analyze_file/{file_id}` – Generowanie opisu dla infografiki za pomocą gpt-4o
- **POST** `/api/analyze_image_with_description/{file_id}` – Walidacja zgodności opisu z infografiką

### Twitter
- **POST** `/api/twitter_data` - Pobiera informacje o poście na podstawie ID postu w serwisie twitter

Pełna dokumentacja API jest dostępna na: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## 📋 Szczegóły funkcjonalności

### Backend
- **`core/openai_client.py`**: Integracja z OpenAI API dla zaawansowanych analiz grafowych.
- **`routers/analysis.py`**: Obsługa logiki analizy infografik przy użyciu AI.
- **`models/uploaded_file.py`**: Obsługa plików zamieszczonych przez użytkownika.



---

## 📝 Licencja

Ten projekt jest licencjonowany na zasadach [MIT](LICENSE).
