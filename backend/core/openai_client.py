import openai
import base64


class OpenAIClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        openai.api_key = self.api_key

    def analyze_image_with_base64(self, image_data: bytes, prompt: str, mime_type: str = "image/png") -> str:
        try:
            base64_image = base64.b64encode(image_data).decode("utf-8")
            data_url = f"data:{mime_type};base64,{base64_image}"
            response = openai.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": data_url},
                            }
                        ]
                    }
                ],
                max_tokens=300,
            )

            return response.choices[0].message.content

        except Exception as e:
            raise Exception(f"OpenAI API Error: {e}")
