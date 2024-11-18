import os
from dotenv import load_dotenv
import openai
from sqlalchemy.orm import Session
from backend.core.database import SessionLocal
from backend.models.uploaded_file import UploadedFile
import base64

# Załaduj klucz API z pliku .env
load_dotenv()
openai.api_key = os.environ.get('OPENAI_API_KEY')

def get_file_data(file_id: int):
    """
    Pobiera dane pliku z bazy danych.
    """
    db: Session = SessionLocal()  # Tworzenie instancji sesji
    try:
        file_record = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
        if not file_record:
            raise ValueError(f"File with id {file_id} not found.")
        return file_record.file_data, file_record.file_name
    finally:
        db.close()  # Zamknięcie sesji

def main():
    try:
        # Pobierz dane pliku z bazy danych
        file_id = 1
        file_data, file_name = get_file_data(file_id)

        # Zakodowanie obrazu w Base64
        encoded_image = base64.b64encode(file_data).decode('utf-8')

        # Przygotowanie prompta
        prompt = f"Analyze the following Base64-encoded image of a chart and provide insights:\n\n{encoded_image}"

        # Wysłanie zapytania do modelu
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=1,
            max_tokens=2048,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
        )

        # Pobranie odpowiedzi modelu
        message = response.choices[0].message.content
        print("Model Response:")
        print(message)

    except Exception as e:
        print(f"Błąd API OpenAI: {e}")


if __name__ == "__main__":
    main()
